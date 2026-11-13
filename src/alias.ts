import type { MsSqlTable } from 'drizzle-orm/mssql-core';
import { alias as _alias } from 'drizzle-orm/mssql-core/alias';
import type { MsSqlAliasTable } from './columns';

type Abbreviation<S extends string, First extends boolean = true> = S extends `${infer Char}${infer Rest}`
  ? First extends true
    ? `${Lowercase<Char>}${Abbreviation<Rest, false>}`
    : Char extends Uppercase<Char>
      ? `${Lowercase<Char>}${Abbreviation<Rest, false>}`
      : Abbreviation<Rest, false>
  : '';

export type MsSqlAliases<TSchema extends Record<string, MsSqlTable>> = {
  [K in keyof TSchema & string]: {
    (alias?: Abbreviation<K>): MsSqlAliasTable<TSchema[K], Abbreviation<K>>;
    <TAlias extends string>(alias: TAlias): MsSqlAliasTable<TSchema[K], TAlias>;
  };
};

export function createAlias<TSchema extends Record<string, MsSqlTable>>(schema: TSchema): MsSqlAliases<TSchema> {
  type SchemaKey = keyof TSchema & string;
  /********************************************************************************************************************
   * getDefaultAlias
   * ******************************************************************************************************************/
  const getDefaultAlias = (tableName: SchemaKey) =>
    `${tableName[0]}${(tableName.slice(1).match(/[A-Z]/g) ?? []).join('')}`.toLowerCase();

  /********************************************************************************************************************
   * createAlias
   * ******************************************************************************************************************/
  const createAlias =
    <K extends SchemaKey>(tableName: K) =>
    (alias: string = getDefaultAlias(tableName)) =>
      _alias(schema[tableName]!, alias);

  /********************************************************************************************************************
   * alias
   * ******************************************************************************************************************/
  const alias = Object.fromEntries(
    (Object.keys(schema) as SchemaKey[]).map((tableName) => [tableName, createAlias(tableName)])
  ) as unknown as MsSqlAliases<TSchema>;

  return alias;
}
