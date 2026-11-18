import type { ColumnBuilderBase, ColumnBuilderBaseConfig, ColumnBuilderExtraConfig, ColumnType } from 'drizzle-orm/column-builder';
import { type AnyMsSqlColumn, type PrimaryKeyBuilder, type MsSqlTable, type MsSqlTableWithColumns } from 'drizzle-orm/mssql-core';
import type { BuildColumns } from 'drizzle-orm/column-builder';
import type { MsSqlColumnBuilders } from 'drizzle-orm/mssql-core/columns/all';
import type { MsSqlTableExtraConfigValue } from 'drizzle-orm/mssql-core/table';
export type ColumnPolicy = {
    insert?: 'blocked' | 'allowed';
    update?: 'blocked' | 'allowed' | 'required';
    timestamp?: 'created' | 'updated';
};
export type TablePolicy = {
    updateBlocked?: boolean;
    deleteBlocked?: boolean;
};
declare const primaryKeyColumnsType: unique symbol;
declare const extraColumnKey: unique symbol;
type KeyedColumns<N extends string, C extends Record<string, ColumnBuilderBase>> = {
    [K in keyof C]: BuildColumns<N, C, 'mssql'>[K] & {
        readonly [extraColumnKey]: K;
    };
};
export declare function primaryKey<const C extends readonly [AnyMsSqlColumn, ...AnyMsSqlColumn[]]>(config: {
    name?: string;
    columns: C;
}): PrimaryKeyBuilder & {
    readonly [primaryKeyColumnsType]: C;
};
export type ExtraColumnKey<T> = T extends {
    readonly [extraColumnKey]: infer K;
} ? K : never;
export type TablePrimaryKeyColumns<T> = T extends {
    readonly [primaryKeyColumnsType]: infer C;
} ? C : never;
declare const tableMutationPolicyType: unique symbol;
declare const policyType: unique symbol;
declare const tablePolicyType: unique symbol;
type Mark<T, P extends ColumnPolicy> = T & {
    readonly [policyType]: P;
};
declare module 'drizzle-orm/mssql-core/columns/common' {
    interface MsSqlColumnBuilder<T extends ColumnBuilderBaseConfig<ColumnType>, TRuntimeConfig extends object, TExtraConfig extends ColumnBuilderExtraConfig> {
        insertBlocked(): Mark<this, {
            insert: 'blocked';
        }>;
        insertAllowed(): Mark<this, {
            insert: 'allowed';
        }>;
        updateBlocked(): Mark<this, {
            update: 'blocked';
        }>;
        updateAllowed(): Mark<this, {
            update: 'allowed';
        }>;
        updateRequired(): Mark<this, {
            update: 'required';
        }>;
        createdAt(): Mark<this, {
            timestamp: 'created';
        }>;
        updatedAt(): Mark<this, {
            timestamp: 'updated';
        }>;
    }
}
type Policies<C> = {
    [K in keyof C]: C[K] extends {
        readonly [policyType]: infer P;
    } ? P : {};
};
export type TablePolicies<T> = T extends {
    readonly [tablePolicyType]: infer P;
} ? P : {};
export type TableMutationPolicy<T> = T extends {
    readonly [tableMutationPolicyType]: infer P;
} ? P : {};
type TableResult<N extends string, C extends Record<string, ColumnBuilderBase>, P extends TablePolicy, E> = MsSqlTableWithColumns<{
    name: N;
    schema: undefined;
    columns: BuildColumns<N, C, 'mssql'>;
    dialect: 'mssql';
    isAlias: false;
}> & {
    readonly [tablePolicyType]: Policies<C>;
    readonly [tableMutationPolicyType]: P;
    readonly [primaryKeyColumnsType]: TablePrimaryKeyColumns<E extends readonly unknown[] ? E[number] : never>;
};
export declare function getColumnPolicies(table: MsSqlTable): Record<string, ColumnPolicy>;
export declare function getTablePolicy(table: MsSqlTable): TablePolicy;
export declare function mssqlTable<N extends string, C extends Record<string, ColumnBuilderBase>, const P extends TablePolicy = {}, const Q extends TablePolicy = {}, const E extends (MsSqlTableExtraConfigValue | MsSqlTableExtraConfigValue[])[] = []>(name: N, columns: C | ((types: MsSqlColumnBuilders) => C), extraConfigOrPolicy?: ((self: KeyedColumns<N, C>) => E) | (P & TablePolicy), policy?: Q & TablePolicy): TableResult<N, C, P & Q, E>;
export {};
