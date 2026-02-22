# SalesPipe CRM — 피처 분석 및 추가 제안

> 작성일: 2026-02-21
> 분석 기준: Wave 1–4 완료 상태

---

## 현재 구현된 피처 (Wave 1–4 완료)

### 기반 인프라
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

---

## 추가 피처 제안

### 난이도: 하 — 빠른 승리

| 피처명 | 설명 | 영향 범위 |
|--------|------|-----------|
| **딜 복제** | 유사 딜을 원클릭으로 복사해 새 딜 생성 | `deal.service.ts`, `deals/DealTable.tsx`, `deals/DealDetail.tsx` |
| **칸반 인라인 딜 추가** | 칸반 컬럼 하단 + 버튼으로 해당 스테이지에 즉시 딜 생성 | `kanban/KanbanColumn.tsx`, `kanban/KanbanBoard.tsx` |
| **데이터 백업/복원** | localStorage 전체를 JSON 파일로 내보내고 복원 | `settings/SettingsForm.tsx`, 새 `backup.service.ts` |
| **가중 파이프라인 가치** | 스테이지 확률 × 딜 금액으로 예상 수익 자동 계산 (Stage에 `probability` 필드 이미 존재) | `dashboard/ForecastChart.tsx`, `report.service.ts` |
| **태그 자동완성** | 폼에서 태그 입력 시 기존 태그 인라인 제안 | `tags/TagForm.tsx`, 딜·컨택·기업 폼 |

### 난이도: 중 — 구조 확장 필요

| 피처명 | 설명 | 영향 범위 |
|--------|------|-----------|
| **CSV 가져오기/내보내기** | 딜·컨택·기업을 CSV로 일괄 내보내고 가져오기 | 새 `importExport.service.ts`, `settings/SettingsForm.tsx`, `types/index.ts` |
| **일괄 작업 (Bulk Action)** | 테이블 다중 선택 후 일괄 삭제·태그·담당자 변경 | `common/DataTable.tsx`, `deals/DealTable.tsx`, `contacts/ContactTable.tsx` |
| **알림 패널** | 활동 마감 임박·딜 상태 변경 알림을 Header 벨 아이콘으로 노출 | 새 `notification.service.ts`, `layout/Header.tsx`, 새 `common/NotificationPanel.tsx`, `types/index.ts` |
| **매출 목표 추적** | 월별/분기별 목표 금액 설정 후 달성률을 대시보드에 시각화 | 새 `goal.service.ts`, `types/index.ts`, `dashboard/SummaryCards.tsx`, `settings/SettingsForm.tsx` |
| **딜 변경 이력** | 딜 금액·스테이지·담당자 변경을 타임라인에 자동 기록 | 새 `history.service.ts`, `types/index.ts`, `deals/DealDetail.tsx` (타임라인 탭 통합) |
| **컨택 중복 탐지** | 이메일·전화번호 기반으로 컨택 저장 시 중복 경고 | `contact.service.ts`, `contacts/ContactForm.tsx` |
| **반복 활동** | 주간 미팅처럼 주기 설정 시 활동 자동 생성 | `types/index.ts` (recurrence 필드), `activities/ActivityForm.tsx`, `activity.service.ts` |
| **전역 검색 강화** | Header 검색 바에서 딜·컨택·기업·활동 통합 검색 결과 페이지 제공 | `layout/Header.tsx`, 새 `search/page.tsx`, 각 서비스 검색 함수 |

### 난이도: 상 — 큰 설계 변경

| 피처명 | 설명 | 영향 범위 |
|--------|------|-----------|
| **커스텀 필드** | 사용자가 딜·컨택에 임의 필드를 추가·관리 | `types/index.ts` (동적 스키마), `settings/page.tsx`, `deals/DealForm.tsx`, `contacts/ContactForm.tsx`, 서비스 전반 |
| **대시보드 위젯 커스터마이징** | 위젯 종류·순서·표시 여부를 사용자가 직접 설정 | `dashboard/page.tsx`, `types/index.ts`, `settings/SettingsForm.tsx`, dashboard 컴포넌트 전체 |
| **칸반 수영 레인 (Swimlane)** | 담당자 또는 우선순위별로 칸반을 행 단위로 분리 표시 | `kanban/KanbanBoard.tsx`, `kanban/KanbanColumn.tsx`, `kanban/KanbanFilters.tsx` |

---

## 즉시 구현 추천 (난이도 대비 효과)

1. **가중 파이프라인 가치** — Stage에 `probability` 필드가 이미 있어 서비스 로직 추가만으로 완성 가능
2. **데이터 백업/복원** — UX 가치가 높고 storage.ts 재사용으로 구현 단순
3. **딜 복제** — 실무 반복 작업 제거, 서비스 함수 1개 추가로 완성

---

## 구현 확정 피처 (Wave 5)

> 다음 세션에서 feature-plan으로 상세 문서화 예정

### 난이도 하 (5개)

| # | 피처명 | 영향 범위 |
|---|--------|-----------|
| W5-1 | **딜 복제** | `deal.service.ts`, `deals/DealTable.tsx`, `deals/DealDetail.tsx` |
| W5-2 | **칸반 인라인 딜 추가** | `kanban/KanbanColumn.tsx`, `kanban/KanbanBoard.tsx` |
| W5-3 | **데이터 백업/복원** | `settings/SettingsForm.tsx`, 새 `backup.service.ts` |
| W5-4 | **가중 파이프라인 가치** | `dashboard/ForecastChart.tsx`, `report.service.ts` |
| W5-5 | **태그 자동완성** | `tags/TagForm.tsx`, 딜·컨택·기업 폼 |

### 난이도 중 (3개)

| # | 피처명 | 영향 범위 |
|---|--------|-----------|
| W5-6 | **컨택 중복 탐지** | `contact.service.ts`, `contacts/ContactForm.tsx` |
| W5-7 | **알림 패널** | 새 `notification.service.ts`, `layout/Header.tsx`, 새 `common/NotificationPanel.tsx`, `types/index.ts` |
| W5-8 | **딜 변경 이력** | 새 `history.service.ts`, `types/index.ts`, `deals/DealDetail.tsx` |
