# SalesPipe CRM — 구현 계획서 (IMPLEMENTATION.md)

> 기준 문서: docs/requirements.md
> 기술 스택: Next.js 16 + TypeScript (App Router) · localStorage · Tailwind CSS · shadcn/ui · Recharts · lucide-react

---

## 프로젝트 디렉터리 구조

```
src/
  app/                        # Next.js App Router 페이지
  components/
    layout/                   # 레이아웃 컴포넌트
    common/                   # 재사용 공통 컴포넌트
    pipelines/ kanban/ deals/ contacts/ companies/
    leads/ activities/ emails/ reports/ tags/ members/
    dashboard/ settings/
  services/                   # localStorage 데이터 서비스
  lib/                        # 유틸리티, 시드 데이터
  types/                      # TypeScript 타입 정의
```

---

## Wave 1 — 공통 기반 ✅ 완료

### 생성 파일 목록

| 파일 | 역할 |
|------|------|
| `src/types/index.ts` | 모든 엔티티 타입 정의 (14개: Pipeline, Stage, Company, Contact, Lead, Deal, Activity, Note, Tag, EntityTag, Email, Attachment, Member, Report) + 필터/정렬 타입 |
| `src/lib/storage.ts` | localStorage CRUD 래퍼 (getAll, getById, create, update, remove, save, seedIfEmpty, getObject, saveObject) |
| `src/lib/utils.ts` | 날짜 포맷, 금액 포맷(KRW/USD), ID 생성(crypto.randomUUID), cn() |
| `src/lib/seed.ts` | 초기 더미 데이터 생성 함수 (앱 최초 실행 시 호출) |
| `app/layout.tsx` | Next.js 루트 레이아웃, AppLayout 주입, 다크모드 클래스 관리 |
| `app/page.tsx` | `/` → `/dashboard` 리다이렉트 |
| `components/layout/AppLayout.tsx` | Sidebar + Header + main content 래퍼 |
| `components/layout/Sidebar.tsx` | 13개 메뉴 항목 네비게이션, 활성 경로 하이라이트 |
| `components/layout/Header.tsx` | 페이지 제목, 글로벌 검색(UI만), 알림 아이콘 |
| `components/common/DataTable.tsx` | 범용 테이블 (컬럼 정의, 정렬, 페이지네이션, 빈 상태) |
| `components/common/Modal.tsx` | 범용 모달 래퍼 (Radix Dialog 기반) |
| `components/common/ConfirmDialog.tsx` | 삭제/확인 다이얼로그 |
| `components/common/EmptyState.tsx` | 데이터 없음 상태 UI |
| `components/common/PriorityBadge.tsx` | low/medium/high/urgent 컬러 뱃지 |
| `components/common/StatusBadge.tsx` | open/won/lost, new/contacted/qualified/unqualified 뱃지 |
| `components/common/TagBadge.tsx` | 태그 색상 뱃지 |
| `components/common/MemberAvatar.tsx` | 멤버 아바타 (이니셜 폴백) |

### 의존성
- 없음 (Wave 1이 모든 Wave의 기반)

### 태스크 분해

| # | 태스크 | 산출물 |
|---|--------|--------|
| T1-1 ✅ | Next.js 16 프로젝트 초기화 · shadcn/ui · Tailwind · Recharts · lucide-react 설치 · tsconfig 설정 | package.json, tsconfig.json |
| T1-2 ✅ | `src/types/index.ts` — 14개 엔티티 인터페이스 · 공통 필터/정렬 타입 · 상수 enum/union 작성 | types/index.ts |
| T1-3 ✅ | `src/lib/storage.ts` + `src/lib/utils.ts` — localStorage 추상화 레이어 · 포맷/ID 유틸 | storage.ts, utils.ts |
| T1-4 ✅ | `src/lib/seed.ts` — 3개 Pipeline, 15개 Stage, 5개 Member, 10개 Company, 20개 Contact, 5개 Lead, 10개 Deal 등 더미 데이터 | seed.ts |
| T1-5 ✅ | `app/layout.tsx` + `app/page.tsx` + AppLayout + Sidebar + Header — 전체 네비게이션 골격 | layout 3종 |
| T1-6 ✅ | `components/common/*` — DataTable, Modal, ConfirmDialog, EmptyState, PriorityBadge, StatusBadge, TagBadge, MemberAvatar | common 8종 |

---

## Wave 2 — 핵심 CRUD ✅ 완료

### 생성 파일 목록

| 파일 | 역할 |
|------|------|
| `src/services/pipeline.service.ts` | getPipelines, createPipeline, updatePipeline, deletePipeline |
| `src/services/stage.service.ts` | getStages, createStage, updateStage, deleteStage, reorderStages |
| `app/pipelines/page.tsx` | 파이프라인 목록 + 스테이지 관리 통합 페이지 |
| `components/pipelines/PipelineForm.tsx` | 파이프라인 생성/수정 폼 (이름, 설명, 기본값 토글) |
| `components/pipelines/StageList.tsx` | 스테이지 목록 (드래그 순서 변경, 색상 표시) |
| `components/pipelines/StageForm.tsx` | 스테이지 생성/수정 폼 (이름, 색상 피커, 확률%) |
| `src/services/company.service.ts` | getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany |
| `app/companies/page.tsx` | 회사 목록 (산업/규모 필터, 연락처 수/딜 수 집계) |
| `app/companies/[id]/page.tsx` | 회사 상세 (정보 편집, 소속 연락처, 연결 딜, 노트) |
| `components/companies/CompanyForm.tsx` | 회사 생성/수정 폼 |
| `components/companies/CompanyTable.tsx` | 회사 테이블 뷰 |
| `src/services/contact.service.ts` | getContacts, getContactById, createContact, updateContact, deleteContact |
| `app/contacts/page.tsx` | 연락처 목록 (검색, 태그 필터, 딜/활동 수 표시) |
| `app/contacts/[id]/page.tsx` | 연락처 상세 (정보 편집, 연결 딜, 활동 이력, 노트, 이메일) |
| `components/contacts/ContactForm.tsx` | 연락처 생성/수정 폼 (회사 연결 포함) |
| `components/contacts/ContactTable.tsx` | 연락처 테이블 뷰 |
| `src/services/lead.service.ts` | getLeads, createLead, updateLead, deleteLead, convertLeadToDeal |
| `app/leads/page.tsx` | 리드 목록 (소스/상태/담당자 필터, 스코어 표시) |
| `components/leads/LeadForm.tsx` | 리드 생성/수정 폼 (스코어 슬라이더, 상태 전이) |
| `components/leads/LeadTable.tsx` | 리드 테이블 뷰 |
| `components/leads/ConvertDialog.tsx` | Qualified → Deal 전환 확인 다이얼로그 (파이프라인/스테이지 선택) |
| `src/services/member.service.ts` | getMembers, createMember, updateMember, deleteMember |
| `app/members/page.tsx` | 멤버 목록 (역할 필터, 담당 딜/활동 수 표시) |
| `components/members/MemberForm.tsx` | 멤버 생성/수정 폼 |
| `components/members/MemberTable.tsx` | 멤버 테이블 뷰 |

### 의존성
- Wave 1 완료 필요 (types, storage, common 컴포넌트)

### 태스크 분해

| # | 태스크 | 산출물 |
|---|--------|--------|
| T2-1 ✅ (developer-a) | pipeline.service.ts + stage.service.ts + pipelines/page.tsx + PipelineForm + StageList + StageForm | 파이프라인 관리 풀스택 |
| T2-2 ✅ (developer-a) | company.service.ts + companies/page.tsx + CompanyTable + CompanyForm + companies/[id]/page.tsx | 회사 관리 풀스택 |
| T2-3 ✅ (developer-b) | contact.service.ts + contacts/page.tsx + ContactTable + ContactForm + contacts/[id]/page.tsx | 연락처 관리 풀스택 |
| T2-4 ✅ (developer-b) | lead.service.ts + leads/page.tsx + LeadTable + LeadForm + ConvertDialog | 리드 관리 풀스택 |
| T2-5 ✅ (developer-b) | member.service.ts + members/page.tsx + MemberTable + MemberForm | 멤버 관리 풀스택 |

---

## Wave 3 — 딜 + 칸반 ✅ 완료

### 생성 파일 목록

| 파일 | 역할 |
|------|------|
| `src/services/deal.service.ts` | getDeals, getDealById, createDeal, updateDeal, deleteDeal, moveDealToStage, closeDeal |
| `app/deals/page.tsx` | 딜 목록 페이지 (테이블 뷰, 필터, 정렬) |
| `components/deals/DealTable.tsx` | 딜 테이블 (파이프라인/스테이지/상태/담당자/금액/마감일 컬럼) |
| `components/deals/DealFilters.tsx` | 파이프라인/스테이지/상태/담당자 필터 패널 |
| `components/deals/DealForm.tsx` | 딜 생성/수정 폼 (연락처, 회사, 금액, 마감일, 우선도, 담당자) |
| `components/deals/CloseDialog.tsx` | Won/Lost 전환 다이얼로그 (Lost 시 lostReason 입력) |
| `app/deals/[id]/page.tsx` | 딜 상세 페이지 (탭: 정보/활동/노트/이메일/첨부파일/태그/타임라인) |
| `components/deals/DealDetail.tsx` | 딜 상세 정보 편집 섹션 |
| `components/deals/StageProgress.tsx` | 스테이지 진행 바 (현재 스테이지 강조, 클릭으로 이동) |
| `app/kanban/page.tsx` | 칸반 보드 페이지 (파이프라인 선택, 필터) |
| `components/kanban/KanbanBoard.tsx` | 칸반 보드 컨테이너 (가로 스크롤, 컬럼 렌더) |
| `components/kanban/KanbanColumn.tsx` | 스테이지 컬럼 (딜 수, 총 금액, + 버튼, 드롭 영역) |
| `components/kanban/DealCard.tsx` | 딜 카드 (제목, 금액, 회사, 담당자 아바타, 우선도 뱃지, 드래그 핸들) |
| `components/kanban/KanbanFilters.tsx` | 담당자/우선도/금액 범위 필터 |

### 의존성
- Wave 1, Wave 2 완료 필요
- 칸반 드래그: HTML5 Drag and Drop API 사용 (외부 라이브러리 없음)
- 딜 상세 탭 내 Activity/Note/Email/Attachment/Tag: Wave 4 서비스 참조 → Wave 4 이전에는 placeholder로 처리

### 태스크 분해

| # | 태스크 | 산출물 |
|---|--------|--------|
| T3-1 ✅ (developer-a) | deal.service.ts — 7개 함수 (getDeals 필터 로직 포함) | deal.service.ts |
| T3-2 ✅ (developer-a) | deals/page.tsx + DealTable + DealFilters — 딜 목록 + 필터 | 딜 목록 |
| T3-3 ✅ (developer-a) | DealForm + CloseDialog — 딜 CRUD + Won/Lost 전환 | 딜 폼 2종 |
| T3-4 ✅ (developer-b) | deals/[id]/page.tsx + DealDetail + StageProgress — 딜 상세 (탭 골격, placeholder) | 딜 상세 |
| T3-5 ✅ (developer-b) | kanban/page.tsx + KanbanBoard + KanbanColumn + DealCard + KanbanFilters — 칸반 드래그 포함 | 칸반 전체 |

---

## Wave 4 — 고급 기능

### 생성 파일 목록

| 파일 | 역할 |
|------|------|
| `src/services/activity.service.ts` | getActivities, createActivity, updateActivity, deleteActivity, toggleActivityComplete |
| `app/activities/page.tsx` | 활동 목록 (리스트/캘린더 뷰 전환, 완료 체크, 담당자 필터) |
| `components/activities/ActivityForm.tsx` | 활동 생성/수정 폼 (타입, 제목, 설명, 마감일, 담당자, 딜/연락처 연결) |
| `components/activities/ActivityList.tsx` | 리스트 뷰 (오늘/이번 주/예정/완료 탭) |
| `components/activities/ActivityCalendar.tsx` | 월간 캘린더 뷰 (dueDate 기준 배치) |
| `src/services/note.service.ts` | getNotes, createNote, updateNote, deleteNote |
| `src/services/email.service.ts` | getEmails, createEmail, updateEmail, sendEmail |
| `app/emails/page.tsx` | 이메일 목록 (sent/draft 탭, 작성 버튼) |
| `components/emails/EmailForm.tsx` | 이메일 작성 폼 (수신자, 제목, 본문, 연락처/딜 연결) |
| `components/emails/EmailList.tsx` | 이메일 목록 테이블 |
| `src/services/tag.service.ts` | getTags, createTag, updateTag, deleteTag |
| `src/services/attachment.service.ts` | getAttachments, createAttachment, deleteAttachment |
| `app/tags/page.tsx` | 태그 목록 (CRUD, 엔티티 수 표시) |
| `components/tags/TagForm.tsx` | 태그 생성/수정 폼 (이름, 색상 피커) |
| `components/tags/TagList.tsx` | 태그 목록 카드 |
| `src/services/report.service.ts` | getReports, createReport, updateReport, deleteReport + 집계 로직 |
| `app/reports/page.tsx` | 보고서 페이지 (5개 보고서 탭) |
| `components/reports/PipelineReport.tsx` | 스테이지별 딜 수/금액 바 차트 (Recharts) |
| `components/reports/SalesReport.tsx` | 월별 성사 금액 라인 차트 (Recharts) |
| `components/reports/ActivityReport.tsx` | 멤버별 활동 수 바 차트 (Recharts) |
| `components/reports/ForecastReport.tsx` | probability × value 매출 예측 합계 |
| `components/reports/LeadSourceReport.tsx` | 소스별 전환율 파이 차트 (Recharts) |
| `src/services/dashboard.service.ts` | getDashboardData, getForecastData |
| `app/dashboard/page.tsx` | 대시보드 메인 페이지 |
| `components/dashboard/SummaryCards.tsx` | 파이프라인별 딜 수/금액, 이번 달 성사/실패 카드 |
| `components/dashboard/ForecastChart.tsx` | 스테이지별 매출 예측 차트 |
| `components/dashboard/ActivitySummary.tsx` | 이번 주 활동 완료/예정 요약 |
| `components/dashboard/RecentTimeline.tsx` | 최근 딜 변경 타임라인 |
| `app/settings/page.tsx` | 앱 설정 페이지 |
| `components/settings/SettingsForm.tsx` | 기본 파이프라인, 기본 통화, 다크모드, 데이터 초기화 |

### Wave 4 내 딜 상세 탭 완성

Wave 3에서 placeholder로 두었던 딜 상세 탭을 Wave 4 서비스 완성 후 채움:

| 탭 | 사용 서비스 | 내용 |
|----|------------|------|
| 활동 | activity.service | ActivityList 재사용 (dealId 필터) |
| 노트 | note.service | 인라인 노트 CRUD |
| 이메일 | email.service | EmailList 재사용 (dealId 필터) |
| 첨부파일 | attachment.service | 첨부파일 메타 목록 |
| 태그 | tag.service + EntityTag | 태그 추가/제거 |
| 타임라인 | 활동+노트+이메일 통합 | 시간순 정렬 |

### 의존성
- Wave 1, 2, 3 완료 필요
- Recharts: Wave 1에서 설치 완료된 패키지 사용
- 딜 상세 탭 완성: note, activity, email, attachment, tag 서비스 모두 완료 후

### 태스크 분해

| # | 태스크 | 산출물 |
|---|--------|--------|
| T4-1 ✅ | activity.service.ts + activities/page.tsx + ActivityForm + ActivityList + ActivityCalendar | 활동 관리 풀스택 |
| T4-2 ✅ | note.service.ts + email.service.ts + emails/page.tsx + EmailForm + EmailList | 노트 서비스 + 이메일 관리 |
| T4-3 ✅ | tag.service.ts + attachment.service.ts + tags/page.tsx + TagForm + TagList | 태그 + 첨부파일 서비스 |
| T4-4 ✅ | report.service.ts + reports/page.tsx + 5개 차트 컴포넌트 | 보고서 풀스택 |
| T4-5 ✅ | dashboard.service.ts + dashboard/page.tsx + SummaryCards + ForecastChart + ActivitySummary + RecentTimeline | 대시보드 풀스택 |
| T4-6 ✅ | settings/page.tsx + SettingsForm + 딜 상세 나머지 탭 완성 (활동/노트/이메일/첨부/태그/타임라인) | 설정 + 딜 상세 완성 |

---

## 서비스 함수 총계

| Wave | 서비스 파일 | 함수 수 |
|------|------------|---------|
| Wave 2 | pipeline, stage, company, contact, lead, member | 27개 |
| Wave 3 | deal | 7개 |
| Wave 4 | activity, note, tag, email, attachment, report, dashboard | 22개 |
| **합계** | **13개 서비스** | **56개** |

---

## 전체 태스크 요약

| Wave | 태스크 수 | 파일 수 |
|------|----------|---------|
| Wave 1 | 6개 | 17개 |
| Wave 2 | 5개 | 25개 |
| Wave 3 | 5개 | 14개 |
| Wave 4 | 6개 | 31개 |
| **합계** | **22개** | **87개** |

---

## Wave 5 — 피처 확장

> 참고: `docs/FEATURE-DISCOVERY.md` — 구현 확정 피처 W5-1 ~ W5-8

### 생성/수정 파일 목록

| 파일 | 역할 | 구분 |
|------|------|------|
| `src/types/index.ts` | `DealHistory`, `Notification` 타입 + `STORAGE_KEYS` 2개 추가 | 수정 |
| `src/services/backup.service.ts` | `exportData()`, `importData()` — 전체 localStorage JSON 직렬화/복원 | 신규 |
| `src/services/notification.service.ts` | `generateNotifications()`, `markAsRead()`, `getUnreadCount()` | 신규 |
| `src/services/history.service.ts` | `addHistory()`, `getDealHistory()` — 딜 필드 변경 이력 기록/조회 | 신규 |
| `src/services/deal.service.ts` | `cloneDeal()` 추가, `updateDeal`/`moveDealToStage`/`closeDeal`에 이력 기록 연동 | 수정 |
| `src/services/contact.service.ts` | `findDuplicates(email, phone)` 추가 | 수정 |
| `src/services/report.service.ts` | `getWeightedPipelineValue()` 추가 (Stage.probability × Deal.value) | 수정 |
| `components/common/TagAutocomplete.tsx` | 기존 태그 목록 기반 인라인 자동완성 입력 컴포넌트 | 신규 |
| `components/common/NotificationPanel.tsx` | 알림 목록 패널 (읽음/안읽음, 엔티티 링크) | 신규 |
| `components/layout/Header.tsx` | 벨 아이콘 + 미읽음 뱃지 + `NotificationPanel` 연결 | 수정 |
| `components/deals/DealTable.tsx` | 행 메뉴에 "복제" 액션 추가 | 수정 |
| `components/deals/DealDetail.tsx` | 복제 버튼 추가, 타임라인 탭에 `DealHistory` 포함 | 수정 |
| `components/kanban/KanbanColumn.tsx` | 컬럼 하단 + 버튼으로 해당 스테이지에 딜 인라인 추가 | 수정 |
| `components/kanban/KanbanBoard.tsx` | `createDeal` 핸들러를 `KanbanColumn`으로 전달 | 수정 |
| `components/contacts/ContactForm.tsx` | 이메일/전화 입력 blur 시 중복 탐지 + 경고 UI | 수정 |
| `components/deals/DealForm.tsx` | 태그 입력을 `TagAutocomplete`로 교체 | 수정 |
| `components/contacts/ContactForm.tsx` | 태그 입력을 `TagAutocomplete`로 교체 | 수정 |
| `components/companies/CompanyForm.tsx` | 태그 입력을 `TagAutocomplete`로 교체 | 수정 |
| `components/settings/SettingsForm.tsx` | 데이터 내보내기/가져오기 버튼 추가 | 수정 |
| `components/dashboard/ForecastChart.tsx` | 가중 파이프라인 가치(확률 × 금액) 반영 | 수정 |
| `components/reports/ForecastReport.tsx` | 가중 계산 표시 방식 업데이트 | 수정 |

### 의존성

- Wave 1–4 완료 필요
- `T5-4` (types 확장) 완료 후 → `T5-5`, `T5-6` 진행
- `T5-1`, `T5-2`, `T5-3`, `T5-7`은 상호 독립 (병렬 가능)

### 태스크 분해

| # | 태스크 | 생성/수정 파일 | 병렬 그룹 |
|---|--------|---------------|-----------|
| T5-1 | **딜 복제 + 칸반 인라인 딜 추가** | `deal.service.ts`, `DealTable`, `DealDetail`, `KanbanColumn`, `KanbanBoard` | 1단계 |
| T5-2 | **데이터 백업/복원 + 태그 자동완성** | 새 `backup.service.ts`, `SettingsForm`, 새 `TagAutocomplete`, `DealForm`, `ContactForm`, `CompanyForm` | 1단계 |
| T5-3 | **가중 파이프라인 가치** | `report.service.ts`, `ForecastChart`, `ForecastReport` | 1단계 |
| T5-4 | **types/index.ts 확장** | `types/index.ts` (`DealHistory`, `Notification` 타입 + `STORAGE_KEYS` 추가) | 1단계 완료 후 |
| T5-5 | **딜 변경 이력** | 새 `history.service.ts`, `deal.service.ts` (이력 기록 추가), `DealDetail` | T5-4 이후 |
| T5-6 | **알림 패널** | 새 `notification.service.ts`, 새 `NotificationPanel`, `Header` | T5-4 이후, T5-5와 병렬 |
| T5-7 | **컨택 중복 탐지** | `contact.service.ts`, `ContactForm` | 1단계 (T5-2와 `ContactForm` 충돌 주의) |

**병렬 실행 전략:**
```
1단계 (병렬): T5-1 / T5-2 / T5-3 / T5-7  ← ContactForm은 T5-2와 T5-7이 동시 수정하므로 한 태스크로 통합 처리
2단계 (순차): T5-4 (types 확장)
3단계 (병렬): T5-5 / T5-6
```

> ⚠️ `ContactForm.tsx`는 T5-2(TagAutocomplete)와 T5-7(중복 탐지) 양쪽에서 수정됨. 동일 담당자에게 배정하거나 T5-7을 T5-2에 통합.

---

## 서비스 함수 총계 (Wave 5 포함)

| Wave | 서비스 파일 | 함수 수 |
|------|------------|---------|
| Wave 2 | pipeline, stage, company, contact, lead, member | 27개 |
| Wave 3 | deal | 7개 |
| Wave 4 | activity, note, tag, email, attachment, report, dashboard | 22개 |
| Wave 5 | deal(+2), contact(+1), report(+1), 신규 backup/notification/history | +10개 |
| **합계** | **16개 서비스** | **~66개** |

---

## 전체 태스크 요약 (Wave 5 포함)

| Wave | 태스크 수 | 파일 수 |
|------|----------|---------|
| Wave 1 | 6개 | 17개 |
| Wave 2 | 5개 | 25개 |
| Wave 3 | 5개 | 14개 |
| Wave 4 | 6개 | 31개 |
| Wave 5 | 7개 | 21개 |
| **합계** | **29개** | **108개** |

---

## Wave 6 — 피처 확장 II

> 참고: `docs/FEATURE-DISCOVERY.md` — 구현 확정 피처 W6-1 ~ W6-5

### 생성/수정 파일 목록

| 파일 | 역할 | 구분 |
|------|------|------|
| `src/types/index.ts` | `EmailTemplate` 타입 + `STORAGE_KEYS.TEMPLATES` 추가 | 수정 |
| `src/services/template.service.ts` | `getTemplates()`, `createTemplate()`, `updateTemplate()`, `deleteTemplate()` | 신규 |
| `src/services/notification.service.ts` | `generateDealDeadlineNotifications(deals)` 추가 — D-3/D-1 마감일 딜 자동 알림 | 수정 |
| `src/services/deal.service.ts` | 딜 조회 시 마감일 알림 자동 트리거 연동 | 수정 |
| `src/services/report.service.ts` | `getMemberPerformance()`, `getPipelineFunnelData()` 추가 | 수정 |
| `components/emails/TemplateSelector.tsx` | 이메일 템플릿 선택/미리보기 드롭다운 UI | 신규 |
| `components/emails/EmailForm.tsx` | 템플릿 선택 시 본문 자동 채우기 연동 | 수정 |
| `app/deals/[id]/page.tsx` | 헤더에 복제 버튼 추가 (기존 `cloneDeal` 재사용) | 수정 |
| `components/reports/MemberPerformanceReport.tsx` | 멤버별 딜 성사율·활동 수 바 차트 (Recharts) | 신규 |
| `components/reports/FunnelReport.tsx` | 스테이지별 딜 수 깔때기 차트 (Recharts FunnelChart) | 신규 |
| `app/reports/page.tsx` | 멤버 성과 + 퍼널 탭 추가 (기존 5탭 → 7탭) | 수정 |

### 의존성

- Wave 1–5 완료 필요
- `T6-4` (EmailForm UI)는 `T6-3` (template.service + types) 완료 후 진행
- `T6-1`, `T6-2`, `T6-3`, `T6-5`는 상호 독립 (병렬 가능)
- `reports/page.tsx`는 `T6-5` 단독 수정 — 타 태스크와 충돌 없음

### 태스크 분해

| # | 태스크 | 생성/수정 파일 | 병렬 그룹 |
|---|--------|---------------|-----------|
| T6-1 | **딜 기한 알림 자동 생성** | `notification.service.ts`, `deal.service.ts` | 1단계 |
| T6-2 | **딜 상세 내 복제 버튼** | `app/deals/[id]/page.tsx` | 1단계 |
| T6-3 | **이메일 템플릿 기반** (types + service) | `types/index.ts`, 새 `template.service.ts` | 1단계 |
| T6-4 | **이메일 템플릿 UI** | 새 `TemplateSelector.tsx`, `EmailForm.tsx` | T6-3 이후 (2단계) |
| T6-5 | **리포트 확장** (멤버 성과 + 퍼널) | `report.service.ts`, 새 `MemberPerformanceReport.tsx`, 새 `FunnelReport.tsx`, `reports/page.tsx` | 1단계 |

**병렬 실행 전략:**
```
1단계 (병렬): T6-1 / T6-2 / T6-3 / T6-5
2단계 (순차): T6-4  ← template.service.ts 완성 후
```

> ⚠️ `reports/page.tsx`는 T6-5 단독 수정. T6-4의 `EmailForm.tsx`는 T6-5와 충돌 없음.

---

## 서비스 함수 총계 (Wave 6 포함)

| Wave | 서비스 파일 | 함수 수 |
|------|------------|---------|
| Wave 2 | pipeline, stage, company, contact, lead, member | 27개 |
| Wave 3 | deal | 7개 |
| Wave 4 | activity, note, tag, email, attachment, report, dashboard | 22개 |
| Wave 5 | deal(+2), contact(+1), report(+1), 신규 backup/notification/history | +10개 |
| Wave 6 | notification(+1), deal(+1 트리거), report(+2), 신규 template | +7개 |
| **합계** | **17개 서비스** | **~73개** |

---

## 전체 태스크 요약 (Wave 6 포함)

| Wave | 태스크 수 | 파일 수 |
|------|----------|---------|
| Wave 1 | 6개 | 17개 |
| Wave 2 | 5개 | 25개 |
| Wave 3 | 5개 | 14개 |
| Wave 4 | 6개 | 31개 |
| Wave 5 | 7개 | 21개 |
| Wave 6 | 5개 | 11개 (신규 4 + 수정 7) |
| **합계** | **34개** | **119개** |

---

## Refactor Wave 1 — 데이터 무결성 수정

> 기준: `docs/REFACTOR-DISCOVERY.md` RF-05 · RF-06 · RF-07
> 목적: cascade 삭제 누락으로 인한 orphan 데이터 방지
> 신규 파일 없음 — 기존 서비스 함수만 수정

### 수정 대상 및 Before / After

| ID | 파일 | 함수 | Before | After |
|----|------|------|--------|-------|
| RF-05 | `src/services/pipeline.service.ts` | `deletePipeline()` | 스테이지만 삭제, 소속 딜 orphan | 딜을 기본 파이프라인 첫 스테이지로 재배정 후 삭제 |
| RF-06 | `src/services/stage.service.ts` | `deleteStage()` | 스테이지만 삭제, 소속 딜 orphan | 딜을 다음 스테이지로 재배정; 다음 스테이지 없으면 삭제 방지 |
| RF-07a | `src/services/contact.service.ts` | `deleteContact()` | deals/활동/노트/이메일 cascade 있음, Attachment 누락 | 기존 cascade 끝에 entityType='contact' attachment 삭제 추가 |
| RF-07b | `src/services/company.service.ts` | `deleteCompany()` | contacts FK nullify, deals FK nullify, notes 삭제, Attachment 누락 | 기존 cascade 끝에 entityType='company' attachment 삭제 추가 |

### 수정 파일 목록

| 파일 | 변경 유형 | 변경 함수 | 읽기 참조 추가 |
|------|-----------|-----------|---------------|
| `src/services/pipeline.service.ts` | 수정 | `deletePipeline()` | `STORAGE_KEYS.DEALS`, `STORAGE_KEYS.STAGES` |
| `src/services/stage.service.ts` | 수정 | `deleteStage()` | `STORAGE_KEYS.DEALS`, `STORAGE_KEYS.STAGES` |
| `src/services/contact.service.ts` | 수정 | `deleteContact()` | `STORAGE_KEYS.ATTACHMENTS` |
| `src/services/company.service.ts` | 수정 | `deleteCompany()` | `STORAGE_KEYS.ATTACHMENTS` |

### 태스크 분해

| # | 태스크 | 수정 파일 | 병렬 그룹 |
|---|--------|-----------|-----------|
| T-RF1-1 | `deletePipeline()` — 딜 재배정 로직 추가 | `pipeline.service.ts` | 1단계 |
| T-RF1-2 | `deleteStage()` — 딜 재배정 또는 삭제 방지 | `stage.service.ts` | 2단계 |
| T-RF1-3 | `deleteContact()` — attachment cascade 추가 | `contact.service.ts` | 1단계 |
| T-RF1-4 | `deleteCompany()` — attachment cascade 추가 | `company.service.ts` | 1단계 |

**안전한 실행 순서 (의존성 기준):**
```
1단계 (병렬 가능): T-RF1-1 / T-RF1-3 / T-RF1-4
2단계 (순차):      T-RF1-2 — T-RF1-1의 정책(딜 재배정) 확인 후 동일 전략 적용
```

### 구현 세부 지침 (코드 아님 — 로직 명세)

#### T-RF1-1: `pipeline.service.ts::deletePipeline()`
1. 삭제할 파이프라인 소속 스테이지 ID 목록 수집 (기존 코드 활용)
2. 해당 스테이지들에 속한 딜 전체 조회 (`STORAGE_KEYS.DEALS`)
3. 기본 파이프라인(`isDefault: true`) 조회
4. 기본 파이프라인의 첫 스테이지(order 최솟값) 조회
5. 소속 딜의 `pipelineId`, `stageId`를 기본 파이프라인 첫 스테이지로 일괄 업데이트 후 `storage.save()`
6. 예외 처리: 삭제 대상이 기본 파이프라인이거나 기본 파이프라인에 스테이지가 없으면 딜 삭제 처리
7. 기존 스테이지 삭제 → 파이프라인 삭제 순서 유지

#### T-RF1-2: `stage.service.ts::deleteStage()`
1. 삭제할 스테이지 소속 딜 조회 (`STORAGE_KEYS.DEALS`, `stageId === id` 필터)
2. 딜이 있으면: 같은 파이프라인(`pipelineId` 동일)에서 `order`가 더 큰 스테이지 중 최솟값 조회
3. 다음 스테이지 있으면 → 딜의 `stageId`를 다음 스테이지 ID로 업데이트 후 스테이지 삭제 진행
4. 다음 스테이지 없으면 (마지막 스테이지) → `Error` throw, 삭제 방지
5. 딜이 없으면 → 스테이지 바로 삭제

#### T-RF1-3: `contact.service.ts::deleteContact()`
- 기존 cascade 블록 마지막에 추가
- `STORAGE_KEYS.ATTACHMENTS`에서 전체 조회 → `entityType === 'contact' && entityId === id` 필터링 → 나머지만 `storage.save()`

#### T-RF1-4: `company.service.ts::deleteCompany()`
- 기존 cascade 블록 마지막에 추가
- `STORAGE_KEYS.ATTACHMENTS`에서 전체 조회 → `entityType === 'company' && entityId === id` 필터링 → 나머지만 `storage.save()`

### 검증 기준

| 케이스 | 기대 동작 |
|--------|-----------|
| 딜이 있는 파이프라인 삭제 | 딜이 기본 파이프라인 첫 스테이지로 이동 |
| 딜이 없는 파이프라인 삭제 | 정상 삭제, 딜 영향 없음 |
| 중간 스테이지(딜 있음) 삭제 | 딜이 다음 스테이지로 이동 |
| 마지막 스테이지(딜 있음) 삭제 | 에러 발생, 삭제 방지 |
| 딜이 없는 스테이지 삭제 | 정상 삭제 |
| 컨택 삭제 | 연관 Attachment 함께 삭제 |
| 회사 삭제 | 연관 Attachment 함께 삭제 |

### 전체 태스크 요약 (Refactor Wave 1 포함)

| Wave | 태스크 수 | 파일 수 |
|------|----------|---------|
| Wave 1–6 | 34개 | 119개 |
| Refactor Wave 1 | 4개 | 4개 수정 |
| **합계** | **38개** | **123개** |

---

## Refactor Wave 2 — 아키텍처 위반 수정

> 기준: `docs/REFACTOR-DISCOVERY.md` RF-01 · RF-02 · RF-04 · RF-21
> 목적: STORAGE_KEYS 단일 소스 확립 / localStorage 직접 접근 제거 / 읽기 함수 순수성 확보 / 렌더 중 사이드 이펙트 제거
> 신규 파일: `src/services/settings.service.ts` 1개 — 나머지는 기존 파일 수정

### 수정 대상 및 Before / After

| ID | 파일 | Before | After |
|----|------|--------|-------|
| RF-01 | `storage.ts`, `types/index.ts`, `DarkModeProvider.tsx` | `STORAGE_KEYS`가 두 파일에 각각 정의 (types: UPPER_CASE, storage: camelCase) | `storage.ts` 정의 삭제 + `types/index.ts`에서 re-export. `DarkModeProvider`는 types에서 import로 변경 |
| RF-02 | `deal.service.ts`, `Header.tsx` | `getDeals()` 안에서 `generateDealDeadlineNotifications()` 쓰기 호출 | `getDeals()`에서 호출 제거. `Header.tsx` mount `useEffect`로 이동 |
| RF-04 | `SettingsForm.tsx`, `storage.ts`, `settings.service.ts`(신규) | `SettingsForm.tsx`에서 `localStorage.removeItem()` 루프 직접 호출 | `storage.ts`에 `clearAll()` 추가 → 신규 `settings.service.ts`에 `resetAllData()` → `SettingsForm`에서 서비스 호출 |
| RF-21 | `NotificationPanel.tsx`, `Header.tsx` | `generateNotifications()` 쓰기 함수를 렌더 본문에서 직접 호출 | `Header.tsx` mount `useEffect`로 이동. `NotificationPanel`은 `notifications: Notification[]` props를 받는 프레젠테이션 컴포넌트로 분리 |

### 수정/신규 파일 목록

| 파일 | 변경 유형 | 변경 내용 | RF |
|------|-----------|-----------|-----|
| `src/lib/storage.ts` | 수정 | `STORAGE_KEYS` 정의 제거 → `types/index.ts`에서 re-export. `clearAll()` 함수 추가 | RF-01, RF-04 |
| `src/components/layout/DarkModeProvider.tsx` | 수정 | `STORAGE_KEYS` import 경로 `@/lib/storage` → `@/types/index`. 키 이름 `settings` → `SETTINGS` | RF-01 |
| `src/services/deal.service.ts` | 수정 | `getDeals()` 내 `generateDealDeadlineNotifications()` 호출 제거. 관련 import 제거 | RF-02 |
| `src/services/settings.service.ts` | 신규 | `getSettings()`, `saveSettings()`, `resetAllData()` 3개 함수 | RF-04 |
| `src/components/settings/SettingsForm.tsx` | 수정 | `handleResetData()` — `localStorage.removeItem()` 루프 → `settingsService.resetAllData()` 호출 | RF-04 |
| `src/components/layout/Header.tsx` | 수정 | mount `useEffect` 추가: `generateDealDeadlineNotifications()` + `generateNotifications()` 각 1회. `notifications` 상태 추가. `NotificationPanel`에 `notifications` props 전달 | RF-02, RF-21 |
| `src/components/common/NotificationPanel.tsx` | 수정 | 렌더 중 `generateNotifications()` 호출 제거. `notifications: Notification[]` props 수령으로 변환 | RF-21 |

### 태스크 분해

| # | 태스크 | 수정 파일 | 병렬 그룹 |
|---|--------|-----------|-----------|
| T-RF2-1 | **RF-01 STORAGE_KEYS 통합 + clearAll 추가** — `storage.ts` 정의 제거 및 re-export, `clearAll()` 추가, `DarkModeProvider` import 경로·키 이름 수정 | `storage.ts`, `DarkModeProvider.tsx` | 1단계 |
| T-RF2-2 | **RF-04 settings 서비스화** — `settings.service.ts` 신규 생성, `SettingsForm.tsx` 수정 | 신규 `settings.service.ts`, `SettingsForm.tsx` | 2단계 (T-RF2-1 이후) |
| T-RF2-3 | **RF-02 + RF-21 통합** — `deal.service.ts` 사이드 이펙트 제거, `Header.tsx` useEffect 추가, `NotificationPanel.tsx` 프레젠테이션 분리 | `deal.service.ts`, `Header.tsx`, `NotificationPanel.tsx` | 2단계 (T-RF2-1 이후, T-RF2-2와 병렬) |

**안전한 실행 순서:**
```
1단계 (순차): T-RF2-1 — storage.ts 단일 소스 확립 (다른 태스크의 기반)
2단계 (병렬): T-RF2-2 / T-RF2-3 — storage.ts 수정 완료 후 병렬 진행 가능
```

> ⚠️ `storage.ts`는 T-RF2-1(STORAGE_KEYS 제거)과 T-RF2-1(clearAll 추가) 모두 포함 — 단일 태스크로 처리.
> ⚠️ `Header.tsx`는 T-RF2-3에서 RF-02와 RF-21 양쪽 수정 — 동일 태스크로 통합해 충돌 방지.

### 구현 세부 지침 (코드 아님 — 로직 명세)

#### T-RF2-1: storage.ts 통합
1. `storage.ts`의 `STORAGE_KEYS` 상수 정의 블록 전체 삭제 (`as const` 포함)
2. `StorageKey` 타입 정의 삭제
3. `types/index.ts`에서 re-export 추가: `export { STORAGE_KEYS, type StorageKey } from '@/types/index';` 단, circular import 방지 위해 storage.ts가 types를 import하는 단방향 구조 유지
4. `clearAll()` 함수 추가: `Object.values(STORAGE_KEYS).forEach(key => { try { localStorage.removeItem(key); } catch {} })`
5. `DarkModeProvider.tsx`: import 경로 `@/lib/storage` → `@/types/index` (STORAGE_KEYS만), 키 이름 `STORAGE_KEYS.settings` → `STORAGE_KEYS.SETTINGS`

#### T-RF2-2: settings 서비스화
1. `src/services/settings.service.ts` 신규 생성:
   - `getSettings(): AppSettings` — `storage.getObject<AppSettings>(STORAGE_KEYS.SETTINGS) ?? DEFAULT_SETTINGS`
   - `saveSettings(settings: AppSettings): void` — `storage.saveObject(STORAGE_KEYS.SETTINGS, settings)`
   - `resetAllData(): void` — `clearAll()` 호출 후 `window.location.reload()` 는 컴포넌트 책임으로 남김
2. `SettingsForm.tsx` 수정:
   - `handleResetData()`: `localStorage.removeItem()` 루프 삭제 → `settingsService.resetAllData()` 호출
   - `import * as settingsService from '@/services/settings.service'` 추가

#### T-RF2-3: Header + NotificationPanel + deal.service
1. `deal.service.ts`:
   - `getDeals()` line 33: `generateDealDeadlineNotifications()` 호출 제거
   - line 21: `import { generateDealDeadlineNotifications } from '@/services/notification.service'` 제거
2. `Header.tsx`:
   - `import { generateDealDeadlineNotifications, generateNotifications, getNotifications } from '@/services/notification.service'` 추가
   - `import type { Notification } from '@/types/index'` 추가
   - `const [notifications, setNotifications] = useState<Notification[]>([])` 추가
   - `loadNotifications()` 함수: `setNotifications(getNotifications()); setUnread(getUnreadCount());`
   - mount useEffect: `generateDealDeadlineNotifications(); generateNotifications(); loadNotifications();`
   - `refreshCount` → `loadNotifications`로 통합 (setUnread + setNotifications 동시)
   - `NotificationPanel`에 `notifications={notifications}` prop 추가
3. `NotificationPanel.tsx`:
   - interface `NotificationPanelProps`: `onCountChange` → `onCountChange`, `notifications: Notification[]` 추가
   - 렌더 본문 `generateNotifications()` 호출 제거 (line 24)
   - `getNotifications()` 직접 호출 제거 (line 25)
   - `const notifications` 지역 변수 제거 → props.notifications 사용

### 검증 기준

| 케이스 | 기대 동작 |
|--------|-----------|
| `STORAGE_KEYS` import 검사 | `grep -r "STORAGE_KEYS" --include="*.ts" --include="*.tsx"` 결과에서 `from '@/lib/storage'` import 없음 |
| 데이터 초기화 클릭 | `settingsService.resetAllData()` → `storage.clearAll()` 경유, localStorage 직접 접근 없음 |
| 딜 목록 페이지 방문 | `getDeals()` 호출 시 console에 notification 생성 로그 없음 |
| 앱 최초 로드 | Header mount 시 `generateDealDeadlineNotifications()` + `generateNotifications()` 각 1회 실행 |
| 알림 패널 열기 | 렌더 중 localStorage 쓰기 없음 (React Strict Mode에서 렌더 2회 실행 시에도 쓰기 발생 안 함) |

### 전체 태스크 요약 (Refactor Wave 2 포함)

| Wave | 태스크 수 | 파일 수 |
|------|----------|---------|
| Wave 1–6 | 34개 | 119개 |
| Refactor Wave 1 | 4개 | 4개 수정 |
| Refactor Wave 2 | 3개 | 1개 신규 + 6개 수정 |
| **합계** | **41개** | **130개** |
