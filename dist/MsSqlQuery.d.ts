import { type AggregateDecoder } from './aggregate.js';
import { coalesce, type CoalesceOutput, type CoalesceDecoder } from './coalesce.js';
import { SQL, Subquery, min as drizzleMin, max as drizzleMax, type Placeholder, type GetDecoderResult } from 'drizzle-orm';
import { MsSqlTable, MsSqlColumn, MsSqlSelectBase } from 'drizzle-orm/mssql-core';
import type { SelectedFields } from 'drizzle-orm/operations';
import type { SQLWrapper } from 'drizzle-orm';
import type { TypedQueryBuilder } from 'drizzle-orm/query-builders/query-builder';
import type { GetSelectTableName } from 'drizzle-orm/query-builders/select.types';
import type { AnyMsSqlSelectQueryBuilder, MsSqlSelectKind, MsSqlSelectHKT, GetMsSqlSetOperators, MsSqlJoin, MsSqlSetOperatorWithResult, SetOperatorRightSelect } from 'drizzle-orm/mssql-core/query-builders/select.types';
import type { MsSqlViewBase } from 'drizzle-orm/mssql-core/view-base';
import type { MsSqlColumnSelectionName, MsSqlSelectedNamedColumnUnion, MsSqlSelectedNamedColumns, MsSqlSelectedTableColumns, MsSqlAliasTable } from './columns.js';
import { type TableMutationPolicy, type TablePrimaryKeyColumns, type ExtraColumnKey } from './mssqlTable.js';
import type { MsSqlAddData, MsSqlEditData, MsSqlCompareValues, MsSqlColumnName, MsSqlArrayCompareValues, MsSqlRangeCompareValues, MsSqlPatternCompareValues, MsSqlNullConditionInput, MsSqlAndConditions, MsSqlOrConditions } from './@types/index.js';
import type { NodeMsSqlDatabase, NodeMsSqlPreparedQueryHKT } from 'drizzle-orm/node-mssql';
/********************************************************************************************************************
 * MsSqlQuery
 * ******************************************************************************************************************/
export declare class MsSqlQuery<TTable extends MsSqlTable, AD extends MsSqlAddData<TTable> = MsSqlAddData<TTable>, ED extends MsSqlEditData<TTable> = MsSqlEditData<TTable>, AR = AddResult<TTable>> {
    private readonly current;
    private readonly getTimestamp?;
    readonly t: TTable;
    /********************************************************************************************************************
     * constructor
     * ******************************************************************************************************************/
    constructor(table: TTable, current: (() => NodeMsSqlDatabase) & {
        getTimestamp?: () => unknown;
    }, getTimestamp?: (() => unknown) | undefined);
    coalesce<N extends MsSqlColumnName<TTable>, TSecond extends Parameters<typeof coalesce>[1], TDecoder extends CoalesceDecoder | undefined = undefined>(name: N, fallback: TSecond, decoder?: TDecoder): SQL<CoalesceOutput<TTable['_']['columns'][N], TSecond, TDecoder>>;
    coalesce<TFirst extends SQLWrapper, TSecond extends Parameters<typeof coalesce>[1], TDecoder extends CoalesceDecoder | undefined = undefined>(expression: TFirst, fallback: TSecond, decoder?: TDecoder): SQL<CoalesceOutput<TFirst, TSecond, TDecoder>>;
    coalesce<TResult>(first: MsSqlColumnName<TTable> | SQLWrapper, fallback: Parameters<typeof coalesce>[1], decoder?: CoalesceDecoder): SQL<TResult>;
    coalesceNumber<TFirst extends MsSqlColumnName<TTable> | SQLWrapper, TSecond extends Parameters<typeof coalesce>[1]>(first: TFirst, fallback: TSecond): SQL<CoalesceOutput<TFirst extends MsSqlColumnName<TTable> ? TTable['_']['columns'][TFirst] : TFirst, TSecond, NumberConstructor>>;
    coalesceNumber<TResult>(first: MsSqlColumnName<TTable> | SQLWrapper, fallback: Parameters<typeof coalesce>[1]): SQL<TResult>;
    coalesceString<TFirst extends MsSqlColumnName<TTable> | SQLWrapper, TSecond extends Parameters<typeof coalesce>[1]>(first: TFirst, fallback: TSecond): SQL<CoalesceOutput<TFirst extends MsSqlColumnName<TTable> ? TTable['_']['columns'][TFirst] : TFirst, TSecond, StringConstructor>>;
    coalesceString<TResult>(first: MsSqlColumnName<TTable> | SQLWrapper, fallback: Parameters<typeof coalesce>[1]): SQL<TResult>;
    coalesceBoolean<TFirst extends MsSqlColumnName<TTable> | SQLWrapper, TSecond extends Parameters<typeof coalesce>[1]>(first: TFirst, fallback: TSecond): SQL<CoalesceOutput<TFirst extends MsSqlColumnName<TTable> ? TTable['_']['columns'][TFirst] : TFirst, TSecond, BooleanConstructor>>;
    coalesceBoolean<TResult>(first: MsSqlColumnName<TTable> | SQLWrapper, fallback: Parameters<typeof coalesce>[1]): SQL<TResult>;
    sum<TDecoder extends AggregateDecoder>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper, decoder: TDecoder): SQL<GetDecoderResult<TDecoder> | null>;
    sum<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper, decoder: AggregateDecoder): SQL<TResult>;
    sumDistinct<TDecoder extends AggregateDecoder>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper, decoder: TDecoder): SQL<GetDecoderResult<TDecoder> | null>;
    sumDistinct<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper, decoder: AggregateDecoder): SQL<TResult>;
    sumNumber(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<number | null>;
    sumNumber<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    sumBoolean(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<boolean | null>;
    sumBoolean<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    sumString(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<string | null>;
    sumString<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    sumDistinctNumber(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<number | null>;
    sumDistinctNumber<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    sumDistinctBoolean(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<boolean | null>;
    sumDistinctBoolean<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    sumDistinctString(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<string | null>;
    sumDistinctString<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    avgNumber(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<number | null>;
    avgNumber<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    avgBoolean(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<boolean | null>;
    avgBoolean<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    avgString(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<string | null>;
    avgString<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    avgDistinctNumber(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<number | null>;
    avgDistinctNumber<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    avgDistinctBoolean(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<boolean | null>;
    avgDistinctBoolean<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    avgDistinctString(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<string | null>;
    avgDistinctString<TResult>(columnOrName: MsSqlColumnName<TTable> | SQLWrapper): SQL<TResult>;
    private readonly drizzle;
    /********************************************************************************************************************
     * alias
     * ******************************************************************************************************************/
    alias<TAlias extends string>(name: TAlias): MsSqlAliasTable<TTable, TAlias>;
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
    min<TResult>(columnOrName: MsSqlColumnName<TTable> | MsSqlColumn): SQL<TResult>;
    max<N extends keyof TTable['_']['columns'] & string>(name: N): ReturnType<typeof drizzleMax<TTable['_']['columns'][N]>>;
    max<C extends MsSqlColumn>(column: C): ReturnType<typeof drizzleMax<C>>;
    max<TResult>(columnOrName: MsSqlColumnName<TTable> | MsSqlColumn): SQL<TResult>;
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
    select<TAlias extends MsSqlAliasTable<TTable, string>, const TSelection extends FieldSet | readonly SelectFieldInput<TAlias>[]>(alias: TAlias, fields: (query: FieldsQuery<TAlias>) => TSelection): SelectFrom<TAlias, ResolveSelectInput<TAlias, () => TSelection>>;
    select<TSource extends Subquery, const TArgs extends readonly [fields?: SubquerySelectInput<TSource>]>(source: TSource, ...args: TArgs): SelectFrom<TSource, ResolveSubquerySelectInput<TSource, TArgs[0]>>;
    /********************************************************************************************************************
     * selectDistinct
     * ******************************************************************************************************************/
    selectDistinct<const TArgs extends SelectArgs<TTable>>(...args: TArgs): TArgs extends readonly [infer TAlias extends MsSqlTable, ...infer TRest] ? SelectFrom<TAlias, ResolveSelectInput<TAlias, TRest[0]>> : SelectFrom<TTable, ResolveSelectInput<TTable, TArgs[0]>>;
    selectDistinct<TAlias extends MsSqlAliasTable<TTable, string>, const TSelection extends FieldSet | readonly SelectFieldInput<TAlias>[]>(alias: TAlias, fields: (query: FieldsQuery<TAlias>) => TSelection): SelectFrom<TAlias, ResolveSelectInput<TAlias, () => TSelection>>;
    selectDistinct<TSource extends Subquery, const TArgs extends readonly [fields?: SubquerySelectInput<TSource>]>(source: TSource, ...args: TArgs): SelectFrom<TSource, ResolveSubquerySelectInput<TSource, TArgs[0]>>;
    /********************************************************************************************************************
     * (PRIVATE) buildSelectQuery
     * ******************************************************************************************************************/
    private buildSelectQuery;
    /********************************************************************************************************************
     * find
     * ******************************************************************************************************************/
    find(where: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<TTable, undefined>>;
    find(fields: readonly [], where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<TTable, {}>>;
    find<N extends MsSqlColumnSelectionName<TTable>>(fields: readonly N[], where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<TTable, MsSqlSelectedNamedColumns<TTable, readonly N[]>>>;
    find<const T extends readonly FieldInput[]>(fields: (query: FieldsQuery<TTable>) => T, where: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<TTable, MergeFields<T>>>;
    find<const T extends readonly (FieldInput | MsSqlColumnSelectionName<TTable>)[]>(fields: T, where: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<TTable, MergeFields<NamedFields<TTable, T>>>>;
    find<const TSelection extends StringColumnSelection<TTable>>(fields: TSelection, where: (query: WhereQuery<MsSqlQuery<TTable, AD, ED, AR>>) => SQL | undefined): Promise<FindResult<TTable, StringColumnSelectionFields<TTable, TSelection>>>;
    find<const TSelection extends StringColumnSelection<TTable>>(fields: TSelection, where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<TTable, StringColumnSelectionFields<TTable, TSelection>>>;
    find<TSelection extends SelectedFields<MsSqlColumn, TTable>>(fields: Fields<FieldsQuery<TTable>, TSelection>, where: (query: WhereQuery<MsSqlQuery<TTable, AD, ED, AR>>) => SQL | undefined): Promise<FindResult<TTable, TSelection>>;
    find<TSelection extends SelectedFields<MsSqlColumn, TTable>>(fields: Fields<FieldsQuery<TTable>, TSelection>, where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<TTable, TSelection>>;
    find<TAlias extends string>(alias: MsSqlAliasTable<TTable, TAlias>, where: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, undefined>>;
    find<TAlias extends string>(alias: MsSqlAliasTable<TTable, TAlias>, fields: readonly [], where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, {}>>;
    find<TAlias extends string, N extends MsSqlColumnSelectionName<MsSqlAliasTable<TTable, TAlias>>>(alias: MsSqlAliasTable<TTable, TAlias>, fields: readonly N[], where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, MsSqlSelectedNamedColumns<MsSqlAliasTable<TTable, TAlias>, readonly N[]>>>;
    find<TAlias extends string, const T extends readonly FieldInput[]>(alias: MsSqlAliasTable<TTable, TAlias>, fields: (query: FieldsQuery<MsSqlAliasTable<TTable, TAlias>>) => T, where: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, MergeFields<T>>>;
    find<TAlias extends string, const T extends readonly (FieldInput | MsSqlColumnSelectionName<MsSqlAliasTable<TTable, TAlias>>)[]>(alias: MsSqlAliasTable<TTable, TAlias>, fields: T, where: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, MergeFields<NamedFields<MsSqlAliasTable<TTable, TAlias>, T>>>>;
    find<TAlias extends string, TSelection extends SelectedFields<MsSqlColumn, MsSqlAliasTable<TTable, TAlias>>>(alias: MsSqlAliasTable<TTable, TAlias>, fields: Fields<FieldsQuery<MsSqlAliasTable<TTable, TAlias>>, TSelection>, where: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<FindResult<MsSqlAliasTable<TTable, TAlias>, TSelection>>;
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
    exists(where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<boolean>;
    /********************************************************************************************************************
     * existsByPrimarykey
     * ******************************************************************************************************************/
    existsByPrimaryKey(key: PrimaryKeyInput<TTable>): Promise<boolean>;
    /********************************************************************************************************************
     * notExists
     * ******************************************************************************************************************/
    notExists(where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<boolean>;
    /********************************************************************************************************************
     * notExistsByPrimaryKey
     * ******************************************************************************************************************/
    notExistsByPrimaryKey(key: PrimaryKeyInput<TTable>): Promise<boolean>;
    /********************************************************************************************************************
     * count
     * ******************************************************************************************************************/
    count(where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Promise<number>;
    /********************************************************************************************************************
     * (PRIVATE) prepareValues
     * ******************************************************************************************************************/
    private prepareValues;
    /********************************************************************************************************************
     * (PRIVATE) executeInsert
     * ******************************************************************************************************************/
    private executeInsert;
    private insertPrimaryKeys;
    private insertPrimaryResult;
    /********************************************************************************************************************
     * addData
     * ******************************************************************************************************************/
    addData(values: AD[]): AD[];
    addData(values: AD): AD;
    /********************************************************************************************************************
     * editData
     * ******************************************************************************************************************/
    editData(values: ED): ED;
    /********************************************************************************************************************
     * add
     * ******************************************************************************************************************/
    add(value: AD[]): Promise<AR[]>;
    add<TSelection extends Record<string, unknown>>(value: TypedQueryBuilder<TSelection>): Promise<AR[]>;
    add(value: AD): Promise<AR>;
    private executeInsertSelect;
    /********************************************************************************************************************
     * edit
     * ******************************************************************************************************************/
    edit(this: this & (TableMutationPolicy<TTable> extends {
        updateBlocked: true;
    } ? never : unknown), set: ED, where: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Omit<import("drizzle-orm/mssql-core").MsSqlUpdateBase<TTable, import("drizzle-orm/node-mssql").NodeMsSqlQueryResultHKT, NodeMsSqlPreparedQueryHKT, undefined, false, "where">, "where">;
    /********************************************************************************************************************
     * editByPrimaryKey
     * ******************************************************************************************************************/
    editByPrimaryKey(this: this & (TableMutationPolicy<TTable> extends {
        updateBlocked: true;
    } ? never : unknown), set: ED, key: PrimaryKeyInput<TTable>): Omit<import("drizzle-orm/mssql-core").MsSqlUpdateBase<TTable, import("drizzle-orm/node-mssql").NodeMsSqlQueryResultHKT, NodeMsSqlPreparedQueryHKT, undefined, false, "where">, "where">;
    /********************************************************************************************************************
     * remove
     * ******************************************************************************************************************/
    remove(this: this & (TableMutationPolicy<TTable> extends {
        deleteBlocked: true;
    } ? never : unknown), where?: BaseWhere<MsSqlQuery<TTable, AD, ED, AR>>): Omit<import("drizzle-orm/mssql-core").MsSqlDeleteBase<TTable, import("drizzle-orm/node-mssql").NodeMsSqlQueryResultHKT, NodeMsSqlPreparedQueryHKT, undefined, false, "where">, "where">;
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
    eq<N extends MsSqlColumnName<TTable>>(name: N, value: Required<MsSqlCompareValues<TTable>>[N]): SQL;
    eq<TAlias extends string, N extends MsSqlColumnName<MsSqlAliasTable<TTable, TAlias>>>(table: MsSqlAliasTable<TTable, TAlias>, name: N, value: Required<MsSqlCompareValues<MsSqlAliasTable<TTable, TAlias>>>[N]): SQL;
    orGt(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orGte(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orLt(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orLte(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orInArray(values: MsSqlArrayCompareValues<TTable>): SQL | undefined;
    orNotInArray(values: MsSqlArrayCompareValues<TTable>): SQL | undefined;
    orBetween(values: MsSqlRangeCompareValues<TTable>): SQL | undefined;
    orNotBetween(values: MsSqlRangeCompareValues<TTable>): SQL | undefined;
    orLike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    orNotLike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    orIsNull(values: MsSqlNullConditionInput<TTable>): SQL | undefined;
    orIsNotNull(values: MsSqlNullConditionInput<TTable>): SQL | undefined;
    /** 객체의 컬럼별 동등 비교를 OR로 결합한다. */
    orEq(values: MsSqlCompareValues<TTable>): SQL | undefined;
    /** 객체의 컬럼별 비동등 비교를 OR로 결합한다. */
    orNe(values: MsSqlCompareValues<TTable>): SQL | undefined;
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
    and(options: MsSqlAndConditions<TTable>): SQL | undefined;
    and(...conditions: (SQLWrapper | false | undefined)[]): SQL | undefined;
    /********************************************************************************************************************
     * or
     * ******************************************************************************************************************/
    or(options: MsSqlOrConditions<TTable>): SQL | undefined;
    or(...conditions: (SQLWrapper | false | undefined)[]): SQL | undefined;
}
/********************************************************************************************************************
 * types
 * ******************************************************************************************************************/
type AliasedSelection<T extends FieldSet> = {
    [K in keyof T]: T[K] extends SQL<infer D> ? SQL.Aliased<D> : T[K];
};
type SelectQueryBase<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined, TBranch extends 'from' | 'top'> = MsSqlSelectBase<GetSelectTableName<TTable>, TSelection extends undefined ? SourceSelection<TTable> : AliasedSelection<NonNullable<TSelection>>, 'partial', NodeMsSqlPreparedQueryHKT, TBranch>;
type TableWhere<TTable extends MsSqlTable | Subquery> = SQL | false | undefined | ((query: SelectConditionQuery<TTable>) => SQL | false | undefined);
type OrderByValue = MsSqlColumn | SQL | SQL.Aliased;
type OptionalOrderByValue = OrderByValue | false | undefined;
type OrderByInput = OptionalOrderByValue | readonly OptionalOrderByValue[];
type SelectOrderByQuery<TTable extends MsSqlTable | Subquery> = {
    readonly t: TTable;
    asc(name: SourceColumnName<TTable>, ...names: SourceColumnName<TTable>[]): SQL | SQL[];
    desc(name: SourceColumnName<TTable>, ...names: SourceColumnName<TTable>[]): SQL | SQL[];
};
type OrderByCallback<TTable extends MsSqlTable | Subquery> = (query: SelectOrderByQuery<TTable>) => OrderByInput | readonly OrderByInput[];
type GroupByCallback<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined, TBranch extends 'from' | 'top'> = (aliases: SelectQueryBase<TTable, TSelection, TBranch>['_']['selection']) => OrderByValue | OrderByValue[];
type HavingCondition<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined, TBranch extends 'from' | 'top'> = SQL | undefined | ((aliases: SelectQueryBase<TTable, TSelection, TBranch>['_']['selection']) => SQL | undefined);
type OrderByPreserved<TQuery, TTable extends MsSqlTable | Subquery> = Omit<TQuery, 'orderBy'> & {
    orderBy(builder: OrderByCallback<TTable>): Omit<OrderByPreserved<TQuery, TTable>, 'orderBy'>;
    orderBy(...columns: OrderByInput[]): Omit<OrderByPreserved<TQuery, TTable>, 'orderBy'>;
};
type SelectSetOperatorMethod<TQuery extends {
    readonly _: {
        readonly result: any[];
    };
    union: (...args: any[]) => any;
}, TTable extends MsSqlTable | Subquery> = <TValue extends MsSqlSetOperatorWithResult<TQuery['_']['result']>>(rightSelection: ((setOperators: GetMsSqlSetOperators) => SetOperatorRightSelect<TValue, TQuery['_']['result']>) | SetOperatorRightSelect<TValue, TQuery['_']['result']>) => OrderByPreserved<ReturnType<TQuery['union']>, TTable>;
type DynamicSelect<TQuery extends {
    readonly _: {
        readonly selection: unknown;
    };
    $dynamic: (...args: any[]) => any;
}, TTable extends MsSqlTable | Subquery> = Omit<ReturnType<TQuery['$dynamic']>, 'where' | 'groupBy' | 'orderBy' | 'having' | 'offset' | 'fetch' | '$dynamic'> & {
    where(condition: TableWhere<TTable>): DynamicSelect<TQuery, TTable>;
    groupBy(builder: (aliases: TQuery['_']['selection']) => OrderByValue | OrderByValue[]): DynamicSelect<TQuery, TTable>;
    groupBy(...columns: OrderByValue[]): DynamicSelect<TQuery, TTable>;
    orderBy(builder: OrderByCallback<TTable>): DynamicSelect<TQuery, TTable>;
    orderBy(...columns: OrderByInput[]): DynamicSelect<TQuery, TTable>;
    having(condition: SQL | undefined | ((aliases: TQuery['_']['selection']) => SQL | undefined)): DynamicSelect<TQuery, TTable>;
    offset(value: number | Placeholder): DynamicSelect<TQuery, TTable>;
    fetch(value: number | Placeholder): DynamicSelect<TQuery, TTable>;
    $dynamic(): DynamicSelect<TQuery, TTable>;
};
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
type RestoreSelect<T extends {
    readonly _: AnyMsSqlSelectQueryBuilder['_'];
}> = MsSqlSelectKind<MsSqlSelectHKT, T['_']['tableName'], T['_']['selection'], T['_']['selectMode'], T['_']['preparedQueryHKT'], T['_']['branch'], T['_']['nullabilityMap'], false, T['_']['excludedMethods'], T['_']['result'], T['_']['selectedFields']>;
type JoinedQuery<TQuery extends AnyMsSqlSelectQueryBuilder, TKind extends 'inner' | 'left' | 'right' | 'full' | 'cross', TJoinedTable extends Joinable> = MsSqlJoin<TQuery, false, TKind, TJoinedTable> extends infer TNext extends {
    readonly _: AnyMsSqlSelectQueryBuilder['_'];
} ? RestoreSelect<TNext> : never;
type JoinedSelect<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined, TBranch extends 'from' | 'top', TJoinedTable extends Joinable, TKind extends 'inner' | 'left' | 'right' | 'full' | 'cross', TQuery extends AnyMsSqlSelectQueryBuilder> = Omit<MsSqlJoin<TQuery, false, TKind, TJoinedTable>, 'where' | 'having' | 'groupBy' | 'orderBy' | 'offset' | 'fetch' | keyof SelectJoinMethods<TTable, TSelection, TBranch, JoinedQuery<TQuery, TKind, TJoinedTable>>> & SelectJoinMethods<TTable, TSelection, TBranch, JoinedQuery<TQuery, TKind, TJoinedTable>> & {
    where(condition: TableWhere<TTable>): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind, TQuery>, 'where'>;
    having(condition: HavingCondition<TTable, TSelection, TBranch>): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind, TQuery>, 'having'>;
    groupBy(builder: GroupByCallback<TTable, TSelection, TBranch>): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind, TQuery>, 'groupBy'>;
    groupBy(...columns: OrderByValue[]): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind, TQuery>, 'groupBy'>;
    orderBy(builder: OrderByCallback<TTable>): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind, TQuery>, 'orderBy'>;
    orderBy(...columns: OrderByInput[]): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind, TQuery>, 'orderBy'>;
    offset(value: number | Placeholder): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind, TQuery>, 'offset'>;
    fetch(value: number | Placeholder): Omit<JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, TKind, TQuery>, 'fetch'>;
};
type SelectJoinMethods<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined, TBranch extends 'from' | 'top', TQuery extends AnyMsSqlSelectQueryBuilder = SelectQueryBase<TTable, TSelection, TBranch>> = {
    innerJoin<TJoinedTable extends Joinable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'inner', TQuery>;
    leftJoin<TJoinedTable extends Joinable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'left', TQuery>;
    rightJoin<TJoinedTable extends Joinable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'right', TQuery>;
    crossJoin<TJoinedTable extends Joinable>(table: TJoinedTable): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'cross', TQuery>;
    fullJoin<TJoinedTable extends Joinable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'full', TQuery>;
    outerApply<TJoinedTable extends MsSqlTable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'left', TQuery>;
    crossApply<TJoinedTable extends MsSqlTable>(table: TJoinedTable, on: JoinCondition<TTable, TSelection, TBranch, TJoinedTable>): JoinedSelect<TTable, TSelection, TBranch, TJoinedTable, 'cross', TQuery>;
};
type SelectTopFrom<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined> = Omit<SelectQueryBase<TTable, TSelection, 'top'>, 'where' | 'having' | 'groupBy' | 'orderBy' | 'offset' | 'fetch' | '$dynamic' | 'union' | 'unionAll' | 'intersect' | 'except' | keyof SelectJoinMethods<TTable, TSelection, 'top'>> & SelectJoinMethods<TTable, TSelection, 'top'> & {
    $dynamic(): DynamicSelect<SelectQueryBase<TTable, TSelection, 'top'>, TTable>;
    union: SelectSetOperatorMethod<SelectQueryBase<TTable, TSelection, 'top'>, TTable>;
    unionAll: SelectSetOperatorMethod<SelectQueryBase<TTable, TSelection, 'top'>, TTable>;
    intersect: SelectSetOperatorMethod<SelectQueryBase<TTable, TSelection, 'top'>, TTable>;
    except: SelectSetOperatorMethod<SelectQueryBase<TTable, TSelection, 'top'>, TTable>;
    where(condition: TableWhere<TTable>): Omit<SelectTopFrom<TTable, TSelection>, 'where'>;
    having(condition: HavingCondition<TTable, TSelection, 'top'>): Omit<SelectTopFrom<TTable, TSelection>, 'having'>;
    groupBy(builder: GroupByCallback<TTable, TSelection, 'top'>): Omit<SelectTopFrom<TTable, TSelection>, 'groupBy'>;
    groupBy(...columns: OrderByValue[]): Omit<SelectTopFrom<TTable, TSelection>, 'groupBy'>;
    orderBy(builder: OrderByCallback<TTable>): Omit<SelectTopFrom<TTable, TSelection>, 'orderBy'>;
    orderBy(...columns: OrderByInput[]): Omit<SelectTopFrom<TTable, TSelection>, 'orderBy'>;
    offset(value: number | Placeholder): Omit<SelectTopFrom<TTable, TSelection>, 'offset'>;
    fetch(value: number | Placeholder): Omit<SelectTopFrom<TTable, TSelection>, 'fetch'>;
};
export type SelectFrom<TTable extends MsSqlTable | Subquery, TSelection extends FieldSet | undefined> = Omit<SelectQueryBase<TTable, TSelection, 'from'>, 'where' | 'having' | 'groupBy' | 'orderBy' | 'offset' | 'fetch' | '$dynamic' | 'union' | 'unionAll' | 'intersect' | 'except' | keyof SelectJoinMethods<TTable, TSelection, 'from'>> & SelectJoinMethods<TTable, TSelection, 'from'> & {
    $dynamic(): DynamicSelect<SelectQueryBase<TTable, TSelection, 'from'>, TTable>;
    union: SelectSetOperatorMethod<SelectQueryBase<TTable, TSelection, 'from'>, TTable>;
    unionAll: SelectSetOperatorMethod<SelectQueryBase<TTable, TSelection, 'from'>, TTable>;
    intersect: SelectSetOperatorMethod<SelectQueryBase<TTable, TSelection, 'from'>, TTable>;
    except: SelectSetOperatorMethod<SelectQueryBase<TTable, TSelection, 'from'>, TTable>;
    where(condition: TableWhere<TTable>): Omit<SelectFrom<TTable, TSelection>, 'where'>;
    having(condition: HavingCondition<TTable, TSelection, 'from'>): Omit<SelectFrom<TTable, TSelection>, 'having'>;
    groupBy(builder: GroupByCallback<TTable, TSelection, 'from'>): Omit<SelectFrom<TTable, TSelection>, 'groupBy'>;
    groupBy(...columns: OrderByValue[]): Omit<SelectFrom<TTable, TSelection>, 'groupBy'>;
    orderBy(builder: OrderByCallback<TTable>): Omit<SelectFrom<TTable, TSelection>, 'orderBy'>;
    orderBy(...columns: OrderByInput[]): Omit<SelectFrom<TTable, TSelection>, 'orderBy'>;
    offset(value: number | Placeholder): Omit<SelectFrom<TTable, TSelection>, 'offset'>;
    fetch(value: number | Placeholder): Omit<SelectFrom<TTable, TSelection>, 'fetch'>;
    top(count: number): SelectTopFrom<TTable, TSelection>;
};
type FindResult<TTable extends MsSqlTable, TSelection extends FieldSet | undefined> = Awaited<SelectFrom<TTable, TSelection>>[number] | undefined;
type WhereQueryEq<TTable extends MsSqlTable> = {
    (values: MsSqlCompareValues<TTable>): SQL | undefined;
    <N extends MsSqlColumnName<TTable>>(name: N, value: Required<MsSqlCompareValues<TTable>>[N]): SQL;
    <TAlias extends string, N extends MsSqlColumnName<MsSqlAliasTable<TTable, TAlias>>>(table: MsSqlAliasTable<TTable, TAlias>, name: N, value: Required<MsSqlCompareValues<MsSqlAliasTable<TTable, TAlias>>>[N]): SQL;
};
type QueryTable<TQuery> = TQuery extends {
    readonly t: infer TTable extends MsSqlTable;
} ? TTable : never;
type WhereQuery<TQuery> = Omit<Pick<TQuery, Extract<keyof TQuery, 't' | 'eq' | 'ne' | 'orEq' | 'orNe' | 'orIsNotNull' | 'orIsNull' | 'orNotLike' | 'orLike' | 'orNotBetween' | 'orBetween' | 'orNotInArray' | 'orInArray' | 'orLte' | 'orLt' | 'orGte' | 'orGt' | 'gt' | 'gte' | 'lt' | 'lte' | 'inArray' | 'notInArray' | 'between' | 'notBetween' | 'like' | 'notLike' | 'isNull' | 'isNotNull' | 'and' | 'or'>>, 'eq'> & {
    eq: WhereQueryEq<QueryTable<TQuery>>;
};
type SelectConditionQuery<TSource extends MsSqlTable | Subquery> = TSource extends MsSqlTable ? TableConditionQuery<TSource> : TSource extends Subquery ? SubqueryConditionQuery<TSource> : never;
type TableConditionQuery<TTable extends MsSqlTable> = {
    readonly t: TTable;
    eq(values: MsSqlCompareValues<TTable>): SQL | undefined;
    ne(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orEq(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orNe(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orIsNotNull(values: MsSqlNullConditionInput<TTable>): SQL | undefined;
    orIsNull(values: MsSqlNullConditionInput<TTable>): SQL | undefined;
    orNotLike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    orLike(values: MsSqlPatternCompareValues<TTable>): SQL | undefined;
    orNotBetween(values: MsSqlRangeCompareValues<TTable>): SQL | undefined;
    orBetween(values: MsSqlRangeCompareValues<TTable>): SQL | undefined;
    orNotInArray(values: MsSqlArrayCompareValues<TTable>): SQL | undefined;
    orInArray(values: MsSqlArrayCompareValues<TTable>): SQL | undefined;
    orLte(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orLt(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orGte(values: MsSqlCompareValues<TTable>): SQL | undefined;
    orGt(values: MsSqlCompareValues<TTable>): SQL | undefined;
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
    isNull(names: MsSqlNullConditionInput<TTable>): SQL | undefined;
    isNotNull(names: MsSqlNullConditionInput<TTable>): SQL | undefined;
    and(options: MsSqlAndConditions<TTable>): SQL | undefined;
    and(...conditions: (SQLWrapper | false | undefined)[]): SQL | undefined;
    or(options: MsSqlOrConditions<TTable>): SQL | undefined;
    or(...conditions: (SQLWrapper | false | undefined)[]): SQL | undefined;
};
type BaseWhere<TQuery> = SQL | undefined | ((query: WhereQuery<TQuery>) => SQL | undefined);
type FieldSet = SelectedFields<MsSqlColumn, MsSqlTable>;
type MixedSelection<TTable extends MsSqlTable> = Record<string, FieldSet[string] | MsSqlColumnName<TTable> | SQLWrapper>;
type ResolveMixedSelection<TTable extends MsSqlTable, TSelection> = {
    [K in keyof TSelection]: TSelection[K] extends MsSqlColumnName<TTable> ? TTable['_']['columns'][TSelection[K]] : TSelection[K] extends MsSqlColumn ? TSelection[K] : TSelection[K] extends {
        _: {
            result: unknown;
        };
    } ? SQL.Aliased<SelectBuilderFieldData<TSelection[K]>> : TSelection[K] extends SQLWrapper<infer TData> ? SQL.Aliased<TData> : Extract<TSelection[K], FieldSet[string]>;
};
type SelectBuilderFieldData<TBuilder> = TBuilder extends {
    _: {
        result: unknown;
    };
} ? Awaited<TBuilder> extends readonly (infer TRow)[] ? TRow extends Record<string, unknown> ? TRow[keyof TRow] : unknown : unknown : unknown;
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
type SelectFieldInput<TTable extends MsSqlTable> = FieldInput | MixedSelection<TTable>;
export type SelectInput<TTable extends MsSqlTable> = readonly (SelectFieldInput<TTable> | MsSqlColumnSelectionName<TTable>)[] | MixedSelection<TTable> | ((query: FieldsQuery<TTable>) => FieldSet | readonly SelectFieldInput<TTable>[]);
type SelectArgs<TTable extends MsSqlTable> = readonly [fields?: SelectInput<TTable>] | readonly [
    alias: MsSqlAliasTable<TTable, string>,
    fields?: Exclude<SelectInput<TTable>, (...args: never[]) => unknown>
];
export type ResolveSelectInput<TTable extends MsSqlTable, T> = T extends undefined ? undefined : T extends (...args: never[]) => infer R ? R extends readonly SelectFieldInput<TTable>[] ? MergeSelectFields<TTable, R> : Extract<R, FieldSet> : T extends readonly (SelectFieldInput<TTable> | MsSqlColumnSelectionName<TTable>)[] ? MergeSelectFields<TTable, SelectNamedFields<TTable, T>> : T extends StringColumnSelection<TTable> ? StringColumnSelectionFields<TTable, T> : ResolveMixedSelection<TTable, T>;
type NamedFields<TTable extends MsSqlTable, T extends readonly (FieldInput | MsSqlColumnSelectionName<TTable>)[]> = {
    [I in keyof T]: T[I] extends MsSqlColumnSelectionName<TTable> ? MsSqlSelectedNamedColumns<TTable, readonly [T[I]]> : Extract<T[I], FieldInput>;
};
type SelectNamedFields<TTable extends MsSqlTable, T extends readonly (SelectFieldInput<TTable> | MsSqlColumnSelectionName<TTable>)[]> = {
    [I in keyof T]: T[I] extends MsSqlColumnSelectionName<TTable> ? MsSqlSelectedNamedColumns<TTable, readonly [T[I]]> : T[I] extends SelectFieldInput<TTable> ? T[I] : never;
};
type ResolveSelectField<TTable extends MsSqlTable, TField> = TField extends FieldSet ? TField : TField extends MixedSelection<TTable> ? ResolveMixedSelection<TTable, TField> : never;
type MergeSelectFields<TTable extends MsSqlTable, T extends readonly unknown[], Result = {}> = T extends readonly [
    infer First,
    ...infer Rest
] ? MergeSelectFields<TTable, Rest, First extends FieldSet | MixedSelection<TTable> ? Omit<Result, keyof First> & ResolveSelectField<TTable, First> : Result> : number extends T['length'] ? ResolveSelectField<TTable, Exclude<T[number], false | undefined>> : Result extends unknown ? {
    [P in keyof Result]: Result[P];
} : never;
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
}[keyof T['_']['columns']] | Extract<ExtraColumnKey<TablePrimaryKeyColumns<T> extends readonly (infer C)[] ? C : never>, keyof T['_']['columns']>;
type PrimaryKeyObject<T extends MsSqlTable> = {
    [P in PrimaryKeyNames<T>]: T['_']['columns'][P]['_']['data'];
};
type IsUnion<T, U = T> = T extends U ? ([U] extends [T] ? false : true) : never;
type PrimaryKeyInput<T extends MsSqlTable> = [PrimaryKeyNames<T>] extends [never] ? Partial<{
    [P in keyof T['_']['columns']]: T['_']['columns'][P]['_']['data'];
}> : IsUnion<PrimaryKeyNames<T>> extends true ? PrimaryKeyObject<T> : PrimaryKeyObject<T> | PrimaryKeyObject<T>[PrimaryKeyNames<T>];
type AddResult<T extends MsSqlTable> = [PrimaryKeyNames<T>] extends [never] ? unknown : IsUnion<PrimaryKeyNames<T>> extends true ? PrimaryKeyObject<T> : PrimaryKeyObject<T>[PrimaryKeyNames<T>];
type SourceSelection<T extends MsSqlTable | Subquery> = T extends MsSqlTable ? MsSqlSelectedTableColumns<T> : T extends Subquery ? T['_']['selectedFields'] : never;
type SourceColumnName<T extends MsSqlTable | Subquery> = T extends MsSqlTable ? MsSqlColumnName<T> : keyof SourceSelection<T> & string;
type SubqueryFieldsQuery<T extends Subquery> = {
    readonly t: T;
    columns(): T['_']['selectedFields'];
    columns<N extends keyof T['_']['selectedFields'] & string>(...names: N[]): Pick<T['_']['selectedFields'], N>;
    min<N extends keyof T['_']['selectedFields'] & string>(name: N): SQL<SubqueryFieldData<T['_']['selectedFields'][N]> | null>;
    min<TResult>(name: keyof T['_']['selectedFields'] & string): SQL<TResult>;
    max<N extends keyof T['_']['selectedFields'] & string>(name: N): SQL<SubqueryFieldData<T['_']['selectedFields'][N]> | null>;
    max<TResult>(name: keyof T['_']['selectedFields'] & string): SQL<TResult>;
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
    [K in keyof T['_']['selectedFields']]?: (NonNullable<SubqueryFieldData<T['_']['selectedFields'][K]>> | SQLWrapper)[] | SQLWrapper;
};
type SubqueryRangeValues<T extends Subquery> = {
    [K in keyof T['_']['selectedFields']]?: [
        NonNullable<SubqueryFieldData<T['_']['selectedFields'][K]>> | SQLWrapper,
        NonNullable<SubqueryFieldData<T['_']['selectedFields'][K]>> | SQLWrapper
    ];
};
type SubqueryPatternValues<T extends Subquery> = {
    [K in keyof T['_']['selectedFields'] as NonNullable<SubqueryFieldData<T['_']['selectedFields'][K]>> extends string ? K : never]?: string;
};
type SubqueryAtomicMethods<T extends Subquery> = Pick<{
    [K in 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte']: (values: SubqueryValues<T>) => SQL | undefined;
} & {
    [K in 'inArray' | 'notInArray']: (values: SubqueryArrayValues<T>) => SQL | undefined;
} & {
    [K in 'between' | 'notBetween']: (values: SubqueryRangeValues<T>) => SQL | undefined;
} & {
    [K in 'like' | 'notLike']: (values: SubqueryPatternValues<T>) => SQL | undefined;
} & {
    isNull(names: SourceColumnName<T> | undefined | readonly (SourceColumnName<T> | undefined)[]): SQL | undefined;
    isNotNull(names: SourceColumnName<T> | undefined | readonly (SourceColumnName<T> | undefined)[]): SQL | undefined;
}, 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'inArray' | 'notInArray' | 'between' | 'notBetween' | 'like' | 'notLike' | 'isNull' | 'isNotNull'>;
type SubqueryAtomicConditions<T extends Subquery> = {
    [K in keyof SubqueryAtomicMethods<T>]?: Parameters<SubqueryAtomicMethods<T>[K]>[0];
} & {
    [K in keyof SubqueryAtomicMethods<T> as `or${Capitalize<K>}`]?: Parameters<SubqueryAtomicMethods<T>[K]>[0];
};
type SubqueryAndConditions<T extends Subquery> = SubqueryAtomicConditions<T> & {
    or?: SubqueryOrConditions<T>;
};
type SubqueryOrConditions<T extends Subquery> = SubqueryAtomicConditions<T> & {
    and?: SubqueryAndConditions<T>;
};
type BaseSubqueryConditionQuery<T extends Subquery> = {
    readonly t: T;
} & {
    [K in 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte']: (values: SubqueryValues<T>) => SQL | undefined;
} & {
    [K in 'inArray' | 'notInArray']: (values: SubqueryArrayValues<T>) => SQL | undefined;
} & {
    [K in 'between' | 'notBetween']: (values: SubqueryRangeValues<T>) => SQL | undefined;
} & {
    [K in 'like' | 'notLike']: (values: SubqueryPatternValues<T>) => SQL | undefined;
} & {
    isNull(names: SourceColumnName<T> | undefined | readonly (SourceColumnName<T> | undefined)[]): SQL | undefined;
    isNotNull(names: SourceColumnName<T> | undefined | readonly (SourceColumnName<T> | undefined)[]): SQL | undefined;
    and(values: SubqueryAndConditions<T>): SQL | undefined;
    and(...conditions: (SQLWrapper | false | undefined)[]): SQL | undefined;
    or(values: SubqueryOrConditions<T>): SQL | undefined;
    or(...conditions: (SQLWrapper | false | undefined)[]): SQL | undefined;
};
type SubqueryConditionQuery<T extends Subquery> = BaseSubqueryConditionQuery<T> & {
    [K in keyof Omit<BaseSubqueryConditionQuery<T>, 't' | 'and' | 'or'> as `or${Capitalize<K>}`]: BaseSubqueryConditionQuery<T>[K];
};
export {};
