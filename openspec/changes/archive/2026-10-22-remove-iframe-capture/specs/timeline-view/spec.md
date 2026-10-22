## ADDED Requirements

### Requirement: Экспорт без служебного iframe-протокола
Приложение SHALL выполнять экспорт PNG/JPEG через exportGantt и html-to-image, не подключая служебный скрипт data-pplx-inline-edit для захвата страницы и передачи данных родительскому окну.

#### Scenario: Удаление служебной интеграции
- **WHEN** приложение открывается отдельно или внутри iframe
- **THEN** скрипт INLINE_EDIT_CAPTURE_REQUEST/INLINE_EDIT_SCREENSHOT_RESULT/INLINE_EDIT_SCROLL отсутствует; штатный экспорт диаграммы остаётся доступным.
