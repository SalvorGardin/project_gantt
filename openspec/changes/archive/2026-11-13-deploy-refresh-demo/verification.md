# Проверка 13 ноября 2026

56 Node-тестов, node --check app.js и git diff --check прошли. Требуется заменить только app.js. Файл загружен в /home/admin_user/site-update-cbc3757e/app.js; SHA-256 cbc3757ea60c8cff029c9a41a1fee44928c0089df35c822a3eae0f948182377a совпадает с локальным. Резервная копия: app.js.backup рядом с пакетом, SHA-256 d8a0e13e7d64bd9887965a4566ac4a99b40db7cfce2eea7be9c8632395a73bd8.

При подготовке публикация требовала ввода владельцем пароля sudo: sudo -n true требует пароль, публичный каталог принадлежит root.

```sh
ssh -t -p 2620 admin_user@179.253.173.110 'sudo install -o root -g root -m 644 /home/admin_user/site-update-cbc3757e/app.js /srv/onlinegantt/app.js'
```

Владелец подтвердил выполнение установки. Проверены все шесть публичных файлов: каждый возвращает HTTPS 200 и совпадает с локальным по SHA-256. Опубликованный app.js имеет SHA-256 cbc3757ea60c8cff029c9a41a1fee44928c0089df35c822a3eae0f948182377a. Публикация демо подтверждена; браузерная проверка не выполнялась. Изменение завершено и архивировано.
