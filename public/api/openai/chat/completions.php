<?php
// Увеличение лимитов для больших изображений
ini_set('post_max_size', '100M');
ini_set('upload_max_filesize', '100M');
ini_set('max_execution_time', 300);
ini_set('max_input_time', 300);
ini_set('memory_limit', '512M');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// API configuration
// Загружаем секреты из /var/www/ibuild360/.env.php (или относительного пути в репо)
$envPath = __DIR__ . '/../../../../.env.php';
if (file_exists($envPath)) {
    require_once $envPath;
}

// Получаем ключи из разных источников: define() из .env.php, переменные окружения
$HF_API_KEY = defined('HUGGINGFACE_API_KEY') ? HUGGINGFACE_API_KEY : (getenv('HUGGINGFACE_API_KEY') ?: ($_ENV['HUGGINGFACE_API_KEY'] ?? ''));
$OPENAI_API_KEY = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : (getenv('OPENAI_API_KEY') ?: ($_ENV['OPENAI_API_KEY'] ?? ''));
// Позволяем задавать модель через ENV
$HF_MODEL = defined('HUGGINGFACE_MODEL') ? HUGGINGFACE_MODEL : (getenv('HUGGINGFACE_MODEL') ?: ($_ENV['HUGGINGFACE_MODEL'] ?? 'mistralai/Mixtral-8x7B-Instruct-v0.1'));

$OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

try {
    // Get request body
    $input = file_get_contents('php://input');
    
    if (!$input) {
        throw new Exception('No request body');
    }
    
    // Check request size
    $requestSize = strlen($input);
    if ($requestSize > 50 * 1024 * 1024) { // 50MB limit
        throw new Exception('Request too large: ' . round($requestSize / 1024 / 1024, 2) . 'MB');
    }
    
    error_log("OpenAI API request size: " . round($requestSize / 1024 / 1024, 2) . "MB");
    
    // Validate JSON
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON in request body: ' . json_last_error_msg());
    }

    // Если задан HUGGINGFACE_API_KEY — используем Hugging Face Inference API
    if (!empty($HF_API_KEY)) {
        $messages = isset($data['messages']) && is_array($data['messages']) ? $data['messages'] : [];
        $temperature = isset($data['temperature']) ? floatval($data['temperature']) : 0.7;
        $maxTokens = isset($data['max_tokens']) ? intval($data['max_tokens']) : 500;

        $system = '';
        $user = '';
        foreach ($messages as $m) {
            if (isset($m['role']) && $m['role'] === 'system') {
                $system = isset($m['content']) ? (string)$m['content'] : $system;
            } elseif (isset($m['role']) && $m['role'] === 'user') {
                $user = isset($m['content']) ? (string)$m['content'] : $user;
            }
        }

        $prompt = ($system !== '' ? ("System: " . $system . "\n\n") : '') . "User: " . $user . "\nAssistant:";

        $hfBody = json_encode([
            'inputs' => $prompt,
            'parameters' => [
                'max_new_tokens' => max(1, min(2048, $maxTokens)),
                'temperature' => max(0.0, min(2.0, $temperature)),
                'return_full_text' => false
            ]
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $hf = curl_init();
        curl_setopt_array($hf, [
            CURLOPT_URL => 'https://api-inference.huggingface.co/models/' . rawurlencode($HF_MODEL),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $hfBody,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: Bearer ' . $HF_API_KEY
            ],
            CURLOPT_TIMEOUT => 120,
            CURLOPT_CONNECTTIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'iBuild360-HF-Proxy/1.0'
        ]);

        $hfResp = curl_exec($hf);
        $hfCode = curl_getinfo($hf, CURLINFO_HTTP_CODE);
        $hfErr = curl_error($hf);
        curl_close($hf);

        if ($hfErr) {
            throw new Exception('cURL error (HF): ' . $hfErr);
        }

        // Обрабатываем ответ HF и нормализуем в формат OpenAI-like
        $generated = '';
        $decoded = json_decode($hfResp, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (is_array($decoded) && isset($decoded[0]['generated_text'])) {
                $generated = (string)$decoded[0]['generated_text'];
            } elseif (isset($decoded['generated_text'])) {
                $generated = (string)$decoded['generated_text'];
            } elseif (is_string($decoded[0] ?? null)) {
                $generated = (string)$decoded[0];
            }
        } else {
            // если пришёл текст, вернём как есть
            $generated = is_string($hfResp) ? $hfResp : '';
        }

        http_response_code($hfCode);
        if ($hfCode >= 200 && $hfCode < 300) {
            echo json_encode([
                'choices' => [[
                    'message' => [ 'content' => trim((string)$generated) ]
                ]]
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } else {
            $errMsg = 'Hugging Face API error: ' . $hfCode;
            if (strpos($hfResp, 'loading') !== false || strpos($hfResp, 'Estimated time') !== false) {
                $errMsg = 'Модель на Hugging Face прогружается. Подождите 1-2 минуты и повторите попытку.';
            } elseif ($hfCode === 401 || $hfCode === 403) {
                $errMsg = 'Ошибка авторизации Hugging Face API. Проверьте HUGGINGFACE_API_KEY.';
            }
            echo json_encode(['error' => $errMsg, 'details' => $hfResp], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        return;
    }

    // Иначе — используем OpenAI, если ключ задан
    if (empty($OPENAI_API_KEY)) {
        http_response_code(500);
        echo json_encode(['error' => 'Server misconfigured: neither HUGGINGFACE_API_KEY nor OPENAI_API_KEY is set']);
        exit;
    }

    // Prepare cURL request to OpenAI
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $OPENAI_API_URL,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $input,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $OPENAI_API_KEY
        ],
        CURLOPT_TIMEOUT => 120,
        CURLOPT_CONNECTTIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT => 'iBuild360-Proxy/1.0'
    ]);

    // Execute request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);

    // Log request info
    error_log("OpenAI API response: HTTP {$httpCode}, size: " . strlen($response) . " bytes");

    // Handle cURL errors
    if ($error) {
        throw new Exception('cURL error: ' . $error);
    }

    // Set response code
    http_response_code($httpCode);

    // Handle different response codes
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        if ($httpCode === 403 && isset($errorData['error']['code']) &&
            $errorData['error']['code'] === 'unsupported_country_region_territory') {
            echo json_encode([
                'error' => 'OpenAI API недоступен в данном регионе. Используется сервер во Франции, но возможны ограничения.',
                'details' => $response
            ]);
        } else if ($httpCode === 413) {
            echo json_encode([
                'error' => 'Изображения слишком большие для OpenAI API. Попробуйте уменьшить качество изображений.',
                'details' => $response
            ]);
        } else if ($httpCode === 429) {
            echo json_encode([
                'error' => 'Превышен лимит запросов к OpenAI API. Попробуйте позже.',
                'details' => $response
            ]);
        } else {
            echo json_encode([
                'error' => 'OpenAI API error: ' . $httpCode,
                'details' => $response
            ]);
        }
    } else {
        echo $response;
    }
    
} catch (Exception $e) {
    error_log("OpenAI Proxy Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?> 