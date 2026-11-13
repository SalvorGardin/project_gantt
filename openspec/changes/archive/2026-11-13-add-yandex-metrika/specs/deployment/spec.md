## ADDED Requirements

### Requirement: Счётчик Яндекс.Метрики
Страница SHALL подключать счётчик 114229137 сразу после charset в head, до внешних библиотек, с асинхронной загрузкой и параметрами ssr, webvisor, clickmap, accurateTrackBounce и trackLinks, равными true, referrer из document.referrer и url из location.href.

#### Scenario: JavaScript включён
- **WHEN** браузер выполняет начальный HTML
- **THEN** загрузчик запрашивает https://mc.yandex.ru/metrika/tag.js?id=114229137 асинхронно и ставит init счётчика в очередь; уже присутствующий script с этим URL не добавляется повторно.

#### Scenario: JavaScript отключён
- **WHEN** браузер обрабатывает начало body без JavaScript
- **THEN** noscript содержит невидимое изображение https://mc.yandex.ru/watch/114229137 с пустым alt.
