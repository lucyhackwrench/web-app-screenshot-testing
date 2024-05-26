# Web Application Screenshot Testing

Этот проект использует Playwright для автоматизированного тестирования веб-приложения, делая скриншоты страниц в разных браузерах и сравнивая их с помощью Pixelmatch. Тесты проверяют корректность отображения страниц в Google Chrome и Яндекс Браузере.

## Установка

1. Клонируйте репозиторий:

2. Установите зависимости:
    ```bash
    npm install
    ```
3. Создайте .env файл вида:
    ```
    DOMAIN=https://some-domain
    USERNAME=username
    PASSWORD=password
    CHROME_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
    YANDEX_EXECUTABLE_PATH=/Applications/Yandex.app/Contents/MacOS/Yandex
    ```

4. Создайте список тестируемых страниц pages.json:
    ```
    [
        {"url":"/home","name":"home"},
        ...
    ]
    ```

## Использование
```
npx playwright test
```

### Результаты
Все скриншоты сохраняются в папке results:

- Скриншоты для Google Chrome: results/chrome-<page-name>-screenshot.png
- Скриншоты для Яндекс Браузера: results/yandex-<page-name>-screenshot.png
- Изображения с различиями: results/diff-<page-name>-image.png
