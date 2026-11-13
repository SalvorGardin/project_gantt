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

## Попытка публикации Яндекс.Метрики

13 ноября 2026 SSH-команда с BatchMode и ConnectTimeout=10 к admin_user@179.253.173.110:2620 завершилась до аутентификации: `Operation not permitted`. Сетевое соединение запрещено текущей средой. Новый index.html не загружен, серверные файлы не изменены. Проверка опубликованного счётчика не выполнена. Ранее загруженные пакеты не содержат это изменение.

## Повторная подготовка публикации Метрики

SSH-доступ подтверждён. 56 Node-тестов и проверка синтаксиса app.js прошли. Пять остальных публичных файлов совпадают с сервером по SHA-256; требуется заменить только index.html.

Новый файл загружен в `/home/admin_user/site-update-20433540/index.html`, SHA-256: `204335403973ace7c779b363c7c2931fd4a7c024db4fd495f0d44511cfb12cdc`. Резервная копия текущего серверного HTML сохранена рядом в `index.html.backup`, SHA-256: `ca5b2bcd7f5e63456e85a5f3a31a7c665c49e128625ed208f8f70a9c89c59bb1`.

Публикация ожидает выполнения владельцем команды ниже: `sudo -n true` требует пароль, публичный каталог принадлежит root. Пароль в переписке не запрашивается.

```sh
ssh -t -p 2620 admin_user@179.253.173.110 'sudo install -o root -g root -m 644 /home/admin_user/site-update-20433540/index.html /srv/onlinegantt/index.html'
```

После выполнения требуется проверить HTTPS и SHA-256 опубликованного HTML. Изменение не архивировано, так как публикация ещё не завершена.

## Публикация подтверждена — 13 ноября 2026

После сообщения владельца о выполнении sudo все шесть публичных файлов проверены по HTTPS: каждый возвращает 200 и совпадает с локальной версией по SHA-256. Главная страница также совпадает с index.html, включая счётчик Метрики 114229137. HTTP возвращает 308 на HTTPS. Запросы /.git/config, /AGENTS.md и /openspec/README.md возвращают 404. Поступление событий в кабинет Метрики не проверялось. Изменение завершено и архивировано.
