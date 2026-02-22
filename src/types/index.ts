/**
 * SalesPipe CRM — 전체 TypeScript 타입 정의
 *
 * 모든 엔티티 인터페이스, Union 타입, 필터/정렬 타입을 단일 파일에 집중.
 * 날짜: ISO 8601 문자열. ID: crypto.randomUUID() 생성.
 * FK는 string (nullable FK는 string | null).
 * 직접 localStorage 접근 금지 — 반드시 src/lib/storage.ts 경유.
 */

// ─────────────────────────────────────────────
// 공통 Union 타입
// ─────────────────────────────────────────────

export type CompanySize = 'small' | 'medium' | 'large' | 'enterprise';

export type LeadSource = 'web' | 'referral' | 'ad' | 'event' | 'other';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified';

export type DealCurrency = 'KRW' | 'USD';

export type DealPriority = 'low' | 'medium' | 'high' | 'urgent';

export type DealStatus = 'open' | 'won' | 'lost';

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note';

export type EmailStatus = 'sent' | 'draft' | 'scheduled';

export type EntityType = 'deal' | 'contact' | 'company';

export type MemberRole = 'admin' | 'manager' | 'sales';

export type ReportType = 'pipeline' | 'sales' | 'activity' | 'forecast';

export type SortDirection = 'asc' | 'desc';

export type NotificationType = 'activity_due' | 'deal_status_changed' | 'deal_assigned';

export type DealHistoryField = 'stageId' | 'value' | 'assignedTo' | 'status' | 'priority' | 'title';

// ─────────────────────────────────────────────
// 엔티티 인터페이스 (14개)
// ─────────────────────────────────────────────

/** 파이프라인 — 딜 흐름의 최상위 컨테이너 (예: "신규 영업", "갱신") */
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  /** true인 파이프라인은 시스템 전체에서 1개만 존재 */
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 파이프라인 내 개별 스테이지 (예: "초기 접촉", "제안", "협상") */
export interface Stage {
  id: string;
  /** FK → Pipeline.id */
  pipelineId: string;
  name: string;
  /** 표시 순서 (1부터 시작, 파이프라인 내 중복 없음) */
  order: number;
  /** HEX 색상 코드 (예: "#3B82F6") */
  color: string;
  /** 성사 확률 0~100 정수 */
  probability: number;
  createdAt: string;
}

/** 거래 대상 회사 정보 */
export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  size: CompanySize | null;
  /** 연매출 (KRW 기준) */
  revenue: number | null;
  createdAt: string;
  updatedAt: string;
}

/** 영업 대상 개인 연락처 */
export interface Contact {
  id: string;
  /** FK → Company.id (nullable: 소속 회사 없을 수 있음) */
  companyId: string | null;
  name: string;
  /** 유니크 이메일 */
  email: string;
  phone: string;
  position: string;
  /** 아바타 URL (없으면 이니셜 폴백) */
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

/** 잠재 고객 리드 */
export interface Lead {
  id: string;
  /** FK → Contact.id */
  contactId: string;
  source: LeadSource;
  status: LeadStatus;
  /** 리드 점수 1~100 */
  score: number;
  /** FK → Member.id */
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 영업 딜 — 파이프라인 내에서 스테이지를 이동하는 핵심 엔티티.
 * lostReason은 status === 'lost' 일 때만 의미 있음.
 */
export interface Deal {
  id: string;
  /** FK → Pipeline.id */
  pipelineId: string;
  /** FK → Stage.id */
  stageId: string;
  /** FK → Contact.id */
  contactId: string;
  /** FK → Company.id (nullable) */
  companyId: string | null;
  title: string;
  value: number;
  currency: DealCurrency;
  /** 예상 마감일 (ISO 8601, 미설정 시 null) */
  expectedCloseDate: string | null;
  priority: DealPriority;
  status: DealStatus;
  /** 실패 사유 (status === 'lost' 일 때만 사용) */
  lostReason: string;
  /** FK → Member.id */
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 딜/연락처와 연결된 영업 활동.
 * dealId 또는 contactId 중 하나 이상은 반드시 설정되어야 함.
 */
export interface Activity {
  id: string;
  /** FK → Deal.id (nullable) */
  dealId: string | null;
  /** FK → Contact.id (nullable) */
  contactId: string | null;
  type: ActivityType;
  title: string;
  description: string;
  /** 마감일 (ISO 8601, 미설정 시 null) */
  dueDate: string | null;
  isCompleted: boolean;
  /** FK → Member.id */
  assignedTo: string;
  createdAt: string;
}

/**
 * 딜/연락처/회사에 첨부되는 자유 텍스트 노트.
 * dealId, contactId, companyId 중 하나 이상 설정.
 */
export interface Note {
  id: string;
  /** FK → Deal.id (nullable) */
  dealId: string | null;
  /** FK → Contact.id (nullable) */
  contactId: string | null;
  /** FK → Company.id (nullable) */
  companyId: string | null;
  content: string;
  /** FK → Member.id */
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** 분류용 태그 (Deal, Contact, Company에 다대다로 연결) */
export interface Tag {
  id: string;
  /** 유니크 태그 이름 */
  name: string;
  /** HEX 색상 코드 */
  color: string;
  createdAt: string;
}

/**
 * Deal/Contact/Company ↔ Tag 다대다 연결 테이블.
 * entityType + entityId + tagId 조합으로 유니크.
 */
export interface EntityTag {
  id: string;
  entityType: EntityType;
  /** 연결 대상 엔티티 ID (Deal.id / Contact.id / Company.id) */
  entityId: string;
  /** FK → Tag.id */
  tagId: string;
}

/**
 * 이메일 로그.
 * sentAt은 status === 'sent' 일 때만 값이 있음.
 */
export interface Email {
  id: string;
  /** FK → Deal.id (nullable) */
  dealId: string | null;
  /** FK → Contact.id */
  contactId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  status: EmailStatus;
  /** 발송 시각 (ISO 8601, status === 'sent' 일 때만 설정) */
  sentAt: string | null;
  createdAt: string;
}

/** 딜/연락처/회사에 첨부된 파일 메타데이터 (실제 파일은 미저장, 메타만 관리) */
export interface Attachment {
  id: string;
  entityType: EntityType;
  /** 연결 대상 엔티티 ID */
  entityId: string;
  fileName: string;
  /** 파일 크기 (bytes) */
  fileSize: number;
  /** MIME 타입 (예: "application/pdf") */
  fileType: string;
  /** FK → Member.id */
  uploadedBy: string;
  createdAt: string;
}

/** CRM 사용 팀원 */
export interface Member {
  id: string;
  name: string;
  /** 유니크 이메일 */
  email: string;
  role: MemberRole;
  /** 아바타 URL (없으면 이니셜 폴백) */
  avatar: string;
  createdAt: string;
}

/**
 * 저장된 보고서 설정.
 * config는 JSON.stringify된 보고서 필터/설정 객체.
 */
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  /** JSON.stringify된 보고서 설정 객체 */
  config: string;
  /** FK → Member.id */
  createdBy: string;
  createdAt: string;
}

/** 앱 전역 설정 (sp_settings 키에 단일 객체로 저장) */
export interface AppSettings {
  defaultPipelineId: string;
  defaultCurrency: DealCurrency;
  darkMode: boolean;
}

/** 딜 변경 이력 — 딜의 주요 필드 변경 시 자동 기록 */
export interface DealHistory {
  id: string;
  /** FK → Deal.id */
  dealId: string;
  field: DealHistoryField;
  oldValue: string;
  newValue: string;
  /** FK → Member.id */
  changedBy: string;
  createdAt: string;
}

/** 알림 — 활동 마감, 딜 상태 변경, 딜 담당자 배정 등 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: 'activity' | 'deal';
  entityId: string;
  isRead: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────
// 관계 포함 타입 (서비스 레이어 JOIN 결과)
// ─────────────────────────────────────────────

/** getDealById 반환 타입 — Contact, Company, Stage, Pipeline, Member JOIN */
export interface DealWithRelations extends Deal {
  contact: Contact | null;
  company: Company | null;
  stage: Stage | null;
  pipeline: Pipeline | null;
  assignedMember: Member | null;
}

/** getContactById 반환 타입 — Company, 연결된 Deal/Activity/Note/Email 포함 */
export interface ContactWithRelations extends Contact {
  company: Company | null;
  deals: Deal[];
  activities: Activity[];
  notes: Note[];
  emails: Email[];
}

/** getCompanyById 반환 타입 — 소속 Contact, 연결 Deal, Note 포함 */
export interface CompanyWithRelations extends Company {
  contacts: Contact[];
  deals: Deal[];
  notes: Note[];
}

/** getLeads 반환 타입 — Contact, 담당 Member 포함 */
export interface LeadWithRelations extends Lead {
  contact: Contact | null;
  assignedMember: Member | null;
}

// ─────────────────────────────────────────────
// 필터 타입
// ─────────────────────────────────────────────

export interface DealFilters {
  pipelineId?: string;
  stageId?: string;
  status?: DealStatus;
  priority?: DealPriority;
  assignedTo?: string;
  companyId?: string;
  contactId?: string;
  currency?: DealCurrency;
  /** 검색어 (title 부분 일치) */
  search?: string;
  /** 마감일 범위 필터 (ISO 8601) */
  expectedCloseDateFrom?: string;
  expectedCloseDateTo?: string;
  /** 금액 범위 필터 */
  valueMin?: number;
  valueMax?: number;
}

export interface ContactFilters {
  companyId?: string;
  search?: string;
  tagId?: string;
}

export interface CompanyFilters {
  industry?: string;
  size?: CompanySize;
  search?: string;
}

export interface LeadFilters {
  source?: LeadSource;
  status?: LeadStatus;
  assignedTo?: string;
  search?: string;
  scoreMin?: number;
  scoreMax?: number;
}

export interface ActivityFilters {
  dealId?: string;
  contactId?: string;
  type?: ActivityType;
  assignedTo?: string;
  isCompleted?: boolean;
  /** 마감일 범위 필터 (ISO 8601) */
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface NoteFilters {
  dealId?: string;
  contactId?: string;
  companyId?: string;
  createdBy?: string;
}

export interface EmailFilters {
  dealId?: string;
  contactId?: string;
  status?: EmailStatus;
}

export interface MemberFilters {
  role?: MemberRole;
  search?: string;
}

// ─────────────────────────────────────────────
// 정렬 타입
// ─────────────────────────────────────────────

export interface SortConfig<T extends string = string> {
  field: T;
  direction: SortDirection;
}

export type DealSortField =
  | 'title'
  | 'value'
  | 'priority'
  | 'status'
  | 'expectedCloseDate'
  | 'createdAt'
  | 'updatedAt';

export type ContactSortField = 'name' | 'email' | 'createdAt' | 'updatedAt';

export type CompanySortField = 'name' | 'industry' | 'revenue' | 'createdAt' | 'updatedAt';

export type LeadSortField = 'score' | 'status' | 'source' | 'createdAt' | 'updatedAt';

export type ActivitySortField = 'title' | 'type' | 'dueDate' | 'isCompleted' | 'createdAt';

export type MemberSortField = 'name' | 'email' | 'role' | 'createdAt';

// ─────────────────────────────────────────────
// localStorage 키 상수
// ─────────────────────────────────────────────

/** 형식: sp_{entity} — 접두사 sp_ + 엔티티명 복수형 소문자 스네이크케이스 */
export const STORAGE_KEYS = {
  PIPELINES: 'sp_pipelines',
  STAGES: 'sp_stages',
  COMPANIES: 'sp_companies',
  CONTACTS: 'sp_contacts',
  LEADS: 'sp_leads',
  DEALS: 'sp_deals',
  ACTIVITIES: 'sp_activities',
  NOTES: 'sp_notes',
  TAGS: 'sp_tags',
  ENTITY_TAGS: 'sp_entity_tags',
  EMAILS: 'sp_emails',
  ATTACHMENTS: 'sp_attachments',
  MEMBERS: 'sp_members',
  REPORTS: 'sp_reports',
  SETTINGS: 'sp_settings',
  DEAL_HISTORY: 'sp_deal_history',
  NOTIFICATIONS: 'sp_notifications',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ─────────────────────────────────────────────
// UI 상태 타입
// ─────────────────────────────────────────────

/** 페이지네이션 상태 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/** 모달 열림/닫힘 + 편집 대상 ID */
export interface ModalState<T = string> {
  isOpen: boolean;
  editId: T | null;
}

/** DataTable 컬럼 정의 */
export interface ColumnDef<TRow> {
  key: string;
  header: string;
  /** 셀 렌더러: 값 반환 또는 JSX 반환 */
  cell: (row: TRow) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}
