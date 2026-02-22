# SalesPipe CRM — 아키텍처 문서

## 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃 (AppLayout 주입)
│   ├── page.tsx                  # / → /dashboard 리다이렉트
│   ├── dashboard/page.tsx
│   ├── pipelines/page.tsx
│   ├── kanban/page.tsx
│   ├── deals/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── contacts/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── companies/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── leads/page.tsx
│   ├── activities/page.tsx
│   ├── emails/page.tsx
│   ├── reports/page.tsx
│   ├── tags/page.tsx
│   ├── members/page.tsx
│   └── settings/page.tsx
│
├── components/
│   ├── layout/                   # AppLayout, Sidebar, Header (Header: Wave 5에서 NotificationPanel 연결)
│   ├── common/                   # 도메인 무관 재사용 컴포넌트
│   │                             #   [Wave 5 추가] TagAutocomplete, NotificationPanel
│   ├── pipelines/
│   ├── kanban/
│   ├── deals/
│   ├── contacts/
│   ├── companies/
│   ├── leads/
│   ├── activities/
│   ├── emails/
│   ├── reports/
│   ├── tags/
│   ├── members/
│   ├── dashboard/
│   └── settings/
│
├── services/                     # 데이터 접근 레이어
│   ├── pipeline.service.ts
│   ├── stage.service.ts
│   ├── company.service.ts
│   ├── contact.service.ts
│   ├── lead.service.ts
│   ├── deal.service.ts
│   ├── activity.service.ts
│   ├── note.service.ts
│   ├── tag.service.ts
│   ├── email.service.ts
│   ├── attachment.service.ts
│   ├── member.service.ts
│   ├── report.service.ts
│   ├── dashboard.service.ts
│   ├── backup.service.ts         # [Wave 5] 전체 데이터 내보내기/가져오기
│   ├── notification.service.ts   # [Wave 5] 알림 생성/조회/읽음 처리
│   ├── history.service.ts        # [Wave 5] 딜 변경 이력 기록/조회
│   └── settings.service.ts       # [Refactor W2] 앱 설정 읽기/저장/초기화 래퍼
│
├── lib/
│   ├── storage.ts                # localStorage 추상화
│   ├── utils.ts                  # 포맷 유틸, ID 생성
│   └── seed.ts                   # 초기 더미 데이터
│
└── types/
    └── index.ts                  # 전체 타입 정의 (단일 파일)
```

---

## 라우팅

| 경로 | 페이지 | 특징 |
|------|--------|------|
| `/` | 리다이렉트 | `/dashboard`로 이동 |
| `/dashboard` | 대시보드 | 집계 차트 + 타임라인 |
| `/pipelines` | 파이프라인 관리 | 스테이지 CRUD 포함 |
| `/kanban` | 칸반 보드 | 드래그 앤 드롭 |
| `/deals` | 딜 목록 | 테이블 뷰 + 필터 |
| `/deals/:id` | 딜 상세 | 7개 탭 (정보/활동/노트/이메일/첨부/태그/타임라인) |
| `/contacts` | 연락처 목록 | 검색 + 태그 필터 |
| `/contacts/:id` | 연락처 상세 | 연결된 딜/활동/노트 |
| `/companies` | 회사 목록 | 산업/규모 필터 |
| `/companies/:id` | 회사 상세 | 소속 연락처 + 딜 |
| `/leads` | 리드 목록 | 상태 전이 + 딜 전환 |
| `/activities` | 활동 관리 | 리스트/캘린더 뷰 |
| `/emails` | 이메일 | sent/draft 관리 |
| `/reports` | 보고서 | 5종 차트 |
| `/tags` | 태그 관리 | CRUD |
| `/members` | 멤버 관리 | 역할 관리 |
| `/settings` | 설정 | 다크모드, 데이터 초기화 |

---

## 상태 관리

서버 없이 localStorage만 사용하므로 전역 상태 라이브러리(Redux, Zustand 등) 없음.

### 상태 종류별 처리

| 상태 종류 | 방법 | 예시 |
|----------|------|------|
| 페이지 데이터 | `useState` + 서비스 호출 | 딜 목록, 연락처 목록 |
| 폼 입력 값 | 모달 내 `useState` | DealForm, ContactForm |
| 모달 열기/닫기 | 부모 컴포넌트 `useState` | `isOpen`, `editTarget` |
| 필터/정렬 값 | 해당 페이지 `useState` | 파이프라인 선택, 담당자 필터 |
| 전역 설정 | `sp_settings` localStorage | 다크모드, 기본 파이프라인 |

### 데이터 리프레시 패턴

```
1. useEffect → 서비스 함수 호출 → setState (초기 로드)
2. 사용자 액션 (생성/수정/삭제) → 서비스 함수 호출
3. 성공 시 → 동일한 서비스 함수 재호출 → setState (목록 갱신)
4. 모달 닫기
```

URL 쿼리 파라미터 미사용 (localStorage 기반으로 페이지 새로고침 시에도 데이터 유지).

---

## 컴포넌트 계층 구조

```
app/layout.tsx
└── AppLayout
    ├── Sidebar
    │   └── NavItem × 13 (활성 경로 하이라이트)
    ├── Header
    │   ├── 페이지 제목
    │   ├── 검색바 (UI만)
    │   ├── 벨 아이콘 + 미읽음 뱃지 → NotificationPanel [Wave 5]
    │   └── MemberAvatar (현재 사용자)
    └── <children> (각 page.tsx)
        │
        ├── [목록 페이지]
        │   ├── 필터 컴포넌트 (Filters)
        │   ├── DataTable
        │   │   └── 행별 액션 (편집, 삭제, 상세 이동)
        │   └── Modal → Form (생성/수정)
        │       └── ConfirmDialog (삭제 확인)
        │
        ├── [상세 페이지]
        │   ├── 상단 정보 + 상태 변경
        │   ├── StageProgress (딜 상세)
        │   └── Tabs → 탭별 콘텐츠
        │
        └── [칸반 페이지]
            ├── KanbanFilters
            └── KanbanBoard
                └── KanbanColumn × n
                    └── DealCard (draggable)
```

### 컴포넌트 설계 원칙

- **page.tsx**: 데이터 페칭 + 레이아웃 조합, 비즈니스 로직 최소화
- **도메인 컴포넌트**: Props로 데이터 받아 표시/편집, 직접 서비스 호출 가능
- **common 컴포넌트**: Props 기반 완전 재사용, 도메인 의존성 없음
- **서비스 직접 호출**: page.tsx 또는 도메인 컴포넌트에서 허용 (common 컴포넌트는 금지)
- **렌더 중 사이드 이펙트 금지**: localStorage 쓰기 등 side effect는 반드시 `useEffect` 내에서 실행. 렌더 본문에서 직접 호출 금지

---

## localStorage 서비스 설계 패턴

### 레이어 구조

```
컴포넌트 (UI)
    ↓ Props/콜백
서비스 (src/services/*.service.ts)   ← 비즈니스 로직
    ↓ getAll / create / update / remove
storage.ts (src/lib/storage.ts)      ← I/O 추상화
    ↓
localStorage
```

### storage.ts 인터페이스

| 함수 | 설명 |
|------|------|
| `getAll<T>(key)` | 전체 배열 조회 (없으면 `[]` 반환) |
| `getById<T>(key, id)` | ID로 단건 조회 (없으면 `null`) |
| `save<T>(key, items)` | 전체 배열 덮어쓰기 |
| `create<T>(key, item)` | 새 항목 추가 (ID + 타임스탬프 자동 주입) |
| `update<T>(key, id, partial)` | 부분 업데이트 + `updatedAt` 갱신 |
| `remove(key, id)` | ID로 항목 삭제 |
| `seedIfEmpty<T>(key, data)` | 데이터 없을 때만 시드 데이터 주입 |
| `getObject<T>(key)` | 단건 객체 조회 (배열이 아닌 단일 객체용) |
| `saveObject<T>(key, obj)` | 단건 객체 저장 (배열이 아닌 단일 객체용) |
| `clearAll()` | 앱이 관리하는 모든 STORAGE_KEYS 항목 일괄 삭제 `[Refactor W2]` |

### 서비스 함수 패턴

```
// 기본 CRUD
getDeals(filters?: DealFilters): Deal[]
getDealById(id: string): DealWithRelations | null
createDeal(data: CreateDealInput): Deal
updateDeal(id: string, data: Partial<Deal>): Deal
deleteDeal(id: string): void

// 도메인 특화 함수
moveDealToStage(dealId: string, stageId: string): Deal
closeDeal(dealId: string, outcome: 'won' | 'lost', lostReason?: string): Deal

// 관계 포함 조회 (메모리 내 조인)
getDealById(id) → Deal & { contact: Contact; company: Company; stage: Stage; member: Member }
```

### 관계 조인 방식

서비스 함수 내에서 각 localStorage 키를 개별 조회 후 메모리에서 병합:

```
getDealById(id):
  1. sp_deals에서 Deal 조회
  2. sp_contacts에서 contact 조회 (deal.contactId 사용)
  3. sp_companies에서 company 조회 (deal.companyId 사용)
  4. sp_stages에서 stage 조회 (deal.stageId 사용)
  5. sp_members에서 member 조회 (deal.assignedTo 사용)
  6. 병합 객체 반환
```

컴포넌트는 완성된 데이터만 받으며, localStorage 키를 직접 알 필요 없음.

### 삭제 cascade 정책 (서비스별 필수 구현)

| 삭제 대상 | cascade 처리 대상 | 정책 |
|-----------|------------------|------|
| Pipeline | 하위 Stage | 삭제 |
| Pipeline | 소속 Deal | 기본 파이프라인 첫 스테이지로 재배정 (삭제 파이프라인이 기본이면 Deal 삭제) |
| Stage | 소속 Deal | 다음 스테이지로 재배정; 다음 스테이지 없으면 삭제 방지 |
| Contact | Lead, Deal, Activity, Note, Email, EntityTag, Attachment | 전체 삭제 |
| Company | Contact.companyId, Deal.companyId | null 처리 |
| Company | Note, Attachment | 삭제 |
| Deal | Activity, Note, Email, Attachment, EntityTag, DealHistory | 삭제 |
| Tag | EntityTag | 삭제 |
| Member | Deal.assignedTo, Activity.assignedTo, Lead.assignedTo | null 처리 |

> **참고:** cascade 정책은 storage.ts 레이어에 없음. 각 서비스 함수 내에서 명시적으로 구현 필수.
