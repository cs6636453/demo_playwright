// @ts-check
import { test, expect } from '@playwright/test';

test('Check login', async ({page}) => {
    await page.goto('https://reg.kmutnb.ac.th/registrar/home');

});
