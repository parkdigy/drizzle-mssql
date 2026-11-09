import { SQL, sql, type Subquery } from 'drizzle-orm';
import { alias, type MsSqlTable } from 'drizzle-orm/mssql-core';
import * as native from 'drizzle-orm';
import { type MsSqlAliases } from './alias.js';
import { type MsSqlSchemaConditions } from './conditions.js';
import { TableColumns } from './columns.js';
import { MsSqlQuery, type SelectFrom, type SelectInput, type ResolveSelectInput } from './MsSqlQuery.js';
export interface DrizzleMsSqlOptions<TSchema extends Record<string, MsSqlTable>> {
    url: string;
    schema: TSchema;
    getTimestamp: () => unknown;
}
type MsSqlConnection<TSchema extends Record<string, MsSqlTable>> = ReturnType<typeof createConnection<TSchema>>;
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
    select<K extends keyof TSchema & string, const TArgs extends readonly [fields?: SelectInput<TSchema[K]>]>(table: K, ...args: TArgs): SelectFrom<TSchema[K], ResolveSelectInput<TSchema[K], TArgs[0]>>;
    select<TTable extends MsSqlTable, const TArgs extends readonly [fields?: SelectInput<TTable>]>(table: TTable, ...args: TArgs): SelectFrom<TTable, ResolveSelectInput<TTable, TArgs[0]>>;
    query<TTable extends MsSqlTable>(table: TTable): MsSqlQuery<TTable>;
}
type MsSqlNativeHelpers = Pick<typeof native, 'asc' | 'desc' | 'count' | 'countDistinct' | 'avg' | 'avgDistinct' | 'sum' | 'sumDistinct' | 'max' | 'min' | 'not' | 'exists' | 'notExists' | 'arrayContains' | 'arrayContained' | 'arrayOverlaps'>;
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
