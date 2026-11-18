import { mssqlTable, primaryKey, int, nvarchar, MsSqlQuery } from '../src';
import { drizzle } from 'drizzle-orm/node-mssql';

const table = mssqlTable(
  'composite',
  { id1: int('first').notNull(), id2: int('second').notNull(), label: nvarchar('label') },
  (t) => [primaryKey({ columns: [t.id1, t.id2] })]
);
const query = new MsSqlQuery(table, () => drizzle.mock());
if (false) {
  const result: Promise<{ id1: number; id2: number }> = query.add({ id1: 1, id2: 2 });
  const results: Promise<{ id1: number; id2: number }[]> = query.add([{ id1: 1, id2: 2 }]);
  // @ts-expect-error 키가 아닌 컬럼은 반환하지 않는다.
  const invalid: Promise<{ id1: number; id2: number; label: string }> = query.add({ id1: 1, id2: 2 });
  void [result, results, invalid];
}
test('테이블 수준 기본 키 타입', () => expect(table).toBeDefined());
