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
