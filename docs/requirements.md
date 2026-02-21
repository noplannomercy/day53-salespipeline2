# SalesPipe - CRM 세일즈 파이프라인 관리 시스템

## 기술 스택
- Next.js 16 + TypeScript (App Router)
- localStorage (클라이언트 저장)
- Tailwind CSS + shadcn/ui
- Recharts (차트)
- lucide-react (아이콘)

## 엔티티

### Pipeline (파이프라인)
- id, name, description, isDefault, createdAt, updatedAt

### Stage (스테이지)
- id, pipelineId(FK), name, order, color, probability(%), createdAt

### Company (회사)
- id, name, industry, website, phone, address, size(소/중/대/기업), revenue, createdAt, updatedAt

### Contact (연락처)
- id, companyId(FK, nullable), name, email, phone, position, avatar, createdAt, updatedAt

### Lead (리드)
- id, contactId(FK), source(웹/소개/광고/이벤트/기타), status(new/contacted/qualified/unqualified), score(1-100), assignedTo(FK→Member), createdAt, updatedAt

### Deal (딜)
- id, pipelineId(FK), stageId(FK), contactId(FK), companyId(FK, nullable), title, value, currency(KRW/USD), expectedCloseDate, priority(low/medium/high/urgent), status(open/won/lost), lostReason(nullable), assignedTo(FK→Member), createdAt, updatedAt

### Activity (활동)
- id, dealId(FK, nullable), contactId(FK, nullable), type(call/email/meeting/task/note), title, description, dueDate(nullable), isCompleted, assignedTo(FK→Member), createdAt

### Note (노트)
- id, dealId(FK, nullable), contactId(FK, nullable), companyId(FK, nullable), content, createdBy(FK→Member), createdAt, updatedAt

### Tag (태그)
- id, name, color, createdAt

### EntityTag (엔티티-태그 연결)
- id, entityType(deal/contact/company), entityId, tagId(FK)

### Email (이메일 로그)
- id, dealId(FK, nullable), contactId(FK), from, to, subject, body, status(sent/draft/scheduled), sentAt, createdAt

### Attachment (첨부파일 메타)
- id, entityType(deal/contact/company), entityId, fileName, fileSize, fileType, uploadedBy(FK→Member), createdAt

### Member (멤버)
- id, name, email, role(admin/manager/sales), avatar, createdAt

### Report (보고서 설정)
- id, name, type(pipeline/sales/activity/forecast), config(JSON string), createdBy(FK→Member), createdAt

## 페이지 및 피처

### 1. 대시보드 (/dashboard)
- 파이프라인별 딜 수 + 총 금액 요약
- 이번 달 성사/실패 딜 수
- 매출 예측 차트 (스테이지별 probability × value)
- 이번 주 활동 요약 (완료/예정)
- 최근 딜 변경 타임라인

### 2. 파이프라인 관리 (/pipelines)
- 파이프라인 CRUD
- 스테이지 CRUD (순서 변경, 색상, 확률)
- 기본 파이프라인 설정

### 3. 칸반 보드 (/kanban)
- 파이프라인 선택
- 스테이지별 컬럼에 딜 카드 표시
- 딜 카드: 제목, 금액, 회사, 담당자, 우선도 뱃지
- 드래그로 스테이지 이동 (stageId 업데이트)
- 딜 퀵 생성 (각 스테이지 하단 + 버튼)
- 필터: 담당자별, 우선도별, 금액 범위

### 4. 딜 관리 (/deals)
- 딜 목록 (테이블 뷰)
- 딜 CRUD
- 상태 전이: Open → Won/Lost (lostReason 입력)
- 필터: 파이프라인별, 스테이지별, 상태별, 담당자별
- 정렬: 금액순, 마감일순, 최신순

### 5. 딜 상세 (/deals/:id)
- 딜 정보 편집
- 스테이지 변경 (진행 바 시각화)
- 연결된 활동 목록 + 추가
- 연결된 노트 목록 + 추가
- 이메일 로그
- 첨부파일 목록
- 태그 관리
- 타임라인 (모든 활동/노트/이메일 통합)

### 6. 연락처 관리 (/contacts)
- 연락처 CRUD
- 회사 연결
- 연락처별 딜/활동 수 표시
- 검색: 이름, 이메일, 회사
- 태그 필터

### 7. 연락처 상세 (/contacts/:id)
- 연락처 정보 편집
- 연결된 딜 목록
- 활동 이력
- 노트
- 이메일 로그

### 8. 회사 관리 (/companies)
- 회사 CRUD
- 산업별 필터
- 규모별 필터
- 회사별 연락처 수, 딜 수, 총 매출 표시

### 9. 회사 상세 (/companies/:id)
- 회사 정보 편집
- 소속 연락처 목록
- 연결된 딜 목록
- 노트

### 10. 리드 관리 (/leads)
- 리드 CRUD
- 리드 스코어링 (1-100 슬라이더)
- 상태 전이: New → Contacted → Qualified/Unqualified
- Qualified → 딜로 전환 (자동 Deal 생성)
- 소스별 필터
- 상태별 필터
- 담당자별 필터

### 11. 활동 관리 (/activities)
- 활동 CRUD (call/email/meeting/task/note)
- 캘린더 뷰 (월간, dueDate 기준)
- 리스트 뷰 (오늘/이번 주/예정/완료)
- 완료 체크
- 담당자별 필터

### 12. 이메일 (/emails)
- 이메일 작성 (draft → sent)
- 이메일 목록 (sent/draft)
- 연락처/딜에 자동 연결

### 13. 보고서 (/reports)
- 파이프라인 보고서: 스테이지별 딜 수 + 금액 (바 차트)
- 매출 보고서: 월별 성사 금액 (라인 차트)
- 활동 보고서: 멤버별 활동 수 (바 차트)
- 매출 예측: 스테이지 확률 × 딜 금액 합계
- 리드 소스 분석: 소스별 전환율 (파이 차트)

### 14. 태그 관리 (/tags)
- 태그 CRUD (이름, 색상)
- 태그별 엔티티 수 표시

### 15. 멤버 관리 (/members)
- 멤버 CRUD
- 역할 관리 (admin/manager/sales)
- 멤버별 담당 딜 수, 활동 수 표시

### 16. 설정 (/settings)
- 앱 설정 (기본 파이프라인, 통화 설정)
- 데이터 초기화
- 다크모드

## 데이터 서비스 (~50개 함수)

### Pipeline (4)
- getPipelines, createPipeline, updatePipeline, deletePipeline

### Stage (5)
- getStages(pipelineId), createStage, updateStage, deleteStage, reorderStages

### Company (5)
- getCompanies(filters), getCompanyById, createCompany, updateCompany, deleteCompany

### Contact (5)
- getContacts(filters), getContactById, createContact, updateContact, deleteContact

### Lead (5)
- getLeads(filters), createLead, updateLead, deleteLead, convertLeadToDeal

### Deal (7)
- getDeals(filters), getDealById, createDeal, updateDeal, deleteDeal, moveDealToStage, closeDeal(won/lost)

### Activity (5)
- getActivities(filters), createActivity, updateActivity, deleteActivity, toggleActivityComplete

### Note (4)
- getNotes(entityType, entityId), createNote, updateNote, deleteNote

### Tag (4)
- getTags, createTag, updateTag, deleteTag

### EntityTag (2)
- addTagToEntity, removeTagFromEntity

### Email (4)
- getEmails(filters), createEmail, updateEmail, sendEmail

### Attachment (3)
- getAttachments(entityType, entityId), createAttachment, deleteAttachment

### Member (4)
- getMembers, createMember, updateMember, deleteMember

### Report (4)
- getReports, createReport, updateReport, deleteReport

### Dashboard (2)
- getDashboardData, getForecastData