import { drizzle } from 'drizzle-orm/node-mssql';
import { count, defineRelations, is, SQL, sql, type Subquery } from 'drizzle-orm';
import type { MsSqlTable } from 'drizzle-orm/mssql-core';
import { AsyncLocalStorage } from 'node:async_hooks';
import * as native from 'drizzle-orm';
import { createAlias } from './alias';
import { createConditions } from './conditions';
import { TableColumns } from './columns';
import { MsSqlQuery } from './MsSqlQuery';

export function drizzleMsSql<TSchema extends Record<string, MsSqlTable>>(options: {
  url: string;
  schema: TSchema;
  getTimestamp: () => unknown;
}) {
  const raw = drizzle({ connection: options.url, relations: defineRelations(options.schema) });
  type Transaction = Parameters<Parameters<typeof raw.transaction>[0]>[0];
  const context = new AsyncLocalStorage<Transaction>();
  const current = Object.assign(() => context.getStore() ?? raw, { getTimestamp: options.getTimestamp });
  const trans = <T>(callback: () => Promise<T>): Promise<T> => {
    const parent = context.getStore();
    const execute = (tx: Transaction) => context.run(tx, callback);
    return parent ? parent.transaction(execute) : raw.transaction(execute);
  };
  const paginate = async <TResult extends unknown[]>(
    builder: {
      offset(offset: number): { fetch(limit: number): PromiseLike<TResult>; as(alias: string): Subquery };
      as(alias: string): Subquery;
    },
    page: number,
    limit: number
  ) => {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
      throw new RangeError('page and limit must be positive integers');
    }
    const offset = (page - 1) * limit;
    // Drizzle의 SQL Server 빌더는 offset/fetch가 호출된 빌더의 설정을 직접 변경한다.
    // 집계와 데이터 조회 모두 SQL Server 2012의 ORDER BY ... OFFSET 문법을 따라야 한다.
    const config = (builder as unknown as {
      config: {
        orderBy?: unknown[];
        fetch?: unknown;
        setOperators: { orderBy?: unknown[]; fetch?: unknown }[];
      };
      orderBy(value: SQL): unknown;
    }).config;
    const tail = config.setOperators.length ? config.setOperators[config.setOperators.length - 1] : config;
    if (!tail.orderBy?.length) {
      (builder as unknown as { orderBy(value: SQL): unknown }).orderBy(sql`(select 0)`);
    }
    // 같은 빌더로 재호출할 때 이전 페이지의 FETCH가 전체 건수에 섞이지 않도록 한다.
    tail.fetch = undefined;
    const [{ total }] = await current().select({ total: count() }).from(builder.offset(0).as('a'));
    const data = await builder.offset(offset).fetch(limit);
    return {
      data,
      paging: {
        current_page: page,
        per_page: limit,
        last_page: Math.ceil(total / limit),
        total,
        from: offset,
        to: offset + data.length,
      },
    };
  };
  return {
    asc: native.asc,
    desc: native.desc,
    count: native.count,
    countDistinct: native.countDistinct,
    avg: native.avg,
    avgDistinct: native.avgDistinct,
    sum: native.sum,
    sumDistinct: native.sumDistinct,
    max: native.max,
    min: native.min,
    not: native.not,
    exists: native.exists,
    notExists: native.notExists,
    arrayContains: native.arrayContains,
    arrayContained: native.arrayContained,
    arrayOverlaps: native.arrayOverlaps,
    s: options.schema,
    a: createAlias(options.schema),
    ...createConditions(options.schema),
    columns: TableColumns,
    sql,
    sqlNumber: (value: SQL | number) => (is(value, SQL) ? value : sql`${value}`).mapWith(Number),
    sqlString: (value: SQL | string) => (is(value, SQL) ? value : sql`${value}`).mapWith(String),
    sqlBoolean: (value: SQL | boolean) =>
      (is(value, SQL) ? value : sql`${value}`).mapWith((v) => v === true || v === 1),
    current,
    query: <TTable extends TSchema[keyof TSchema]>(table: TTable) => new MsSqlQuery(table, current),
    trans,
    paginate,
    close: async () => (await raw.$client.$instance()).close(),
  };
}
