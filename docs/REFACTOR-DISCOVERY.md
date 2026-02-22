# Refactor Discovery — SalesPipe CRM

> 분석 기준일: 2026-02-22
> 분석 범위: `src/services/`, `src/components/`, `src/app/`, `src/lib/`, `src/types/`

---

## 범례

| 구분 | 설명 |
|------|------|
| 난이도 하 | 단순 rename / 추출 / 상수 이동 |
| 난이도 중 | 함수 분리 / 패턴 통일 / 의존 구조 조정 |
| 난이도 상 | 컴포넌트 분해 / 서비스 통합 / 아키텍처 변경 |

---

## 1. 아키텍처 / 구조적 문제

### RF-01 · STORAGE_KEYS 이중 정의 ✅ 완료

| 항목 | 내용 |
|------|------|
| 대상 | `src/types/index.ts`, `src/lib/storage.ts` |
| 문제점 | `STORAGE_KEYS` 상수가 두 파일에 별도로 정의되어 키 이름 불일치 위험 존재 |
| 개선 방향 | `types/index.ts`를 단일 출처로 확정하고 `storage.ts`의 중복 정의 제거 |
| 난이도 | 하 |
| 영향 범위 | `storage.ts`, `seed.ts`, `STORAGE_KEYS`를 import하는 모든 서비스 파일 |

---

### RF-02 · `getDeals()` 내 사이드 이펙트 ✅ 완료

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/deal.service.ts` (line 33) |
| 문제점 | 읽기 함수 `getDeals()` 안에서 `generateDealDeadlineNotifications()` 쓰기 호출 |
| 개선 방향 | 알림 생성 로직을 별도 훅 또는 레이아웃 레벨 `useEffect`로 분리 |
| 난이도 | 중 |
| 영향 범위 | `deal.service.ts`, `notification.service.ts`, `layout.tsx` 또는 `Header.tsx` |

---

### RF-03 · 서비스 간 직접 의존 (서비스→서비스 import)

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/deal.service.ts` (line 21), `src/services/lead.service.ts` (line 110) |
| 문제점 | `deal.service`가 `notification.service`를 직접 import, `lead.service`가 deal 생성 시 `storage`를 직접 호출 |
| 개선 방향 | 크로스 서비스 로직은 이벤트 콜백 또는 상위 오케스트레이터로 위임 |
| 난이도 | 중 |
| 영향 범위 | `deal.service.ts`, `lead.service.ts`, `notification.service.ts` |

---

### RF-04 · `SettingsForm` 직접 localStorage 접근 ✅ 완료

| 항목 | 내용 |
|------|------|
| 대상 | `src/components/settings/SettingsForm.tsx` (line 66-72) |
| 문제점 | `localStorage.removeItem()` 루프를 컴포넌트에서 직접 호출해 아키텍처 규칙 위반 |
| 개선 방향 | `storage.ts`에 `clearAll()` 추가, `settings.service.ts`에 `resetAllData()` 래퍼 생성 |
| 난이도 | 하 |
| 영향 범위 | `storage.ts`, `settings.service.ts`, `SettingsForm.tsx` |

---

## 2. 데이터 무결성 (캐스케이드 누락)

### RF-05 · `deletePipeline()` — 딜 cascade 미처리 ✅ 완료

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/pipeline.service.ts` (line 50-58) |
| 문제점 | 파이프라인 삭제 시 하위 stage만 제거하고 해당 딜 처리 없음 → orphan 딜 발생 |
| 개선 방향 | 파이프라인 삭제 전 소속 딜을 기본 파이프라인으로 이동하거나 삭제 |
| 난이도 | 중 |
| 영향 범위 | `pipeline.service.ts`, `deal.service.ts` |

---

### RF-06 · `deleteStage()` — 딜 cascade 미처리 ✅ 완료

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/stage.service.ts` (line 46-47) |
| 문제점 | 스테이지 삭제 시 해당 스테이지의 딜을 처리하지 않아 orphan 딜 발생 |
| 개선 방향 | 삭제 전 딜이 있으면 차단하거나 다음 스테이지로 이동 |
| 난이도 | 중 |
| 영향 범위 | `stage.service.ts`, `deal.service.ts` |

---

### RF-07 · `deleteContact()` / `deleteCompany()` — attachment cascade 누락 ✅ 완료

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/contact.service.ts` (line 111-149), `src/services/company.service.ts` (line 81-103) |
| 문제점 | 컨택/회사 삭제 시 연결된 Attachment 레코드를 정리하지 않아 orphan attachment 잔존 |
| 개선 방향 | 각 삭제 함수에 `attachment.service.ts`의 entityType 기준 cleanup 추가 |
| 난이도 | 중 |
| 영향 범위 | `contact.service.ts`, `company.service.ts`, `attachment.service.ts` |

---

## 3. 코드 중복

### RF-08 · 필터 체인 패턴 반복 (6개 서비스)

| 항목 | 내용 |
|------|------|
| 대상 | `deal.service.ts`, `activity.service.ts`, `contact.service.ts`, `company.service.ts`, `lead.service.ts`, `member.service.ts` |
| 문제점 | 모든 서비스가 `if (filters?.field) { items = items.filter(...) }` 블록을 반복 구현 |
| 개선 방향 | `src/lib/utils.ts`에 `applyFilters<T>()` 유틸 추출 후 각 서비스에서 호출 |
| 난이도 | 중 |
| 영향 범위 | 위 6개 서비스 파일, `utils.ts` |

---

### RF-09 · "관련 엔티티 이름 조회" 함수 중복 (~15개)

| 항목 | 내용 |
|------|------|
| 대상 | `deal.service.ts` (4개), `activity.service.ts` (3개), `contact.service.ts` (1개), `email.service.ts` (1개), `lead.service.ts` (2개) |
| 문제점 | `storage.getById(key, id)?.name ?? '-'` 1줄 패턴을 반복하는 함수가 11개 이상 존재 |
| 개선 방향 | `getRelatedName(storageKey, id): string` 공통 유틸 함수 추출 |
| 난이도 | 하 |
| 영향 범위 | 위 5개 서비스 파일, `utils.ts` 또는 신규 `src/lib/entityHelpers.ts` |

---

### RF-10 · 캐스케이드 nullify 패턴 반복 (4개 서비스)

| 항목 | 내용 |
|------|------|
| 대상 | `deal.service.ts` (3회), `member.service.ts` (3회), `contact.service.ts` (5회), `company.service.ts` (3회) |
| 문제점 | `getAll → map(nullify FK) → save` 패턴이 서비스마다 12회 이상 복사-붙여넣기 |
| 개선 방향 | `cascadeNullifyFK<T>(key, parentId, fkField)` 유틸 함수 추출 |
| 난이도 | 중 |
| 영향 범위 | 위 4개 서비스, `storage.ts` 또는 `utils.ts` |

---

### RF-11 · 폼 컴포넌트 태그 동기화 로직 중복

| 항목 | 내용 |
|------|------|
| 대상 | `src/components/deals/DealForm.tsx`, `src/components/contacts/ContactForm.tsx`, `src/app/companies/page.tsx` |
| 문제점 | EntityTag를 저장할 때 "기존 태그 필터링 + 신규 태그 매핑 + 저장" 패턴이 3곳에 중복 |
| 개선 방향 | `tag.service.ts`에 `syncEntityTags(entityType, entityId, tagIds[])` 함수 추가 |
| 난이도 | 중 |
| 영향 범위 | `tag.service.ts`, `DealForm.tsx`, `ContactForm.tsx`, `companies/page.tsx` |

---

### RF-12 · `crypto.randomUUID()` 직접 호출 (폼 컴포넌트)

| 항목 | 내용 |
|------|------|
| 대상 | `DealForm.tsx` (line 158), `ContactForm.tsx` (line 104), `companies/page.tsx` (line 100) |
| 문제점 | EntityTag ID 생성 시 `crypto.randomUUID()`를 직접 호출해 `generateId()` 래퍼 우회 |
| 개선 방향 | RF-11의 `syncEntityTags()`로 대체하거나 `generateId()` 경유 |
| 난이도 | 하 |
| 영향 범위 | `DealForm.tsx`, `ContactForm.tsx`, `companies/page.tsx`, `tag.service.ts` |

---

### RF-13 · 페이지 `loadData` 패턴 중복 (5개 페이지)

| 항목 | 내용 |
|------|------|
| 대상 | `deals/page.tsx`, `contacts/page.tsx`, `activities/page.tsx`, `companies/page.tsx`, `leads/page.tsx` |
| 문제점 | `initSeedData + 서비스 호출 + setState` useCallback 패턴이 5개 페이지에 반복 |
| 개선 방향 | `useListPage<T, F>()` 커스텀 훅으로 추출 |
| 난이도 | 중 |
| 영향 범위 | 위 5개 페이지, 신규 `src/hooks/useListPage.ts` |

---

### RF-14 · report/dashboard 집계 로직 중복

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/report.service.ts`, `src/services/dashboard.service.ts` |
| 문제점 | `getForecastData()` 등 집계 함수가 두 서비스에 거의 동일하게 구현됨 |
| 개선 방향 | 공통 집계를 `report.service.ts`로 통합하거나 신규 `aggregation.service.ts`로 분리 |
| 난이도 | 중 |
| 영향 범위 | `report.service.ts`, `dashboard.service.ts`, `reports/page.tsx`, `dashboard/page.tsx` |

---

## 4. 일관성 부족

### RF-15 · `getById()` 반환 타입 불일치

| 항목 | 내용 |
|------|------|
| 대상 | `deal.service.ts`, `company.service.ts`, `contact.service.ts`, `lead.service.ts` vs `activity.service.ts`, `pipeline.service.ts` |
| 문제점 | 일부 서비스는 관계 조인된 `WithRelations` 타입 반환, 나머지는 기본 타입 반환으로 혼재 |
| 개선 방향 | 기본 `getById()` → 단순 타입, `getByIdWithRelations()` → 조인 타입으로 명칭 분리 표준화 |
| 난이도 | 중 |
| 영향 범위 | 모든 서비스 및 해당 서비스를 호출하는 컴포넌트 |

---

### RF-16 · 폼 컴포넌트 Props 인터페이스 불일치

| 항목 | 내용 |
|------|------|
| 대상 | `DealForm.tsx`, `ContactForm.tsx`, `EmailForm.tsx` vs `CompanyForm.tsx`, `ActivityForm.tsx` |
| 문제점 | 일부 폼은 `{ editId, onClose, onSaved }`, 나머지는 `{ entity, onSave, onCancel }` 혼용 |
| 개선 방향 | `{ entity: T \| null, onSave, onCancel }` 패턴으로 전체 표준화 |
| 난이도 | 중 |
| 영향 범위 | 모든 폼 컴포넌트, 해당 폼을 호출하는 페이지 컴포넌트 |

---

### RF-17 · 서비스 목록 함수의 정렬 방식 불일치

| 항목 | 내용 |
|------|------|
| 대상 | `template.service.ts`, `history.service.ts` (정렬 있음) vs `tag.service.ts`, `activity.service.ts`, `email.service.ts`, `note.service.ts` (정렬 없음) |
| 문제점 | 일부 서비스만 기본 정렬을 제공해 UI 출력 순서가 일관되지 않음 |
| 개선 방향 | 모든 목록 함수에 기본 정렬 기준(createdAt desc)을 명시하거나 호출자 책임으로 문서화 |
| 난이도 | 하 |
| 영향 범위 | `tag.service.ts`, `activity.service.ts`, `email.service.ts`, `note.service.ts` |

---

### RF-18 · 폼 내 옵션 상수 분산 정의

| 항목 | 내용 |
|------|------|
| 대상 | `DealForm.tsx`, `LeadForm.tsx`, `ActivityForm.tsx`, `EmailForm.tsx`, `CompanyForm.tsx` |
| 문제점 | `PRIORITY_OPTIONS`, `TYPE_OPTIONS` 등 enum성 상수가 각 폼에 로컬로 정의됨 |
| 개선 방향 | `src/constants/options.ts` 신규 파일에 집중 정의 후 각 폼에서 import |
| 난이도 | 하 |
| 영향 범위 | 위 5개 폼 컴포넌트, 신규 `src/constants/options.ts` |

---

## 5. 타입 안전성

### RF-19 · cascade 함수 내 inline 타입 리터럴 사용

| 항목 | 내용 |
|------|------|
| 대상 | `contact.service.ts` (line 122), `pipeline.service.ts` (line 52) |
| 문제점 | `getAll<{ id: string; contactId: string }>()` 처럼 실제 타입 대신 인라인 타입 리터럴 사용 |
| 개선 방향 | `types/index.ts`에 정의된 전체 타입(`Lead`, `Stage`)으로 교체 |
| 난이도 | 하 |
| 영향 범위 | `contact.service.ts`, `pipeline.service.ts` |

---

### RF-20 · `AttachmentFilters` 타입 미정의

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/attachment.service.ts` (line 12-14) |
| 문제점 | 필터 파라미터를 인라인 객체 타입으로 정의해 다른 서비스 패턴과 불일치 |
| 개선 방향 | `types/index.ts`에 `AttachmentFilters` 인터페이스 추가 |
| 난이도 | 하 |
| 영향 범위 | `types/index.ts`, `attachment.service.ts` |

---

## 6. 성능 / 렌더링 패턴

### RF-21 · `NotificationPanel` 렌더 중 사이드 이펙트 실행 ✅ 완료

| 항목 | 내용 |
|------|------|
| 대상 | `src/components/common/NotificationPanel.tsx` (line 24) |
| 문제점 | `generateNotifications()` 쓰기 함수를 렌더 중 직접 호출해 매 렌더마다 localStorage 쓰기 발생 |
| 개선 방향 | `Header.tsx`의 `useEffect`로 이동, `NotificationPanel`은 props를 받는 프레젠테이션 컴포넌트로 분리 |
| 난이도 | 중 |
| 영향 범위 | `NotificationPanel.tsx`, `Header.tsx`, `notification.service.ts` |

---

### RF-22 · `initSeedData()` 중복 호출

| 항목 | 내용 |
|------|------|
| 대상 | `deals/page.tsx`, `contacts/page.tsx`, `activities/page.tsx` |
| 문제점 | `initSeedData()`가 `useEffect`와 `loadData` 콜백에 각각 존재해 마운트 시 2번 호출됨 |
| 개선 방향 | 마운트 시 1회 실행 `useEffect`로 통일 (RF-13 훅 추출과 함께 해결 가능) |
| 난이도 | 하 |
| 영향 범위 | 위 3개 페이지, `src/hooks/useListPage.ts` (RF-13 구현 시) |

---

### RF-23 · Kanban 컴포넌트 prop drilling

| 항목 | 내용 |
|------|------|
| 대상 | `kanban/page.tsx` → `KanbanBoard.tsx` → `KanbanColumn.tsx` → `DealCard.tsx` |
| 문제점 | `membersMap`, `companyNames`가 3단계를 거쳐 전달되나 실제 사용은 `DealCard`만 |
| 개선 방향 | `DealCard` 내부에서 직접 서비스 호출하거나 Kanban 범위 Context 도입 |
| 난이도 | 중 |
| 영향 범위 | `kanban/page.tsx`, `KanbanBoard.tsx`, `KanbanColumn.tsx`, `DealCard.tsx` |

---

## 7. 서비스 레이어 일관성

### RF-24 · `member.service.ts` — FK nullify 시 빈 문자열 사용

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/member.service.ts` (`deleteMember()` 내부 3회) |
| 문제점 | `assignedTo` FK를 `null` 대신 빈 문자열 `''`로 대체해 FK 의미와 다른 서비스 패턴에서 이탈 |
| 개선 방향 | `.map()` 반환값을 `{ ...d, assignedTo: null }`로 변경, `Deal.assignedTo` 타입이 `string`이라면 `string \| null`로 수정 |
| 난이도 | 하 |
| 영향 범위 | `member.service.ts`, `src/types/index.ts` (타입 변경 필요 시) |

---

### RF-25 · `lead.service.ts` — `convertLeadToDeal()` 서비스 레이어 우회

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/lead.service.ts` (`convertLeadToDeal()`, line 126-140) |
| 문제점 | 딜 생성 시 `deal.service.ts`를 거치지 않고 `storage.create<Deal>()`을 직접 호출해 히스토리 기록 및 cascade 로직 누락 |
| 개선 방향 | `import * as dealService from './deal.service'` 후 `dealService.createDeal()`로 교체 |
| 난이도 | 하 |
| 영향 범위 | `lead.service.ts`, `deal.service.ts` |

---

### RF-26 · `contact.service.ts` — `deleteContact()` 내 부분 타입 캐스팅

| 항목 | 내용 |
|------|------|
| 대상 | `src/services/contact.service.ts` (line 123, `deleteContact()` 내부) |
| 문제점 | `getAll<{ id: string; contactId: string }>(STORAGE_KEYS.LEADS)` 처럼 인라인 부분 타입 캐스팅 — `Lead` 타입 변경 시 묵시 오류 발생 가능 (RF-19의 구체 인스턴스) |
| 개선 방향 | `Lead` 타입 import 후 `getAll<Lead>(STORAGE_KEYS.LEADS)`로 교체 |
| 난이도 | 하 |
| 영향 범위 | `contact.service.ts` |

---

## 8. 컴포넌트 크기 / 책임 분리

### RF-27 · `deals/[id]/page.tsx` — 844줄 모놀리식 페이지

| 항목 | 내용 |
|------|------|
| 대상 | `src/app/deals/[id]/page.tsx` (844줄, state 변수 18개 이상, 서비스 호출 7개 이상) |
| 문제점 | 7개 탭(딜 편집, 활동, 노트, 이메일, 첨부, 태그, 타임라인)의 상태·로직·JSX가 단일 파일에 혼재 |
| 개선 방향 | 각 TabsContent를 `src/components/deals/tabs/DealActivitiesTab.tsx` 등 별도 파일로 추출 |
| 난이도 | 상 |
| 영향 범위 | `src/app/deals/[id]/page.tsx`, 신규 `src/components/deals/tabs/` 하위 파일들 |

---

### RF-28 · `DealDetail.tsx` — 읽기/편집 모드 혼재 (434줄)

| 항목 | 내용 |
|------|------|
| 대상 | `src/components/deals/DealDetail.tsx` (434줄, 필드 레벨 state 변수 12개) |
| 문제점 | 읽기 뷰와 편집 폼이 하나의 컴포넌트에서 `isEditing` 플래그로 분기되어 복잡도 급증 |
| 개선 방향 | 편집 모드를 `DealEditForm.tsx`로 추출하고 `DealDetail.tsx`는 읽기 전용 프레젠터로 축소 |
| 난이도 | 중 |
| 영향 범위 | `DealDetail.tsx`, 신규 `src/components/deals/DealEditForm.tsx` |

---

### RF-29 · 폼 컴포넌트별 참조 데이터 독립 fetch

| 항목 | 내용 |
|------|------|
| 대상 | `src/components/deals/DealForm.tsx`, `src/components/contacts/ContactForm.tsx`, `src/components/companies/CompanyForm.tsx` |
| 문제점 | 각 폼이 마운트마다 pipelines, stages, members, contacts, companies를 독립적으로 re-fetch — 공유나 캐싱 없음 |
| 개선 방향 | `src/hooks/useReferenceData.ts` 커스텀 훅 생성 후 공통 조회 로직 통합 |
| 난이도 | 중 |
| 영향 범위 | `DealForm.tsx`, `ContactForm.tsx`, `CompanyForm.tsx`, 신규 `src/hooks/useReferenceData.ts` |

---

### RF-30 · `deals/[id]/page.tsx` — 타임라인 `useMemo` 미적용

| 항목 | 내용 |
|------|------|
| 대상 | `src/app/deals/[id]/page.tsx` — `getTimelineItems()` 인라인 함수 |
| 문제점 | 4개 배열(activities, notes, emails, history)을 재조합·정렬하는 연산이 매 렌더마다 재실행 |
| 개선 방향 | `useMemo(() => getTimelineItems(), [activities, notes, emails, dealHistory])`로 메모이제이션 |
| 난이도 | 하 |
| 영향 범위 | `src/app/deals/[id]/page.tsx` |

---

### RF-31 · 폼 유효성 실패 시 사용자 피드백 없음

| 항목 | 내용 |
|------|------|
| 대상 | `src/components/deals/DealForm.tsx`, `src/components/contacts/ContactForm.tsx`, `src/components/leads/LeadForm.tsx` 외 다수 |
| 문제점 | 필수 필드 누락 시 submit 핸들러가 조용히 반환(early return)해 사용자에게 오류 원인 미전달 |
| 개선 방향 | `errors` 상태 객체 추가 후 각 필드 아래 인라인 오류 메시지 `<p className="text-red-500 text-sm">` 표시 |
| 난이도 | 중 |
| 영향 범위 | `DealForm.tsx`, `ContactForm.tsx`, `LeadForm.tsx`, `ActivityForm.tsx` 등 폼 컴포넌트 전체 |

---

## 우선순위 요약

### Phase 1 — 데이터 무결성 (즉시 처리 권장)

| ID | 대상 | 난이도 | 상태 |
|----|------|--------|------|
| RF-05 | `deletePipeline()` 딜 cascade 누락 | 중 | ✅ 완료 |
| RF-06 | `deleteStage()` 딜 cascade 누락 | 중 | ✅ 완료 |
| RF-07 | `deleteContact/Company()` attachment cascade 누락 | 중 | ✅ 완료 |

### Phase 2 — 아키텍처 위반 수정

| ID | 대상 | 난이도 | 상태 |
|----|------|--------|------|
| RF-01 | STORAGE_KEYS 이중 정의 제거 | 하 | ✅ 완료 |
| RF-04 | SettingsForm localStorage 직접 접근 제거 | 하 | ✅ 완료 |
| RF-02 | `getDeals()` 사이드 이펙트 분리 | 중 | ✅ 완료 |
| RF-21 | NotificationPanel 렌더 중 쓰기 제거 | 중 | ✅ 완료 |

### Phase 3 — 중복 제거 (코드 품질)

| ID | 대상 | 난이도 |
|----|------|--------|
| RF-09 | 관련 엔티티 이름 조회 함수 통합 | 하 |
| RF-12 | `crypto.randomUUID()` 직접 호출 제거 | 하 |
| RF-11 | 태그 동기화 로직 서비스로 추출 | 중 |
| RF-08 | 필터 체인 패턴 유틸 추출 | 중 |
| RF-10 | cascade nullify 패턴 유틸 추출 | 중 |
| RF-13 | `useListPage` 훅 추출 | 중 |
| RF-22 | `initSeedData()` 중복 호출 제거 | 하 |
| RF-24 | `member.service` FK nullify 빈 문자열 수정 | 하 |
| RF-25 | `lead.service` 딜 생성 서비스 레이어 경유 | 하 |
| RF-26 | `contact.service` 부분 타입 캐스팅 제거 | 하 |
| RF-30 | 타임라인 `useMemo` 적용 | 하 |

### Phase 4 — 일관성 / 타입 정리 / UX

| ID | 대상 | 난이도 |
|----|------|--------|
| RF-15 | `getById()` 반환 타입 표준화 | 중 |
| RF-16 | 폼 Props 인터페이스 표준화 | 중 |
| RF-17 | 서비스 목록 정렬 방식 명문화 | 하 |
| RF-18 | 옵션 상수 집중화 | 하 |
| RF-19 | inline 타입 리터럴 → 전체 타입으로 교체 | 하 |
| RF-20 | `AttachmentFilters` 타입 추가 | 하 |
| RF-14 | report/dashboard 집계 로직 통합 | 중 |
| RF-03 | 서비스 간 직접 의존 해소 | 중 |
| RF-23 | Kanban prop drilling 해소 | 중 |
| RF-27 | `deals/[id]/page.tsx` 탭별 컴포넌트 분리 | 상 |
| RF-28 | `DealDetail.tsx` 읽기/편집 분리 | 중 |
| RF-29 | 폼 참조 데이터 공통 훅 추출 | 중 |
| RF-31 | 폼 유효성 실패 피드백 추가 | 중 |
