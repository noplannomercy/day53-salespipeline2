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