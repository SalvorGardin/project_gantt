## ADDED Requirements

### Requirement: Подтверждение Google Search Console
Главная страница SHALL содержать в head метатег google-site-verification со значением, предоставленным владельцем сайта.

#### Scenario: Чтение исходного HTML
- **WHEN** проверяется index.html
- **THEN** единственный метатег google-site-verification находится внутри head перед body и имеет content `VA_rSZ7nsNxbqXU1UtSRnI2x3mXYFoQBefcTE54DGOs`.
