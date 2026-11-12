import { type config as MsSqlConfig } from 'mssql';
import { SQL, sql, type Subquery } from 'drizzle-orm';
import { alias, type MsSqlTable } from 'drizzle-orm/mssql-core';
import * as native from 'drizzle-orm';
import { type MsSqlAliases } from './alias.cjs';
import { type MsSqlSchemaConditions } from './conditions.cjs';
import { TableColumns } from './columns.cjs';
import type { MsSqlColumnName } from './@types/index.cjs';
import { MsSqlQuery, type SelectFrom, type SelectInput, type ResolveSelectInput, type SubquerySelectInput, type ResolveSubquerySelectInput } from './MsSqlQuery.cjs';
export type DrizzleMsSqlOptions<TSchema extends Record<string, MsSqlTable>> = {
    schema: TSchema;
    getTimestamp?: () => unknown;
} & ({
    url: string;
    options?: MsSqlConfig['options'];
} | (MsSqlConfig & {
    url?: never;
}));
type MsSqlConnection<TSchema extends Record<string, MsSqlTable>> = ReturnType<typeof createConnection<TSchema>>;
type SelectTable<TSchema, TSource> = TSource extends MsSqlTable ? TSource : TSource extends keyof TSchema ? Extract<TSchema[TSource], MsSqlTable> : never;
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
    select<TSource extends (keyof TSchema & string) | MsSqlTable, const TArgs extends readonly [fields?: SelectInput<SelectTable<TSchema, TSource>>]>(table: TSource, ...args: TArgs): SelectFrom<SelectTable<TSchema, TSource>, ResolveSelectInput<SelectTable<TSchema, TSource>, TArgs[0]>>;
    select<TSource extends Subquery, const TArgs extends readonly [fields?: SubquerySelectInput<TSource>]>(source: TSource, ...args: TArgs): SelectFrom<TSource, ResolveSubquerySelectInput<TSource, TArgs[0]>>;
    query<TTable extends MsSqlTable>(table: TTable): MsSqlQuery<TTable>;
}
type OrderByColumn = Parameters<typeof native.asc>[0];
type AliasOrderByHelper = {
    <TTable extends MsSqlTable>(table: TTable, name: MsSqlColumnName<TTable>): SQL;
    <TTable extends MsSqlTable>(table: TTable, first: MsSqlColumnName<TTable>, second: MsSqlColumnName<TTable>, ...rest: MsSqlColumnName<TTable>[]): SQL[];
};
type MultiColumnOrderHelper = {
    (column: OrderByColumn): SQL;
    (first: OrderByColumn, second: OrderByColumn, ...rest: OrderByColumn[]): SQL[];
} & AliasOrderByHelper;
type MsSqlNativeHelpers = Omit<Pick<typeof native, 'count' | 'countDistinct' | 'avg' | 'avgDistinct' | 'sum' | 'sumDistinct' | 'max' | 'min' | 'not' | 'exists' | 'notExists' | 'arrayContains' | 'arrayContained' | 'arrayOverlaps'>, 'asc' | 'desc'> & {
    asc: MultiColumnOrderHelper;
    desc: MultiColumnOrderHelper;
};
export type DrizzleMsSql<TSchema extends Record<string, MsSqlTable>> = MsSqlDatabaseHelpers<TSchema> & MsSqlSchemaConditions<TSchema>;
declare function createConnection<TSchema extends Record<string, MsSqlTable>>(options: DrizzleMsSqlOptions<TSchema>): {
    current: (() => (import("drizzle-orm/node-mssql").NodeMsSqlDatabase<native.ExtractTablesWithRelations<{}, native.ExtractTablesFromSchema<TSchema>>> & {
        $client: import("drizzle-orm/node-mssql/pool").AutoPool;
    }) | import("drizzle-orm/mssql-core").MsSqlTransaction<import("drizzle-orm/node-mssql").NodeMsSqlQueryResultHKT, import("drizzle-orm/node-mssql").NodeMsSqlPreparedQueryHKT, native.ExtractTablesWithRelations<{}, native.ExtractTablesFromSchema<TSchema>>>) & {
        getTimestamp: () => unknown;
    };
    trans: <T>(callback: () => Promise<T>) => Promise<T>;
    paginate: <TResult extends unknown[]>(builder: {
        offset(offset: number): {
            fetch(limit: number): PromiseLike<TResult>;
            as(alias: string): Subquery;
        };
        as(alias: string): Subquery;
    }, page: number, limit: number) => Promise<{
        data: TResult;
        paging: {
            current_page: number;
            per_page: number;
            last_page: number;
            total: number;
            from: number;
            to: number;
        };
    }>;
    close: () => Promise<void>;
};
export declare function drizzleMsSql<TSchema extends Record<string, MsSqlTable>>(options: DrizzleMsSqlOptions<TSchema>): DrizzleMsSql<TSchema>;
export {};
