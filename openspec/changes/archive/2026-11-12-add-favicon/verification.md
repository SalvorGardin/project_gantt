# Проверка 12 ноября 2026

SVG разобран XML-парсером, ссылка в HTML проверена, изображение отрисовано и просмотрено в Chromium. git diff --check прошёл. Обновление загружено в ~/favicon-update-20261112 на сервере. Предыдущие публичные файлы сохранены в backup/, конфигурация — Caddyfile.backup. Владелец выполнил публикацию через sudo. Внешняя проверка HTTPS подтвердила HTTP 200 и Content-Type image/svg+xml для favicon.svg. SHA-256 опубликованных index.html и favicon.svg совпадают с локальными файлами. Изменение завершено.

Команда владельца после SSH-входа:

```sh
sudo install -o root -g root -m 644 ~/favicon-update-20261112/favicon.svg ~/favicon-update-20261112/index.html /srv/onlinegantt/
```

Перезапуск Caddy для обновления статических файлов не нужен.
