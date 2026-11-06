import type { ColumnBuilderBase, ColumnBuilderBaseConfig, ColumnBuilderExtraConfig, ColumnType } from 'drizzle-orm/column-builder';
import { type MsSqlTable, type MsSqlTableWithColumns } from 'drizzle-orm/mssql-core';
import type { BuildColumns, BuildExtraConfigColumns } from 'drizzle-orm/column-builder';
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
type TableResult<N extends string, C extends Record<string, ColumnBuilderBase>, P extends TablePolicy> = MsSqlTableWithColumns<{
    name: N;
    schema: undefined;
    columns: BuildColumns<N, C, 'mssql'>;
    dialect: 'mssql';
    isAlias: false;
}> & {
    readonly [tablePolicyType]: Policies<C>;
    readonly [tableMutationPolicyType]: P;
};
export declare function getColumnPolicies(table: MsSqlTable): Record<string, ColumnPolicy>;
export declare function getTablePolicy(table: MsSqlTable): TablePolicy;
type ExtraConfig<N extends string, C extends Record<string, ColumnBuilderBase>> = (self: BuildExtraConfigColumns<N, C, 'mssql'>) => (MsSqlTableExtraConfigValue | MsSqlTableExtraConfigValue[])[];
export declare function mssqlTable<N extends string, C extends Record<string, ColumnBuilderBase>, const P extends TablePolicy = {}, const Q extends TablePolicy = {}>(name: N, columns: C | ((types: MsSqlColumnBuilders) => C), extraConfigOrPolicy?: ExtraConfig<N, C> | (P & TablePolicy), policy?: Q & TablePolicy): TableResult<N, C, P & Q>;
export {};
