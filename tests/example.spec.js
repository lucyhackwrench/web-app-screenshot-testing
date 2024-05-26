const { test } = require('@playwright/test');

test('simple test', async ({ page }) => {
  console.log('Test runs');
});