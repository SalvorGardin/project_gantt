# Проверка пересчёта родителей — 22 октября 2026

Пересчёт выполняется одним защищённым проходом вверх по дереву. Используются непосредственные дети, копии дат и calculateDuration. Исключения больше не подавляются; флаг повторного входа снимается в finally. Добавлены старый и новый родители при переносе и родитель удалённого элемента. Пустая ветка сохраняет последний период. Формат JSON v1 не изменён.

`node tests/parents-browser.cjs [URL]` прошёл в Chromium, Europe/Moscow, file:// с реальным DHTMLX. Проверены форма редактирования, обновление дат через API и событие окончания drag, добавление, удаление, перенос moveTask, пустой родитель, вложенная обычная задача, даты и длительность предков. Цепочка из 20 уровней дала 21 событие обновления. Скачанный JSON v1 содержит пересчитанные даты. Ошибок страницы нет. Запуск использует существующие Playwright/Chromium через NODE_PATH и BROWSER_EXECUTABLE.

Физическое перетаскивание мышью отдельно не проверялось. Для marker-режима подключены onRowDragStart/onRowDragEnd, для moveTask — onBeforeTaskMove/onAfterTaskMove. Сверены официальные контракты [onAfterTaskMove](https://docs.dhtmlx.com/gantt/api/event/onaftertaskmove/), [onRowDragStart](https://docs.dhtmlx.com/gantt/api/event/onrowdragstart/) и [onRowDragEnd](https://docs.dhtmlx.com/gantt/api/event/onrowdragend/).

Все 50 Node-тестов, проверка синтаксиса app.js, git diff --check и локальная проверка ссылок/структуры требований OpenSpec прошли. CLI OpenSpec не установлен; его валидация не выполнялась. Новые зависимости не добавлены.
