# Day 53 실행 가이드 - SalesPipe CRM

## Day 52 교훈 반영

### 검증 완료 (Day 52에서 성공)
- ✅ documenter 복원 (plan approval 면제) → 엔터프라이즈급 TASK-LOG
- ✅ 범용 프롬프트 (IMPLEMENTATION.md 기반 자동 배분)
- ✅ superpowers 자동 선택 허용
- ✅ 리드에게 실행 전략 위임
- ✅ tester Wave 팀 포함 → 사후 테스트(PIV) 방식
- ✅ 리드 태스크 추적 + TASK-LOG

### Day 53 신규 적용 (비용 최적화)
- 🆕 tester: Opus → Sonnet (코드 읽고 테스트 작성은 Sonnet 충분)
- 🆕 da: Opus → Haiku (빌드 확인 + 패턴 체크는 Haiku 충분)
- 🆕 토큰 통제 강화: "테스트 실패 3개 초과 시 해당 테스트 삭제하고 다음으로"
- 🆕 da + tester 병렬화 (da가 tester 완료 대기 안 함)

---

## 세션 1: Phase A - 계획 (Plan Mode)

```
docs/requirements.md를 읽고 docs/IMPLEMENTATION.md를 작성해줘.

Wave 단위로 구분:
- Wave 1: 공통 기반 (레이아웃, 타입, localStorage 서비스, 네비게이션)
- Wave 2: 핵심 CRUD (Pipeline, Stage, Company, Contact, Lead, Member)
- Wave 3: 딜 + 칸반 (Deal, 칸반보드, 딜 상세, 스테이지 전이)
- Wave 4: 고급 기능 (Activity, Note, Email, Tag, Attachment, Report, Dashboard, Settings)

각 Wave별로:
- 생성할 파일 목록
- 파일별 담당 역할
- 의존성
- 태스크 분해 (팀원당 5-6개)

코드 작성하지 마. 계획만.
```

→ 사람 리뷰/승인 → 세션 종료

---

## 세션 1.5: Phase B - 문서화 (단독 세션)

```
docs/requirements.md와 docs/IMPLEMENTATION.md를 읽고 다음을 생성해줘:

1. CLAUDE.md (60줄 이내)
   - 프로젝트 개요, 기술 스택, 빌드 명령어
   - 파일 구조 규칙, 코딩 컨벤션
   - localStorage 사용 패턴

2. docs/ARCHITECTURE.md
   - 프로젝트 구조, 라우팅, 상태관리
   - 컴포넌트 계층 구조
   - localStorage 서비스 설계 패턴

3. docs/DATABASE.md
   - 전체 엔티티 관계도 (Mermaid ERD)
   - 엔티티별 필드 정의
   - localStorage 키 네이밍 규칙
   - 관계 처리 방식

4. docs/UI-DESIGN.md
   - 페이지별 레이아웃 구조
   - 공통 컴포넌트 목록
   - 페이지 간 네비게이션 흐름
   - 주요 UI 패턴 (칸반, 모달, 폼, 차트)

코드 작성하지 마. 문서만.
```

→ 사람 확인 → 세션 종료

---

## 세션 2: Phase C - Wave 1 (공통 기반)

```
CLAUDE.md와 docs/ 전체 문서를 읽고 Wave 1을 실행해.
IMPLEMENTATION.md의 Wave 1 태스크를 읽고 팀원 수에 맞게 균등 배분해서 TaskCreate해.
파일 소유권은 태스크의 생성 파일 기준으로 자동 설정.
팀원 간 파일 충돌 없도록 배분.

에이전트 팀:
- architect (Opus): IMPLEMENTATION.md Wave 1에서 배분된 태스크 구현
- developer (Opus): IMPLEMENTATION.md Wave 1에서 배분된 태스크 구현
- ux-designer (Opus): IMPLEMENTATION.md Wave 1에서 배분된 태스크 구현.
  UI-DESIGN.md 참고.
- tester (Sonnet): 각 팀원의 기능 완료 시 webapp-testing 스킬로 테스트 작성 + 실행.
  tests/wave1.spec.ts에 저장. 실패 시 담당 팀원에게 SendMessage.
  테스트 범위 (Wave 1):
  - 각 페이지 라우팅 접근 가능 확인
  - 레이아웃/네비게이션 렌더링 확인
  - 다크모드 토글 동작
  테스트 제한: 최대 10개 케이스. 초과 금지.
  테스트 실패 3개 초과 시 해당 테스트 삭제하고 다음으로.
- da (Haiku): 각 기능 완료 시 코드 리뷰 + npm run build 검증.
  이슈 발견 시 담당 팀원에게 SendMessage. 읽기만, 코드 수정 안 함.
  tester 완료 대기하지 말고 코드 리뷰와 빌드 검증을 병렬로 진행.
- documenter (Sonnet): plan approval 없이 자율 실행.
  팀원 코드 변경 감지 시 CLAUDE.md, docs/*.md 즉시 업데이트.
  추가: 리드가 TaskCreate 완료 시 docs/TASK-LOG.md에 태스크 배분 내역 기록.
  각 태스크 완료 시 상태 업데이트. 계획 대비 차이 기록.

코딩 팀원은 plan approval 없이 자율 구현.
da는 tester와 독립적으로 병렬 리뷰.
tester는 npm run dev 실행 후 완료된 기능을 순차 테스트.

리드 역할:
- 각 태스크 완료 시 IMPLEMENTATION.md에 ✅ 체크
- 계획 대비 실제 차이 발생 시 문서에 기록
- TaskCreate 완료 후 태스크 배분 내역을 documenter에게 SendMessage

완료되면 npm run build + npx playwright test 검증 후 TeamDelete.
```

→ Shift+Tab delegate mode → 빌드 + 테스트 확인 → 세션 종료

---

## 세션 3: Phase C - Wave 2 (핵심 CRUD)

```
먼저 npm run build로 Wave 1 상태를 확인해줘. 실패하면 수정 후 진행.

CLAUDE.md와 docs/ 전체 문서를 읽고 Wave 2를 실행해.
IMPLEMENTATION.md의 Wave 2 태스크를 읽고 팀원 수에 맞게 균등 배분해서 TaskCreate해.
파일 소유권은 태스크의 생성 파일 기준으로 자동 설정.
팀원 간 파일 충돌 없도록 배분.

에이전트 팀:
- developer-a (Opus): IMPLEMENTATION.md 기준 배분된 CRUD
- developer-b (Opus): IMPLEMENTATION.md 기준 배분된 CRUD
- tester (Sonnet): 각 developer의 기능 완료 시 webapp-testing 스킬로 테스트 작성 + 실행.
  tests/wave2.spec.ts에 저장. 실패 시 담당 developer에게 SendMessage.
  테스트 범위 (Wave 2 - CRUD 기능별):
  - 각 엔티티 CRUD: 생성 → 목록 표시 → 수정 → 삭제
  - 필터/검색 동작 확인
  - 리드→딜 전환 동작
  테스트 제한: 엔티티당 최대 4개 케이스. 총 20개 이내. 초과 금지.
  테스트 실패 3개 초과 시 해당 테스트 삭제하고 다음으로.
- da (Haiku): 각 기능 완료 시 코드 리뷰 + npm run build 검증.
  이슈 발견 시 담당 팀원에게 SendMessage. 읽기만, 코드 수정 안 함.
  tester 완료 대기하지 말고 코드 리뷰와 빌드 검증을 병렬로 진행.
- documenter (Sonnet): plan approval 없이 자율 실행.
  팀원 코드 변경 감지 시 CLAUDE.md, docs/*.md 즉시 업데이트.
  추가: 리드가 TaskCreate 완료 시 docs/TASK-LOG.md에 태스크 배분 내역 기록.
  각 태스크 완료 시 상태 업데이트. 계획 대비 차이 기록.

코딩 팀원은 plan approval 없이 자율 구현.
da는 tester와 독립적으로 병렬 리뷰.
tester는 npm run dev 실행 후 완료된 기능을 순차 테스트.

리드 역할:
- 각 태스크 완료 시 IMPLEMENTATION.md에 ✅ 체크
- 계획 대비 실제 차이 발생 시 문서에 기록
- TaskCreate 완료 후 태스크 배분 내역을 documenter에게 SendMessage

기존 Wave 1 코드를 수정하지 마. 파일 소유권을 벗어나는 변경도 금지.
완료되면 npm run build + npx playwright test 검증 후 TeamDelete.
```

→ Shift+Tab delegate mode → 빌드 + 테스트 확인 → 세션 종료

---

## 세션 4: Phase C - Wave 3 (딜 + 칸반)

```
먼저 npm run build로 Wave 2 상태를 확인해줘. 실패하면 수정 후 진행.

CLAUDE.md와 docs/ 전체 문서를 읽고 Wave 3를 실행해.
IMPLEMENTATION.md의 Wave 3 태스크를 읽고 팀원 수에 맞게 균등 배분해서 TaskCreate해.
파일 소유권은 태스크의 생성 파일 기준으로 자동 설정.
팀원 간 파일 충돌 없도록 배분.

에이전트 팀:
- developer-a (Opus): IMPLEMENTATION.md 기준 배분된 기능
- developer-b (Opus): IMPLEMENTATION.md 기준 배분된 기능
- tester (Sonnet): 각 developer의 기능 완료 시 webapp-testing 스킬로 테스트 작성 + 실행.
  tests/wave3.spec.ts에 저장. 실패 시 담당 developer에게 SendMessage.
  테스트 범위 (Wave 3 - 딜 + 칸반):
  - Deal CRUD + 상태 전이 (Open → Won/Lost)
  - 칸반 보드 렌더링 + 스테이지 이동
  - 딜 상세 페이지 각 패널 동작
  테스트 제한: 기능당 최대 3개 케이스. 총 15개 이내. 초과 금지.
  테스트 실패 3개 초과 시 해당 테스트 삭제하고 다음으로.
- da (Haiku): 각 기능 완료 시 코드 리뷰 + npm run build 검증.
  이슈 발견 시 담당 팀원에게 SendMessage. 읽기만, 코드 수정 안 함.
  tester 완료 대기하지 말고 코드 리뷰와 빌드 검증을 병렬로 진행.
- documenter (Sonnet): plan approval 없이 자율 실행.
  팀원 코드 변경 감지 시 CLAUDE.md, docs/*.md 즉시 업데이트.
  추가: 리드가 TaskCreate 완료 시 docs/TASK-LOG.md에 태스크 배분 내역 기록.
  각 태스크 완료 시 상태 업데이트. 계획 대비 차이 기록.

코딩 팀원은 plan approval 없이 자율 구현.
da는 tester와 독립적으로 병렬 리뷰.
tester는 npm run dev 실행 후 완료된 기능을 순차 테스트.

리드 역할:
- 각 태스크 완료 시 IMPLEMENTATION.md에 ✅ 체크
- 계획 대비 실제 차이 발생 시 문서에 기록
- TaskCreate 완료 후 태스크 배분 내역을 documenter에게 SendMessage

기존 Wave 1-2 코드를 수정하지 마. 파일 소유권을 벗어나는 변경도 금지.
완료되면 npm run build + npx playwright test 검증 후 TeamDelete.
```

→ Shift+Tab delegate mode → 빌드 + 테스트 확인 → 세션 종료

---

## 세션 5: Phase C - Wave 4 (고급 기능)

```
먼저 npm run build로 Wave 3 상태를 확인해줘. 실패하면 수정 후 진행.

CLAUDE.md와 docs/ 전체 문서를 읽고 Wave 4를 실행해.
IMPLEMENTATION.md의 Wave 4 태스크를 읽고 팀원 수에 맞게 균등 배분해서 TaskCreate해.
파일 소유권은 태스크의 생성 파일 기준으로 자동 설정.
팀원 간 파일 충돌 없도록 배분.

에이전트 팀:
- developer-a (Opus): IMPLEMENTATION.md 기준 배분된 기능
- developer-b (Opus): IMPLEMENTATION.md 기준 배분된 기능
- tester (Sonnet): 각 developer의 기능 완료 시 webapp-testing 스킬로 테스트 작성 + 실행.
  tests/wave4.spec.ts에 저장. 실패 시 담당 developer에게 SendMessage.
  테스트 범위 (Wave 4 - 고급 기능별):
  - Activity: CRUD + 완료 체크 + 캘린더 뷰
  - Email: 작성 + 발송
  - Tag: CRUD + 엔티티에 태그 추가/제거
  - Report: 차트 렌더링 확인
  - Dashboard: 데이터 표시 + 매출 예측
  - Settings: 다크모드 + 데이터 초기화
  테스트 제한: 기능당 최대 3개 케이스. 총 25개 이내. 초과 금지.
  테스트 실패 3개 초과 시 해당 테스트 삭제하고 다음으로.
- da (Haiku): 각 기능 완료 시 코드 리뷰 + npm run build 검증.
  이슈 발견 시 담당 팀원에게 SendMessage. 읽기만, 코드 수정 안 함.
  tester 완료 대기하지 말고 코드 리뷰와 빌드 검증을 병렬로 진행.
- documenter (Sonnet): plan approval 없이 자율 실행.
  팀원 코드 변경 감지 시 CLAUDE.md, docs/*.md 즉시 업데이트.
  추가: 리드가 TaskCreate 완료 시 docs/TASK-LOG.md에 태스크 배분 내역 기록.
  각 태스크 완료 시 상태 업데이트. 계획 대비 차이 기록.

코딩 팀원은 plan approval 없이 자율 구현.
da는 tester와 독립적으로 병렬 리뷰.
tester는 npm run dev 실행 후 완료된 기능을 순차 테스트.

리드 역할:
- 각 태스크 완료 시 IMPLEMENTATION.md에 ✅ 체크
- 계획 대비 실제 차이 발생 시 문서에 기록
- TaskCreate 완료 후 태스크 배분 내역을 documenter에게 SendMessage

기존 Wave 1-3 코드를 수정하지 마. 파일 소유권을 벗어나는 변경도 금지.
완료되면 npm run build + npx playwright test 검증 후 TeamDelete.
```

→ Shift+Tab delegate mode → 빌드 + 테스트 확인 → 세션 종료

---

## 세션 6: Phase D - QA (Agent Teams)

```
먼저 npm run build 확인. 실패하면 수정 우선.

CLAUDE.md와 docs/ 문서를 읽고 최종 QA를 실행해.

Step 1: 기존 테스트 전체 실행
- npx playwright test로 tests/wave1~4.spec.ts 전부 실행
- 실패 케이스 수정

Step 2: 통합 테스트 작성 + 실행
- Wave 간 연동되는 시나리오만 테스트
- tests/integration.spec.ts 단일 파일에 저장

에이전트 팀:
- tester-a (Sonnet): Step 1 담당. 기존 테스트 전체 실행 + 실패 수정.
  신규 테스트 작성하지 마.
- tester-b (Sonnet): Step 2 담당. 통합 테스트 작성 + 실행.
  tests/integration.spec.ts에 저장.
  통합 테스트 범위:
  - 리드 생성 → Qualified → 딜 자동 전환 → 칸반에 표시
  - 연락처 생성 → 회사 연결 → 딜 생성 → 활동 추가 → 대시보드 반영
  - 파이프라인 스테이지 변경 → 딜 확률 변경 → 매출 예측 갱신
  - 딜 Won/Lost → 보고서 차트 반영
  통합 테스트 제한: 최대 8개 케이스. 초과 금지.
  테스트 실패 3개 초과 시 해당 테스트 삭제하고 다음으로.
- da (Haiku): 전체 테스트 결과 리뷰 + 실패 분석.

tester-a 완료 후 tester-b 시작 (순차).
최종 npx playwright test 전체 실행 (wave1 + wave2 + wave3 + wave4 + integration).
npm run build 확인 후 TeamDelete.
```

→ Shift+Tab delegate mode → 결과 확인 → 세션 종료

---

## Day 50-51-52-53 비교 체크리스트

| 항목 | Day 50 | Day 51 | Day 52 | Day 53 |
|------|--------|--------|--------|--------|
| 앱 | JobTools | GoalFlow | WikiFlow | SalesPipe |
| 엔티티 | 없음 | 7개 | 11개 | 14개 |
| 피처 수 | 10도구 | 25피처 | 33피처 | 45피처 |
| Wave 수 | 3 | 3 | 3 | 4 |
| DB | localStorage | localStorage | localStorage | localStorage |
| developer | Opus | Opus | Opus | Opus |
| tester | - | - | Opus | 🆕 Sonnet |
| da | Opus | Opus | Opus | 🆕 Haiku |
| documenter | Sonnet (멈춤) | 제거 | Sonnet ✅ | Sonnet |
| da+tester 관계 | - | - | 순차 | 🆕 병렬 |
| TASK-LOG | ❌ | ❌ | ✅ | ✅ |
| plan approval | ✅ (실패) | ❌ | ❌ | ❌ |
| superpowers | ❌ | ❌ | 자동 ✅ | 자동 |
| 총 소요시간 | ~53분 | ~70분 | ~120분 (중단) | ___분 |
| 토큰 | 100% | ~50% | 100% (소진) | 목표: 70% |
| compact | 0 | 0 | 0 | 목표: 0 |