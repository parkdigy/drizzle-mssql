import { SQL, min as drizzleMin, max as drizzleMax } from 'drizzle-orm';
import { MsSqlTable, MsSqlColumn, type MsSqlSelectBase } from 'drizzle-orm/mssql-core';
import type { SelectedFields } from 'drizzle-orm/operations';
import type { GetSelectTableName } from 'drizzle-orm/query-builders/select.types';
import type { MsSqlColumnSelectionName, MsSqlSelectedNamedColumnUnion, MsSqlSelectedNamedColumns, MsSqlSelectedTableColumns, MsSqlAliasTable } from './columns.js';
import { type TableMutationPolicy } from './mssqlTable.js';
import type { MsSqlAddValues, MsSqlEditValues, MsSqlCompareValues, MsSqlColumnName, MsSqlArrayCompareValues, MsSqlRangeCompareValues, MsSqlPatternCompareValues, MsSqlNullConditionInput, MsSqlConditions } from './@types/index.js';
import type { NodeMsSqlDatabase, NodeMsSqlPreparedQueryHKT } from 'drizzle-orm/node-mssql';
/********************************************************************************************************************
 * MsSqlQuery
 * ******************************************************************************************************************/
export declare class MsSqlQuery<TTable extends MsSqlTable, AV extends MsSqlAddValues<TTable> = MsSqlAddValues<TTable>, EV extends MsSqlEditValues<TTable> = MsSqlEditValues<TTable>, AR = AddResult<TTable>> {
    private readonly current;
    private readonly getTimestamp?;
    readonly t: TTable;
    /********************************************************************************************************************
     * constructor
     * ******************************************************************************************************************/
    constructor(table: TTable, current: (() => NodeMsSqlDatabase) & {
        getTimestamp?: () => unknown;
    }, getTimestamp?: (() => unknown) | undefined);
    private readonly drizzle;
    /********************************************************************************************************************
     * (PROTECTED) getTx
     * ******************************************************************************************************************/
    protected getTx(): NodeMsSqlDatabase;
    /********************************************************************************************************************
     * columns
     * ******************************************************************************************************************/
    columns(): MsSqlSelectedTableColumns<TTable>;
    columns<N extends MsSqlColumnSelectionName<TTable>>(...names: N[]): MsSqlSelectedNamedColumnUnion<TTable, N>;
    /********************************************************************************************************************
     * min / max
     * ******************************************************************************************************************/
    min<N extends keyof TTable['_']['columns'] & string>(name: N): ReturnType<typeof drizzleMin<TTable['_']['columns'][N]>>;
    min<C extends MsSqlColumn>(column: C): ReturnType<typeof drizzleMin<C>>;
    max<N extends keyof TTable['_']['columns'] & string>(name: N): ReturnType<typeof drizzleMax<TTable['_']['columns'][N]>>;
    max<C extends MsSqlColumn>(column: C): ReturnType<typeof drizzleMax<C>>;
    private resolveAggregateColumn;
    private resolveOrderColumn;
    /********************************************************************************************************************
     * asc / desc
     * ******************************************************************************************************************/
    asc(name: MsSqlColumnName<TTable>): SQL;
    asc<TAlias extends string>(table: MsSqlAliasTable<TTable, TAlias>, name: MsSqlColumnName<MsSqlAliasTable<TTable, TAlias>>): SQL;
    desc(name: MsSqlColumnName<TTable>): SQL;
    desc<TAlias extends string>(table: MsSqlAliasTable<TTable, TAlias>, name: MsSqlColumnName<MsSqlAliasTable<TTable, TAlias>>): SQL;
    private resolveFields;
    /********************************************************************************************************************
     * select
     * ******************************************************************************************************************/
    select(): SelectFrom<TTable, undefined>;
    select(fields: readonly []): SelectFrom<TTable, {}>;
    select<N extends MsSqlColumnSelectionName<TTable>>(fields: readonly N[]): SelectFrom<TTable, MsSqlSelectedNamedColumns<TTable, readonly N[]>>;
    select<const T extends readonly FieldInput[]>(fields: (query: FieldsQuery<TTable>) => T): SelectFrom<TTable, MergeFields<T>>;
    select<const T extends readonly (FieldInput | MsSqlColumnSelectionName<TTable>)[]>(fields: T): SelectFrom<TTable, MergeFields<NamedFields<TTable, T>>>;
    select<const TSelection extends StringColumnSelection<TTable>>(fields: TSelection): SelectFrom<TTable, StringColumnSelectionFields<TTable, TSelection>>;
    select<TSelection extends SelectedFields<MsSqlColumn, TTable>>(fields?: Fields<FieldsQuery<TTable>, TSelection>): SelectFrom<TTable, TSelection>;
    select<TAlias extends string>(alias: MsSqlAliasTable<TTable, TAlias>): SelectFrom<MsSqlAliasTable<TTable, TAlias>, undefined>;
    select<TAlias extends string>(alias: MsSqlAliasTable<TTable, TAlias>, fields: readonly []): SelectFrom<MsSqlAliasTable<TTable, TAlias>, {}>;
    select<TAlias extends string, N extends MsSqlColumnSelectionName<MsSqlAliasTable<TTable, TAlias>>>(alias: MsSqlAliasTable<TTable, TAlias>, fields: readonly N[]): SelectFrom<MsSqlAliasTable<TTable, TAlias>, MsSqlSelectedNamedColumns<MsSqlAliasTable<TTable, TAlias>, readonly N[]>>;
    select<TAlias extends string, const T extends readonly FieldInput[]>(alias: MsSqlAliasTable<TTable, TAlias>, fields: (query: FieldsQuery<MsSqlAliasTable<TTable, TAlias>>) => T): SelectFrom<MsSqlAliasTable<TTable, TAlias>, MergeFields<T>>;
    select<TAlias extends string, const T extends readonly (FieldInput | MsSqlColumnSelectionName<MsSqlAliasTable<TTable, TAlias>>)[]>(alias: MsSqlAliasTable<TTable, TAlias>, fields: T): SelectFrom<MsSqlAliasTable<TTable, TAlias>, MergeFields<NamedFields<MsSqlAliasTable<TTable, TAlias>, T>>>;
    select<TAlias extends string, TSelection extends SelectedFields<MsSqlColumn, MsSqlAliasTable<TTable, TAlias>>>(alias: MsSqlAliasTable<TTable, TAlias>, fields: Fields<FieldsQuery<MsSqlAliasTable<TTable, TAlias>>, TSelection>): SelectFrom<MsSqlAliasTable<TTable, TAlias>, TSelection>;
    /********************************************************************************************************************
     * find
     * ******************************************************************************************************************/
    find(where: BaseWhere<this>): Promise<FindResult<TTable, undefined>>;
    find(fields: readonly [], where?: BaseWhere<this>): Promise<FindResult<TTable, {}>>;
    find<N extends MsSqlColumnSelectionName<TTable>>(fields: readonly N[], where?: BaseWhere<this>): Promise<FindResult<TTable, MsSqlSelectedNamedColumns<TTable, readonly N[]>>>;
    find<const T extends readonly FieldInput[]>(fields: (query: FieldsQuery<TTable>) => T, where: BaseWhere<this>): Promise<FindResult<TTable, MergeFields<T>>>;
    find<const T extends readonly (FieldInput | MsSqlColumnSelectionName<TTable>)[]>(fields: T, where: BaseWhere<this>): Promise<FindResult<TTable, MergeFields<NamedFields<TTable, T>>>>;
    find<const TSelection extends StringColumnSelection<TTable>>(fields: TSelection, where?: BaseWhere<this>): Promise<FindResult<TTable, StringColumnSelectionFields<TTable, TSelection>>>;
    find<TSelection extends SelectedFields<MsSqlColumn, TTable>>(fields: Fields<FieldsQuery<TTable>, TSelection>, where?: BaseWhere<this>): Promise<FindResult<TTable, TSelection>>;
    find<TAlias extends string>(alias: MsSqlAliasTable<TTable, TAlias>, where: BaseWhere<this>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, undefined>>;
    find<TAlias extends string>(alias: MsSqlAliasTable<TTable, TAlias>, fields: readonly [], where?: BaseWhere<this>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, {}>>;
    find<TAlias extends string, N extends MsSqlColumnSelectionName<MsSqlAliasTable<TTable, TAlias>>>(alias: MsSqlAliasTable<TTable, TAlias>, fields: readonly N[], where?: BaseWhere<this>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, MsSqlSelectedNamedColumns<MsSqlAliasTable<TTable, TAlias>, readonly N[]>>>;
    find<TAlias extends string, const T extends readonly FieldInput[]>(alias: MsSqlAliasTable<TTable, TAlias>, fields: (query: FieldsQuery<MsSqlAliasTable<TTable, TAlias>>) => T, where: BaseWhere<this>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, MergeFields<T>>>;
    find<TAlias extends string, const T extends readonly (FieldInput | MsSqlColumnSelectionName<MsSqlAliasTable<TTable, TAlias>>)[]>(alias: MsSqlAliasTable<TTable, TAlias>, fields: T, where: BaseWhere<this>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, MergeFields<NamedFields<MsSqlAliasTable<TTable, TAlias>, T>>>>;
    find<TAlias extends string, TSelection extends SelectedFields<MsSqlColumn, MsSqlAliasTable<TTable, TAlias>>>(alias: MsSqlAliasTable<TTable, TAlias>, fields: Fields<FieldsQuery<MsSqlAliasTable<TTable, TAlias>>, TSelection>, where: BaseWhere<this>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, TSelection>>;
    /********************************************************************************************************************
     * findByPrimaryKey
     * ******************************************************************************************************************/
    findByPrimaryKey<N extends MsSqlColumnSelectionName<TTable>>(fields: readonly N[], key: PrimaryKeyInput<TTable>): Promise<FindResult<TTable, MsSqlSelectedNamedColumns<TTable, readonly N[]>>>;
    findByPrimaryKey(key: PrimaryKeyInput<TTable>): Promise<FindResult<TTable, undefined>>;
    findByPrimaryKey(fields: readonly [], key: PrimaryKeyInput<TTable>): Promise<FindResult<TTable, {}>>;
    findByPrimaryKey<const T extends readonly FieldInput[]>(fields: (query: FieldsQuery<TTable>) => T, key: PrimaryKeyInput<TTable>): Promise<FindResult<TTable, MergeFields<T>>>;
    findByPrimaryKey<const T extends readonly (FieldInput | MsSqlColumnSelectionName<TTable>)[]>(fields: T, key: PrimaryKeyInput<TTable>): Promise<FindResult<TTable, MergeFields<NamedFields<TTable, T>>>>;
    findByPrimaryKey<const TSelection extends StringColumnSelection<TTable>>(fields: TSelection, key: PrimaryKeyInput<TTable>): Promise<FindResult<TTable, StringColumnSelectionFields<TTable, TSelection>>>;
    findByPrimaryKey<TSelection extends SelectedFields<MsSqlColumn, TTable>>(fields: Fields<FieldsQuery<TTable>, TSelection>, key: PrimaryKeyInput<TTable>): Promise<FindResult<TTable, TSelection>>;
    /********************************************************************************************************************
     * primaryKeyCondition
     * ******************************************************************************************************************/
    private primaryKeyCondition;
    /********************************************************************************************************************
     * exists
     * ******************************************************************************************************************/
    exists(where?: BaseWhere<this>): Promise<boolean>;
    /********************************************************************************************************************
     * existsByPrimarykey
     * ******************************************************************************************************************/
    existsByPrimaryKey(key: PrimaryKeyInput<TTable>): Promise<boolean>;
    /********************************************************************************************************************
     * notExists
     * ******************************************************************************************************************/
    notExists(where?: BaseWhere<this>): Promise<boolean>;
    /********************************************************************************************************************
     * notExistsByPrimaryKey
     * ******************************************************************************************************************/
    notExistsByPrimaryKey(key: PrimaryKeyInput<TTable>): Promise<boolean>;
    /********************************************************************************************************************
     * count
     * ******************************************************************************************************************/
    count(where?: BaseWhere<this>): Promise<number>;
    private prepareValues;
    /********************************************************************************************************************
     * (PRIVATE) executeInsert
     * ******************************************************************************************************************/
    private executeInsert;
    /********************************************************************************************************************
     * addValues
     * ******************************************************************************************************************/
    addValues(values: AV[]): AV[];
    addValues(values: AV): AV;
    /********************************************************************************************************************
     * editValues
     * ******************************************************************************************************************/
    editValues(values: EV): EV;
    /********************************************************************************************************************
     * add
     * ******************************************************************************************************************/
    add(value: AV[]): Promise<AR[]>;
    add(value: AV): Promise<AR>;
    /********************************************************************************************************************
     * edit
     * ******************************************************************************************************************/
    edit(this: this & (TableMutationPolicy<TTable> extends {
        updateBlocked: true;
    } ? never : unknown), set: EV, where: BaseWhere<this>): Omit<import("drizzle-orm/mssql-core").MsSqlUpdateBase<TTable, import("drizzle-orm/node-mssql").NodeMsSqlQueryResultHKT, NodeMsSqlPreparedQueryHKT, undefined, false, "where">, "where">;
    /********************************************************************************************************************
     * editByPrimaryKey
     * ******************************************************************************************************************/
    editByPrimaryKey(this: this & (TableMutationPolicy<TTable> extends {
        updateBlocked: true;
    } ? never : unknown), set: EV, key: PrimaryKeyInput<TTable>): Omit<import("drizzle-orm/mssql-core").MsSqlUpdateBase<TTable, import("drizzle-orm/node-mssql").NodeMsSqlQueryResultHKT, NodeMsSqlPreparedQueryHKT, undefined, false, "where">, "where">;
    /********************************************************************************************************************
     * remove
     * ******************************************************************************************************************/
    remove(this: this & (TableMutationPolicy<TTable> extends {
        deleteBlocked: true;
    } ? never : unknown), where: BaseWhere<this>): Omit<import("drizzle-orm/mssql-core").MsSqlDeleteBase<TTable, import("drizzle-orm/node-mssql").NodeMsSqlQueryResultHKT, NodeMsSqlPreparedQueryHKT, undefined, false, "where">, "where">;
    /********************************************************************************************************************
     * removeByPrimaryKey
     * ******************************************************************************************************************/
    removeByPrimaryKey(this: this & (TableMutationPolicy<TTable> extends {
        deleteBlocked: true;
    } ? never : unknown), key: PrimaryKeyInput<TTable>): Omit<import("drizzle-orm/mssql-core").MsSqlDeleteBase<TTable, import("drizzle-orm/node-mssql").NodeMsSqlQueryResultHKT, NodeMsSqlPreparedQueryHKT, undefined, false, "where">, "where">;
    private assertMutationAllowed;
    /********************************************************************************************************************
     * eq
     * ******************************************************************************************************************/
    eq(values: MsSqlCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * ne
     * ******************************************************************************************************************/
    ne(values: MsSqlCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * gt
     * ******************************************************************************************************************/
    gt(values: MsSqlCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * gte
     * ******************************************************************************************************************/
    gte(values: MsSqlCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * lt
     * ******************************************************************************************************************/
    lt(values: MsSqlCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * lte
     * ******************************************************************************************************************/
    lte(values: MsSqlCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * lte
     * ******************************************************************************************************************/
    inArray(values: MsSqlArrayCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * notInArray
     * ******************************************************************************************************************/
    notInArray(values: MsSqlArrayCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * between
     * ******************************************************************************************************************/
    between(values: MsSqlRangeCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * notBetween
     * ******************************************************************************************************************/
    notBetween(values: MsSqlRangeCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * like
     * ******************************************************************************************************************/
    like(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * notLike
     * ******************************************************************************************************************/
    notLike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * ilike
     * ******************************************************************************************************************/
    ilike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * notIlike
     * ******************************************************************************************************************/
    notIlike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * isNull
     * ******************************************************************************************************************/
    isNull(name: MsSqlColumnName<TTable>): SQL;
    isNull(names: MsSqlNullConditionInput<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * isNotNull
     * ******************************************************************************************************************/
    isNotNull(name: MsSqlColumnName<TTable>): SQL;
    isNotNull(names: MsSqlNullConditionInput<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * and
     * ******************************************************************************************************************/
    and(options: MsSqlConditions<TTable>): SQL | undefined;
    /********************************************************************************************************************
     * or
     * ******************************************************************************************************************/
    or(options: MsSqlConditions<TTable>): SQL | undefined;
}
/********************************************************************************************************************
 * types
 * ******************************************************************************************************************/
type SelectFrom<TTable extends MsSqlTable, TSelection extends FieldSet | undefined> = MsSqlSelectBase<GetSelectTableName<TTable>, TSelection extends undefined ? MsSqlSelectedTableColumns<TTable> : TSelection, 'partial', NodeMsSqlPreparedQueryHKT, 'from'> & {
    top: (count: number) => MsSqlSelectBase<GetSelectTableName<TTable>, TSelection extends undefined ? MsSqlSelectedTableColumns<TTable> : TSelection, 'partial', NodeMsSqlPreparedQueryHKT, 'top'>;
};
type FindResult<TTable extends MsSqlTable, TSelection extends FieldSet | undefined> = Awaited<SelectFrom<TTable, TSelection>>[number] | undefined;
type WhereQuery<TQuery> = Pick<TQuery, Extract<keyof TQuery, 't' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'inArray' | 'notInArray' | 'between' | 'notBetween' | 'like' | 'notLike' | 'ilike' | 'notIlike' | 'isNull' | 'isNotNull' | 'and' | 'or'>>;
type BaseWhere<TQuery> = SQL | undefined | ((query: WhereQuery<TQuery>) => SQL | undefined);
type FieldSet = SelectedFields<MsSqlColumn, MsSqlTable>;
type StringColumnSelection<TTable extends MsSqlTable> = Record<string, keyof TTable['_']['columns'] & string>;
type StringColumnSelectionFields<TTable extends MsSqlTable, TSelection extends StringColumnSelection<TTable>> = {
    [K in keyof TSelection]: TTable['_']['columns'][TSelection[K]] extends MsSqlColumn<infer TConfig> ? SQL.Aliased<TConfig['data']> : never;
};
type FieldInput = FieldSet | false | undefined;
type FieldsQuery<TTable extends MsSqlTable> = {
    readonly t: TTable;
    columns(): MsSqlSelectedTableColumns<TTable>;
    columns<N extends MsSqlColumnSelectionName<TTable>>(...names: N[]): MsSqlSelectedNamedColumnUnion<TTable, N>;
    min: MsSqlQuery<TTable>['min'];
    max: MsSqlQuery<TTable>['max'];
};
type Fields<TQuery, TSelection> = TSelection | ((query: TQuery) => TSelection);
type NamedFields<TTable extends MsSqlTable, T extends readonly (FieldInput | MsSqlColumnSelectionName<TTable>)[]> = {
    [I in keyof T]: T[I] extends MsSqlColumnSelectionName<TTable> ? MsSqlSelectedNamedColumns<TTable, readonly [T[I]]> : Extract<T[I], FieldInput>;
};
type MergeField<First, Result> = First extends FieldSet ? Result extends unknown ? Omit<Result, keyof First> & First : never : Result;
type MergeFields<T extends readonly FieldInput[], Result = {}> = T extends readonly [
    infer First extends FieldInput,
    ...infer Rest extends readonly FieldInput[]
] ? MergeFields<Rest, MergeField<First, Result>> : number extends T['length'] ? Exclude<T[number], false | undefined> : Result extends unknown ? {
    [P in keyof Result]: Result[P];
} : never;
type PrimaryKeyNames<T extends MsSqlTable> = {
    [P in keyof T['_']['columns']]: T['_']['columns'][P]['_'] extends {
        isPrimaryKey: true;
    } ? P : never;
}[keyof T['_']['columns']];
type PrimaryKeyObject<T extends MsSqlTable> = {
    [P in PrimaryKeyNames<T>]: T['_']['columns'][P]['_']['data'];
};
type IsUnion<T, U = T> = T extends U ? ([U] extends [T] ? false : true) : never;
type PrimaryKeyInput<T extends MsSqlTable> = [PrimaryKeyNames<T>] extends [never] ? Partial<{
    [P in keyof T['_']['columns']]: T['_']['columns'][P]['_']['data'];
}> : IsUnion<PrimaryKeyNames<T>> extends true ? PrimaryKeyObject<T> : PrimaryKeyObject<T> | PrimaryKeyObject<T>[PrimaryKeyNames<T>];
type AutoIncrementKeys<TTable extends MsSqlTable> = {
    [P in keyof TTable['_']['columns']]: TTable['_']['columns'][P]['_'] extends {
        generated: infer G;
    } ? undefined extends G ? never : keyof G extends never ? P : never : never;
}[keyof TTable['_']['columns']];
type HasAutoIncrement<TTable extends MsSqlTable> = [AutoIncrementKeys<TTable>] extends [never] ? false : true;
type AddResult<TTable extends MsSqlTable> = HasAutoIncrement<TTable> extends true ? TTable['_']['columns'][AutoIncrementKeys<TTable>]['_']['data'] : undefined;
export {};
