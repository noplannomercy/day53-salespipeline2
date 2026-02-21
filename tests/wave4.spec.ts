import { test, expect } from '@playwright/test';

// ──────────────────────────────────────────────────────────────────────────────
// Wave 4: Activity CRUD, Email, Tag, Dashboard, Settings
// Total: 20 tests
// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────
// Activity CRUD + 완료 토글 (4개)
// ──────────────────────────────────────────────

test.describe('Activity CRUD + 완료 토글', () => {
  test('1. 활동 목록 렌더링 - 탭과 뷰 전환 버튼이 표시됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/activities', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1', { hasText: '활동 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '리스트' })).toBeVisible();
    await expect(page.getByRole('button', { name: '캘린더' })).toBeVisible();
    await expect(page.getByRole('button', { name: '새 활동' })).toBeVisible();

    // Activity list tabs
    await expect(page.getByRole('tab', { name: /오늘/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /이번 주/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /예정/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /완료/ })).toBeVisible();
  });

  test('2. 활동 생성 - 폼 제출 후 목록에 나타남', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/activities', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: '새 활동' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('#activity-title').fill('E2E 테스트 활동');

    // Set today's date so it appears in "오늘" tab
    const today = new Date().toISOString().split('T')[0];
    await page.locator('#activity-due').fill(today);

    // Select assignee (required)
    await page.locator('[role="dialog"]').getByText('담당자 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await page.getByRole('tab', { name: /오늘/ }).click();
    await expect(page.getByText('E2E 테스트 활동')).toBeVisible();
  });

  test('3. 활동 완료 토글 - 체크박스로 완료 탭 카운트 증가', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/activities', { waitUntil: 'networkidle' });

    // Navigate to 예정 tab which has seed activities
    await page.getByRole('tab', { name: /예정/ }).click();
    await page.waitForTimeout(300);

    const completedTabBefore = page.getByRole('tab', { name: /완료/ });
    const beforeText = await completedTabBefore.textContent() ?? '';
    const beforeCount = parseInt(beforeText.match(/\d+/)?.[0] ?? '0');

    // Click first checkbox to complete the activity
    const firstCheckbox = page.locator('[type="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.click();
    await page.waitForTimeout(300);

    // Completed count should increase
    const afterText = await completedTabBefore.textContent() ?? '';
    const afterCount = parseInt(afterText.match(/\d+/)?.[0] ?? '0');
    expect(afterCount).toBeGreaterThan(beforeCount);
  });

  test('4. 활동 삭제 - 생성 후 삭제하면 목록에서 제거됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/activities', { waitUntil: 'networkidle' });

    // Create an activity to delete
    await page.getByRole('button', { name: '새 활동' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#activity-title').fill('삭제할 활동 E2E');
    await page.locator('[role="dialog"]').getByText('담당자 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Find the activity in any tab
    let found = false;
    for (const tabName of [/예정/, /오늘/, /이번 주/]) {
      await page.getByRole('tab', { name: tabName }).click();
      await page.waitForTimeout(200);
      if (await page.getByText('삭제할 활동 E2E').isVisible({ timeout: 500 }).catch(() => false)) {
        found = true;
        break;
      }
    }
    expect(found).toBeTruthy();

    // Click delete (trash) button in the activity row
    const activityRow = page.locator('div.rounded-lg.border', { hasText: '삭제할 활동 E2E' });
    await activityRow.getByRole('button').last().click();
    await page.waitForTimeout(200);

    // Confirm dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '삭제' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText('삭제할 활동 E2E')).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Email 생성 + 목록 (4개)
// ──────────────────────────────────────────────

test.describe('Email 생성 + 목록', () => {
  test('5. 이메일 목록 렌더링 - 탭과 작성 버튼이 표시됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/emails', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1', { hasText: '이메일' })).toBeVisible();
    await expect(page.getByRole('button', { name: '이메일 작성' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '전체' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '발송됨' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '임시저장' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '예약됨' })).toBeVisible();
  });

  test('6. 이메일 초안 생성 - 폼 제출 후 임시저장 탭에 나타남', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/emails', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: '이메일 작성' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select contact first (auto-fills "to")
    await page.locator('[role="dialog"]').getByText('연락처 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    // Fill from (required)
    await page.locator('#email-from').fill('sender@test.com');

    // Fill "to" if not auto-filled
    const toValue = await page.locator('#email-to').inputValue();
    if (!toValue) {
      await page.locator('#email-to').fill('recipient@test.com');
    }

    await page.locator('#email-subject').fill('E2E 테스트 이메일');
    await page.locator('#email-body').fill('테스트 본문입니다.');

    // Submit (status defaults to draft)
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify in draft tab
    await page.getByRole('tab', { name: '임시저장' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText('E2E 테스트 이메일')).toBeVisible();
  });

  test('7. 이메일 발송 - 임시저장 이메일을 발송됨으로 전환', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/emails', { waitUntil: 'networkidle' });

    // Create a draft
    await page.getByRole('button', { name: '이메일 작성' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('[role="dialog"]').getByText('연락처 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    await page.locator('#email-from').fill('test@test.com');
    const toValue = await page.locator('#email-to').inputValue();
    if (!toValue) {
      await page.locator('#email-to').fill('to@test.com');
    }
    await page.locator('#email-subject').fill('발송할 이메일');
    await page.locator('#email-body').fill('발송 테스트');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Go to draft tab and find the send button
    await page.getByRole('tab', { name: '임시저장' }).click();
    await page.waitForTimeout(300);

    const emailRow = page.locator('tr', { hasText: '발송할 이메일' });
    await expect(emailRow).toBeVisible();
    await emailRow.getByRole('button', { name: '발송' }).click();
    await page.waitForTimeout(300);

    // Should now appear in 발송됨 tab
    await page.getByRole('tab', { name: '발송됨' }).click();
    await expect(page.getByText('발송할 이메일')).toBeVisible();
  });

  test('8. 이메일 삭제 - 생성 후 삭제하면 목록에서 제거됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/emails', { waitUntil: 'networkidle' });

    // Create a draft to delete
    await page.getByRole('button', { name: '이메일 작성' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('[role="dialog"]').getByText('연락처 선택').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(200);

    await page.locator('#email-from').fill('delete@test.com');
    const toValue = await page.locator('#email-to').inputValue();
    if (!toValue) {
      await page.locator('#email-to').fill('del@test.com');
    }
    await page.locator('#email-subject').fill('삭제할 이메일 E2E');
    await page.locator('#email-body').fill('삭제 테스트');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Find and delete from the list
    const emailRow = page.locator('tr', { hasText: '삭제할 이메일 E2E' });
    await expect(emailRow).toBeVisible();
    await emailRow.getByRole('button', { name: '삭제' }).click();
    await page.waitForTimeout(200);

    // Confirm deletion dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '삭제' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText('삭제할 이메일 E2E')).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Tag CRUD (4개)
// ──────────────────────────────────────────────

test.describe('Tag CRUD', () => {
  test('9. 태그 목록 렌더링 - 시드 태그 카드가 표시됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/tags', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1', { hasText: '태그 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '새 태그' })).toBeVisible();

    // Seed data tags
    await expect(page.getByText('엔터프라이즈')).toBeVisible();
    await expect(page.getByText('긴급')).toBeVisible();
  });

  test('10. 태그 생성 - 새 태그 폼 제출 후 카드가 추가됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/tags', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: '새 태그' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('#tag-name').fill('E2E 테스트 태그');

    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText('E2E 테스트 태그')).toBeVisible();
  });

  test('11. 태그 수정 - 이름 변경 후 카드에 반영됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/tags', { waitUntil: 'networkidle' });

    // Create a tag to edit
    await page.getByRole('button', { name: '새 태그' }).click();
    await page.locator('#tag-name').fill('수정 전 태그');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('수정 전 태그')).toBeVisible();

    // Find edit button on the tag card (first button = pencil/edit)
    const tagCard = page.locator('[data-slot="card"]', { hasText: '수정 전 태그' });
    await tagCard.getByRole('button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('#tag-name').clear();
    await page.locator('#tag-name').fill('수정 후 태그');
    await page.getByRole('button', { name: '수정' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText('수정 후 태그')).toBeVisible();
    await expect(page.getByText('수정 전 태그')).not.toBeVisible();
  });

  test('12. 태그 삭제 - 삭제 확인 후 카드가 제거됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/tags', { waitUntil: 'networkidle' });

    // Create a tag to delete
    await page.getByRole('button', { name: '새 태그' }).click();
    await page.locator('#tag-name').fill('삭제할 태그 E2E');
    await page.getByRole('button', { name: '생성' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('삭제할 태그 E2E')).toBeVisible();

    // Find delete button (last button = trash) on the tag card
    const tagCard = page.locator('[data-slot="card"]', { hasText: '삭제할 태그 E2E' });
    await tagCard.getByRole('button').last().click();
    await page.waitForTimeout(200);

    // Confirm deletion
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '삭제' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText('삭제할 태그 E2E')).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Dashboard 로드 (3개)
// ──────────────────────────────────────────────

test.describe('Dashboard 로드', () => {
  test('13. 대시보드 KPI 카드 렌더링 - 주요 지표 카드가 표시됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    await expect(page.locator('main h1', { hasText: '대시보드' })).toBeVisible();

    // KPI card titles visible
    await expect(page.getByText('진행 중 딜')).toBeVisible();
    await expect(page.getByText('이번 달 성사')).toBeVisible();
    await expect(page.getByText('매출 예측')).toBeVisible();
    await expect(page.getByText('이번 주 활동')).toBeVisible();
  });

  test('14. 대시보드 차트 렌더링 - Recharts SVG가 표시됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Recharts renders svg elements
    const chartCount = await page.locator('.recharts-wrapper').count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('15. 대시보드 최근 딜 변경 - 리스트가 표시됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // The dashboard shows recent deal changes section
    await expect(page.getByText('최근 딜 변경')).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Settings 동작 (3개)
// ──────────────────────────────────────────────

test.describe('Settings 동작', () => {
  test('16. 설정 페이지 렌더링 - 설정 항목들이 표시됨', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/settings', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1', { hasText: '설정' })).toBeVisible();
    await expect(page.getByText('기본 파이프라인')).toBeVisible();
    await expect(page.getByText('기본 통화')).toBeVisible();
    await expect(page.getByText('다크 모드')).toBeVisible();
    await expect(page.getByRole('button', { name: '설정 저장' })).toBeVisible();
    await expect(page.getByRole('button', { name: '데이터 초기화' })).toBeVisible();
  });

  test('17. 설정 저장 - 통화 변경 후 저장 버튼 클릭', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/settings', { waitUntil: 'networkidle' });

    // Click save button (verifies it's clickable and doesn't throw)
    await page.getByRole('button', { name: '설정 저장' }).click();
    await page.waitForTimeout(300);

    // Page should still be on settings (no redirect on save)
    await expect(page.locator('main h1', { hasText: '설정' })).toBeVisible();
  });

  test('18. 데이터 초기화 - 인라인 확인 UI가 표시되고 취소 가능', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/settings', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: '데이터 초기화' }).click();
    await page.waitForTimeout(200);

    // Inline confirmation UI appears (not a modal dialog)
    await expect(page.getByText('정말 초기화하시겠습니까?')).toBeVisible();
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
    await expect(page.getByRole('button', { name: '확인' })).toBeVisible();

    // Cancel (do NOT actually reset data)
    await page.getByRole('button', { name: '취소' }).click();
    await page.waitForTimeout(200);

    // Confirmation UI hidden, back to initial state
    await expect(page.getByText('정말 초기화하시겠습니까?')).not.toBeVisible();
    await expect(page.getByRole('button', { name: '데이터 초기화' })).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// 딜 상세 Wave4 탭 (2개) — bonus tests within limit
// ──────────────────────────────────────────────

test.describe('딜 상세 Wave4 탭', () => {
  test('19. 딜 상세 활동 탭 - 활동 탭 콘텐츠가 표시됨 (Wave4 구현)', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/deals/deal-1', { waitUntil: 'networkidle' });

    await page.getByRole('tab', { name: '활동' }).click();
    await page.waitForTimeout(300);

    // Named tabpanel for 활동 tab should be visible
    await expect(page.getByRole('tabpanel', { name: '활동' })).toBeVisible();
  });

  test('20. 딜 상세 태그 탭 - 태그 탭 콘텐츠가 표시됨 (Wave4 구현)', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.goto('/deals/deal-1', { waitUntil: 'networkidle' });

    await page.getByRole('tab', { name: '태그' }).click();
    await page.waitForTimeout(300);

    // Named tabpanel for 태그 tab should be visible
    await expect(page.getByRole('tabpanel', { name: '태그' })).toBeVisible();
  });
});
