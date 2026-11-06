# 프로젝트 구조와 개발 참고

이 패키지는 Drizzle ORM `1.0.0-rc.5`와 `mssql` 11 기반 SQL Server 보조 라이브러리다. 공개 API는 `src/index.ts`, 연결·트랜잭션·페이지네이션은 `src/drizzleMsSql.ts`, 테이블 CRUD는 `src/MsSqlQuery.ts`, 조건식과 컬럼 선택은 `src/conditions.ts`와 `src/columns.ts`에 있다. 공개 타입은 `src/@types/`, 테스트는 `test/`, 사용 예제는 `examples/src/`에 있다.

`dist/`는 생성 파일이다. Rollup은 ESM `index.esm.js`, CommonJS `index.cjs`와 각각의 선언 파일을 만든다. Drizzle과 드라이버는 peer dependency이므로 소비자가 설치해야 한다. 페이지네이션은 SQL Server의 `OFFSET … FETCH`를 사용하므로 정렬이 필요하다. IDENTITY 삽입은 `OUTPUT`을 사용하며 대상 테이블의 트리거 제약을 고려해야 한다. 실제 SQL Server에 대한 검증과 모의 SQL 생성 검증을 구분해 보고한다.

Node 버전은 `.nvmrc`를 따른다. 타입 검사는 `npm run tsc`, 정적 검사는 `npm run lint`, 테스트는 `npm test -- --runInBand --watchman=false`로 실행한다. `npm run build`는 Watchman 설정, 테스트, Rollup 순으로 실행된다. Watchman 접근 오류가 있으면 테스트와 `./node_modules/.bin/rollup -c --bundleConfigAsCjs`를 별도로 실행하고 전체 빌드 통과로 보고하지 않는다. 배포 진입점 변경 시 `npm pack --dry-run`과 ESM·CommonJS 소비를 확인한다.
