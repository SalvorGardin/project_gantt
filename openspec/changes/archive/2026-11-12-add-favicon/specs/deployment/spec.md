# ADDED Requirements

### Requirement: Иконка вкладки
Страница SHALL подключать локальный SVG favicon, повторяющий логотип GanttFlow.

#### Scenario: Открытие приложения
- **WHEN** браузер открывает приложение
- **THEN** ссылка rel=icon указывает на favicon.svg, доступный по HTTPS с типом image/svg+xml и содержащий логотип без внешних ресурсов.
