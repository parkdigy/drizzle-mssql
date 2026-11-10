import type { MsSqlTable } from 'drizzle-orm/mssql-core';
import type { InferSelectModel, SQLWrapper } from 'drizzle-orm';
export type MsSqlCompareValues<T extends MsSqlTable> = {
    [P in keyof InferSelectModel<T>]?: InferSelectModel<T>[P] | SQLWrapper;
};
export type MsSqlColumnName<T extends MsSqlTable> = keyof T['_']['columns'] & string;
export type MsSqlArrayCompareValues<T extends MsSqlTable> = {
    [P in keyof InferSelectModel<T>]?: (NonNullable<InferSelectModel<T>[P]> | SQLWrapper)[] | SQLWrapper;
};
export type MsSqlRangeCompareValues<T extends MsSqlTable> = {
    [P in keyof InferSelectModel<T>]?: [
        NonNullable<InferSelectModel<T>[P]> | SQLWrapper,
        NonNullable<InferSelectModel<T>[P]> | SQLWrapper
    ];
};
export type MsSqlPatternCompareValues<T extends MsSqlTable> = {
    [P in keyof InferSelectModel<T> as NonNullable<InferSelectModel<T>[P]> extends string ? P : never]?: string;
};
export type MsSqlNullConditionInput<T extends MsSqlTable> = MsSqlColumnName<T> | undefined | readonly (MsSqlColumnName<T> | undefined)[];
