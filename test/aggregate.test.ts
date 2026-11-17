import { drizzle } from 'drizzle-orm/node-mssql';
import { drizzleMsSql, int, mssqlTable, sum, sumDistinct, avg, avgDistinct } from '../src';
import {
  avg as nativeAvg,
  avgDistinct as nativeAvgDistinct,
  sum as nativeSum,
  sumDistinct as nativeSumDistinct,
} from 'drizzle-orm';

const items = mssqlTable('items', { id: int().notNull() });
const db = drizzleMsSql({ url: '', schema: { items } });

test.each([
  ['avg', avg, nativeAvg],
  ['avgDistinct', avgDistinct, nativeAvgDistinct],
  ['db.avg', db.avg, nativeAvg],
  ['db.avgDistinct', db.avgDistinct, nativeAvgDistinct],
  ['sum', sum, nativeSum],
  ['sumDistinct', sumDistinct, nativeSumDistinct],
  ['db.sum', db.sum, nativeSum],
  ['db.sumDistinct', db.sumDistinct, nativeSumDistinct],
] as const)('%s는 필수 decoder를 mapWith에 전달하고 SQL과 NULL 동작을 유지한다', async (_name, aggregate, native) => {
  for (const value of ['12', '12.5', null]) {
    const database = drizzle({
      client: {
        request: () => ({ query: async () => ({ recordset: [[value]] }) }),
      } as never,
    });
    for (const decoder of [Number, { mapFromDriverValue: (value: string) => Number(value) + 1 }]) {
      const query = database.select({ total: aggregate(items.id, decoder) }).from(items);
      const expected = database.select({ total: native(items.id).mapWith(decoder) }).from(items);
      expect(query.toSQL()).toEqual(expected.toSQL());
      const rows = await query;
      expect(rows).toEqual([{ total: value === null ? null : decoder === Number ? Number(value) : Number(value) + 1 }]);
    }
  }
});
