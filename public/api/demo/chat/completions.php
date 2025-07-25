<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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

// Simulate processing delay
sleep(2);

// Demo AI analysis response
$demoResponse = [
    'choices' => [[
        'message' => [
            'content' => '🏗️ АНАЛИЗ СТРОИТЕЛЬНОГО ПРОГРЕССА:

📊 За период между фотографиями выполнены следующие работы:

✅ ЗАВЕРШЕННЫЕ РАБОТЫ:
• Установлена внутренняя перегородка в левой части помещения
• Выполнена штукатурка стен в центральной зоне
• Проложена электропроводка по потолку
• Установлены оконные рамы

🔄 НАЧАТЫЕ РАБОТЫ:
• Подготовка пола под финишное покрытие
• Монтаж системы вентиляции

📈 ПРОГРЕСС: Примерно 65% работ по данному участку завершены.

⚠️ ВНИМАНИЕ: Это демо-версия анализа на сервере во Франции. OpenAI API должен работать нормально!'
        ]
    ]]
];

echo json_encode($demoResponse);
?> 