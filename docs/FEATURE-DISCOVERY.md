# SalesPipe CRM — 피처 분석 및 추가 제안

> 작성일: 2026-02-22 (Wave 5 완료 기준)

---

## 현재 구현된 피처 (Wave 1–5 완료)

### 기반 인프라 (Wave 1)
- localStorage CRUD 레이어 (`storage.ts`)
- 14개 엔티티 타입 시스템 (`types/index.ts`)
- 앱 레이아웃 (Sidebar, Header, AppLayout)
- 공통 컴포넌트 (DataTable, Modal, ConfirmDialog, Badge류, EmptyState)
- 시드 데이터 (5명 멤버, 3 파이프라인, 20 컨택, 10 딜 등)
- 다크모드 지원

### 핵심 CRUD (Wave 2)
- **파이프라인/스테이지**: 다중 파이프라인, 스테이지 순서/확률 설정
- **기업(Company)**: 업종·규모 필터, 상세 페이지
- **컨택(Contact)**: 기업 연결, 태그 필터, 상세 페이지
- **리드(Lead)**: 출처·상태·담당자 필터, 딜로 전환(ConvertDialog)
- **팀원(Member)**: Admin/Manager/Sales 역할 관리

### 딜 & 칸반 (Wave 3)
- **딜 목록**: 테이블 + 고급 필터 (파이프라인·스테이지·상태·우선순위·담당자)
- **딜 상세**: 7탭 (기본정보, 활동, 노트, 이메일, 첨부, 태그, 타임라인)
- **칸반 보드**: HTML5 드래그&드롭으로 스테이지 간 이동

### 고급 기능 (Wave 4)
- **활동(Activity)**: 통화/이메일/미팅/업무/노트 5종, 리스트 + 캘린더 뷰
- **이메일 로그**: 발송/임시저장 탭 관리
- **노트**: 딜·컨택·기업에 연결된 자유 텍스트 노트
- **태그 시스템**: 다대다 (Deal/Contact/Company ↔ Tag), 컬러 태깅
- **첨부파일**: 파일 메타데이터 저장 (실제 업로드는 미구현)
- **리포트 5종**: 파이프라인 현황, 매출 실적, 활동 현황, 매출 예측, 리드 출처
- **대시보드**: KPI 카드 4개 + 예측 차트 + 활동 요약 + 타임라인
- **설정**: 다크모드, 기본 파이프라인, 통화(KRW/USD), 데이터 초기화

### Wave 5 추가 기능

| # | 피처명 | 구현 증거 |
|---|--------|-----------|
| W5-1 | **딜 복제** | `deal.service.ts:cloneDeal`, `deals/page.tsx:124-127`, `DataTable.tsx:onClone` |
| W5-2 | **칸반 인라인 딜 추가** | `kanban/page.tsx:KanbanAddDealForm` |
| W5-3 | **데이터 백업/복원** | `SettingsForm.tsx:handleExport/handleImportClick`, `backup.service.ts` |
| W5-4 | **가중 파이프라인 가치** | `ForecastChart.tsx:getWeightedPipelineValue`, `report.service.ts` |
| W5-5 | **태그 자동완성** | `TagAutocomplete.tsx`, ContactForm/DealForm 통합 |
| W5-6 | **컨택 중복 탐지** | `ContactForm.tsx:checkDuplicates onBlur`, `contact.service.ts:findDuplicates` |
| W5-7 | **알림 패널** | `Header.tsx:Bell+NotificationPanel`, `notification.service.ts` |
| W5-8 | **딜 변경 이력** | `deals/[id]/page.tsx:historyService`, `history.service.ts` |

---

## 추가 피처 제안 (Wave 6 후보)

### 난이도: 하 — 빠른 승리

| 피처명 | 설명 | 영향 범위 |
|--------|------|-----------|
| **딜 기한 알림 자동 생성** | 마감일 D-3/D-1 딜에 알림 자동 생성 | `notification.service.ts`, `deal.service.ts` |
| **이메일 템플릿** | 자주 쓰는 이메일 본문 미리 저장/재사용 | `email.service.ts`, `EmailForm.tsx`, 새 `template.service.ts` |
| **딜 상세 내 복제 버튼** | 딜 상세 페이지 헤더에도 복제 버튼 추가 | `deals/[id]/page.tsx` |

### 난이도: 중 — 구조 확장 필요

| 피처명 | 설명 | 영향 범위 |
|--------|------|-----------|
| **CSV 가져오기/내보내기** | 딜·컨택·기업을 CSV로 일괄 내보내고 가져오기 | 새 `importExport.service.ts`, `settings/SettingsForm.tsx` |
| **일괄 작업 (Bulk Action)** | 테이블 다중 선택 후 일괄 삭제·태그·담당자 변경 | `common/DataTable.tsx`, `deals/DealTable.tsx`, `contacts/ContactTable.tsx` |
| **매출 목표 추적** | 월별/분기별 목표 금액 설정 후 달성률을 대시보드에 시각화 | 새 `goal.service.ts`, `dashboard/SummaryCards.tsx`, `types/index.ts`, `settings/SettingsForm.tsx` |
| **멤버 성과 대시보드** | 멤버별 딜 성사율·활동수 바 차트 | `reports/page.tsx`, `report.service.ts` |
| **파이프라인 전환 퍼널** | 스테이지별 딜 수 깔때기 차트 | `reports/page.tsx`, `report.service.ts` |

### 난이도: 상 — 큰 설계 변경

| 피처명 | 설명 | 영향 범위 |
|--------|------|-----------|
| **커스텀 필드** | 사용자가 딜·컨택에 임의 필드를 추가·관리 | `types/index.ts` (동적 스키마), `settings/SettingsForm.tsx`, `deals/DealForm.tsx`, `contacts/ContactForm.tsx`, 서비스 전반 |
| **대시보드 위젯 커스터마이징** | 위젯 종류·순서·표시 여부를 사용자가 직접 설정 | `dashboard/page.tsx`, `settings/SettingsForm.tsx`, dashboard 컴포넌트 전체 |
| **칸반 수영 레인 (Swimlane)** | 담당자 또는 우선순위별로 칸반을 행 단위로 분리 표시 | `kanban/KanbanBoard.tsx`, `kanban/KanbanColumn.tsx` |

---

## 즉시 구현 추천 (난이도 대비 효과)

1. **딜 기한 알림 자동 생성** — `notification.service.ts`가 이미 존재하여 연동만으로 완성 가능
2. **이메일 템플릿** — 반복 작업 제거 효과 높음, EmailForm 재사용으로 구현 단순
3. **딜 상세 내 복제 버튼** — W5-1(딜 복제)의 자연스러운 확장, 단일 파일 수정

---

## 구현 확정 피처 (Wave 6)

> feature-plan으로 상세 문서화 예정

### 난이도 하 (3개)

| # | 피처명 | 영향 범위 |
|---|--------|-----------|
| W6-1 | **딜 기한 알림 자동 생성** | `notification.service.ts`, `deal.service.ts` |
| W6-2 | **이메일 템플릿** | `email.service.ts`, `EmailForm.tsx`, 새 `template.service.ts` |
| W6-3 | **딜 상세 내 복제 버튼** | `deals/[id]/page.tsx` |

### 난이도 중 (2개)

| # | 피처명 | 영향 범위 |
|---|--------|-----------|
| W6-4 | **멤버 성과 대시보드** | `reports/page.tsx`, `report.service.ts` |
| W6-5 | **파이프라인 전환 퍼널** | `reports/page.tsx`, `report.service.ts` |
