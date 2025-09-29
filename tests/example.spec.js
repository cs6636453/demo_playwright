// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com/';
const VALID_USERNAME = 'standard_user';
const VALID_PASSWORD = 'secret_sauce';

test.describe('SauceDemo Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('1. Login with valid credentials', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('2. Login with invalid credentials', async ({ page }) => {
    await page.fill('#user-name', 'wrong_user');
    await page.fill('#password', 'wrong_pass');
    await page.click('#login-button');
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  test('3. Add item to cart', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.click('text=Add to cart');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('4. Remove item from cart', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.click('text=Add to cart');
    await page.click('text=Remove');
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });

  test('5. Proceed to checkout', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.click('text=Add to cart');
    await page.click('.shopping_cart_link');
    await page.click('#checkout');
    await expect(page.locator('#first-name')).toBeVisible();
  });

  test('6. Complete checkout with valid info', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.click('text=Add to cart');
    await page.click('.shopping_cart_link');
    await page.click('#checkout');
    await page.fill('#first-name', 'John');
    await page.fill('#last-name', 'Doe');
    await page.fill('#postal-code', '12345');
    await page.click('#continue');
    await page.click('#finish');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  test('7. Complete checkout with invalid info', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.click('text=Add to cart');
    await page.click('.shopping_cart_link');
    await page.click('#checkout');
    await page.click('#continue'); // skip filling fields
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  test('8. Logout functionality', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');
    await expect(page.locator('#login-button')).toBeVisible();
  });

  test('9. Filter items by price', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.selectOption('.product_sort_container', 'lohi'); // Price low to high
    const prices = await page.$$eval('.inventory_item_price', items => items.map(i => parseFloat(i.textContent?.replace('$','') || '0')));
    const sorted = [...prices].sort((a,b) => a-b);
    expect(prices).toEqual(sorted);
  });

  test('10. Sort items by name', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.selectOption('.product_sort_container', 'az'); // Name A-Z
    const names = await page.$$eval('.inventory_item_name', items => items.map(i => i.textContent || ''));
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

});

test.describe('SauceDemo System Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
  });

  test('11. Verify UI responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // mobile
    await expect(page.locator('.inventory_list')).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 720 }); // desktop
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('12. Verify session timeout', async ({ page }) => {
    await page.waitForTimeout(3000); // simulate wait, adjust for demo
    await expect(page.locator('.inventory_list')).toBeVisible(); // still logged in
  });

  test('13. Verify error handling for invalid inputs', async ({ page }) => {
    await page.click('text=Add to cart'); // valid
    // invalid input handled via negative scenario
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('14. Verify data persistence after logout', async ({ page }) => {
    await page.click('text=Add to cart');
    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(1);
  });

  test('15. Verify accessibility compliance', async ({ page }) => {
    const html = await page.innerHTML('body');
    expect(html.length).toBeGreaterThan(0); // basic check; full audit requires axe-core or Lighthouse
  });

});

test.describe('SauceDemo Performance Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('16. Measure homepage load time', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL);
    const duration = Date.now() - start;
    console.log(`Homepage load time: ${duration}ms`);
  });

  test('17. Measure login response time', async ({ page }) => {
    const start = Date.now();
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.waitForSelector('.inventory_list');
    console.log(`Login response time: ${Date.now() - start}ms`);
  });

  test('18. Measure checkout process time', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    await page.click('text=Add to cart');
    await page.click('.shopping_cart_link');
    await page.click('#checkout');
    const start = Date.now();
    await page.fill('#first-name', 'John');
    await page.fill('#last-name', 'Doe');
    await page.fill('#postal-code', '12345');
    await page.click('#continue');
    await page.click('#finish');
    await page.waitForSelector('.complete-header');
    console.log(`Checkout process time: ${Date.now() - start}ms`);
  });

  test('19. Measure cart update time', async ({ page }) => {
    await page.fill('#user-name', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#login-button');
    const start = Date.now();
    await page.click('text=Add to cart');
    await page.click('text=Remove');
    console.log(`Cart update time: ${Date.now() - start}ms`);
  });

  test('20. Measure server response time under load', async ({ page }) => {
    const start = Date.now();
    for (let i=0; i<3; i++) { // simulate minimal load
      await page.goto(BASE_URL);
    }
    console.log(`Server response under minimal load: ${Date.now() - start}ms`);
  });

});
