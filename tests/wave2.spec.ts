import { test, expect } from '@playwright/test';

// ──────────────────────────────────────────────────────────────────────────────
// Wave 2: CRUD Tests — Pipeline, Company, Contact, Lead, Member
// Total: 20 tests (4 per entity)
// ──────────────────────────────────────────────────────────────────────────────

test.describe('Pipeline CRUD', () => {
  test('1. 파이프라인 생성 - 폼 제출 후 목록에 나타남', async ({ page }) => {
    await page.goto('/pipelines', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: '파이프라인 추가' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('#pipeline-name').fill('E2E Test Pipeline');
    await page.locator('#pipeline-desc').fill('E2E test description');
    await page.getByRole('button', { name: '생성' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    // The pipeline name appears in a span inside the card
    await expect(
      page.locator('span.font-medium.text-sm.truncate', { hasText: 'E2E Test Pipeline' })
    ).toBeVisible();
  });

  test('2. 파이프라인 목록 표시 - 페이지 로드 시 헤더와 추가 버튼 보임', async ({ page }) => {
    await page.goto('/pipelines', { waitUntil: 'networkidle' });

    // Scope heading check to main to avoid duplicate in header
    await expect(page.locator('main h1', { hasText: '파이프라인 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '파이프라인 추가' })).toBeVisible();
  });

  test('3. 파이프라인 수정 - 이름 변경 후 반영', async ({ page }) => {
    await page.goto('/pipelines', { waitUntil: 'networkidle' });

    // Create a pipeline to edit
    await page.getByRole('button', { name: '파이프라인 추가' }).click();
    await page.locator('#pipeline-name').fill('Pipeline To Edit');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Find the card and click the first button (pencil/edit icon)
    const cardContent = page.locator('[data-slot="card-content"]', { hasText: 'Pipeline To Edit' });
    await cardContent.locator('button').first().click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#pipeline-name').fill('Pipeline Edited');
    await page.getByRole('button', { name: '수정' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(
      page.locator('span.font-medium.text-sm.truncate', { hasText: 'Pipeline Edited' })
    ).toBeVisible();
  });

  test('4. 파이프라인 삭제 - 확인 후 목록에서 사라짐', async ({ page }) => {
    await page.goto('/pipelines', { waitUntil: 'networkidle' });

    // Create a pipeline to delete
    await page.getByRole('button', { name: '파이프라인 추가' }).click();
    await page.locator('#pipeline-name').fill('Pipeline To Delete');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(
      page.locator('span.font-medium.text-sm.truncate', { hasText: 'Pipeline To Delete' })
    ).toBeVisible();

    // Find the card and click the last button (trash/delete icon)
    const cardContent = page.locator('[data-slot="card-content"]', { hasText: 'Pipeline To Delete' });
    const buttons = cardContent.locator('button');
    await buttons.last().click();

    // Confirm deletion in dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '삭제' }).click();

    await expect(
      page.locator('span.font-medium.text-sm.truncate', { hasText: 'Pipeline To Delete' })
    ).not.toBeVisible();
  });
});

test.describe('Company CRUD', () => {
  test('1. 회사 생성 - 폼 제출 후 검색으로 확인', async ({ page }) => {
    await page.goto('/companies', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: '회사 추가' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('#company-name').fill('E2E Test Company');
    await page.locator('#company-industry').fill('IT/소프트웨어');
    await page.getByRole('button', { name: '생성' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Search to find the company (may be on a later page due to pagination)
    await page.locator('input[placeholder*="검색"]').fill('E2E Test Company');
    await page.waitForTimeout(500);
    await expect(page.getByRole('row', { name: /E2E Test Company/ })).toBeVisible();
  });

  test('2. 회사 목록 표시 - 페이지 로드 시 헤더와 추가 버튼 보임', async ({ page }) => {
    await page.goto('/companies', { waitUntil: 'networkidle' });

    await expect(page.locator('h1', { hasText: '회사 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '회사 추가' })).toBeVisible();
  });

  test('3. 회사 수정 - 이름 변경 후 반영', async ({ page }) => {
    await page.goto('/companies', { waitUntil: 'networkidle' });

    // Create a company to edit
    await page.getByRole('button', { name: '회사 추가' }).click();
    await page.locator('#company-name').fill('Company To Edit');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Search to find the row
    await page.locator('input[placeholder*="검색"]').fill('Company To Edit');
    await page.waitForTimeout(500);

    const row = page.getByRole('row', { name: /Company To Edit/ });
    await row.getByRole('button', { name: '편집' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#company-name').fill('Company Edited');
    await page.getByRole('button', { name: '수정' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Clear search and search for new name
    await page.locator('input[placeholder*="검색"]').fill('Company Edited');
    await page.waitForTimeout(500);
    await expect(page.getByRole('row', { name: /Company Edited/ })).toBeVisible();
  });

  test('4. 회사 삭제 - 확인 후 테이블에서 사라짐', async ({ page }) => {
    await page.goto('/companies', { waitUntil: 'networkidle' });

    // Create a company to delete
    await page.getByRole('button', { name: '회사 추가' }).click();
    await page.locator('#company-name').fill('Company To Delete');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Search to find the row
    await page.locator('input[placeholder*="검색"]').fill('Company To Delete');
    await page.waitForTimeout(500);

    const row = page.getByRole('row', { name: /Company To Delete/ });
    await row.getByRole('button', { name: '삭제' }).click();

    // Confirm in dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '삭제' }).click();

    // Row should be gone (search still active so no results)
    await expect(page.getByRole('row', { name: /Company To Delete/ })).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Contact CRUD
// NOTE: Contacts page only renders table data after React hydration + seed.
// Navigate via /dashboard first so DarkModeProvider fully mounts before
// going to /contacts, ensuring seeded data and table rows are visible.
// ──────────────────────────────────────────────

test.describe('Contact CRUD', () => {
  test('1. 연락처 생성 - 폼 제출 후 검색으로 확인', async ({ page }) => {
    // Init via dashboard so table renders correctly
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/contacts', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: '연락처 추가' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('#contact-name').fill('E2E Contact Test');
    await page.locator('#contact-email').fill('e2e.contact@test.com');
    await page.getByRole('button', { name: '생성' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Search to find the new contact
    await page.locator('input[placeholder*="검색"]').fill('E2E Contact Test');
    await page.waitForTimeout(500);
    await expect(page.getByRole('row', { name: /E2E Contact Test/ })).toBeVisible();
  });

  test('2. 연락처 목록 표시 - 헤더와 추가 버튼 보임', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/contacts', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1', { hasText: '연락처' })).toBeVisible();
    await expect(page.getByRole('button', { name: '연락처 추가' })).toBeVisible();
    // Table should have rows after proper hydration
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('3. 연락처 수정 - 이름 변경 후 반영', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/contacts', { waitUntil: 'networkidle' });

    // Create a contact to edit
    await page.getByRole('button', { name: '연락처 추가' }).click();
    await page.locator('#contact-name').fill('Contact To Edit');
    await page.locator('#contact-email').fill('contact.edit@test.com');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Search and edit
    await page.locator('input[placeholder*="검색"]').fill('Contact To Edit');
    await page.waitForTimeout(500);
    const row = page.getByRole('row', { name: /Contact To Edit/ });
    await row.getByRole('button', { name: '편집' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#contact-name').fill('Contact Edited');
    await page.getByRole('button', { name: '수정' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.locator('input[placeholder*="검색"]').fill('Contact Edited');
    await page.waitForTimeout(500);
    await expect(page.getByRole('row', { name: /Contact Edited/ })).toBeVisible();
  });

  test('4. 연락처 삭제 - 확인 후 테이블에서 사라짐', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/contacts', { waitUntil: 'networkidle' });

    // Create a contact to delete
    await page.getByRole('button', { name: '연락처 추가' }).click();
    await page.locator('#contact-name').fill('Contact To Delete');
    await page.locator('#contact-email').fill('contact.delete@test.com');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Search and delete
    await page.locator('input[placeholder*="검색"]').fill('Contact To Delete');
    await page.waitForTimeout(500);
    const row = page.getByRole('row', { name: /Contact To Delete/ });
    await row.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByRole('row', { name: /Contact To Delete/ })).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Lead CRUD
// Leads table also requires prior hydration (same race condition as Contacts).
// Use /dashboard → /leads navigation pattern.
// Lead form requires selecting a contact AND an assignedTo member via combobox.
// ──────────────────────────────────────────────

test.describe('Lead CRUD', () => {
  test('1. 리드 생성 - 연락처+담당자 선택 후 테이블에 나타남', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/leads', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: '리드 추가' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select first contact from dropdown
    const dialog = page.getByRole('dialog');
    const comboboxes = dialog.locator('[role="combobox"]');
    await comboboxes.first().click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    // Select assignedTo member (last combobox)
    await comboboxes.last().click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('2. 리드 목록 표시 - 헤더와 추가 버튼 보임', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/leads', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1', { hasText: '리드 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '리드 추가' })).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('3. 리드→딜 전환 - 검증됨 상태 리드를 딜로 전환', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/leads', { waitUntil: 'networkidle' });

    // Create a qualified lead
    await page.getByRole('button', { name: '리드 추가' }).click();
    const dialog = page.getByRole('dialog');
    const comboboxes = dialog.locator('[role="combobox"]');

    // Contact
    await comboboxes.first().click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    // Status = 검증됨 (qualified) — 3rd combobox (source, status, score, assignedTo)
    await comboboxes.nth(2).click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: '검증됨' }).click();
    await page.waitForTimeout(200);

    // AssignedTo
    await comboboxes.last().click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Click the conversion button (shown for qualified leads)
    const convertBtn = page.locator('button', { hasText: '전환' }).first();
    await expect(convertBtn).toBeVisible();
    await convertBtn.click();

    // ConvertDialog opens — pipeline and stage should be auto-selected
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('button', { name: '전환' })).not.toBeDisabled();
    await page.getByRole('button', { name: '전환' }).click();

    // Dialog closes after successful conversion
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('4. 리드 삭제 - 확인 후 테이블에서 사라짐', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/leads', { waitUntil: 'networkidle' });

    // Create a lead to delete
    await page.getByRole('button', { name: '리드 추가' }).click();
    const dialog = page.getByRole('dialog');
    const comboboxes = dialog.locator('[role="combobox"]');

    await comboboxes.first().click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    await comboboxes.last().click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Count rows before delete
    const rowsBefore = await page.locator('tbody tr').count();

    // Delete the first row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '삭제' }).click();

    await expect(page.locator('tbody tr')).toHaveCount(rowsBefore - 1);
  });
});

// ──────────────────────────────────────────────
// Member CRUD
// Members page renders seeded data correctly on direct navigation.
// ──────────────────────────────────────────────

test.describe('Member CRUD', () => {
  test('1. 멤버 생성 - 폼 제출 후 검색으로 확인', async ({ page }) => {
    await page.goto('/members', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: '멤버 추가' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('#member-name').fill('E2E Member Test');
    await page.locator('#member-email').fill('e2e.member@test.com');
    await page.getByRole('button', { name: '생성' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();

    await page.locator('input[placeholder*="검색"]').fill('E2E Member Test');
    await page.waitForTimeout(500);
    await expect(page.getByRole('row', { name: /E2E Member Test/ })).toBeVisible();
  });

  test('2. 멤버 목록 표시 - 헤더와 추가 버튼 보임', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/members', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1', { hasText: '멤버 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '멤버 추가' })).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('3. 멤버 수정 - 이름 변경 후 반영', async ({ page }) => {
    await page.goto('/members', { waitUntil: 'networkidle' });

    // Create a member to edit
    await page.getByRole('button', { name: '멤버 추가' }).click();
    await page.locator('#member-name').fill('Member To Edit');
    await page.locator('#member-email').fill('member.edit@test.com');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Search and edit
    await page.locator('input[placeholder*="검색"]').fill('Member To Edit');
    await page.waitForTimeout(500);
    const row = page.getByRole('row', { name: /Member To Edit/ });
    await row.getByRole('button', { name: '편집' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#member-name').fill('Member Edited');
    await page.getByRole('button', { name: '수정' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.locator('input[placeholder*="검색"]').fill('Member Edited');
    await page.waitForTimeout(500);
    await expect(page.getByRole('row', { name: /Member Edited/ })).toBeVisible();
  });

  test('4. 멤버 삭제 - 확인 후 테이블에서 사라짐', async ({ page }) => {
    await page.goto('/members', { waitUntil: 'networkidle' });

    // Create a member to delete
    await page.getByRole('button', { name: '멤버 추가' }).click();
    await page.locator('#member-name').fill('Member To Delete');
    await page.locator('#member-email').fill('member.delete@test.com');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Search and delete
    await page.locator('input[placeholder*="검색"]').fill('Member To Delete');
    await page.waitForTimeout(500);
    const row = page.getByRole('row', { name: /Member To Delete/ });
    await row.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByRole('row', { name: /Member To Delete/ })).not.toBeVisible();
  });
});
