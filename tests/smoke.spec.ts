import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('landing page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/MERNMaxxingg/i);
    await expect(page.getByRole('heading', { name: /level up/i })).toBeVisible();

    const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('manifest'));
    expect(criticalErrors).toHaveLength(0);
  });

  test('login page has form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('register page has form elements', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('admin login flow succeeds', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('admin@mernmaxxingg.com');
    await page.getByLabel(/password/i).fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('dashboard page loads for authenticated user', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@mernmaxxingg.com');
    await page.getByLabel(/password/i).fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto('/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('navigation to login and register from landing', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign in/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await page.goBack();
    await page.getByRole('link', { name: /get started/i }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });
});
