<?php
// Простой роутер для /api путей без .php
$requestUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/api/';
$path = parse_url($requestUri, PHP_URL_PATH);

// Ожидаем вид /api/{segment}/{segment}[...]
$baseDir = __DIR__;
$relative = str_replace('/api', '', $path);

// Защита от переходов вне директории
$relative = preg_replace('#\.\.+#', '', $relative);

// Если путь указывает на директорию, пробуем index.php внутри
$candidate = rtrim($baseDir . $relative, '/');
if (is_dir($candidate)) {
    $candidate = $candidate . '/index.php';
} else {
    $candidate = $candidate . '.php';
}

if (is_file($candidate)) {
    require $candidate;
    exit;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Not Found']);
?>

