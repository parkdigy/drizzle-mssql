import {getMsSqlConnectionParams,drizzle}from'drizzle-orm/node-mssql';import mssql from'mssql';import*as native from'drizzle-orm';import {isTable,is,Subquery,sql,getTableColumns,min,max,asc as asc$1,desc as desc$1,SQL,eq,and,count,or,defineRelations}from'drizzle-orm';export{asc,avg,avgDistinct,count,countDistinct,desc,exists,max,min,not,notExists,sum,sumDistinct}from'drizzle-orm';import {MsSqlTable,mssqlTable as mssqlTable$1,getTableConfig,MsSqlSelectBase,MsSqlColumn,alias as alias$1}from'drizzle-orm/mssql-core';export{bigint,binary,bit,char,check,customType,date,datetime,datetime2,datetimeoffset,decimal,float,foreignKey,index,int,mssqlSchema,mssqlTableCreator,mssqlView,nchar,ntext,numeric,nvarchar,primaryKey,real,smallint,text,time,tinyint,unique,uniqueIndex,varbinary,varchar}from'drizzle-orm/mssql-core';import {AsyncLocalStorage}from'node:async_hooks';import {alias}from'drizzle-orm/mssql-core/alias';import {MsSqlColumnBuilder}from'drizzle-orm/mssql-core/columns/common';/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};function createAlias(schema) {
    /********************************************************************************************************************
     * getDefaultAlias
     * ******************************************************************************************************************/
    const getDefaultAlias = (tableName) => { var _a; return `${tableName[0]}${((_a = tableName.slice(1).match(/[A-Z]/g)) !== null && _a !== void 0 ? _a : []).join('')}`.toLowerCase(); };
    /********************************************************************************************************************
     * createAlias
     * ******************************************************************************************************************/
    const createAlias = (tableName) => (alias$1 = getDefaultAlias(tableName)) => alias(schema[tableName], alias$1);
    /********************************************************************************************************************
     * alias
     * ******************************************************************************************************************/
    const alias$1 = Object.fromEntries(Object.keys(schema).map((tableName) => [tableName, createAlias(tableName)]));
    return alias$1;
}function createConditions(schema) {
    const resolveTable = (table) => {
        if (typeof table !== 'string')
            return table;
        const resolved = schema[table];
        if (!Object.hasOwn(schema, table) || resolved === undefined) {
            throw new Error(`Condition: unknown table "${table}".`);
        }
        return resolved;
    };
    const getColumn = (table, name) => {
        const columns = native.getTableColumns(table);
        const column = columns[name];
        if (!Object.hasOwn(columns, name) || column === undefined) {
            throw new Error(`Condition: unknown column "${name}".`);
        }
        return column;
    };
    const recordEntries = (values) => {
        if (typeof values !== 'object' || values === null || Array.isArray(values)) {
            throw new Error('Condition: expected a column/value object.');
        }
        return Object.entries(values);
    };
    const isSQLWrapper = (value) => typeof value === 'object' && value !== null && 'getSQL' in value && typeof value.getSQL === 'function';
    const compareValue = (column, value, operator) => {
        if (value === null) {
            if (operator === 'eq')
                return native.isNull(column);
            if (operator === 'ne')
                return native.isNotNull(column);
            throw new Error(`${operator}: column "${column.name}" must not be null.`);
        }
        switch (operator) {
            case 'eq':
                return native.eq(column, value);
            case 'ne':
                return native.ne(column, value);
            case 'gt':
                return native.gt(column, value);
            case 'gte':
                return native.gte(column, value);
            case 'lt':
                return native.lt(column, value);
            case 'lte':
                return native.lte(column, value);
            case 'inArray':
            case 'notInArray':
                if (!Array.isArray(value) && !isSQLWrapper(value)) {
                    throw new Error(`${operator}: expected an array or a SQL query.`);
                }
                return operator === 'inArray' ? native.inArray(column, value) : native.notInArray(column, value);
            case 'between':
            case 'notBetween':
                if (!Array.isArray(value) || value.length !== 2 || value.some((item) => item == null)) {
                    throw new Error(`${operator}: expected two non-null bounds.`);
                }
                return operator === 'between'
                    ? native.between(column, value[0], value[1])
                    : native.notBetween(column, value[0], value[1]);
            default:
                if (typeof value !== 'string')
                    throw new Error(`${operator}: expected a string pattern.`);
                return native[operator](column, value);
        }
    };
    const valueConditions = (table, values, operator) => {
        const conditions = [];
        for (const [name, value] of recordEntries(values)) {
            const column = getColumn(table, name);
            if (value !== undefined)
                conditions.push(compareValue(column, value, operator));
        }
        return conditions;
    };
    function extendOperator(original, objectOperator) {
        return (...args) => {
            if (typeof args[0] === 'string' || native.is(args[0], MsSqlTable)) {
                const table = typeof args[0] === 'string' ? resolveTable(args[0]) : args[0];
                return objectOperator(table, args[1]);
            }
            return Reflect.apply(original, undefined, args);
        };
    }
    const objectOperator = (operator, join = 'and') => (table, values) => native[join](...valueConditions(resolveTable(table), values, operator));
    // Tables use object dispatch at runtime, not the native SQLWrapper/unknown overload.
    const binaryOperator = (operator) => extendOperator(native[operator], objectOperator(operator));
    const nullOperator = (operator, join = 'and') => ((table, input) => {
        const names = typeof input === 'string' ? [input] : input === undefined ? [] : input;
        if (!Array.isArray(names))
            throw new Error(`${operator}: expected column names.`);
        const conditions = [];
        for (const name of names) {
            if (name === undefined)
                continue;
            if (typeof name !== 'string')
                throw new Error(`${operator}: expected a column name.`);
            conditions.push(native[operator](getColumn(resolveTable(table), name)));
        }
        return native[join](...conditions);
    });
    const groupOperator = (operator) => (input, options) => {
        const table = resolveTable(input);
        const sqlConditions = [];
        for (const [name, values] of recordEntries(options)) {
            if (name === operator) {
                throw new Error(`Condition: cannot nest "${operator}" inside itself.`);
            }
            if (!Object.hasOwn(conditions, name)) {
                throw new Error(`Condition: unknown operator "${name}".`);
            }
            if (values === undefined)
                continue;
            const condition = Reflect.apply(conditions[name], undefined, [table, values]);
            if (condition !== undefined)
                sqlConditions.push(condition);
        }
        return native[operator](...sqlConditions);
    };
    const logicalOperator = (operator) => extendOperator((...conditions) => native[operator](...conditions.filter((condition) => condition !== false && condition !== undefined)), groupOperator(operator));
    const conditions = {
        eq: binaryOperator('eq'),
        ne: binaryOperator('ne'),
        orEq: objectOperator('eq', 'or'),
        orNe: objectOperator('ne', 'or'),
        gt: binaryOperator('gt'),
        gte: binaryOperator('gte'),
        lt: binaryOperator('lt'),
        lte: binaryOperator('lte'),
        inArray: extendOperator(native.inArray, objectOperator('inArray')),
        notInArray: extendOperator(native.notInArray, objectOperator('notInArray')),
        between: extendOperator(native.between, objectOperator('between')),
        notBetween: extendOperator(native.notBetween, objectOperator('notBetween')),
        like: extendOperator(native.like, objectOperator('like')),
        notLike: extendOperator(native.notLike, objectOperator('notLike')),
        ilike: extendOperator(native.ilike, objectOperator('ilike')),
        notIlike: extendOperator(native.notIlike, objectOperator('notIlike')),
        isNull: extendOperator(native.isNull, nullOperator('isNull')),
        isNotNull: extendOperator(native.isNotNull, nullOperator('isNotNull')),
        orGt: objectOperator('gt', 'or'),
        orGte: objectOperator('gte', 'or'),
        orLt: objectOperator('lt', 'or'),
        orLte: objectOperator('lte', 'or'),
        orInArray: objectOperator('inArray', 'or'),
        orNotInArray: objectOperator('notInArray', 'or'),
        orBetween: objectOperator('between', 'or'),
        orNotBetween: objectOperator('notBetween', 'or'),
        orLike: objectOperator('like', 'or'),
        orNotLike: objectOperator('notLike', 'or'),
        orIlike: objectOperator('ilike', 'or'),
        orNotIlike: objectOperator('notIlike', 'or'),
        orIsNull: nullOperator('isNull', 'or'),
        orIsNotNull: nullOperator('isNotNull', 'or'),
        and: logicalOperator('and'),
        or: logicalOperator('or'),
    };
    return conditions;
}function TableColumns(first, ...rest) {
    var _a, _b, _c, _d;
    if (Array.isArray(first) && isTable(first[0])) {
        const result = {};
        for (const group of [first, ...rest]) {
            if (!Array.isArray(group) || !isTable(group[0])) {
                throw new Error('columns: expected a table/column-name tuple.');
            }
            Object.assign(result, TableColumns(group[0], ...group.slice(1)));
        }
        return result;
    }
    if (is(first, Subquery)) {
        const subqueryFields = first._.selectedFields;
        if (rest.length === 0)
            return subqueryFields;
        const selected = {};
        for (const selection of rest) {
            if (typeof selection !== 'string')
                throw new Error('columns: expected a column name.');
            const match = /^(.+?)\s+as\s+(.+)$/i.exec(selection.trim());
            const name = ((_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : selection).trim();
            const alias = (_b = match === null || match === void 0 ? void 0 : match[2]) === null || _b === void 0 ? void 0 : _b.trim();
            if (!Object.hasOwn(subqueryFields, name))
                throw new Error(`columns: unknown column "${name}".`);
            const field = subqueryFields[name];
            if (alias)
                selected[alias] = sql `${field}`.as(alias);
            else
                selected[name] = field;
        }
        return selected;
    }
    if (isTable(first)) {
        const tableColumns = getTableColumns(first);
        if (rest.length === 0)
            return Object.fromEntries(Object.values(tableColumns).map((column) => [column.name, column]));
        const selected = {};
        for (const selection of rest) {
            if (typeof selection !== 'string') {
                throw new Error('columns: expected a column name.');
            }
            const match = /^(.+?)\s+as\s+(.+)$/i.exec(selection.trim());
            const name = ((_c = match === null || match === void 0 ? void 0 : match[1]) !== null && _c !== void 0 ? _c : selection).trim();
            const alias = (_d = match === null || match === void 0 ? void 0 : match[2]) === null || _d === void 0 ? void 0 : _d.trim();
            const column = tableColumns[name];
            if (!Object.hasOwn(tableColumns, name) || column === undefined) {
                throw new Error(`columns: unknown column "${name}".`);
            }
            if (alias)
                selected[alias] = sql `${column}`.as(alias);
            else
                selected[column.name] = column;
        }
        return selected;
    }
    const columns = (Array.isArray(first) ? first : [first, ...rest]);
    return Object.fromEntries(columns.map((column) => {
        if (typeof column === 'string' || Array.isArray(column))
            throw new Error('columns: expected a column object.');
        return [column.name, column];
    }));
}const policies = new WeakMap();
for (const [method, policy] of Object.entries({
    insertBlocked: { insert: 'blocked' },
    insertAllowed: { insert: 'allowed' },
    updateBlocked: { update: 'blocked' },
    updateAllowed: { update: 'allowed' },
    updateRequired: { update: 'required' },
    createdAt: { timestamp: 'created' },
    updatedAt: { timestamp: 'updated' },
})) {
    Object.defineProperty(MsSqlColumnBuilder.prototype, method, {
        configurable: true,
        value: function () {
            policies.set(this, Object.assign(Object.assign({}, policies.get(this)), policy));
            return this;
        },
    });
}
const tableMutationPolicies = new WeakMap();
const tablePolicies = new WeakMap();
function getColumnPolicies(table) {
    var _a;
    return (_a = tablePolicies.get(table)) !== null && _a !== void 0 ? _a : {};
}
function getTablePolicy(table) {
    var _a;
    return (_a = tableMutationPolicies.get(table)) !== null && _a !== void 0 ? _a : {};
}
function mssqlTable(name, columns, extraConfigOrPolicy, policy) {
    const extraConfig = typeof extraConfigOrPolicy === 'function' ? extraConfigOrPolicy : undefined;
    const mutationPolicy = typeof extraConfigOrPolicy === 'object' ? extraConfigOrPolicy : policy;
    let builders = {};
    const table = typeof columns === 'function'
        ? mssqlTable$1(name, (types) => (builders = columns(types)), extraConfig)
        : mssqlTable$1(name, (builders = columns), extraConfig);
    tablePolicies.set(table, Object.fromEntries(Object.entries(builders).map(([key, builder]) => { var _a; return [key, (_a = policies.get(builder)) !== null && _a !== void 0 ? _a : {}]; })));
    tableMutationPolicies.set(table, Object.assign({}, mutationPolicy));
    return table;
}/********************************************************************************************************************
 * MsSqlQuery
 * ******************************************************************************************************************/
class MsSqlQuery {
    /********************************************************************************************************************
     * constructor
     * ******************************************************************************************************************/
    constructor(table, current, getTimestamp) {
        this.current = current;
        this.getTimestamp = getTimestamp;
        this.drizzle = Object.assign(Object.assign({}, createConditions({})), { sqlNumber: (value) => sql `${value}`.mapWith(Number) });
        this.t = table;
    }
    /********************************************************************************************************************
     * alias
     * ******************************************************************************************************************/
    alias(name) {
        return alias(this.t, name);
    }
    /********************************************************************************************************************
     * (PROTECTED) getTx
     * ******************************************************************************************************************/
    getTx() {
        return this.current();
    }
    columns(...names) {
        const table = this.t;
        return TableColumns(table, ...names);
    }
    min(columnOrName) {
        return min(this.resolveAggregateColumn(columnOrName, this.t));
    }
    max(columnOrName) {
        return max(this.resolveAggregateColumn(columnOrName, this.t));
    }
    resolveAggregateColumn(columnOrName, table) {
        if (typeof columnOrName !== 'string')
            return columnOrName;
        const columns = is(table, Subquery) ? sourceColumns(table) : getTableColumns(table);
        if (!Object.hasOwn(columns, columnOrName))
            throw new Error(`aggregate: unknown column "${columnOrName}".`);
        return columns[columnOrName];
    }
    resolveOrderColumn(name, table) {
        if (name === undefined)
            throw new Error('orderBy: column name is required.');
        const columns = is(table, Subquery) ? sourceColumns(table) : getTableColumns(table);
        if (!Object.hasOwn(columns, name))
            throw new Error(`orderBy: unknown column "${name}".`);
        return columns[name];
    }
    resolveConditionColumn(name, table) {
        const columns = getTableColumns(table);
        if (!Object.hasOwn(columns, name))
            throw new Error(`Condition: unknown column "${name}".`);
        return columns[name];
    }
    asc(tableOrName, name) {
        const table = typeof tableOrName === 'string' ? this.t : tableOrName;
        const columnName = typeof tableOrName === 'string' ? tableOrName : name;
        return asc$1(this.resolveOrderColumn(columnName, table));
    }
    desc(tableOrName, name) {
        const table = typeof tableOrName === 'string' ? this.t : tableOrName;
        const columnName = typeof tableOrName === 'string' ? tableOrName : name;
        return desc$1(this.resolveOrderColumn(columnName, table));
    }
    resolveFields(fields, table = this.t) {
        if (Array.isArray(fields) && fields.length > 0 && fields.every((field) => typeof field === 'string')) {
            return sourceColumns(table, fields);
        }
        if (typeof fields !== 'function')
            return normalizeFields(fields, table);
        const query = {
            t: table,
            columns: (...names) => sourceColumns(table, names),
            min: (columnOrName) => min(this.resolveAggregateColumn(columnOrName, table)),
            max: (columnOrName) => max(this.resolveAggregateColumn(columnOrName, table)),
        };
        return normalizeFields(fields(query), table);
    }
    select(fieldsOrAlias, fields) {
        return this.buildSelectQuery(fieldsOrAlias, fields, false);
    }
    selectDistinct(fieldsOrAlias, fields) {
        return this.buildSelectQuery(fieldsOrAlias, fields, true);
    }
    /********************************************************************************************************************
     * (PRIVATE) buildSelectQuery
     * ******************************************************************************************************************/
    buildSelectQuery(fieldsOrAlias, fields, distinct) {
        const tx = this.getTx();
        const isAlias = isTable(fieldsOrAlias) || is(fieldsOrAlias, Subquery);
        const table = isAlias ? fieldsOrAlias : this.t;
        const selectedFields = this.resolveFields(isAlias ? fields : fieldsOrAlias, table);
        const selectBuilder = distinct
            ? tx.selectDistinct(selectedFields !== null && selectedFields !== void 0 ? selectedFields : sourceColumns(table))
            : tx.select(selectedFields !== null && selectedFields !== void 0 ? selectedFields : sourceColumns(table));
        const enhance = (query) => {
            if (typeof query !== 'object' || query === null)
                return query;
            const builder = query;
            const originalWhere = builder.where.bind(query);
            const orderBy = query.orderBy;
            const originalOrderBy = typeof orderBy === 'function' ? orderBy.bind(query) : undefined;
            const bindCondition = (operator, conditionTable = table) => (input) => {
                const orGroup = operator.startsWith('or') && operator !== 'or';
                const baseOperator = orGroup ? operator.charAt(2).toLowerCase() + operator.slice(3) : operator;
                const join = orGroup || operator === 'or' ? or : and;
                const conditionOperator = this.drizzle[operator];
                if (isTable(conditionTable)) {
                    return Reflect.apply(conditionOperator, undefined, [conditionTable, input]);
                }
                if (baseOperator === 'isNull' || baseOperator === 'isNotNull') {
                    const names = Array.isArray(input) ? input : [input];
                    return join(...names
                        .filter((name) => name !== undefined)
                        .map((name) => {
                        const column = conditionTable[String(name)];
                        if (column === undefined)
                            throw new Error(`Condition: unknown column "${name}".`);
                        return Reflect.apply(this.drizzle[baseOperator], undefined, [
                            column,
                        ]);
                    }));
                }
                if (operator === 'and' || operator === 'or') {
                    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
                        throw new Error(`${operator}: expected a condition object.`);
                    }
                    const conditions = Object.entries(input).map(([nestedOperator, values]) => bindCondition(nestedOperator, conditionTable)(values));
                    return Reflect.apply(join, undefined, conditions);
                }
                if (typeof input !== 'object' || input === null || Array.isArray(input)) {
                    throw new Error(`${operator}: expected a column/value object.`);
                }
                const conditions = Object.entries(input)
                    .filter(([, value]) => value !== undefined)
                    .map(([name, value]) => {
                    const column = conditionTable[name];
                    if (column === undefined)
                        throw new Error(`Condition: unknown column "${name}".`);
                    if (value === null && (baseOperator === 'eq' || baseOperator === 'ne')) {
                        return Reflect.apply(this.drizzle[baseOperator === 'eq' ? 'isNull' : 'isNotNull'], undefined, [column]);
                    }
                    const nativeOperator = this.drizzle[baseOperator];
                    if (baseOperator === 'between' || baseOperator === 'notBetween') {
                        if (!Array.isArray(value) || value.length !== 2) {
                            throw new Error(`${operator}: expected two bounds.`);
                        }
                        return Reflect.apply(nativeOperator, undefined, [column, value[0], value[1]]);
                    }
                    return Reflect.apply(nativeOperator, undefined, [column, value]);
                });
                return join(...conditions);
            };
            const combineCallbackConditions = (operator, conditionTable, inputs) => {
                const conditions = [];
                for (const input of inputs) {
                    if (input === undefined || input === false)
                        continue;
                    if (typeof input === 'object' && input !== null && 'getSQL' in input && typeof input.getSQL === 'function') {
                        conditions.push(input);
                        continue;
                    }
                    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
                        conditions.push(bindCondition(operator, conditionTable)(input));
                        continue;
                    }
                    throw new Error(`${operator}: expected SQL conditions or a condition object.`);
                }
                const filtered = conditions.filter((condition) => condition !== false);
                return operator === 'and' ? and(...filtered) : or(...filtered);
            };
            const conditionQuery = (conditionTable, contextTable) => ({
                t: contextTable,
                eq: bindCondition('eq', conditionTable),
                ne: bindCondition('ne', conditionTable),
                gt: bindCondition('gt', conditionTable),
                gte: bindCondition('gte', conditionTable),
                lt: bindCondition('lt', conditionTable),
                lte: bindCondition('lte', conditionTable),
                inArray: bindCondition('inArray', conditionTable),
                notInArray: bindCondition('notInArray', conditionTable),
                between: bindCondition('between', conditionTable),
                notBetween: bindCondition('notBetween', conditionTable),
                like: bindCondition('like', conditionTable),
                notLike: bindCondition('notLike', conditionTable),
                ilike: bindCondition('ilike', conditionTable),
                notIlike: bindCondition('notIlike', conditionTable),
                isNull: bindCondition('isNull', conditionTable),
                isNotNull: bindCondition('isNotNull', conditionTable),
                and: (...conditions) => combineCallbackConditions('and', conditionTable, conditions),
                or: (...conditions) => combineCallbackConditions('or', conditionTable, conditions),
                orEq: bindCondition('orEq', conditionTable),
                orNe: bindCondition('orNe', conditionTable),
                orIsNotNull: bindCondition('orIsNotNull', conditionTable),
                orIsNull: bindCondition('orIsNull', conditionTable),
                orNotIlike: bindCondition('orNotIlike', conditionTable),
                orIlike: bindCondition('orIlike', conditionTable),
                orNotLike: bindCondition('orNotLike', conditionTable),
                orLike: bindCondition('orLike', conditionTable),
                orNotBetween: bindCondition('orNotBetween', conditionTable),
                orBetween: bindCondition('orBetween', conditionTable),
                orNotInArray: bindCondition('orNotInArray', conditionTable),
                orInArray: bindCondition('orInArray', conditionTable),
                orLte: bindCondition('orLte', conditionTable),
                orLt: bindCondition('orLt', conditionTable),
                orGte: bindCondition('orGte', conditionTable),
                orGt: bindCondition('orGt', conditionTable),
            });
            const whereQuery = conditionQuery(table, table);
            const orderByColumns = (direction, name, ...names) => {
                const orders = [name, ...names].map((columnName) => direction(this.resolveOrderColumn(columnName, table)));
                return orders.length === 1 ? orders[0] : orders;
            };
            const orderByQuery = {
                t: table,
                asc: (name, ...names) => orderByColumns(asc$1, name, ...names),
                desc: (name, ...names) => orderByColumns(desc$1, name, ...names),
            };
            const enhancements = {
                where: (condition) => originalWhere(typeof condition === 'function'
                    ? () => condition(whereQuery)
                    : condition),
                top: (count) => typeof selectBuilder.top === 'function' ? enhance(selectBuilder.top(count).from(table)) : query,
            };
            if (originalOrderBy) {
                enhancements.orderBy = (...args) => {
                    if (typeof args[0] === 'function') {
                        const result = args[0](orderByQuery);
                        const columns = Array.isArray(result) ? result.flat(Infinity) : [result];
                        return originalOrderBy(...columns);
                    }
                    return originalOrderBy(...args.flat(Infinity));
                };
            }
            for (const setOperator of ['union', 'unionAll', 'intersect', 'except']) {
                const operation = query[setOperator];
                if (typeof operation !== 'function')
                    continue;
                enhancements[setOperator] = (...args) => {
                    const result = Reflect.apply(operation, query, args);
                    return result === query ? query : enhance(result);
                };
            }
            const crossJoin = query.crossJoin;
            if (typeof crossJoin === 'function') {
                enhancements.crossJoin = (joinedTable) => enhance(Reflect.apply(crossJoin, query, [joinedTable]));
            }
            for (const joinMethod of ['innerJoin', 'leftJoin', 'rightJoin', 'fullJoin', 'outerApply', 'crossApply']) {
                const join = query[joinMethod];
                if (typeof join !== 'function')
                    continue;
                enhancements[joinMethod] = (joinedTable, on) => {
                    if (typeof on !== 'function' || (!isTable(joinedTable) && !is(joinedTable, Subquery))) {
                        return enhance(Reflect.apply(join, query, [joinedTable, on]));
                    }
                    const joinQuery = conditionQuery(joinedTable, table);
                    return enhance(Reflect.apply(join, query, [joinedTable, () => on(joinQuery)]));
                };
            }
            return Object.assign(query, enhancements);
        };
        return enhance(selectBuilder.from(table));
    }
    async find(aliasOrFieldsOrWhere, fieldsOrWhere, where) {
        const hasAlias = isTable(aliasOrFieldsOrWhere);
        const fieldsOrCondition = hasAlias ? fieldsOrWhere : aliasOrFieldsOrWhere;
        const hasFields = arguments.length === (hasAlias ? 3 : 2);
        const isCondition = (value) => is(value, SQL) || typeof value === 'function';
        const table = hasAlias ? aliasOrFieldsOrWhere : this.t;
        const selectedFields = this.resolveFields(!hasFields && isCondition(fieldsOrCondition) ? undefined : fieldsOrCondition, table);
        const conditionInput = !hasFields && isCondition(fieldsOrCondition)
            ? fieldsOrCondition
            : hasAlias
                ? where
                : isCondition(fieldsOrWhere)
                    ? fieldsOrWhere
                    : undefined;
        const condition = typeof conditionInput === 'function' ? conditionInput(this) : conditionInput;
        if (condition !== undefined && !is(condition, SQL)) {
            throw new Error('find: the where callback must return SQL or undefined.');
        }
        const builder = (() => {
            if (hasAlias) {
                const alias = aliasOrFieldsOrWhere;
                if (selectedFields === undefined) {
                    return this.select(alias);
                }
                return this.select(alias, selectedFields);
            }
            return selectedFields === undefined
                ? this.select()
                : this.select(selectedFields);
        })();
        const [result] = await builder.top(1).where(condition);
        return result;
    }
    async findByPrimaryKey(fieldsOrKey, key) {
        const hasFields = arguments.length === 2;
        const primaryKeyValue = hasFields ? key : fieldsOrKey;
        const condition = this.primaryKeyCondition(primaryKeyValue, 'findByPrimaryKey');
        if (hasFields) {
            return this.find(this.resolveFields(fieldsOrKey), condition);
        }
        return this.find(condition);
    }
    /********************************************************************************************************************
     * primaryKeyCondition
     * ******************************************************************************************************************/
    primaryKeyCondition(primaryKeyValue, method) {
        // 固定された MsSqlTable 型で取得し、ジェネリックによる型の拡大を避ける。
        const table = this.t;
        const config = getTableConfig(table);
        const columns = getTableColumns(table);
        const primaryColumns = new Set(config.columns.filter((column) => column.primary));
        for (const primaryKey of config.primaryKeys) {
            for (const column of primaryKey.columns) {
                primaryColumns.add(column);
            }
        }
        const primaryEntries = Object.entries(columns).filter(([, column]) => primaryColumns.has(column));
        if (primaryEntries.length === 0) {
            throw new Error(`${method}: ${config.name} has no primary key.`);
        }
        const isKeyObject = typeof primaryKeyValue === 'object' && primaryKeyValue !== null && !Array.isArray(primaryKeyValue);
        if (primaryEntries.length > 1 && !isKeyObject) {
            throw new Error(`${method}: ${config.name} requires a composite key object.`);
        }
        const keyObject = isKeyObject ? primaryKeyValue : undefined;
        if (keyObject &&
            Object.keys(keyObject).some((name) => !primaryEntries.some(([primaryName]) => primaryName === name))) {
            throw new Error(`${method}: ${config.name} received an unknown primary key field.`);
        }
        const conditions = primaryEntries.map(([name, column]) => {
            if (keyObject && !Object.hasOwn(keyObject, name)) {
                throw new Error(`${method}: missing primary key field "${name}".`);
            }
            const value = keyObject ? keyObject[name] : primaryKeyValue;
            if (value === undefined || value === null) {
                throw new Error(`${method}: primary key field "${name}" must have a value.`);
            }
            return eq(column, value);
        });
        const condition = and(...conditions);
        if (!condition) {
            throw new Error(`${method}: failed to build the primary key condition.`);
        }
        return condition;
    }
    /********************************************************************************************************************
     * exists
     * ******************************************************************************************************************/
    async exists(where) {
        const condition = typeof where === 'function' ? where(this) : where;
        if (condition !== undefined && !is(condition, SQL)) {
            throw new Error('exists: the where callback must return SQL or undefined.');
        }
        const [result] = await this.select({ matched: this.drizzle.sqlNumber(1) })
            .where(condition)
            .orderBy(sql `(select 0)`)
            .offset(0)
            .fetch(1);
        return result !== undefined;
    }
    /********************************************************************************************************************
     * existsByPrimarykey
     * ******************************************************************************************************************/
    async existsByPrimaryKey(key) {
        const result = await this.findByPrimaryKey({ matched: this.drizzle.sqlNumber(1) }, key);
        return result !== undefined;
    }
    /********************************************************************************************************************
     * notExists
     * ******************************************************************************************************************/
    async notExists(where) {
        return !(await this.exists(where));
    }
    /********************************************************************************************************************
     * notExistsByPrimaryKey
     * ******************************************************************************************************************/
    async notExistsByPrimaryKey(key) {
        return !(await this.existsByPrimaryKey(key));
    }
    /********************************************************************************************************************
     * count
     * ******************************************************************************************************************/
    async count(where) {
        var _a;
        const condition = typeof where === 'function' ? where(this) : where;
        if (condition !== undefined && !is(condition, SQL)) {
            throw new Error('count: the where callback must return SQL or undefined.');
        }
        const [row] = await this.select({ cnt: count() }).where(condition);
        return (_a = row === null || row === void 0 ? void 0 : row.cnt) !== null && _a !== void 0 ? _a : 0;
    }
    prepareValues(input, operation) {
        var _a, _b;
        const values = Object.assign({}, input);
        const columns = getTableColumns(this.t);
        const policies = getColumnPolicies(this.t);
        let timestamp;
        let generated = false;
        for (const [key, column] of Object.entries(columns)) {
            const policy = (_a = policies[key]) !== null && _a !== void 0 ? _a : {};
            const auto = 'identity' in column && column.identity !== undefined;
            const rule = operation === 'insert' ? policy.insert : policy.update;
            const primary = column.primary;
            const blocked = (operation === 'update' && policy.timestamp === 'created' && rule !== 'allowed') ||
                rule === 'blocked' ||
                (operation === 'update' && primary && rule !== 'allowed') ||
                (auto && rule !== 'allowed' && rule !== 'required');
            if (blocked && Object.hasOwn(values, key))
                throw new Error(`${operation}: column "${key}" is blocked.`);
            if (operation === 'update' &&
                !blocked &&
                rule === 'required' &&
                policy.timestamp !== 'updated' &&
                values[key] === undefined) {
                throw new Error(`update: column "${key}" is required.`);
            }
            if (policy.timestamp && values[key] === undefined && (operation === 'insert' || policy.timestamp === 'updated')) {
                if (!generated) {
                    const getTimestamp = (_b = this.getTimestamp) !== null && _b !== void 0 ? _b : this.current.getTimestamp;
                    if (!getTimestamp)
                        throw new Error('timestamp generator is not configured');
                    timestamp = getTimestamp();
                    generated = true;
                }
                values[key] = timestamp;
            }
        }
        return values;
    }
    /********************************************************************************************************************
     * (PRIVATE) executeInsert
     * ******************************************************************************************************************/
    async executeInsert(value) {
        const tx = this.getTx();
        const autoIncrementColumn = getTableConfig(this.t).columns.find((column) => 'identity' in column && column.identity !== undefined);
        const hasAutoIncrement = !!autoIncrementColumn;
        const autoIncrementKey = autoIncrementColumn &&
            Object.keys(getTableColumns(this.t)).find((key) => getTableColumns(this.t)[key] === autoIncrementColumn);
        if (hasAutoIncrement) {
            if (Array.isArray(value)) {
                const addedItems = (await tx.insert(this.t).output().values(value));
                return addedItems.map((item) => item[autoIncrementKey]);
            }
            else {
                const [item] = (await tx.insert(this.t).output().values(value));
                return item[autoIncrementKey];
            }
        }
        else {
            if (Array.isArray(value)) {
                await tx.insert(this.t).values(value);
                return Array(value.length).fill(undefined);
            }
            else {
                await tx.insert(this.t).values(value);
                return undefined;
            }
        }
    }
    addValues(values) {
        return values;
    }
    /********************************************************************************************************************
     * editValues
     * ******************************************************************************************************************/
    editValues(values) {
        return values;
    }
    add(value) {
        if (is(value, MsSqlSelectBase)) {
            return this.executeInsertSelect(value);
        }
        const items = Array.isArray(value) ? value : [value];
        const values = items.map((item) => this.prepareValues(item, 'insert'));
        return this.executeInsert((Array.isArray(value) ? values : values[0]));
    }
    async executeInsertSelect(selectQuery) {
        var _a;
        const policies = getColumnPolicies(this.t);
        const timestampColumns = Object.entries(policies).filter(([, policy]) => policy.timestamp === 'created' || policy.timestamp === 'updated');
        let timestamp;
        let generated = false;
        const getTimestamp = (_a = this.getTimestamp) !== null && _a !== void 0 ? _a : this.current.getTimestamp;
        const selectedFields = selectQuery.getSelectedFields();
        const missingTimestamps = timestampColumns.filter(([name]) => !Object.hasOwn(selectedFields, name));
        if (missingTimestamps.length > 0) {
            if (!getTimestamp)
                throw new Error('timestamp generator is not configured');
            const source = selectQuery.as('__insert_source');
            const fields = Object.fromEntries(Object.keys(selectedFields).map((name) => [name, source[name]]));
            for (const [name] of missingTimestamps) {
                if (!generated) {
                    timestamp = getTimestamp();
                    generated = true;
                }
                fields[name] = sql `${timestamp}`.as(name);
            }
            selectQuery = this.getTx()
                .select(fields)
                .from(source);
        }
        const autoIncrementColumn = getTableConfig(this.t).columns.find((column) => 'identity' in column && column.identity !== undefined);
        const rows = (await this.getTx()
            .insert(this.t)
            .output()
            .select(selectQuery));
        if (!autoIncrementColumn)
            return rows.map(() => undefined);
        const columns = getTableColumns(this.t);
        const autoIncrementKey = Object.keys(columns).find((key) => columns[key] === autoIncrementColumn);
        return rows.map((row) => row[autoIncrementKey]);
    }
    /********************************************************************************************************************
     * edit
     * ******************************************************************************************************************/
    edit(set, where) {
        this.assertMutationAllowed('update', 'edit');
        const condition = typeof where === 'function' ? where(this) : where;
        if (!is(condition, SQL)) {
            throw new Error('edit: a SQL where condition is required.');
        }
        const tx = this.getTx();
        return tx
            .update(this.t)
            .set(this.prepareValues(set, 'update'))
            .where(condition);
    }
    /********************************************************************************************************************
     * editByPrimaryKey
     * ******************************************************************************************************************/
    editByPrimaryKey(set, key) {
        this.assertMutationAllowed('update', 'editByPrimaryKey');
        return this.edit(set, this.primaryKeyCondition(key, 'editByPrimaryKey'));
    }
    /********************************************************************************************************************
     * remove
     * ******************************************************************************************************************/
    remove(where) {
        this.assertMutationAllowed('delete', 'remove');
        const tx = this.getTx();
        if (arguments.length === 0) {
            return tx.delete(this.t);
        }
        const condition = typeof where === 'function' ? where(this) : where;
        if (!is(condition, SQL)) {
            throw new Error('remove: a SQL where condition is required.');
        }
        return tx.delete(this.t).where(condition);
    }
    /********************************************************************************************************************
     * removeByPrimaryKey
     * ******************************************************************************************************************/
    removeByPrimaryKey(key) {
        this.assertMutationAllowed('delete', 'removeByPrimaryKey');
        return this.remove(this.primaryKeyCondition(key, 'removeByPrimaryKey'));
    }
    assertMutationAllowed(operation, method) {
        const policy = getTablePolicy(this.t);
        if (operation === 'update' ? policy.updateBlocked : policy.deleteBlocked) {
            throw new Error(`${method}: ${operation} is blocked for table "${getTableConfig(this.t).name}".`);
        }
    }
    eq(tableOrValues, nameOrValue, value) {
        if (typeof tableOrValues === 'string') {
            return eq(this.resolveConditionColumn(tableOrValues, this.t), nameOrValue);
        }
        if (isTable(tableOrValues)) {
            return eq(this.resolveConditionColumn(nameOrValue, tableOrValues), value);
        }
        return this.drizzle.eq(this.t, tableOrValues);
    }
    orGt(values) {
        return this.drizzle.orGt(this.t, values);
    }
    orGte(values) {
        return this.drizzle.orGte(this.t, values);
    }
    orLt(values) {
        return this.drizzle.orLt(this.t, values);
    }
    orLte(values) {
        return this.drizzle.orLte(this.t, values);
    }
    orInArray(values) {
        return this.drizzle.orInArray(this.t, values);
    }
    orNotInArray(values) {
        return this.drizzle.orNotInArray(this.t, values);
    }
    orBetween(values) {
        return this.drizzle.orBetween(this.t, values);
    }
    orNotBetween(values) {
        return this.drizzle.orNotBetween(this.t, values);
    }
    orLike(values) {
        return this.drizzle.orLike(this.t, values);
    }
    orNotLike(values) {
        return this.drizzle.orNotLike(this.t, values);
    }
    orIlike(values) {
        return this.drizzle.orIlike(this.t, values);
    }
    orNotIlike(values) {
        return this.drizzle.orNotIlike(this.t, values);
    }
    orIsNull(values) {
        return this.drizzle.orIsNull(this.t, values);
    }
    orIsNotNull(values) {
        return this.drizzle.orIsNotNull(this.t, values);
    }
    /** 객체의 컬럼별 동등 비교를 OR로 결합한다. */
    orEq(values) {
        return this.drizzle.orEq(this.t, values);
    }
    /** 객체의 컬럼별 비동등 비교를 OR로 결합한다. */
    orNe(values) {
        return this.drizzle.orNe(this.t, values);
    }
    /********************************************************************************************************************
     * ne
     * ******************************************************************************************************************/
    ne(values) {
        return this.drizzle.ne(this.t, values);
    }
    /********************************************************************************************************************
     * gt
     * ******************************************************************************************************************/
    gt(values) {
        return this.drizzle.gt(this.t, values);
    }
    /********************************************************************************************************************
     * gte
     * ******************************************************************************************************************/
    gte(values) {
        return this.drizzle.gte(this.t, values);
    }
    /********************************************************************************************************************
     * lt
     * ******************************************************************************************************************/
    lt(values) {
        return this.drizzle.lt(this.t, values);
    }
    /********************************************************************************************************************
     * lte
     * ******************************************************************************************************************/
    lte(values) {
        return this.drizzle.lte(this.t, values);
    }
    /********************************************************************************************************************
     * lte
     * ******************************************************************************************************************/
    inArray(values) {
        return this.drizzle.inArray(this.t, values);
    }
    /********************************************************************************************************************
     * notInArray
     * ******************************************************************************************************************/
    notInArray(values) {
        return this.drizzle.notInArray(this.t, values);
    }
    /********************************************************************************************************************
     * between
     * ******************************************************************************************************************/
    between(values) {
        return this.drizzle.between(this.t, values);
    }
    /********************************************************************************************************************
     * notBetween
     * ******************************************************************************************************************/
    notBetween(values) {
        return this.drizzle.notBetween(this.t, values);
    }
    /********************************************************************************************************************
     * like
     * ******************************************************************************************************************/
    like(values) {
        return this.drizzle.like(this.t, values);
    }
    /********************************************************************************************************************
     * notLike
     * ******************************************************************************************************************/
    notLike(values) {
        return this.drizzle.notLike(this.t, values);
    }
    /********************************************************************************************************************
     * ilike
     * ******************************************************************************************************************/
    ilike(values) {
        return this.drizzle.ilike(this.t, values);
    }
    /********************************************************************************************************************
     * notIlike
     * ******************************************************************************************************************/
    notIlike(values) {
        return this.drizzle.notIlike(this.t, values);
    }
    isNull(names) {
        return this.drizzle.isNull(this.t, names);
    }
    isNotNull(names) {
        return this.drizzle.isNotNull(this.t, names);
    }
    and(options, ...conditions) {
        if (typeof options === 'object' && options !== null && !('getSQL' in options)) {
            return this.drizzle.and(this.t, options);
        }
        return and(...[options, ...conditions].filter((condition) => condition !== false));
    }
    or(options, ...conditions) {
        if (typeof options === 'object' && options !== null && !('getSQL' in options)) {
            return this.drizzle.or(this.t, options);
        }
        return or(...[options, ...conditions].filter((condition) => condition !== false));
    }
}
const normalizeFields = (fields, table) => {
    if (fields === undefined)
        return undefined;
    const groups = Array.isArray(fields) ? fields : [fields];
    const result = {};
    for (const group of groups) {
        if (Array.isArray(fields) && (group === false || group === undefined))
            continue;
        if (Array.isArray(fields) && typeof group === 'string') {
            if (!table)
                throw new Error('fields: a table is required for column-name selections.');
            Object.assign(result, sourceColumns(table, [group]));
            continue;
        }
        if (typeof group !== 'object' || group === null || Array.isArray(group) || isTable(group) || is(group, SQL)) {
            throw new Error('fields: expected a selection object or an array of selection objects.');
        }
        Object.assign(result, group);
    }
    for (const [name, field] of Object.entries(result)) {
        if (typeof field === 'string') {
            const column = table && (is(table, Subquery) ? sourceColumns(table) : getTableColumns(table))[field];
            if (!column)
                throw new Error(`select: unknown column "${field}".`);
            const decoder = is(column, MsSqlColumn)
                ? column
                : is(column, SQL.Aliased)
                    ? column.sql.decoder
                    : (value) => value;
            result[name] = sql `${column}`.mapWith(decoder).as(name);
            continue;
        }
        if (is(field, SQL)) {
            result[name] = field.as(name);
            continue;
        }
        if (is(field, SQL.Aliased))
            continue;
        if (is(field, MsSqlColumn) && field.name !== name) {
            result[name] = sql `${field}`.mapWith(field).as(name);
            continue;
        }
        if (typeof field === 'object' && field !== null && 'getSQL' in field && typeof field.getSQL === 'function') {
            result[name] = sql `${field}`.as(name);
        }
    }
    return result;
};
function sourceColumns(source, names = []) {
    return is(source, Subquery)
        ? TableColumns(source, ...names)
        : TableColumns(source, ...names);
}const createOrderByHelper = (direction) => {
    const implementation = (...args) => {
        let columns;
        if (isTable(args[0])) {
            const [table, ...names] = args;
            const tableColumns = getTableColumns(table);
            columns = names.map((name) => {
                const column = tableColumns[name];
                if (!column)
                    throw new Error(`orderBy: unknown column "${name}".`);
                return column;
            });
        }
        else {
            columns = args;
        }
        const orders = columns.map(direction);
        return orders.length === 1 ? orders[0] : orders;
    };
    return implementation;
};
const asc = createOrderByHelper(native.asc);
const desc = createOrderByHelper(native.desc);
function createConnection(options) {
    const { url, schema, getTimestamp } = options, connectionOptions = __rest(options, ["url", "schema", "getTimestamp"]);
    if (url && Object.keys(connectionOptions).some((key) => key !== 'options')) {
        throw new TypeError('url cannot be combined with direct connection settings.');
    }
    const connectionConfig = url
        ? getMsSqlConnectionParams(url)
        : connectionOptions;
    const drizzleConnection = url && connectionOptions.options
        ? Object.assign(Object.assign({}, (typeof connectionConfig === 'string'
            ? mssql.ConnectionPool.parseConnectionString(connectionConfig)
            : connectionConfig)), { options: connectionOptions.options }) : connectionConfig;
    // 현재 Drizzle 구현은 config 객체를 지원하지만 공개 타입은 connection을 string으로만 선언한다.
    const raw = drizzle({ connection: drizzleConnection, relations: defineRelations(schema) });
    const context = new AsyncLocalStorage();
    const timestampFactory = getTimestamp !== null && getTimestamp !== void 0 ? getTimestamp : (() => new Date());
    const current = Object.assign(() => { var _a; return (_a = context.getStore()) !== null && _a !== void 0 ? _a : raw; }, { getTimestamp: timestampFactory });
    const trans = (callback) => {
        const parent = context.getStore();
        const execute = (tx) => context.run(tx, callback);
        return parent ? parent.transaction(execute) : raw.transaction(execute);
    };
    const paginate = async (builder, page, limit) => {
        var _a, _b, _c;
        if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
            throw new RangeError('page and limit must be positive integers');
        }
        const offset = (page - 1) * limit;
        // Drizzle의 SQL Server 빌더는 offset/fetch가 호출된 빌더의 설정을 직접 변경한다.
        // 집계와 데이터 조회 모두 SQL Server 2012의 ORDER BY ... OFFSET 문법을 따라야 한다.
        const config = builder.config;
        const tail = (_a = config.setOperators[config.setOperators.length - 1]) !== null && _a !== void 0 ? _a : config;
        if (!((_b = tail.orderBy) === null || _b === void 0 ? void 0 : _b.length)) {
            builder.orderBy(sql `(select 0)`);
        }
        // 같은 빌더로 재호출할 때 이전 페이지의 FETCH가 전체 건수에 섞이지 않도록 한다.
        tail.fetch = undefined;
        const [countRow] = await current().select({ total: count() }).from(builder.offset(0).as('a'));
        const total = (_c = countRow === null || countRow === void 0 ? void 0 : countRow.total) !== null && _c !== void 0 ? _c : 0;
        const data = await builder.offset(offset).fetch(limit);
        return {
            data,
            paging: {
                current_page: page,
                per_page: limit,
                last_page: Math.ceil(total / limit),
                total,
                from: offset,
                to: offset + data.length,
            },
        };
    };
    return { current, trans, paginate, close: async () => (await raw.$client.$instance()).close() };
}
function drizzleMsSql(options) {
    const connection = createConnection(options);
    function select(tableOrName, fields) {
        const table = typeof tableOrName === 'string' ? options.schema[tableOrName] : tableOrName;
        if (!table)
            throw new Error(`select: unknown table "${tableOrName}".`);
        if (is(table, native.Subquery)) {
            // select의 서브쿼리 분기는 기준 테이블 대신 전달한 source를 사용한다.
            return new MsSqlQuery(table, connection.current).select(table, fields);
        }
        return new MsSqlQuery(table, connection.current).select(fields);
    }
    return Object.assign(Object.assign(Object.assign(Object.assign({ select: select, asc,
        desc, count: native.count, countDistinct: native.countDistinct, avg: native.avg, avgDistinct: native.avgDistinct, sum: native.sum, sumDistinct: native.sumDistinct, max: native.max, min: native.min, not: native.not, exists: native.exists, notExists: native.notExists, arrayContains: native.arrayContains, arrayContained: native.arrayContained, arrayOverlaps: native.arrayOverlaps, s: options.schema, a: createAlias(options.schema) }, createConditions(options.schema)), { columns: TableColumns, alias: alias$1,
        sql, sqlNumber: (value) => (is(value, SQL) ? value : sql `${value}`).mapWith(Number), sqlString: (value) => (is(value, SQL) ? value : sql `${value}`).mapWith(String), sqlBoolean: (value) => (is(value, SQL) ? value : sql `${value}`).mapWith((v) => v === true || v === 1) }), connection), { query: (table) => new MsSqlQuery(table, connection.current) });
}export{MsSqlQuery,TableColumns,createConditions,drizzleMsSql as default,drizzleMsSql,mssqlTable};