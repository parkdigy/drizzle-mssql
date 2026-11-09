import { Subquery, type SQL } from 'drizzle-orm';
import type { MsSqlColumn, MsSqlTable, MsSqlTableWithColumns } from 'drizzle-orm/mssql-core';
import type { BuildAliasTable } from 'drizzle-orm/mssql-core/query-builders/select.types';
/********************************************************************************************************************
 * MsSqlAliasTable
 * ******************************************************************************************************************/
export type MsSqlAliasTable<T extends MsSqlTable, Alias extends string> = MsSqlTableWithColumns<Omit<BuildAliasTable<T, Alias>['_'], 'columns'> & {
    columns: {
        [K in keyof T['_']['columns']]: MsSqlColumn<BuildAliasTable<T, Alias>['_']['columns'][K]['_'] & {
            name: T['_']['columns'][K]['_']['name'];
        }>;
    };
}>;
/********************************************************************************************************************
 * MsSqlSelectedColumns
 * ******************************************************************************************************************/
export type MsSqlSelectedColumns<T extends readonly MsSqlColumn[]> = {
    [C in T[number] as C['_']['name']]: C;
};
/********************************************************************************************************************
 * MsSqlTableColumns
 * ******************************************************************************************************************/
export type MsSqlSelectedTableColumns<T extends MsSqlTable> = {
    [K in keyof T['_']['columns'] as string extends T['_']['columns'][K]['_']['name'] ? K : T['_']['columns'][K]['_']['name']]: T['_']['columns'][K];
};
/********************************************************************************************************************
 * MsSqlColumnSelectionName
 * ******************************************************************************************************************/
type AsKeyword = 'as' | 'AS' | 'As' | 'aS';
export type MsSqlColumnSelectionName<T extends MsSqlTable> = (keyof T['_']['columns'] & string) | `${keyof T['_']['columns'] & string} ${AsKeyword} ${string}`;
/********************************************************************************************************************
 * MsSqlSelectedNamedColumn
 * ******************************************************************************************************************/
type MsSqlColumnForName<T extends MsSqlTable, N extends string> = Extract<T['_']['columns'][Extract<N, keyof T['_']['columns']>], MsSqlColumn>;
/********************************************************************************************************************
 * MsSqlSelectedNamedColumn
 * ******************************************************************************************************************/
type MsSqlSelectionKey<T extends MsSqlTable, N extends string> = N extends `${string} ${AsKeyword} ${infer Alias}` ? Alias : string extends MsSqlColumnForName<T, N>['_']['name'] ? N : MsSqlColumnForName<T, N>['_']['name'];
/********************************************************************************************************************
 * MsSqlSelectedNamedColumn
 * ******************************************************************************************************************/
type MsSqlSelectionValue<T extends MsSqlTable, N extends string> = N extends `${infer Name} ${AsKeyword} ${string}` ? SQL.Aliased<MsSqlColumnForName<T, Name>['_']['data']> : MsSqlColumnForName<T, N>;
/********************************************************************************************************************
 * MsSqlSelectedNamedColumn
 * ******************************************************************************************************************/
type MsSqlSelectedNamedColumn<T extends MsSqlTable, N extends string> = {
    [K in MsSqlSelectionKey<T, N>]: MsSqlSelectionValue<T, N>;
};
/********************************************************************************************************************
 * MsSqlSelectedNamedColumnUnion
 * ******************************************************************************************************************/
export type MsSqlSelectedNamedColumnUnion<T extends MsSqlTable, N extends string> = {
    [Name in N as MsSqlSelectionKey<T, Name>]: MsSqlSelectionValue<T, Name>;
};
/********************************************************************************************************************
 * MsSqlSelectedNamedColumns
 * ******************************************************************************************************************/
export type MsSqlSelectedNamedColumns<T extends MsSqlTable, N extends readonly string[], Result = {}> = number extends N['length'] ? {
    [Name in N[number] as MsSqlSelectionKey<T, Name>]: MsSqlSelectionValue<T, Name>;
} : N extends readonly [infer First extends string, ...infer Rest extends readonly string[]] ? MsSqlSelectedNamedColumns<T, Rest, Omit<Result, MsSqlSelectionKey<T, First>> & MsSqlSelectedNamedColumn<T, First>> : Result;
/********************************************************************************************************************
 * MsSqlColumnGroup
 * ******************************************************************************************************************/
type MsSqlColumnGroup = readonly [MsSqlTable, ...string[]];
type MsSqlSubqueryFields<T extends Subquery> = T['_']['selectedFields'];
/********************************************************************************************************************
 * MsSqlGroupColumns
 * ******************************************************************************************************************/
type MsSqlGroupColumns<G extends MsSqlColumnGroup> = G extends readonly [infer T extends MsSqlTable, ...infer N] ? N extends readonly [] ? MsSqlSelectedTableColumns<T> : MsSqlSelectedNamedColumns<T, Extract<N, readonly string[]>> : never;
/********************************************************************************************************************
 * MsSqlMergedGroupColumns
 * ******************************************************************************************************************/
type MsSqlMergedGroupColumns<G extends readonly MsSqlColumnGroup[], Result = {}> = G extends readonly [
    infer First extends MsSqlColumnGroup,
    ...infer Rest extends readonly MsSqlColumnGroup[]
] ? MsSqlMergedGroupColumns<Rest, Omit<Result, keyof MsSqlGroupColumns<First>> & MsSqlGroupColumns<First>> : {
    [P in keyof Result]: Result[P];
};
/********************************************************************************************************************
 * MsSqlTableColumns
 * ******************************************************************************************************************/
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN]): MsSqlMergedGroupColumns<readonly [readonly [A, ...AN], readonly [B, ...BN]]>;
export declare function TableColumns<T extends MsSqlTable>(table: T): MsSqlSelectedTableColumns<T>;
export declare function TableColumns<T extends MsSqlTable, N extends MsSqlColumnSelectionName<T>>(table: T, ...names: N[]): MsSqlSelectedNamedColumnUnion<T, N>;
export declare function TableColumns<T extends MsSqlTable, N extends string>(table: T, ...names: N[] & MsSqlColumnSelectionName<T>[]): Record<string, MsSqlColumn | SQL.Aliased>;
export declare function TableColumns<const T extends readonly MsSqlColumn[]>(columns: T): MsSqlSelectedColumns<T>;
export declare function TableColumns<const T extends readonly [MsSqlColumn, ...MsSqlColumn[]]>(...columns: T): MsSqlSelectedColumns<T>;
export declare function TableColumns<const G extends readonly [MsSqlColumnGroup, ...MsSqlColumnGroup[]]>(...groups: G & {
    [I in keyof G]: readonly [G[I][0], ...MsSqlColumnSelectionName<G[I][0]>[]];
}): MsSqlMergedGroupColumns<G>;
export declare function TableColumns<T extends Subquery>(subquery: T): MsSqlSubqueryFields<T>;
export declare function TableColumns<T extends Subquery, N extends keyof MsSqlSubqueryFields<T> & string>(subquery: T, ...names: (N | NoInfer<keyof MsSqlSubqueryFields<T> & string>)[]): Pick<MsSqlSubqueryFields<T>, N>;
export {};
