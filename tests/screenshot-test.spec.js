const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const { test } = require('@playwright/test');
const os = require('os');
require('dotenv').config();

const pagesJson = require('../pages.json');

const domain = process.env.DOMAIN;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const chromeExecutablePath = process.env.CHROME_EXECUTABLE_PATH;
const yandexExecutablePath = process.env.YANDEX_EXECUTABLE_PATH;
const pages = pagesJson.map(page => ({
  url: `${domain}${page.url}`,
  name: page.name
}));
pages.unshift({
  url: 'https://webbrowsertools.com/useragent/',
  name: 'useragent'
}); // Проверяем, что действительно открывается в нужном браузере

// Селекторы
const formSelector = '.card-pf #kc-form-login';
const usernameSelector = '#username';
const passwordSelector = '#password';
const loginButtonSelector = '#kc-login';

// Время ожидания загрузки страницы (в миллисекундах)
const PAGE_LOAD_TIMEOUT = 2000;

test('Login and navigate through pages with screenshot comparison', async ({ playwright }) => {
  test.setTimeout(500000); // По умолчанию 30s, этого времени не достаточно. Можно разбить на несколько тестов

  const chrome = await playwright.chromium.launch({
    executablePath: chromeExecutablePath,
    headless: false
  });
  const yandex = await playwright.chromium.launch({
    executablePath: yandexExecutablePath,
    headless: false
  });

  const chromePage = await chrome.newPage();
  const yandexPage = await yandex.newPage();

  // Получаем информацию о браузерах и системе
  const chromeVersion = await chrome.version();
  const yandexVersion = await yandex.version();
  const viewportSize = await chromePage.viewportSize();
  const osInfo = {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
  };

  console.log('Testing environment information:');
  console.log(`Chrome version: ${chromeVersion}`);
  console.log(`Yandex version: ${yandexVersion}`);
  console.log(`Viewport size: ${viewportSize.width}x${viewportSize.height}`);
  console.log(`Operating System: ${osInfo.platform} ${osInfo.release} ${osInfo.arch}`);

  await chromePage.goto(domain);
  await yandexPage.goto(domain);

  // Дожидаемся появления формы входа
  await chromePage.waitForSelector(formSelector, { state: 'visible' });
  await yandexPage.waitForSelector(formSelector, { state: 'visible' });

  // Ввод логина и пароля
  await chromePage.fill(usernameSelector, username);
  await chromePage.fill(passwordSelector, password);
  await yandexPage.fill(usernameSelector, username);
  await yandexPage.fill(passwordSelector, password);

  // Нажатие кнопки для входа
  await chromePage.click(loginButtonSelector);
  await yandexPage.click(loginButtonSelector);

  // Дожидаемся перехода на следующую страницу
  // await chromePage.waitForNavigation();
  // await yandexPage.waitForNavigation();
  await chromePage.waitForTimeout(PAGE_LOAD_TIMEOUT);
  await yandexPage.waitForTimeout(PAGE_LOAD_TIMEOUT);

  // Функция для навигации и снятия скриншотов
  const navigateAndScreenshot = async (page, url, screenshotPath) => {
    await page.goto(url);
    await page.waitForTimeout(PAGE_LOAD_TIMEOUT); // Ожидание прогрузки страницы
    await page.screenshot({ path: screenshotPath });
  };

  // Проходимся по каждой странице и делаем скриншоты
  for (const { url, name } of pages) {
    await navigateAndScreenshot(chromePage, url, `results/chrome-${name}-screenshot.png`);
    await navigateAndScreenshot(yandexPage, url, `results/yandex-${name}-screenshot.png`);

    const img1 = PNG.sync.read(fs.readFileSync(`results/chrome-${name}-screenshot.png`));
    const img2 = PNG.sync.read(fs.readFileSync(`results/yandex-${name}-screenshot.png`));

    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    fs.writeFileSync(`results/diff-${name}-image.png`, PNG.sync.write(diff));

    console.log(`Number of different pixels for ${name}:`, numDiffPixels);
  }

  console.log('Test execution completed.');

  await chromePage.close();
  await yandexPage.close();

  await chrome.close();
  await yandex.close();
});