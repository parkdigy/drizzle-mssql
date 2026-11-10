import { testData } from './query';

// 연결 객체에서도 테이블명 또는 alias를 기준으로 조회할 수 있다.
// const rows = await mssql.select('testData', ['id']);
// const td = mssql.a.testData('td');
// const aliasedRows = await mssql.select(td, (q) => q.columns('id'));
// 위 예제 사용 시 import mssql from './mssql'을 추가한다.

await testData.selectTest();
// await testData.selectColumnsTest();
// await testData.aliasSelectTest();
// await testData.selectTopTest();
// await testData.subQueryTest();
// await testData.selectDistinctTest();
// await testData.findTest();
// await testData.conditionTest();
// await testData.selectConditionTest();
// await testData.addTest();
// await testData.addValuesTest();
// await testData.addBySelectTest();
// await testData.editTest();
// await testData.editByPrimaryKeyTest();
// await testData.editValuesTest();
// await testData.removeTest();
// await testData.removeByPrimaryKeyTest();
// await testData.paginateTest();
