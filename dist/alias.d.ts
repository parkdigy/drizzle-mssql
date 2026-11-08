import type { MsSqlTable } from 'drizzle-orm/mssql-core';
import type { MsSqlAliasTable } from './columns.js';
type Abbreviation<S extends string, First extends boolean = true> = S extends `${infer Char}${infer Rest}` ? First extends true ? `${Lowercase<Char>}${Abbreviation<Rest, false>}` : Char extends Uppercase<Char> ? `${Lowercase<Char>}${Abbreviation<Rest, false>}` : Abbreviation<Rest, false> : '';
export type MsSqlAliases<TSchema extends Record<string, MsSqlTable>> = {
    [K in keyof TSchema & string]: {
        (alias?: Abbreviation<K>): MsSqlAliasTable<TSchema[K], Abbreviation<K>>;
        <TAlias extends string>(alias: TAlias): MsSqlAliasTable<TSchema[K], TAlias>;
    };
};
export declare function createAlias<TSchema extends Record<string, MsSqlTable>>(schema: TSchema): MsSqlAliases<TSchema>;
export {};
