import { drizzle } from 'drizzle-orm/node-mssql';
import { min as nativeMin, max as nativeMax } from 'drizzle-orm';
import { drizzleMsSql, datetime2, mssqlTable, min, max } from '../src';

const dates = mssqlTable('dates', { updated: datetime2() });
const db = drizzleMsSql({ url: '', schema: { dates } });
const query = db.query(dates);

test.each(['min', 'max'] as const)('%s는 결과 타입을 지정해도 기존 SQL과 값 매핑을 유지한다', async (method) => {
  const aggregate = method === 'min' ? min : max;
  const native = method === 'min' ? nativeMin : nativeMax;
  for (const value of [new Date('2026-01-01T00:00:00Z'), null]) {
    const database = drizzle({
      client: { request: () => ({ query: async () => ({ recordset: [[value]] }) }) } as never,
    });
    for (const expression of [
      aggregate<Date | null>(dates.updated),
      db[method]<Date | null>(dates.updated),
      query[method]<Date | null>('updated'),
    ]) {
      const selected = database.select({ value: expression }).from(dates);
      expect(selected.toSQL()).toEqual(
        database
          .select({ value: native(dates.updated) })
          .from(dates)
          .toSQL()
      );
      expect(await selected).toEqual([{ value }]);
    }
  }
  expect(() => Reflect.apply(query[method], query, ['missing'])).toThrow('unknown column "missing"');
});
