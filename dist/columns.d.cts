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
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[], C extends MsSqlTable, const CN extends readonly MsSqlColumnSelectionName<C>[], D extends MsSqlTable, const DN extends readonly MsSqlColumnSelectionName<D>[], E extends MsSqlTable, const EN extends readonly MsSqlColumnSelectionName<E>[], F extends MsSqlTable, const FN extends readonly MsSqlColumnSelectionName<F>[], G extends MsSqlTable, const GN extends readonly MsSqlColumnSelectionName<G>[], H extends MsSqlTable, const HN extends readonly MsSqlColumnSelectionName<H>[], I extends MsSqlTable, const IN extends readonly MsSqlColumnSelectionName<I>[], J extends MsSqlTable, const JN extends readonly MsSqlColumnSelectionName<J>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN], c: readonly [C, ...CN], d: readonly [D, ...DN], e: readonly [E, ...EN], f: readonly [F, ...FN], g: readonly [G, ...GN], h: readonly [H, ...HN], i: readonly [I, ...IN], j: readonly [J, ...JN]): MsSqlMergedGroupColumns<readonly [
    readonly [A, ...AN],
    readonly [B, ...BN],
    readonly [C, ...CN],
    readonly [D, ...DN],
    readonly [E, ...EN],
    readonly [F, ...FN],
    readonly [G, ...GN],
    readonly [H, ...HN],
    readonly [I, ...IN],
    readonly [J, ...JN]
]>;
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[], C extends MsSqlTable, const CN extends readonly MsSqlColumnSelectionName<C>[], D extends MsSqlTable, const DN extends readonly MsSqlColumnSelectionName<D>[], E extends MsSqlTable, const EN extends readonly MsSqlColumnSelectionName<E>[], F extends MsSqlTable, const FN extends readonly MsSqlColumnSelectionName<F>[], G extends MsSqlTable, const GN extends readonly MsSqlColumnSelectionName<G>[], H extends MsSqlTable, const HN extends readonly MsSqlColumnSelectionName<H>[], I extends MsSqlTable, const IN extends readonly MsSqlColumnSelectionName<I>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN], c: readonly [C, ...CN], d: readonly [D, ...DN], e: readonly [E, ...EN], f: readonly [F, ...FN], g: readonly [G, ...GN], h: readonly [H, ...HN], i: readonly [I, ...IN]): MsSqlMergedGroupColumns<readonly [
    readonly [A, ...AN],
    readonly [B, ...BN],
    readonly [C, ...CN],
    readonly [D, ...DN],
    readonly [E, ...EN],
    readonly [F, ...FN],
    readonly [G, ...GN],
    readonly [H, ...HN],
    readonly [I, ...IN]
]>;
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[], C extends MsSqlTable, const CN extends readonly MsSqlColumnSelectionName<C>[], D extends MsSqlTable, const DN extends readonly MsSqlColumnSelectionName<D>[], E extends MsSqlTable, const EN extends readonly MsSqlColumnSelectionName<E>[], F extends MsSqlTable, const FN extends readonly MsSqlColumnSelectionName<F>[], G extends MsSqlTable, const GN extends readonly MsSqlColumnSelectionName<G>[], H extends MsSqlTable, const HN extends readonly MsSqlColumnSelectionName<H>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN], c: readonly [C, ...CN], d: readonly [D, ...DN], e: readonly [E, ...EN], f: readonly [F, ...FN], g: readonly [G, ...GN], h: readonly [H, ...HN]): MsSqlMergedGroupColumns<readonly [
    readonly [A, ...AN],
    readonly [B, ...BN],
    readonly [C, ...CN],
    readonly [D, ...DN],
    readonly [E, ...EN],
    readonly [F, ...FN],
    readonly [G, ...GN],
    readonly [H, ...HN]
]>;
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[], C extends MsSqlTable, const CN extends readonly MsSqlColumnSelectionName<C>[], D extends MsSqlTable, const DN extends readonly MsSqlColumnSelectionName<D>[], E extends MsSqlTable, const EN extends readonly MsSqlColumnSelectionName<E>[], F extends MsSqlTable, const FN extends readonly MsSqlColumnSelectionName<F>[], G extends MsSqlTable, const GN extends readonly MsSqlColumnSelectionName<G>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN], c: readonly [C, ...CN], d: readonly [D, ...DN], e: readonly [E, ...EN], f: readonly [F, ...FN], g: readonly [G, ...GN]): MsSqlMergedGroupColumns<readonly [
    readonly [A, ...AN],
    readonly [B, ...BN],
    readonly [C, ...CN],
    readonly [D, ...DN],
    readonly [E, ...EN],
    readonly [F, ...FN],
    readonly [G, ...GN]
]>;
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[], C extends MsSqlTable, const CN extends readonly MsSqlColumnSelectionName<C>[], D extends MsSqlTable, const DN extends readonly MsSqlColumnSelectionName<D>[], E extends MsSqlTable, const EN extends readonly MsSqlColumnSelectionName<E>[], F extends MsSqlTable, const FN extends readonly MsSqlColumnSelectionName<F>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN], c: readonly [C, ...CN], d: readonly [D, ...DN], e: readonly [E, ...EN], f: readonly [F, ...FN]): MsSqlMergedGroupColumns<readonly [
    readonly [A, ...AN],
    readonly [B, ...BN],
    readonly [C, ...CN],
    readonly [D, ...DN],
    readonly [E, ...EN],
    readonly [F, ...FN]
]>;
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[], C extends MsSqlTable, const CN extends readonly MsSqlColumnSelectionName<C>[], D extends MsSqlTable, const DN extends readonly MsSqlColumnSelectionName<D>[], E extends MsSqlTable, const EN extends readonly MsSqlColumnSelectionName<E>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN], c: readonly [C, ...CN], d: readonly [D, ...DN], e: readonly [E, ...EN]): MsSqlMergedGroupColumns<readonly [readonly [A, ...AN], readonly [B, ...BN], readonly [C, ...CN], readonly [D, ...DN], readonly [E, ...EN]]>;
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[], C extends MsSqlTable, const CN extends readonly MsSqlColumnSelectionName<C>[], D extends MsSqlTable, const DN extends readonly MsSqlColumnSelectionName<D>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN], c: readonly [C, ...CN], d: readonly [D, ...DN]): MsSqlMergedGroupColumns<readonly [readonly [A, ...AN], readonly [B, ...BN], readonly [C, ...CN], readonly [D, ...DN]]>;
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[], C extends MsSqlTable, const CN extends readonly MsSqlColumnSelectionName<C>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN], c: readonly [C, ...CN]): MsSqlMergedGroupColumns<readonly [readonly [A, ...AN], readonly [B, ...BN], readonly [C, ...CN]]>;
export declare function TableColumns<A extends MsSqlTable, const AN extends readonly MsSqlColumnSelectionName<A>[], B extends MsSqlTable, const BN extends readonly MsSqlColumnSelectionName<B>[]>(a: readonly [A, ...AN], b: readonly [B, ...BN]): MsSqlMergedGroupColumns<readonly [readonly [A, ...AN], readonly [B, ...BN]]>;
export declare function TableColumns<T extends MsSqlTable>(table: T): MsSqlSelectedTableColumns<T>;
export declare function TableColumns<T extends MsSqlTable, N extends MsSqlColumnSelectionName<T>>(table: T, ...names: (N | NoInfer<MsSqlColumnSelectionName<T>>)[]): MsSqlSelectedNamedColumnUnion<T, N>;
export declare function TableColumns<T extends MsSqlTable, N extends string>(table: T, ...names: N[] & MsSqlColumnSelectionName<T>[]): Record<string, MsSqlColumn | SQL.Aliased>;
export declare function TableColumns<const T extends readonly MsSqlColumn[]>(columns: T): MsSqlSelectedColumns<T>;
export declare function TableColumns<const T extends readonly [MsSqlColumn, ...MsSqlColumn[]]>(...columns: T): MsSqlSelectedColumns<T>;
export declare function TableColumns<const G extends readonly [MsSqlColumnGroup, ...MsSqlColumnGroup[]]>(...groups: G & {
    [I in keyof G]: readonly [G[I][0], ...MsSqlColumnSelectionName<G[I][0]>[]];
}): MsSqlMergedGroupColumns<G>;
export declare function TableColumns<T extends Subquery>(subquery: T): MsSqlSubqueryFields<T>;
export declare function TableColumns<T extends Subquery, N extends keyof MsSqlSubqueryFields<T> & string>(subquery: T, ...names: (N | NoInfer<keyof MsSqlSubqueryFields<T> & string>)[]): Pick<MsSqlSubqueryFields<T>, N>;
export {};
