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

// OpenAI API configuration
define('OPENAI_API_KEY', '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');
define('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions');

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
    
    // Prepare cURL request
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => OPENAI_API_URL,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $input,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . OPENAI_API_KEY
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
        // Success - return OpenAI response
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