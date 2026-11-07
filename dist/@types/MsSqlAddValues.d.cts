import type { MsSqlTable } from 'drizzle-orm/mssql-core/table';
import type { MsSqlInsertValue as InsertValue } from 'drizzle-orm/mssql-core/query-builders/insert';
import type { TablePolicies } from '../mssqlTable.cjs';
type Blocked<T extends MsSqlTable> = {
    [K in keyof InsertValue<T>]-?: K extends keyof TablePolicies<T> ? TablePolicies<T>[K] extends {
        insert: 'blocked';
    } ? K : TablePolicies<T>[K] extends {
        insert: 'allowed';
    } ? never : K extends keyof T['_']['columns'] ? (T['_']['columns'][K]['_'] extends {
        generated: infer G;
    } ? undefined extends G ? false : keyof G extends never ? true : false : false) extends true ? K : never : never : K extends keyof T['_']['columns'] ? (T['_']['columns'][K]['_'] extends {
        generated: infer G;
    } ? undefined extends G ? false : keyof G extends never ? true : false : false) extends true ? K : never : never;
}[keyof InsertValue<T>];
type TimestampKeys<T extends MsSqlTable> = {
    [K in keyof InsertValue<T>]-?: K extends keyof TablePolicies<T> ? TablePolicies<T>[K] extends {
        timestamp: string;
    } ? K : never : never;
}[keyof InsertValue<T>] & keyof InsertValue<T>;
export type MsSqlAddValues<T extends MsSqlTable, B extends keyof InsertValue<T> = never> = Omit<InsertValue<T>, B | Blocked<T> | TimestampKeys<T>> & Partial<Pick<InsertValue<T>, Exclude<TimestampKeys<T>, B | Blocked<T>>>>;
export {};
