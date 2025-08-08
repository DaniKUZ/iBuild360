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

// Подтянуть секреты
$envPath = __DIR__ . '/../../../../.env.php';
if (file_exists($envPath)) {
    require_once $envPath;
}

// Ожидаем константы OPENAI_API_KEY и (опционально) AGENT360_MODEL_ID в .env.php
if (!defined('OPENAI_API_KEY')) {
    http_response_code(500);
    echo json_encode(['error' => 'Server misconfigured: OPENAI_API_KEY is not set']);
    exit;
}

$OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
$MODEL_ID = defined('AGENT360_MODEL_ID') ? AGENT360_MODEL_ID : null; // например: gpt-<ID_Агента_360>

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

    // Формируем content для Chat Completions по паттерну Агент 360
    $content = [];
    $content[] = [
        'type' => 'text',
        'text' => "Объект: {$siteId}. Сравни 'до' и 'после' и верни JSON по нашей схеме."
    ];

    foreach ($images as $img) {
        $imageUrl = isset($img['image_url']) ? $img['image_url'] : null;
        $role = isset($img['role']) ? $img['role'] : 'current';
        $takenAt = isset($img['taken_at']) ? $img['taken_at'] : '';
        $notes = isset($img['notes']) ? $img['notes'] : '';

        if (!$imageUrl) {
            continue;
        }

        // Приводим к формату Chat Completions (image_url)
        $content[] = [
            'type' => 'image_url',
            'image_url' => [ 'url' => $imageUrl ]
        ];

        $meta = "role={$role} taken_at={$takenAt}";
        if ($notes !== '') {
            $meta .= " notes=" . $notes;
        }
        $content[] = [ 'type' => 'text', 'text' => $meta ];
    }

    $messages = [ [ 'role' => 'user', 'content' => $content ] ];

    $body = [
        'model' => $overrideModel ? $overrideModel : ($MODEL_ID ?: 'gpt-4o-mini'),
        'messages' => $messages,
        'temperature' => 0.1,
        'max_tokens' => 2000
    ];

    // Запрос к OpenAI
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $OPENAI_API_URL,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . OPENAI_API_KEY
        ],
        CURLOPT_TIMEOUT => 120,
        CURLOPT_CONNECTTIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT => 'iBuild360-Agent360-Proxy/1.0'
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

