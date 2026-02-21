import { test, expect } from '@playwright/test';

test.describe('Wave 1: Layout, Navigation, and Routing', () => {
  test('1. Root path / redirects to /dashboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('2. /dashboard page loads successfully', async ({ page }) => {
    const response = await page.goto('/dashboard', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('3. /pipelines is accessible via sidebar link', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.locator('a[href="/pipelines"]')).toBeVisible();
  });

  test('4. /kanban is accessible via sidebar link', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.locator('a[href="/kanban"]')).toBeVisible();
  });

  test('5. /deals is accessible via sidebar link', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.locator('a[href="/deals"]')).toBeVisible();
  });

  test('6. /contacts is accessible via sidebar link', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.locator('a[href="/contacts"]')).toBeVisible();
  });

  test('7. /companies is accessible via sidebar link', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.locator('a[href="/companies"]')).toBeVisible();
  });

  test('8. /leads is accessible via sidebar link', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.locator('a[href="/leads"]')).toBeVisible();
  });

  test('9. Sidebar navigation contains expected menu items', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    const expectedLabels = [
      '대시보드',
      '파이프라인',
      '칸반',
      '딜 관리',
      '연락처',
      '회사',
      '리드',
      '활동',
      '이메일',
      '보고서',
      '태그',
      '멤버',
      '설정',
    ];

    for (const label of expectedLabels) {
      await expect(sidebar.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('10. Layout structure: main content area exists', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    const main = page.locator('main');
    await expect(main).toBeVisible();

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
