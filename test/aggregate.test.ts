import { drizzle } from 'drizzle-orm/node-mssql';
import {
  drizzleMsSql,
  int,
  mssqlTable,
  sum,
  sumDistinct,
  avg,
  avgDistinct,
  sumDistinctNumber,
  sumDistinctBoolean,
  sumDistinctString,
  avgNumber,
  avgBoolean,
  avgString,
  avgDistinctNumber,
  avgDistinctBoolean,
  avgDistinctString,
  sumNumber,
  sumBoolean,
  sumString,
} from '../src';
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

test.each(['sum', 'sumDistinct'] as const)('명시적 %s 결과 타입도 기존 SQL과 변환기를 유지한다', async (method) => {
  const database = drizzle({
    client: {
      request: () => ({ query: async () => ({ recordset: [['12.5']] }) }),
    } as never,
  });
  const aggregate = method === 'sum' ? sum : sumDistinct;
  for (const expression of [aggregate<number>(items.id, Number), db[method]<number>(items.id, Number)]) {
    const selected = database.select({ total: expression }).from(items);
    expect(selected.toSQL()).toEqual(
      database
        .select({ total: aggregate(items.id, Number) })
        .from(items)
        .toSQL()
    );
    expect(await selected).toEqual([{ total: 12.5 }]);
  }
});

test.each(['sum', 'sumDistinct'] as const)(
  'MsSqlQuery.%s는 컬럼명을 해석하고 집계 변환기를 전달한다',
  async (method) => {
    const query = db.query(items);
    const aggregate = method === 'sum' ? sum : sumDistinct;
    const selected = query.select(() => ({ total: query[method]('id', Number) })).toSQL();
    expect(selected).toEqual(query.select({ total: aggregate(items.id, Number) }).toSQL());
    const database = drizzle({
      client: {
        request: () => ({ query: async () => ({ recordset: [['12.5']] }) }),
      } as never,
    });
    expect(await database.select({ total: query[method]<number>('id', Number) }).from(items)).toEqual([
      { total: 12.5 },
    ]);
    expect(() => Reflect.apply(query[method], query, ['missing', Number])).toThrow('unknown column "missing"');
  }
);

test.each([
  ['sumDistinctNumber', sumDistinctNumber, Number],
  ['sumDistinctBoolean', sumDistinctBoolean, Boolean],
  ['sumDistinctString', sumDistinctString, String],
  ['sumNumber', sumNumber, Number],
  ['sumBoolean', sumBoolean, Boolean],
  ['sumString', sumString, String],
  ['avgDistinctNumber', avgDistinctNumber, Number],
  ['avgDistinctBoolean', avgDistinctBoolean, Boolean],
  ['avgDistinctString', avgDistinctString, String],
  ['avgNumber', avgNumber, Number],
  ['avgBoolean', avgBoolean, Boolean],
  ['avgString', avgString, String],
] as const)('%s는 자동 변환기를 모든 진입점에 적용한다', async (method, aggregate, decoder) => {
  const query = db.query(items);
  for (const value of ['12.5', '0', 0, 1, null]) {
    const database = drizzle({
      client: {
        request: () => ({ query: async () => ({ recordset: [[value]] }) }),
      } as never,
    });
    for (const expression of [
      aggregate(items.id),
      db[method](items.id),
      query[method]('id'),
      query[method](items.id),
      aggregate<unknown>(items.id),
      db[method]<unknown>(items.id),
      query[method]<unknown>('id'),
    ]) {
      const selected = database.select({ total: expression }).from(items);
      const expected = database
        .select({
          total: (method.startsWith('avgDistinct')
            ? nativeAvgDistinct
            : method.startsWith('avg')
              ? nativeAvg
              : method.startsWith('sumDistinct')
                ? nativeSumDistinct
                : nativeSum)(items.id).mapWith(decoder),
        })
        .from(items);
      expect(selected.toSQL()).toEqual(expected.toSQL());
      expect(await selected).toEqual([{ total: value === null ? null : decoder(value) }]);
    }
  }
  expect(() => Reflect.apply(query[method], query, ['missing'])).toThrow('unknown column "missing"');
});
