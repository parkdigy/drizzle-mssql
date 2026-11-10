import { SQL, Subquery, min as drizzleMin, max as drizzleMax } from 'drizzle-orm';
import { MsSqlTable, MsSqlColumn, type MsSqlSelectBase } from 'drizzle-orm/mssql-core';
import type { SelectedFields } from 'drizzle-orm/operations';
import type { SQLWrapper } from 'drizzle-orm';
import type { GetSelectTableName } from 'drizzle-orm/query-builders/select.types';
import type { MsSqlJoin } from 'drizzle-orm/mssql-core/query-builders/select.types';
import type { MsSqlViewBase } from 'drizzle-orm/mssql-core/view-base';
import type { MsSqlColumnSelectionName, MsSqlSelectedNamedColumnUnion, MsSqlSelectedNamedColumns, MsSqlSelectedTableColumns, MsSqlAliasTable } from './columns.cjs';
import { type TableMutationPolicy } from './mssqlTable.cjs';
import type { MsSqlAddValues, MsSqlEditValues, MsSqlCompareValues, MsSqlColumnName, MsSqlArrayCompareValues, MsSqlRangeCompareValues, MsSqlPatternCompareValues, MsSqlNullConditionInput, MsSqlConditions } from './@types/index.cjs';
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
    private resolveConditionColumn;
    /********************************************************************************************************************
     * asc
     * ******************************************************************************************************************/
    asc(name: MsSqlColumnName<TTable>): SQL;
    asc<TAlias extends string>(table: MsSqlAliasTable<TTable, TAlias>, name: MsSqlColumnName<MsSqlAliasTable<TTable, TAlias>>): SQL;
    /********************************************************************************************************************
     * desc
     * ******************************************************************************************************************/
    desc(name: MsSqlColumnName<TTable>): SQL;
    desc<TAlias extends string>(table: MsSqlAliasTable<TTable, TAlias>, name: MsSqlColumnName<MsSqlAliasTable<TTable, TAlias>>): SQL;
    private resolveFields;
    /********************************************************************************************************************
     * select
     * ******************************************************************************************************************/
    select<const TArgs extends SelectArgs<TTable>>(...args: TArgs): TArgs extends readonly [infer TAlias extends MsSqlTable, ...infer TRest] ? SelectFrom<TAlias, ResolveSelectInput<TAlias, TRest[0]>> : SelectFrom<TTable, ResolveSelectInput<TTable, TArgs[0]>>;
    select<TAlias extends MsSqlAliasTable<TTable, string>, const TSelection extends FieldSet | readonly FieldInput[]>(alias: TAlias, fields: (query: FieldsQuery<TAlias>) => TSelection): SelectFrom<TAlias, ResolveSelectInput<TAlias, () => TSelection>>;
    select<TSource extends Subquery, const TArgs extends readonly [fields?: SubquerySelectInput<TSource>]>(source: TSource, ...args: TArgs): SelectFrom<TSource, ResolveSubquerySelectInput<TSource, TArgs[0]>>;
    /********************************************************************************************************************
     * selectDistinct
     * ******************************************************************************************************************/
    selectDistinct<const TArgs extends SelectArgs<TTable>>(...args: TArgs): TArgs extends readonly [infer TAlias extends MsSqlTable, ...infer TRest] ? SelectFrom<TAlias, ResolveSelectInput<TAlias, TRest[0]>> : SelectFrom<TTable, ResolveSelectInput<TTable, TArgs[0]>>;
    selectDistinct<TAlias extends MsSqlAliasTable<TTable, string>, const TSelection extends FieldSet | readonly FieldInput[]>(alias: TAlias, fields: (query: FieldsQuery<TAlias>) => TSelection): SelectFrom<TAlias, ResolveSelectInput<TAlias, () => TSelection>>;
    selectDistinct<TSource extends Subquery, const TArgs extends readonly [fields?: SubquerySelectInput<TSource>]>(source: TSource, ...args: TArgs): SelectFrom<TSource, ResolveSubquerySelectInput<TSource, TArgs[0]>>;
    /********************************************************************************************************************
     * (PRIVATE) buildSelectQuery
     * ******************************************************************************************************************/
    private buildSelectQuery;
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
    eq<N extends MsSqlColumnName<TTable>>(name: N, value: Required<MsSqlCompareValues<TTable>>[N]): SQL;
    eq<TAlias extends string, N extends MsSqlColumnName<MsSqlAliasTable<TTable, TAlias>>>(table: MsSqlAliasTable<TTable, TAlias>, name: N, value: Required<MsSqlCompareValues<MsSqlAliasTable<TTable, TAlias>>>[N]): SQL;
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
type AliasedSelection<T extends FieldSet> = {
    [K in keyof T]: T[K] extends SQL<infer D> ? SQL.Aliased<D> : T[K];
};
type SelectQueryBase<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined, TBranch extends 'from' | 'top'> = MsSqlSelectBase<GetSelectTableName<TTable>, TSelection extends undefined ? SourceSelection<TTable> : AliasedSelection<NonNullable<TSelection>>, 'partial', NodeMsSqlPreparedQueryHKT, TBranch>;
type TableWhere<TTable extends MsSqlTable | Subquery> = SQL | undefined | ((query: SelectConditionQuery<TTable>) => SQL | undefined);
type OrderByValue = MsSqlColumn | SQL | SQL.Aliased;
type SelectOrderByQuery<TTable extends MsSqlTable | Subquery> = {
    readonly t: TTable;
    asc(name: SourceColumnName<TTable>): SQL;
    desc(name: SourceColumnName<TTable>): SQL;
};
type OrderByCallback<TTable extends MsSqlTable | Subquery> = (query: SelectOrderByQuery<TTable>) => OrderByValue | OrderByValue[];
type JoinConditionValues<TJoinedTable extends Joinable> = TJoinedTable extends MsSqlTable ? MsSqlCompareValues<TJoinedTable> : TJoinedTable extends Subquery<string, infer TFields> ? {
    [K in keyof TFields]?: unknown;
} : never;
type JoinConditionQuery<TTable extends MsSqlTable | Subquery, TJoinedTable extends Joinable> = TJoinedTable extends MsSqlTable ? Omit<SelectConditionQuery<TJoinedTable>, 't'> & {
    readonly t: TTable;
} : {
    readonly t: TTable;
    eq(values: JoinConditionValues<TJoinedTable>): SQL | undefined;
};
type Joinable = MsSqlTable | Subquery | MsSqlViewBase | SQL;
type JoinCondition<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined, TBranch extends 'from' | 'top', TJoinedTable extends Joinable> = TJoinedTable extends MsSqlTable | Subquery ? SQL | undefined | ((query: JoinConditionQuery<TTable, TJoinedTable>) => SQL | undefined) : SQL | undefined | ((aliases: SelectQueryBase<TTable, TSelection, TBranch>['_']['selection']) => SQL | undefined);
type JoinedSelect<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined, TBranch extends 'from' | 'top', TJoinedTable extends Joinable, TKind extends 'inner' | 'left' | 'right' | 'full' | 'cross'> = Omit<MsSqlJoin<SelectQueryBase<TTable, TSelection, TBranch>, false, TKind, TJoinedTable>, 'where' | 'orderBy' | keyof SelectJoinMethods<TTable, TSelection, TBranch>> & SelectJoinMethods<TTable, TSelection, TBranch> & {
    where(condition: TableWhere<TTable>): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind>, 'where'>;
    orderBy(builder: OrderByCallback<TTable>): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind>, 'orderBy'>;
    orderBy(...columns: OrderByValue[]): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind>, 'orderBy'>;
};
type SelectJoinMethods<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined, TBranch extends 'from' | 'top'> = {
    innerJoin<TJoinedTable extends Joinable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'inner'>;
    leftJoin<TJoinedTable extends Joinable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'left'>;
    rightJoin<TJoinedTable extends Joinable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'right'>;
    fullJoin<TJoinedTable extends Joinable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'full'>;
    outerApply<TJoinedTable extends MsSqlTable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'left'>;
    crossApply<TJoinedTable extends MsSqlTable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'cross'>;
};
type SelectTopFrom<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined> = Omit<SelectQueryBase<TTable, TSelection, 'top'>, 'where' | 'orderBy' | keyof SelectJoinMethods<TTable, TSelection, 'top'>> & SelectJoinMethods<TTable, TSelection, 'top'> & {
    where(condition: TableWhere<TTable>): Omit<SelectTopFrom<TTable, TSelection>, 'where'>;
    orderBy(builder: OrderByCallback<TTable>): Omit<SelectTopFrom<TTable, TSelection>, 'orderBy'>;
    orderBy(...columns: OrderByValue[]): Omit<SelectTopFrom<TTable, TSelection>, 'orderBy'>;
};
export type SelectFrom<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined> = Omit<SelectQueryBase<TTable, TSelection, 'from'>, 'where' | 'orderBy' | keyof SelectJoinMethods<TTable, TSelection, 'from'>> & SelectJoinMethods<TTable, TSelection, 'from'> & {
    where(condition: TableWhere<TTable>): Omit<SelectFrom<TTable, TSelection>, 'where'>;
    orderBy(builder: OrderByCallback<TTable>): Omit<SelectFrom<TTable, TSelection>, 'orderBy'>;
    orderBy(...columns: OrderByValue[]): Omit<SelectFrom<TTable, TSelection>, 'orderBy'>;
    top(count: number): SelectTopFrom<TTable, TSelection>;
};
type FindResult<TTable extends MsSqlTable, TSelection extends FieldSet | undefined> = Awaited<SelectFrom<TTable, TSelection>>[number] | undefined;
type WhereQuery<TQuery> = Pick<TQuery, Extract<keyof TQuery, 't' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'inArray' | 'notInArray' | 'between' | 'notBetween' | 'like' | 'notLike' | 'ilike' | 'notIlike' | 'isNull' | 'isNotNull' | 'and' | 'or'>>;
type SelectConditionQuery<TSource extends MsSqlTable | Subquery> = TSource extends MsSqlTable ? TableConditionQuery<TSource> : TSource extends Subquery ? SubqueryConditionQuery<TSource> : never;
type TableConditionQuery<TTable extends MsSqlTable> = {
    readonly t: TTable;
    eq(values: MsSqlCompareValues<TTable>): SQL | undefined;
    ne(values: MsSqlCompareValues<TTable>): SQL | undefined;
    gt(values: MsSqlCompareValues<TTable>): SQL | undefined;
    gte(values: MsSqlCompareValues<TTable>): SQL | undefined;
    lt(values: MsSqlCompareValues<TTable>): SQL | undefined;
    lte(values: MsSqlCompareValues<TTable>): SQL | undefined;
    inArray(values: MsSqlArrayCompareValues<TTable>): SQL | undefined;
    notInArray(values: MsSqlArrayCompareValues<TTable>): SQL | undefined;
    between(values: MsSqlRangeCompareValues<TTable>): SQL | undefined;
    notBetween(values: MsSqlRangeCompareValues<TTable>): SQL | undefined;
    like(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    notLike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    ilike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    notIlike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    isNull(names: MsSqlNullConditionInput<TTable>): SQL | undefined;
    isNotNull(names: MsSqlNullConditionInput<TTable>): SQL | undefined;
    and(options: MsSqlConditions<TTable>): SQL | undefined;
    or(options: MsSqlConditions<TTable>): SQL | undefined;
};
type BaseWhere<TQuery> = SQL | undefined | ((query: WhereQuery<TQuery>) => SQL | undefined);
type FieldSet = SelectedFields<MsSqlColumn, MsSqlTable>;
type MixedSelection<TTable extends MsSqlTable> = Record<string, FieldSet[string] | MsSqlColumnName<TTable> | SQLWrapper>;
type ResolveMixedSelection<TTable extends MsSqlTable, TSelection> = {
    [K in keyof TSelection]: TSelection[K] extends MsSqlColumnName<TTable> ? TTable['_']['columns'][TSelection[K]] : TSelection[K] extends MsSqlColumn ? TSelection[K] : TSelection[K] extends SQLWrapper<infer TData> ? SQL.Aliased<TData> : Extract<TSelection[K], FieldSet[string]>;
};
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
export type SelectInput<TTable extends MsSqlTable> = readonly (FieldInput | MsSqlColumnSelectionName<TTable>)[] | MixedSelection<TTable> | ((query: FieldsQuery<TTable>) => FieldSet | readonly FieldInput[]);
type SelectArgs<TTable extends MsSqlTable> = readonly [fields?: SelectInput<TTable>] | readonly [
    alias: MsSqlAliasTable<TTable, string>,
    fields?: Exclude<SelectInput<TTable>, (...args: never[]) => unknown>
];
export type ResolveSelectInput<TTable extends MsSqlTable, T> = T extends undefined ? undefined : T extends (...args: never[]) => infer R ? R extends readonly FieldInput[] ? MergeFields<R> : Extract<R, FieldSet> : T extends readonly (FieldInput | MsSqlColumnSelectionName<TTable>)[] ? MergeFields<NamedFields<TTable, T>> : T extends StringColumnSelection<TTable> ? StringColumnSelectionFields<TTable, T> : ResolveMixedSelection<TTable, T>;
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
type SourceSelection<T extends MsSqlTable | Subquery> = T extends MsSqlTable ? MsSqlSelectedTableColumns<T> : T extends Subquery ? T['_']['selectedFields'] : never;
type SourceColumnName<T extends MsSqlTable | Subquery> = T extends MsSqlTable ? MsSqlColumnName<T> : keyof SourceSelection<T> & string;
type SubqueryFieldsQuery<T extends Subquery> = {
    readonly t: T;
    columns(): T['_']['selectedFields'];
    columns<N extends keyof T['_']['selectedFields'] & string>(...names: N[]): Pick<T['_']['selectedFields'], N>;
    min<N extends keyof T['_']['selectedFields'] & string>(name: N): SQL<SubqueryFieldData<T['_']['selectedFields'][N]> | null>;
    max<N extends keyof T['_']['selectedFields'] & string>(name: N): SQL<SubqueryFieldData<T['_']['selectedFields'][N]> | null>;
};
export type SubquerySelectInput<T extends Subquery> = readonly (FieldInput | (keyof T['_']['selectedFields'] & string))[] | Record<string, FieldSet[string] | (keyof T['_']['selectedFields'] & string) | SQLWrapper> | ((query: SubqueryFieldsQuery<T>) => FieldSet | readonly FieldInput[]);
export type ResolveSubquerySelectInput<T extends Subquery, V> = Extract<ResolvedSubqueryInput<T, V>, FieldSet | undefined>;
type ResolvedSubqueryInput<T extends Subquery, V> = V extends undefined ? undefined : V extends (...args: never[]) => infer R ? R extends readonly FieldInput[] ? MergeFields<R> : Extract<R, FieldSet> : V extends readonly unknown[] ? MergeFields<{
    [I in keyof V]: V[I] extends keyof T['_']['selectedFields'] ? Extract<Pick<T['_']['selectedFields'], V[I]>, FieldSet> : Extract<V[I], FieldInput>;
}> : {
    [K in keyof V]: V[K] extends keyof T['_']['selectedFields'] ? T['_']['selectedFields'][V[K]] : V[K] extends MsSqlColumn | SQL | SQL.Aliased ? V[K] : V[K] extends SQLWrapper<infer D> ? SQL.Aliased<D> : Extract<V[K], FieldSet[string]>;
};
type SubqueryFieldData<F> = F extends MsSqlColumn ? F['_']['data'] | (F['_']['notNull'] extends true ? never : null) : F extends SQL<infer D> | SQL.Aliased<infer D> ? D : unknown;
type SubqueryValues<T extends Subquery> = {
    [K in keyof T['_']['selectedFields']]?: SubqueryFieldData<T['_']['selectedFields'][K]> | SQLWrapper;
};
type SubqueryArrayValues<T extends Subquery> = {
    [K in keyof T['_']['selectedFields']]?: (NonNullable<SubqueryFieldData<T['_']['selectedFields'][K]>> | SQLWrapper)[];
};
type SubqueryRangeValues<T extends Subquery> = {
    [K in keyof T['_']['selectedFields']]?: [
        NonNullable<SubqueryFieldData<T['_']['selectedFields'][K]>>,
        NonNullable<SubqueryFieldData<T['_']['selectedFields'][K]>>
    ];
};
type SubqueryPatternValues<T extends Subquery> = {
    [K in keyof T['_']['selectedFields'] as NonNullable<SubqueryFieldData<T['_']['selectedFields'][K]>> extends string ? K : never]?: string;
};
type SubqueryConditionQuery<T extends Subquery> = {
    readonly t: T;
} & {
    [K in 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte']: (values: SubqueryValues<T>) => SQL | undefined;
} & {
    [K in 'inArray' | 'notInArray']: (values: SubqueryArrayValues<T>) => SQL | undefined;
} & {
    [K in 'between' | 'notBetween']: (values: SubqueryRangeValues<T>) => SQL | undefined;
} & {
    [K in 'like' | 'notLike' | 'ilike' | 'notIlike']: (values: SubqueryPatternValues<T>) => SQL | undefined;
} & {
    isNull(names: SourceColumnName<T> | undefined | readonly (SourceColumnName<T> | undefined)[]): SQL | undefined;
    isNotNull(names: SourceColumnName<T> | undefined | readonly (SourceColumnName<T> | undefined)[]): SQL | undefined;
    and(values: SubqueryConditions<T>): SQL | undefined;
    or(values: SubqueryConditions<T>): SQL | undefined;
};
type SubqueryConditions<T extends Subquery> = {
    [K in keyof Omit<SubqueryConditionQuery<T>, 't'>]?: SubqueryConditionQuery<T>[K] extends (values: infer V) => unknown ? V : never;
};
export {};
