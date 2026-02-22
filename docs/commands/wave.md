CLAUDE.md와 docs/ 전체 문서를 읽고 Wave $ARGUMENTS 를 실행해.
IMPLEMENTATION.md 기준으로 팀을 자율 구성하고 태스크를 배분해.

제약:
- 코딩 역할은 Opus 사용
- 비코딩 역할(테스트/리뷰/문서)은 Sonnet 또는 Haiku 사용
- 문서 담당을 반드시 포함: 변경사항 반영이 필요한 docs/ 문서를 업데이트
- 테스트 실패 3개 초과 시 삭제
- 기존 Wave 코드 수정 금지
- 완료 후 npm run build + npx playwright test 검증 후 TeamDelete