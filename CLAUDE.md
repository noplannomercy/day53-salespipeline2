# SalesPipe CRM

Next.js 16 + TypeScript 기반 세일즈 파이프라인 CRM. 모든 데이터는 localStorage에 저장 (서버 없음).

## 기술 스택
- Next.js 16 (App Router) · TypeScript 5 · Tailwind CSS · shadcn/ui
- Recharts (차트) · lucide-react (아이콘)
- 저장소: localStorage (외부 DB 없음)

## 빌드 명령어
```bash
npm install       # 의존성 설치
npm run dev       # 개발 서버 (http://localhost:3000)
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
```

## 파일 구조 규칙
- 페이지: `src/app/{route}/page.tsx`
- 컴포넌트: `src/components/{domain}/{ComponentName}.tsx`
- 서비스: `src/services/{entity}.service.ts`
- 타입: `src/types/index.ts` (단일 파일에 전체 타입 집중)
- 유틸: `src/lib/` (storage.ts, utils.ts, seed.ts)

## 코딩 컨벤션
- 컴포넌트: PascalCase · 함수형 · `export default`
- 서비스 함수: camelCase (`getDeals`, `createDeal`, `moveDealToStage`)
- 타입/인터페이스: PascalCase (`interface Deal`, `type DealStatus`)
- 파일명: PascalCase (컴포넌트) / camelCase (서비스, 유틸, 훅)
- Props: 컴포넌트 파일 내 `interface {Name}Props` 로 정의
- 날짜: ISO 8601 문자열 (`string`), 포맷은 `utils.ts`의 `formatDate()` 사용
- ID: `crypto.randomUUID()` (`utils.ts`의 `generateId()` 래퍼 사용)

## localStorage 사용 패턴
- **직접 호출 금지**: 모든 읽기/쓰기는 반드시 `src/lib/storage.ts` 경유
- 키 형식: `sp_{entity}` (예: `sp_deals`, `sp_contacts`, `sp_settings`)
- 호출 체인: 컴포넌트 → 서비스(`*.service.ts`) → `storage.ts` → localStorage
- 앱 최초 실행 시 `src/lib/seed.ts`의 `initSeedData()` 호출 (내부적으로 `seedIfEmpty` 사용). `seedAll`은 deprecated alias
- 시드 데이터 ID: 하드코딩 형식 (`'pipeline-1'`, `'stage-1-1'` 등). 런타임 생성은 `generateId()` 사용
- `STORAGE_KEYS` 상수: `src/types/index.ts`와 `src/lib/storage.ts` 양쪽에 정의됨. seed.ts는 types에서 import
- 관계는 FK(ID 문자열)로만 저장, JOIN은 서비스 레이어에서 메모리 내 처리
- 삭제 시 cascade 없으므로 서비스 함수 내 명시적 연관 데이터 cleanup 필수

## 참고 문서
- `docs/ARCHITECTURE.md` — 프로젝트 구조, 컴포넌트 계층, 서비스 패턴
- `docs/DATABASE.md` — 엔티티 정의, ERD, localStorage 키 규칙
- `docs/UI-DESIGN.md` — 페이지 레이아웃, 컴포넌트 목록, UI 패턴
- `docs/IMPLEMENTATION.md` — Wave별 구현 계획 및 태스크 분해
