import * as native from 'drizzle-orm';
import { MsSqlTable } from 'drizzle-orm/mssql-core';
import type { Column, SQL, SQLWrapper } from 'drizzle-orm';
import type { MsSqlAndConditions, MsSqlColumnName, MsSqlNullConditionInput, MsSqlOrConditions } from './@types/index.cjs';
export declare function createConditions<TSchema extends Record<string, MsSqlTable>>(schema: TSchema): {
    eq: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column, TValue extends native.GetColumnData<TColumn, "raw"> | native.SQLWrapper | undefined>(left: TColumn, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T, TValue extends T | native.SQLWrapper | undefined>(left: SQL.Aliased<T>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T extends native.SQLWrapper, TValue>(left: Exclude<T, MsSqlTable>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
    };
    ne: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column, TValue extends native.GetColumnData<TColumn, "raw"> | native.SQLWrapper | undefined>(left: TColumn, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T, TValue extends T | native.SQLWrapper | undefined>(left: SQL.Aliased<T>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T extends native.SQLWrapper, TValue>(left: Exclude<T, MsSqlTable>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
    };
    orEq: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orNe: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    gt: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column, TValue extends native.GetColumnData<TColumn, "raw"> | native.SQLWrapper | undefined>(left: TColumn, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T, TValue extends T | native.SQLWrapper | undefined>(left: SQL.Aliased<T>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T extends native.SQLWrapper, TValue>(left: Exclude<T, MsSqlTable>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
    };
    gte: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column, TValue extends native.GetColumnData<TColumn, "raw"> | native.SQLWrapper | undefined>(left: TColumn, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T, TValue extends T | native.SQLWrapper | undefined>(left: SQL.Aliased<T>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T extends native.SQLWrapper, TValue>(left: Exclude<T, MsSqlTable>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
    };
    lt: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column, TValue extends native.GetColumnData<TColumn, "raw"> | native.SQLWrapper | undefined>(left: TColumn, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T, TValue extends T | native.SQLWrapper | undefined>(left: SQL.Aliased<T>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T extends native.SQLWrapper, TValue>(left: Exclude<T, MsSqlTable>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
    };
    lte: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column, TValue extends native.GetColumnData<TColumn, "raw"> | native.SQLWrapper | undefined>(left: TColumn, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T, TValue extends T | native.SQLWrapper | undefined>(left: SQL.Aliased<T>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
        <T extends native.SQLWrapper, TValue>(left: Exclude<T, MsSqlTable>, right: TValue): undefined extends TValue ? SQL | undefined : SQL;
    };
    inArray: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlArrayCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlArrayCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & typeof native.inArray & ((args_0: native.SQLWrapper<unknown>, args_1: native.SQLWrapper<unknown> | readonly unknown[] | undefined) => SQL | undefined);
    notInArray: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlArrayCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlArrayCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & typeof native.notInArray & ((args_0: native.SQLWrapper<unknown>, args_1: native.SQLWrapper<unknown> | unknown[] | undefined) => SQL | undefined);
    between: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlRangeCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlRangeCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & typeof native.between & ((args_0: native.SQLWrapper<unknown>, args_1: unknown, args_2: unknown) => SQL | undefined);
    notBetween: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlRangeCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlRangeCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & typeof native.notBetween & ((args_0: native.SQLWrapper<unknown>, args_1: unknown, args_2: unknown) => SQL | undefined);
    like: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlPatternCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & typeof native.like & ((args_0: native.Column<native.ColumnBaseConfig<native.ColumnType>, object> | native.SQLWrapper<unknown> | native.SQL<unknown> | native.SQL.Aliased<unknown>, args_1: string | native.SQLWrapper<unknown> | undefined) => SQL | undefined);
    notLike: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlPatternCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & typeof native.notLike & ((args_0: native.Column<native.ColumnBaseConfig<native.ColumnType>, object> | native.SQLWrapper<unknown> | native.SQL<unknown> | native.SQL.Aliased<unknown>, args_1: string | native.SQLWrapper<unknown> | undefined) => SQL | undefined);
    ilike: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlPatternCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & ((column: SQLWrapper, pattern: string | SQLWrapper) => native.SQL<unknown>) & ((args_0: native.SQLWrapper<unknown>, args_1: string | native.SQLWrapper<unknown> | undefined) => SQL | undefined);
    notIlike: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlPatternCompareValues<TSchema[K]> | undefined): SQL | undefined;
    } & ((column: SQLWrapper, pattern: string | SQLWrapper) => native.SQL<unknown>) & ((args_0: native.SQLWrapper<unknown>, args_1: string | native.SQLWrapper<unknown> | undefined) => SQL | undefined);
    isNull: {
        <T extends MsSqlTable>(table: T, name: MsSqlColumnName<T>): SQL;
        <T extends MsSqlTable>(table: T, names: MsSqlNullConditionInput<T>): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, name: MsSqlColumnName<(typeof schema)[K]>): SQL;
        <K extends keyof TSchema & string>(table: K, names: MsSqlNullConditionInput<(typeof schema)[K]>): SQL | undefined;
    } & typeof native.isNull;
    isNotNull: {
        <T extends MsSqlTable>(table: T, name: MsSqlColumnName<T>): SQL;
        <T extends MsSqlTable>(table: T, names: MsSqlNullConditionInput<T>): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, name: MsSqlColumnName<(typeof schema)[K]>): SQL;
        <K extends keyof TSchema & string>(table: K, names: MsSqlNullConditionInput<(typeof schema)[K]>): SQL | undefined;
    } & typeof native.isNotNull;
    orGt: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orGte: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orLt: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orLte: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orInArray: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlArrayCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlArrayCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orNotInArray: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlArrayCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlArrayCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orBetween: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlRangeCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlRangeCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orNotBetween: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlRangeCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlRangeCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orLike: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlPatternCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orNotLike: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlPatternCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orIlike: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlPatternCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orNotIlike: {
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, values: import("./index.cjs").MsSqlPatternCompareValues<TSchema[K]> | undefined): SQL | undefined;
    };
    orIsNull: {
        <T extends MsSqlTable>(table: T, name: MsSqlColumnName<T>): SQL;
        <T extends MsSqlTable>(table: T, names: MsSqlNullConditionInput<T>): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, name: MsSqlColumnName<(typeof schema)[K]>): SQL;
        <K extends keyof TSchema & string>(table: K, names: MsSqlNullConditionInput<(typeof schema)[K]>): SQL | undefined;
    };
    orIsNotNull: {
        <T extends MsSqlTable>(table: T, name: MsSqlColumnName<T>): SQL;
        <T extends MsSqlTable>(table: T, names: MsSqlNullConditionInput<T>): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, name: MsSqlColumnName<(typeof schema)[K]>): SQL;
        <K extends keyof TSchema & string>(table: K, names: MsSqlNullConditionInput<(typeof schema)[K]>): SQL | undefined;
    };
    and: {
        <T extends MsSqlTable>(table: T, options: MsSqlAndConditions<T> | MsSqlOrConditions<T>): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, options: MsSqlAndConditions<TSchema[K]> | MsSqlOrConditions<TSchema[K]>): SQL | undefined;
    } & ((...conditions: (native.SQLWrapper | false | undefined)[]) => SQL | undefined);
    or: {
        <T extends MsSqlTable>(table: T, options: MsSqlAndConditions<T> | MsSqlOrConditions<T>): SQL | undefined;
        <K extends keyof TSchema & string>(table: K, options: MsSqlAndConditions<TSchema[K]> | MsSqlOrConditions<TSchema[K]>): SQL | undefined;
    } & ((...conditions: (native.SQLWrapper | false | undefined)[]) => SQL | undefined);
};
export type MsSqlSchemaConditions<TSchema extends Record<string, MsSqlTable>> = ReturnType<typeof createConditions<TSchema>>;
