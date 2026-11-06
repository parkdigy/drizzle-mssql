import * as native from 'drizzle-orm';
import { MsSqlTable } from 'drizzle-orm/mssql-core';
import type { Column, SQL } from 'drizzle-orm';
import type { MsSqlColumnName, MsSqlConditions, MsSqlNullConditionInput } from './@types/index.cjs';
export declare function createConditions<TSchema extends Record<string, MsSqlTable>>(schema: TSchema): {
    eq: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column>(left: TColumn, right: native.GetColumnData<TColumn, "raw"> | native.SQLWrapper): SQL;
        <T>(left: SQL.Aliased<T>, right: T | native.SQLWrapper): SQL;
        <T extends native.SQLWrapper>(left: Exclude<T, MsSqlTable>, right: unknown): SQL;
    };
    ne: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column>(left: TColumn, right: native.GetColumnData<TColumn, "raw"> | native.SQLWrapper): SQL;
        <T>(left: SQL.Aliased<T>, right: T | native.SQLWrapper): SQL;
        <T extends native.SQLWrapper>(left: Exclude<T, MsSqlTable>, right: unknown): SQL;
    };
    gt: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column>(left: TColumn, right: native.GetColumnData<TColumn, "raw"> | native.SQLWrapper): SQL;
        <T>(left: SQL.Aliased<T>, right: T | native.SQLWrapper): SQL;
        <T extends native.SQLWrapper>(left: Exclude<T, MsSqlTable>, right: unknown): SQL;
    };
    gte: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column>(left: TColumn, right: native.GetColumnData<TColumn, "raw"> | native.SQLWrapper): SQL;
        <T>(left: SQL.Aliased<T>, right: T | native.SQLWrapper): SQL;
        <T extends native.SQLWrapper>(left: Exclude<T, MsSqlTable>, right: unknown): SQL;
    };
    lt: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column>(left: TColumn, right: native.GetColumnData<TColumn, "raw"> | native.SQLWrapper): SQL;
        <T>(left: SQL.Aliased<T>, right: T | native.SQLWrapper): SQL;
        <T extends native.SQLWrapper>(left: Exclude<T, MsSqlTable>, right: unknown): SQL;
    };
    lte: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlCompareValues<T> | undefined): SQL | undefined;
    } & {
        <TColumn extends Column>(left: TColumn, right: native.GetColumnData<TColumn, "raw"> | native.SQLWrapper): SQL;
        <T>(left: SQL.Aliased<T>, right: T | native.SQLWrapper): SQL;
        <T extends native.SQLWrapper>(left: Exclude<T, MsSqlTable>, right: unknown): SQL;
    };
    inArray: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlArrayCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlArrayCompareValues<T> | undefined): SQL | undefined;
    } & typeof native.inArray;
    notInArray: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlArrayCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlArrayCompareValues<T> | undefined): SQL | undefined;
    } & typeof native.notInArray;
    between: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlRangeCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlRangeCompareValues<T> | undefined): SQL | undefined;
    } & typeof native.between;
    notBetween: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlRangeCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlRangeCompareValues<T> | undefined): SQL | undefined;
    } & typeof native.notBetween;
    like: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
    } & typeof native.like;
    notLike: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
    } & typeof native.notLike;
    ilike: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
    } & typeof native.ilike;
    notIlike: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>> | undefined): SQL | undefined;
        <T extends MsSqlTable>(table: T, values: import("./index.cjs").MsSqlPatternCompareValues<T> | undefined): SQL | undefined;
    } & typeof native.notIlike;
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
    and: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, options: MsSqlConditions<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>>): SQL | undefined;
        <T extends MsSqlTable>(table: T, options: MsSqlConditions<T>): SQL | undefined;
    } & ((...conditions: (native.SQLWrapper | false | undefined)[]) => SQL | undefined);
    or: {
        <T extends (keyof TSchema & string) | MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>(table: T, options: MsSqlConditions<T extends keyof TSchema & string ? TSchema[T] : Extract<T, MsSqlTable<import("drizzle-orm/mssql-core").TableConfig>>>): SQL | undefined;
        <T extends MsSqlTable>(table: T, options: MsSqlConditions<T>): SQL | undefined;
    } & ((...conditions: (native.SQLWrapper | false | undefined)[]) => SQL | undefined);
};
