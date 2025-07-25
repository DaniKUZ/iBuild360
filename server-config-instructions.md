# Настройка сервера для AI сравнения изображений

## Проблема
Ошибка 413 "Request Entity Too Large" при отправке изображений в base64 к OpenAI API.

## Решение

### 1. Настройка PHP (php.ini)
```ini
post_max_size = 100M
upload_max_filesize = 100M
max_execution_time = 300
max_input_time = 300
memory_limit = 512M
max_input_vars = 10000
```

### 2. Настройка Nginx
```nginx
# В /etc/nginx/sites-available/build.napoleonit.ru
server {
    ...
    client_max_body_size 100M;
    client_body_timeout 300s;
    client_header_timeout 300s;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    
    location /api/ {
        try_files $uri $uri/ /api/index.php?$query_string;
    }
}
```

### 3. Команды для применения настроек
```bash
# Подключение к серверу
ssh root@193.8.184.254

# Редактирование php.ini
nano /etc/php/8.x/fpm/php.ini
# Найти и изменить указанные параметры

# Редактирование конфигурации nginx
nano /etc/nginx/sites-available/build.napoleonit.ru

# Перезапуск сервисов
systemctl restart php8.x-fpm
systemctl restart nginx

# Проверка статуса
systemctl status php8.x-fpm
systemctl status nginx
```

### 4. Проверка настроек
```bash
# Создать файл для проверки лимитов
echo "<?php phpinfo(); ?>" > /var/www/ibuild360/phpinfo.php

# Открыть в браузере
# https://build.napoleonit.ru/phpinfo.php

# Удалить после проверки
rm /var/www/ibuild360/phpinfo.php
``` 