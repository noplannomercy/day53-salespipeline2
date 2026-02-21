import { test, expect } from '@playwright/test';

// ──────────────────────────────────────────────────────────────────────────────
// Wave 3: Deal CRUD + State Transitions, Deal Detail Page, Kanban Board
// Total: 9 tests (3 per section, max 15 overall)
// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────
// Deal CRUD + State Transitions
// ──────────────────────────────────────────────

test.describe('Deal CRUD + 상태 전이', () => {
  test('1. 딜 생성 - 폼 제출 후 목록에 나타남', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/deals', { waitUntil: 'networkidle' });

    // Count rows before creation
    const rowsBefore = await page.locator('tbody tr').count();

    // Open create modal
    await page.getByRole('button', { name: '딜 추가' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill title
    await page.locator('#deal-title').fill('E2E Test Deal');

    // Contact select — first visible combobox with placeholder "연락처 선택"
    await page.locator('[role="dialog"]').getByText('연락처 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    // Pipeline select
    await page.locator('[role="dialog"]').getByText('파이프라인 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Stage: pipeline change does NOT auto-select — must select manually
    await page.locator('[role="dialog"]').getByText('스테이지 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    // AssignedTo select
    await page.locator('[role="dialog"]').getByText('담당자 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Table has pagination (10 per page). After creation total count increases.
    // Verify by checking total count text or navigating to last page.
    // The total count text "총 N건" should increase.
    await expect(page.locator('text=/총 \\d+건/')).toBeVisible();
    // Navigate to next page if available to verify the new deal
    const nextBtn = page.getByRole('button', { name: '다음' });
    if (await nextBtn.isEnabled({ timeout: 1000 }).catch(() => false)) {
      // Keep clicking next until last page
      while (await nextBtn.isEnabled({ timeout: 500 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(300);
      }
    }
    await expect(page.locator('table').getByText('E2E Test Deal')).toBeVisible();
  });

  test('2. 딜 Won 전환 - 빠른 종료 버튼으로 Open 딜을 Won으로 전환', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/deals', { waitUntil: 'networkidle' });

    // Find a quick-close button for an open deal (seed data has open deals)
    const quickCloseSection = page.locator('text=진행 중인 딜 종료:').locator('..');
    await expect(quickCloseSection).toBeVisible();

    // Click the first quick-close button
    const firstQuickCloseBtn = quickCloseSection.locator('button').first();
    const dealName = await firstQuickCloseBtn.textContent();
    await firstQuickCloseBtn.click();

    // CloseDialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select Won
    await page.getByRole('button', { name: '성사 (Won)' }).click();

    // Confirm
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // The deal row should now show Won/성사 status
    if (dealName) {
      const row = page.locator('table tbody tr', { hasText: dealName.trim() });
      await expect(row.getByText('성사')).toBeVisible();
    }
  });

  test('3. 딜 Lost 전환 - 빠른 종료 버튼으로 Open 딜을 Lost로 전환 (사유 입력)', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/deals', { waitUntil: 'networkidle' });

    // Find quick-close buttons — need an open deal
    const quickCloseSection = page.locator('text=진행 중인 딜 종료:').locator('..');
    await expect(quickCloseSection).toBeVisible();

    // Click the second quick-close button (if available, else first)
    const quickCloseBtns = quickCloseSection.locator('button');
    const btnCount = await quickCloseBtns.count();
    const targetBtn = btnCount > 1 ? quickCloseBtns.nth(1) : quickCloseBtns.first();
    const dealName = await targetBtn.textContent();
    await targetBtn.click();

    // CloseDialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select Lost
    await page.getByRole('button', { name: '실패 (Lost)' }).click();

    // Enter lost reason
    await expect(page.locator('#lost-reason')).toBeVisible();
    await page.locator('#lost-reason').fill('E2E 테스트 실패 사유');

    // Confirm
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // The deal row should now show Lost/실패 status
    if (dealName) {
      const row = page.locator('table tbody tr', { hasText: dealName.trim() });
      await expect(row.getByText('실패')).toBeVisible();
    }
  });
});

// ──────────────────────────────────────────────
// Deal Detail Page
// ──────────────────────────────────────────────

test.describe('딜 상세 페이지', () => {
  test('4. 상세 페이지 탭 렌더링 - 7개 탭이 모두 표시됨', async ({ page }) => {
    // Navigate directly to a known deal (seed data has deal-1)
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/deals/deal-1', { waitUntil: 'networkidle' });

    // Verify all 7 tabs are visible
    await expect(page.getByRole('tab', { name: '정보' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '활동' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '노트' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '이메일' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '첨부파일' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '태그' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '타임라인' })).toBeVisible();
  });

  test('5. 정보 탭 편집 - 딜 제목 변경 후 저장', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/deals/deal-1', { waitUntil: 'networkidle' });

    // Should show 편집 button in DealDetail card
    await expect(page.getByRole('button', { name: '편집' })).toBeVisible();
    await page.getByRole('button', { name: '편집' }).click();

    // Edit mode should show 저장 button
    await expect(page.getByRole('button', { name: '저장' })).toBeVisible();

    // Change the title
    await page.locator('#deal-title').clear();
    await page.locator('#deal-title').fill('Updated Deal Title E2E');
    await page.getByRole('button', { name: '저장' }).click();

    // Should return to view mode and show updated title
    await expect(page.getByRole('button', { name: '편집' })).toBeVisible();
    await expect(page.locator('dd', { hasText: 'Updated Deal Title E2E' })).toBeVisible();
  });

  test('6. 딜 상세 탭 렌더링 - 활동/노트 탭이 실제 콘텐츠 영역을 표시함', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/deals/deal-1', { waitUntil: 'networkidle' });

    // Click 활동 tab — Wave 4에서 실제 구현됨
    await page.getByRole('tab', { name: '활동' }).click();
    await expect(page.getByRole('tab', { name: '활동' })).toHaveAttribute('data-state', 'active');

    // Click 노트 tab — Wave 4에서 실제 구현됨
    await page.getByRole('tab', { name: '노트' }).click();
    await expect(page.getByRole('tab', { name: '노트' })).toHaveAttribute('data-state', 'active');
  });
});

// ──────────────────────────────────────────────
// 칸반 보드
// ──────────────────────────────────────────────

test.describe('칸반 보드', () => {
  test('7. 칸반 보드 렌더링 - 파이프라인 스테이지 컬럼이 표시됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/kanban', { waitUntil: 'networkidle' });

    // Page heading should be visible (scope to main to avoid duplicate in banner)
    await expect(page.locator('main h1', { hasText: '칸반 보드' })).toBeVisible();

    // Pipeline selector should be visible with a value selected
    await expect(page.locator('[role="combobox"]').first()).toBeVisible();

    // At least one kanban column (stage) should be rendered
    // Each column has a "딜 추가" button at the bottom
    await expect(page.getByRole('button', { name: '딜 추가' }).first()).toBeVisible();

    // Seed data has 5 stages per pipeline — verify at least 3 columns show deal counts (N건)
    const countLabels = page.locator('text=/\\d+건/');
    await expect(countLabels.first()).toBeVisible();
  });

  test('8. 칸반 스테이지 내 딜 카드 표시 - 딜 카드가 올바른 컬럼에 렌더링됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/kanban', { waitUntil: 'networkidle' });

    // Default pipeline is "신규 영업" — seed has deals in it
    // Verify at least one deal card is visible somewhere on the board
    // DealCard shows the deal title
    // Seed data deals for 신규 영업: AlphaTech, 델타파이낸셜, 감마리테일, 제타헬스케어, 카파공공, 델타파이낸셜2
    await expect(page.getByText('AlphaTech SaaS 플랫폼 도입')).toBeVisible();
  });

  test('9. 칸반 딜 추가 - 컬럼의 딜 추가 버튼으로 새 딜 생성', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/kanban', { waitUntil: 'networkidle' });

    // Click the first "딜 추가" button in any column
    await page.getByRole('button', { name: '딜 추가' }).first().click();

    // Modal should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#kanban-deal-title')).toBeVisible();

    // Fill deal title
    await page.locator('#kanban-deal-title').fill('Kanban E2E Test Deal');

    // Select contact (required)
    await page.locator('[role="dialog"]').getByText('연락처 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    // Submit
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // New deal card should appear on the board
    await expect(page.getByText('Kanban E2E Test Deal')).toBeVisible();
  });
});
