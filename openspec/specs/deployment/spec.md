# Развёртывание

## Purpose

Раздача статического приложения на https://onlinegantt.ru через Caddy из /srv/onlinegantt. Проверено 13 ноября 2026.

## Requirements

### Requirement: Публичное размещение
Сайт SHALL предоставлять существующее приложение по https://onlinegantt.ru с доверенным сертификатом и перенаправлением HTTP на HTTPS.

#### Scenario: Открытие сайта
- **WHEN** пользователь открывает http://onlinegantt.ru
- **THEN** он переходит на HTTPS и получает работающее приложение с загруженными стилями и скриптами.

### Requirement: Изолированный публичный каталог
Веб-сервер SHALL раздавать только файлы приложения из отдельного каталога, без репозитория, документации, тестов и пользовательских JSON.

#### Scenario: Запрос служебных файлов
- **WHEN** посетитель запрашивает /.git/config, /AGENTS.md или /openspec/README.md
- **THEN** сервер возвращает 404.

### Requirement: Сохранение модели данных
Развёртывание SHALL сохранять работу с проектом в памяти браузера и ручной JSON-экспорт без отправки содержимого проекта на сервер.

#### Scenario: Сохранение и повторное открытие
- **WHEN** пользователь сохраняет проект и импортирует скачанный JSON
- **THEN** план восстанавливается через существующий интерфейс.

### Requirement: Иконка вкладки
Страница SHALL подключать локальный SVG favicon, повторяющий логотип GanttFlow.

#### Scenario: Открытие приложения
- **WHEN** браузер открывает приложение
- **THEN** ссылка rel=icon указывает на favicon.svg, доступный по HTTPS с типом image/svg+xml и содержащий логотип без внешних ресурсов.

Публичные файлы: index.html, favicon.svg, style.css, app.js, js/project-file.js и js/powerpoint-export.js.

### Requirement: Подтверждение Google Search Console
Главная страница SHALL содержать в head метатег google-site-verification со значением, предоставленным владельцем сайта.

#### Scenario: Чтение исходного HTML
- **WHEN** проверяется index.html
- **THEN** единственный метатег google-site-verification находится внутри head перед body и имеет content `VA_rSZ7nsNxbqXU1UtSRnI2x3mXYFoQBefcTE54DGOs`.

### Requirement: Счётчик Яндекс.Метрики
Страница SHALL подключать счётчик 114229137 сразу после charset в head, до внешних библиотек, с асинхронной загрузкой и параметрами ssr, webvisor, clickmap, accurateTrackBounce и trackLinks, равными true, referrer из document.referrer и url из location.href.

#### Scenario: JavaScript включён
- **WHEN** браузер выполняет начальный HTML
- **THEN** загрузчик запрашивает https://mc.yandex.ru/metrika/tag.js?id=114229137 асинхронно и ставит init счётчика в очередь; уже присутствующий script с этим URL не добавляется повторно.

#### Scenario: JavaScript отключён
- **WHEN** браузер обрабатывает начало body без JavaScript
- **THEN** noscript содержит невидимое изображение https://mc.yandex.ru/watch/114229137 с пустым alt.
