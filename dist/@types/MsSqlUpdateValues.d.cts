import type { MsSqlTable } from 'drizzle-orm/mssql-core/table';
import type { MsSqlUpdateSetSource } from 'drizzle-orm/mssql-core/query-builders/update';
import type { GetColumnData, Placeholder, SQL } from 'drizzle-orm';
import type { TablePolicies } from '../mssqlTable.cjs';
type UpdateSource<T extends MsSqlTable> = MsSqlUpdateSetSource<T> & {
    [K in Exclude<keyof T['_']['columns'], keyof MsSqlUpdateSetSource<T>> as K extends keyof TablePolicies<T> ? TablePolicies<T>[K] extends {
        update: 'allowed' | 'required';
    } ? K : never : never]?: GetColumnData<T['_']['columns'][K], 'query'> | Placeholder | SQL;
};
type DefaultBlocked<T extends MsSqlTable, K> = K extends keyof T['_']['columns'] ? T['_']['columns'][K]['_']['isPrimaryKey'] extends true ? K : (T['_']['columns'][K]['_'] extends {
    generated: infer G;
} ? undefined extends G ? false : keyof G extends never ? true : false : false) extends true ? K : never : never;
type Blocked<T extends MsSqlTable> = {
    [K in keyof UpdateSource<T>]-?: K extends keyof TablePolicies<T> ? TablePolicies<T>[K] extends {
        timestamp: 'created';
    } | {
        update: 'blocked';
    } ? K : TablePolicies<T>[K] extends {
        update: 'allowed';
    } ? never : K extends keyof T['_']['columns'] ? T['_']['columns'][K]['_']['isPrimaryKey'] extends true ? K : TablePolicies<T>[K] extends {
        update: 'required';
    } ? never : DefaultBlocked<T, K> : never : DefaultBlocked<T, K>;
}[keyof UpdateSource<T>] & keyof UpdateSource<T>;
type RequiredKeys<T extends MsSqlTable> = {
    [K in keyof UpdateSource<T>]-?: K extends keyof TablePolicies<T> ? TablePolicies<T>[K] extends {
        update: 'required';
    } ? TablePolicies<T>[K] extends {
        timestamp: 'updated';
    } ? never : K : never : never;
}[keyof UpdateSource<T>] & keyof UpdateSource<T>;
export type MsSqlUpdateValues<T extends MsSqlTable, B extends keyof UpdateSource<T> = never, R extends Exclude<keyof UpdateSource<T>, B | Blocked<T>> = never> = Omit<UpdateSource<T>, B | Blocked<T> | R | RequiredKeys<T>> & {
    [K in Exclude<R | RequiredKeys<T>, B | Blocked<T>>]-?: Exclude<UpdateSource<T>[K], undefined>;
};
export {};
