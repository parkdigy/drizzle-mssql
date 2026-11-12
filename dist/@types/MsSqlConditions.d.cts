import type { MsSqlTable } from 'drizzle-orm/mssql-core';
import type { MsSqlArrayCompareValues, MsSqlCompareValues, MsSqlNullConditionInput, MsSqlPatternCompareValues, MsSqlRangeCompareValues } from './common.cjs';
type BaseConditions<T extends MsSqlTable> = {
    eq?: MsSqlCompareValues<T>;
    ne?: MsSqlCompareValues<T>;
    gt?: MsSqlCompareValues<T>;
    gte?: MsSqlCompareValues<T>;
    lt?: MsSqlCompareValues<T>;
    lte?: MsSqlCompareValues<T>;
    inArray?: MsSqlArrayCompareValues<T>;
    notInArray?: MsSqlArrayCompareValues<T>;
    between?: MsSqlRangeCompareValues<T>;
    notBetween?: MsSqlRangeCompareValues<T>;
    like?: MsSqlPatternCompareValues<T>;
    notLike?: MsSqlPatternCompareValues<T>;
    ilike?: MsSqlPatternCompareValues<T>;
    notIlike?: MsSqlPatternCompareValues<T>;
    isNull?: MsSqlNullConditionInput<T>;
    isNotNull?: MsSqlNullConditionInput<T>;
};
type OrConditions<T extends MsSqlTable> = {
    [K in keyof BaseConditions<T> as `or${Capitalize<K>}`]?: BaseConditions<T>[K];
};
type AtomicConditions<T extends MsSqlTable> = BaseConditions<T> & OrConditions<T>;
export type MsSqlAndConditions<T extends MsSqlTable> = AtomicConditions<T> & {
    or?: MsSqlOrConditions<T>;
};
export type MsSqlOrConditions<T extends MsSqlTable> = AtomicConditions<T> & {
    and?: MsSqlAndConditions<T>;
};
export type MsSqlConditions<T extends MsSqlTable> = AtomicConditions<T> & {
    and?: MsSqlAndConditions<T>;
    or?: MsSqlOrConditions<T>;
};
export {};
