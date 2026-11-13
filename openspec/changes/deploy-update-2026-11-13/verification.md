# Проверка 13 ноября 2026

55 Node-тестов прошли; node --check app.js прошёл. SHA-256 всех шести загруженных файлов совпадают с локальными. Пакет: `/home/admin_user/site-update-3f72c1d`. Резервная копия сайта: `backup/`, конфигурации: `Caddyfile.backup` внутри пакета.

Публикация не выполнена: `/srv/onlinegantt` принадлежит root, `sudo -n` требует пароль. Владелец может выполнить после SSH-входа:

```sh
sudo sh -c 'set -e; cd /home/admin_user/site-update-3f72c1d; install -o root -g root -m 644 js/project-file.js js/powerpoint-export.js /srv/onlinegantt/js/; install -o root -g root -m 644 favicon.svg style.css app.js index.html /srv/onlinegantt/'
```

Перезапуск Caddy не требуется. Публичная проверка новой версии ожидает выполнения команды.

## Повторный пакет с последними правками

Свежие index.html и style.css включают подтверждение Yandex и увеличенные шрифты стартового экрана. `git diff --check` прошёл. JavaScript не менялся после 55 успешных тестов. Все шесть файлов загружены в `/home/admin_user/site-update-ca5b2bcd`, SHA-256 совпадают с локальными. Текущий сайт и конфигурация скопированы в `backup/` и `Caddyfile.backup` нового пакета. `sudo -n true` по-прежнему требует пароль, публикация нового пакета не выполнена.

Актуальная команда владельца (заменяет предыдущую):

```sh
sudo sh -c 'set -e; cd /home/admin_user/site-update-ca5b2bcd; install -o root -g root -m 644 js/project-file.js js/powerpoint-export.js /srv/onlinegantt/js/; install -o root -g root -m 644 favicon.svg style.css app.js index.html /srv/onlinegantt/'
```
