import { drizzle, getMsSqlConnectionParams } from 'drizzle-orm/node-mssql';
import mssql, { type config as MsSqlConfig } from 'mssql';
import { count, defineRelations, getTableColumns, is, isTable, SQL, sql, type Subquery } from 'drizzle-orm';
import { alias, type MsSqlTable } from 'drizzle-orm/mssql-core';
import { AsyncLocalStorage } from 'node:async_hooks';
import * as native from 'drizzle-orm';
import { createAlias, type MsSqlAliases } from './alias';
import { createConditions, type MsSqlSchemaConditions } from './conditions';
import { TableColumns } from './columns';
import type { MsSqlColumnName } from './@types';
import {
  MsSqlQuery,
  type SelectFrom,
  type SelectInput,
  type ResolveSelectInput,
  type SubquerySelectInput,
  type ResolveSubquerySelectInput,
} from './MsSqlQuery';

export type DrizzleMsSqlOptions<TSchema extends Record<string, MsSqlTable>> = {
  schema: TSchema;
  getTimestamp?: () => unknown;
} & (
  | ({ url: string } & Omit<MsSqlConfig, 'server' | 'port' | 'user' | 'password' | 'database'>)
  | (MsSqlConfig & { url?: never })
);

type MsSqlConnection<TSchema extends Record<string, MsSqlTable>> = ReturnType<typeof createConnection<TSchema>>;

type SelectTable<TSchema, TSource> = TSource extends MsSqlTable
  ? TSource
  : TSource extends keyof TSchema
    ? Extract<TSchema[TSource], MsSqlTable>
    : never;

interface MsSqlDatabaseHelpers<TSchema extends Record<string, MsSqlTable>> extends MsSqlNativeHelpers {
  s: TSchema;
  a: MsSqlAliases<TSchema>;
  columns: typeof TableColumns;
  alias: typeof alias;
  sql: typeof sql;
  sqlNumber(value: SQL | number): SQL<number>;
  sqlString(value: SQL | string): SQL<string>;
  sqlBoolean(value: SQL | boolean): SQL<boolean>;
  current: MsSqlConnection<TSchema>['current'];
  trans: MsSqlConnection<TSchema>['trans'];
  paginate: MsSqlConnection<TSchema>['paginate'];
  close: MsSqlConnection<TSchema>['close'];
  select<
    TSource extends (keyof TSchema & string) | MsSqlTable,
    const TArgs extends readonly [fields?: SelectInput<SelectTable<TSchema, TSource>>],
  >(
    table: TSource,
    ...args: TArgs
  ): SelectFrom<SelectTable<TSchema, TSource>, ResolveSelectInput<SelectTable<TSchema, TSource>, TArgs[0]>>;
  select<TSource extends Subquery, const TArgs extends readonly [fields?: SubquerySelectInput<TSource>]>(
    source: TSource,
    ...args: TArgs
  ): SelectFrom<TSource, ResolveSubquerySelectInput<TSource, TArgs[0]>>;
  query<TTable extends MsSqlTable>(table: TTable): MsSqlQuery<TTable>;
}

type OrderByColumn = Parameters<typeof native.asc>[0];
type AliasOrderByHelper = {
  <TTable extends MsSqlTable>(table: TTable, name: MsSqlColumnName<TTable>): SQL;
  <TTable extends MsSqlTable>(
    table: TTable,
    first: MsSqlColumnName<TTable>,
    second: MsSqlColumnName<TTable>,
    ...rest: MsSqlColumnName<TTable>[]
  ): SQL[];
};
type MultiColumnOrderHelper = {
  (column: OrderByColumn): SQL;
  (first: OrderByColumn, second: OrderByColumn, ...rest: OrderByColumn[]): SQL[];
} & AliasOrderByHelper;

const createOrderByHelper = (direction: (column: OrderByColumn) => SQL): MultiColumnOrderHelper => {
  const implementation = (...args: [OrderByColumn | MsSqlTable, ...(OrderByColumn | string)[]]) => {
    let columns: OrderByColumn[];
    if (isTable(args[0])) {
      const [table, ...names] = args;
      const tableColumns = getTableColumns(table);
      columns = (names as string[]).map((name) => {
        const column = tableColumns[name];
        if (!column) throw new Error(`orderBy: unknown column "${name}".`);
        return column;
      });
    } else {
      columns = args as OrderByColumn[];
    }
    const orders = columns.map(direction);
    return orders.length === 1 ? orders[0] : orders;
  };
  return implementation as MultiColumnOrderHelper;
};

type MsSqlNativeHelpers = Omit<
  Pick<
    typeof native,
    | 'count'
    | 'countDistinct'
    | 'avg'
    | 'avgDistinct'
    | 'sum'
    | 'sumDistinct'
    | 'max'
    | 'min'
    | 'not'
    | 'exists'
    | 'notExists'
    | 'arrayContains'
    | 'arrayContained'
    | 'arrayOverlaps'
  >,
  'asc' | 'desc'
> & {
  asc: MultiColumnOrderHelper;
  desc: MultiColumnOrderHelper;
};

const asc = createOrderByHelper(native.asc);
const desc = createOrderByHelper(native.desc);

export type DrizzleMsSql<TSchema extends Record<string, MsSqlTable>> = MsSqlDatabaseHelpers<TSchema> &
  MsSqlSchemaConditions<TSchema>;

function createConnection<TSchema extends Record<string, MsSqlTable>>(options: DrizzleMsSqlOptions<TSchema>) {
  const { url, schema, getTimestamp, ...connectionOptions } = options;
  if (url && Object.keys(connectionOptions).some((key) => key !== 'options')) {
    throw new TypeError('url cannot be combined with direct connection settings.');
  }
  const connectionConfig: string | MsSqlConfig = url
    ? getMsSqlConnectionParams(url)
    : (connectionOptions as MsSqlConfig);
  const drizzleConnection =
    url && connectionOptions.options
      ? {
          ...(typeof connectionConfig === 'string'
            ? mssql.ConnectionPool.parseConnectionString(connectionConfig)
            : connectionConfig),
          options: connectionOptions.options,
        }
      : connectionConfig;
  // 현재 Drizzle 구현은 config 객체를 지원하지만 공개 타입은 connection을 string으로만 선언한다.
  const raw = drizzle({ connection: drizzleConnection as string, relations: defineRelations(schema) });
  type Transaction = Parameters<Parameters<typeof raw.transaction>[0]>[0];
  const context = new AsyncLocalStorage<Transaction>();
  const timestampFactory = getTimestamp ?? (() => new Date());
  const current = Object.assign(() => context.getStore() ?? raw, { getTimestamp: timestampFactory });
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
    const config = (
      builder as unknown as {
        config: {
          orderBy?: unknown[];
          fetch?: unknown;
          setOperators: { orderBy?: unknown[]; fetch?: unknown }[];
        };
        orderBy(value: SQL): unknown;
      }
    ).config;
    const tail = config.setOperators[config.setOperators.length - 1] ?? config;
    if (!tail.orderBy?.length) {
      (builder as unknown as { orderBy(value: SQL): unknown }).orderBy(sql`(select 0)`);
    }
    // 같은 빌더로 재호출할 때 이전 페이지의 FETCH가 전체 건수에 섞이지 않도록 한다.
    tail.fetch = undefined;
    const [countRow] = await current().select({ total: count() }).from(builder.offset(0).as('a'));
    const total = countRow?.total ?? 0;
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
  return { current, trans, paginate, close: async () => (await raw.$client.$instance()).close() };
}

export function drizzleMsSql<TSchema extends Record<string, MsSqlTable>>(
  options: DrizzleMsSqlOptions<TSchema>
): DrizzleMsSql<TSchema> {
  const connection = createConnection(options);
  function select(tableOrName: string | MsSqlTable | Subquery, fields?: unknown): unknown {
    const table = typeof tableOrName === 'string' ? options.schema[tableOrName] : tableOrName;
    if (!table) throw new Error(`select: unknown table "${tableOrName}".`);
    if (is(table, native.Subquery)) {
      // select의 서브쿼리 분기는 기준 테이블 대신 전달한 source를 사용한다.
      return new MsSqlQuery(table as unknown as MsSqlTable, connection.current).select(
        table,
        fields as SubquerySelectInput<Subquery>
      );
    }
    return new MsSqlQuery(table, connection.current).select(fields as SelectInput<MsSqlTable>);
  }
  return {
    select: select as MsSqlDatabaseHelpers<TSchema>['select'],
    asc,
    desc,
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
    alias,
    sql,
    sqlNumber: (value: SQL | number) => (is(value, SQL) ? value : sql`${value}`).mapWith(Number),
    sqlString: (value: SQL | string) => (is(value, SQL) ? value : sql`${value}`).mapWith(String),
    sqlBoolean: (value: SQL | boolean) =>
      (is(value, SQL) ? value : sql`${value}`).mapWith((v) => v === true || v === 1),
    ...connection,
    query: <TTable extends MsSqlTable>(table: TTable): MsSqlQuery<TTable> => new MsSqlQuery(table, connection.current),
  };
}
