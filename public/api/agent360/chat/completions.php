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

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Только POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// .env.php файл больше не нужен для n8n webhook
// Всё настроено в коде

// Используем n8n webhook вместо OpenAI API (из переменных окружения)
$N8N_WEBHOOK_URL = $_ENV['N8N_WEBHOOK_URL'] ?? '';
$N8N_AUTH_HEADER = $_ENV['N8N_AUTH_HEADER'] ?? 'N8N';
$N8N_AUTH_KEY = $_ENV['N8N_AUTH_KEY'] ?? '';

// Проверяем что все необходимые переменные заданы
if (empty($N8N_WEBHOOK_URL) || empty($N8N_AUTH_KEY)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server misconfigured: Missing N8N_WEBHOOK_URL or N8N_AUTH_KEY environment variables']);
    exit;
}

try {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        throw new Exception('No request body');
    }

    // Контроль размера запроса
    $requestSize = strlen($raw);
    if ($requestSize > 80 * 1024 * 1024) { // 80MB safety
        throw new Exception('Request too large: ' . round($requestSize / 1024 / 1024, 2) . 'MB');
    }

    $input = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    $siteId = isset($input['site_id']) ? (string)$input['site_id'] : 'UNKNOWN';
    $images = isset($input['images']) && is_array($input['images']) ? $input['images'] : [];
    $overrideModel = isset($input['model']) ? (string)$input['model'] : null;

    if (count($images) === 0) {
        throw new Exception('No images provided');
    }

    // Для n8n просто передаём данные как есть
    $body = [
        'site_id' => $siteId,
        'images' => $images
    ];

    // Запрос к n8n webhook
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $N8N_WEBHOOK_URL,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            $N8N_AUTH_HEADER . ': ' . $N8N_AUTH_KEY
        ],
        CURLOPT_TIMEOUT => 120,
        CURLOPT_CONNECTTIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT => 'iBuild360-N8N-Proxy/1.0'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        throw new Exception('cURL error: ' . $error);
    }

    http_response_code($httpCode);
    echo $response;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>

