# SalesPipe CRM — 작업 현황 (2026-02-21)

## 요약

| Wave | 내용 | 상태 | 테스트 |
|------|------|------|--------|
| Wave 1 | 공통 기반 (types, storage, layout, common 컴포넌트) | ✅ 완료 | 10/10 |
| Wave 2 | 핵심 CRUD (Pipeline, Company, Contact, Lead, Member) | ✅ 완료 | 20/20 |
| Wave 3 | 딜 + 칸반 | ✅ 완료 | 9/9 |
| Wave 4 | 고급 기능 (Activity, Email, Tag, Report, Dashboard, Settings) | ✅ 완료 | 20/20 |

**playwright 누적: 68/68 통과** (wave1~4: 60 + integration: 8)
**npm run build: ✅ 정상 (17개 라우트 모두 포함)**

---

## Wave 4 태스크 최종 현황

| # | 태스크 | 파일 수 | 담당자 | 상태 | 완료 시각 |
|---|--------|---------|--------|------|-----------|
| T4-1 ✅ | Activity 풀스택 | 5 | developer-a | ✅ 완료 | 2026-02-21 |
| T4-2 ✅ | Note + Email 풀스택 | 5 | developer-b | ✅ 완료 | 2026-02-21 |
| T4-3 ✅ | Tag + Attachment 풀스택 | 5 | developer-b | ✅ 완료 | 2026-02-21 |
| T4-4 ✅ | Report 풀스택 | 7 | developer-a | ✅ 완료 | 2026-02-21 |
| T4-5 ✅ | Dashboard 풀스택 | 6 | developer-a/b | ✅ 완료 | 2026-02-21 |
| T4-6 ✅ | Settings + 딜 상세 탭 완성 | 2+수정 | developer-b | ✅ 완료 | 2026-02-21 |

**Wave 4 구현 태스크 6/6 완료 ✅ — 총 31개 파일**

---

## Wave 4 딜 상세 탭 완성 목록

deals/[id]/page.tsx 탭 전체 완성 (T4-6):

| 탭 | 사용 서비스 | 상태 |
|----|-----------|------|
| 활동 | activity.service | ✅ 완료 |
| 노트 | note.service | ✅ 완료 |
| 이메일 | email.service | ✅ 완료 |
| 첨부파일 | attachment.service | ✅ 완료 |
| 태그 | tag.service + EntityTag | ✅ 완료 |
| 타임라인 | 활동+노트+이메일 통합 | ✅ 완료 |

---

## 최종 파일 구조 (Wave 1~4 전체 완성)

```
src/
├── types/index.ts ✅
├── lib/
│   ├── storage.ts ✅ (9개 함수)
│   ├── utils.ts ✅
│   └── seed.ts ✅ (initSeedData)
├── app/
│   ├── layout.tsx ✅
│   ├── page.tsx ✅ (→ /dashboard 리다이렉트)
│   ├── dashboard/page.tsx ✅ (T4-5)
│   ├── pipelines/page.tsx ✅
│   ├── kanban/page.tsx ✅
│   ├── deals/page.tsx ✅
│   ├── deals/[id]/page.tsx ✅ (탭 완성 — T4-6)
│   ├── contacts/page.tsx ✅
│   ├── contacts/[id]/page.tsx ✅
│   ├── companies/page.tsx ✅
│   ├── companies/[id]/page.tsx ✅
│   ├── leads/page.tsx ✅
│   ├── members/page.tsx ✅
│   ├── activities/page.tsx ✅ (T4-1)
│   ├── emails/page.tsx ✅ (T4-2)
│   ├── reports/page.tsx ✅ (T4-4)
│   ├── tags/page.tsx ✅ (T4-3)
│   └── settings/page.tsx ✅ (T4-6)
├── services/
│   ├── pipeline.service.ts ✅
│   ├── stage.service.ts ✅
│   ├── company.service.ts ✅
│   ├── contact.service.ts ✅
│   ├── lead.service.ts ✅
│   ├── member.service.ts ✅
│   ├── deal.service.ts ✅
│   ├── activity.service.ts ✅ (T4-1)
│   ├── note.service.ts ✅ (T4-2)
│   ├── email.service.ts ✅ (T4-2)
│   ├── tag.service.ts ✅ (T4-3)
│   ├── attachment.service.ts ✅ (T4-3)
│   ├── report.service.ts ✅ (T4-4)
│   └── dashboard.service.ts ✅ (T4-5)
└── components/
    ├── layout/ ✅ (AppLayout, Sidebar, Header, DarkModeProvider)
    ├── common/ ✅ (DataTable, Modal, ConfirmDialog, EmptyState, PriorityBadge, StatusBadge, TagBadge, MemberAvatar)
    ├── pipelines/ ✅ (PipelineForm, StageList, StageForm)
    ├── companies/ ✅ (CompanyForm, CompanyTable)
    ├── contacts/ ✅ (ContactForm, ContactTable)
    ├── leads/ ✅ (LeadForm, LeadTable, ConvertDialog)
    ├── members/ ✅ (MemberForm, MemberTable)
    ├── deals/ ✅ (DealTable, DealFilters, DealForm, CloseDialog, DealDetail, StageProgress)
    ├── kanban/ ✅ (KanbanBoard, KanbanColumn, DealCard, KanbanFilters)
    ├── activities/ ✅ (ActivityForm, ActivityList, ActivityCalendar — T4-1)
    ├── emails/ ✅ (EmailForm, EmailList — T4-2)
    ├── tags/ ✅ (TagForm, TagList — T4-3)
    ├── reports/ ✅ (PipelineReport, SalesReport, ActivityReport, ForecastReport, LeadSourceReport — T4-4)
    ├── dashboard/ ✅ (SummaryCards, ForecastChart, ActivitySummary, RecentTimeline — T4-5)
    └── settings/ ✅ (SettingsForm — T4-6)
```

**총 87개 파일 — Wave 1~4 전체 완성**

---

## 알려진 이슈 / 기술 부채

| 항목 | 내용 | 우선순위 |
|------|------|--------|
| STORAGE_KEYS 이중 정의 | types/index.ts(UPPER_CASE) + storage.ts(camelCase) 동일 값 | 낮음 (기능상 문제 없음) |
| 딜 목록 → 딜 상세 이동 | onRowClick 없어 URL 직접 접근 필요 | 낮음 |
| 파이프라인 선택 시 스테이지 자동 선택 | DealForm에서 수동 선택 필요 | 낮음 |
