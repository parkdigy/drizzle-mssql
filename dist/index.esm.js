import {drizzle}from'drizzle-orm/node-mssql';import*as native from'drizzle-orm';import {isTable,getTableColumns,sql,min,max,asc,desc,is,SQL,eq,and,count,defineRelations}from'drizzle-orm';export{asc,avg,avgDistinct,count,countDistinct,desc,exists,max,min,not,notExists,sum,sumDistinct}from'drizzle-orm';import {AsyncLocalStorage}from'node:async_hooks';import {alias}from'drizzle-orm/mssql-core/alias';import {MsSqlTable,mssqlTable as mssqlTable$1,getTableConfig,MsSqlColumn}from'drizzle-orm/mssql-core';export{bigint,binary,bit,char,check,customType,date,datetime,datetime2,datetimeoffset,decimal,float,foreignKey,index,int,mssqlSchema,mssqlTableCreator,mssqlView,nchar,ntext,numeric,nvarchar,primaryKey,real,smallint,text,time,tinyint,unique,uniqueIndex,varbinary,varchar}from'drizzle-orm/mssql-core';import {MsSqlColumnBuilder}from'drizzle-orm/mssql-core/columns/common';function createAlias(schema) {
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
        if (!Object.hasOwn(schema, table)) {
            throw new Error(`Condition: unknown table "${table}".`);
        }
        return schema[table];
    };
    const getColumn = (table, name) => {
        const columns = native.getTableColumns(table);
        if (!Object.hasOwn(columns, name)) {
            throw new Error(`Condition: unknown column "${name}".`);
        }
        return columns[name];
    };
    const recordEntries = (values) => {
        if (typeof values !== 'object' || values === null || Array.isArray(values)) {
            throw new Error('Condition: expected a column/value object.');
        }
        return Object.entries(values);
    };
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
                if (!Array.isArray(value))
                    throw new Error(`${operator}: expected an array.`);
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
    const objectOperator = (operator) => (table, values) => native.and(...valueConditions(resolveTable(table), values, operator));
    // Tables use object dispatch at runtime, not the native SQLWrapper/unknown overload.
    const binaryOperator = (operator) => extendOperator(native[operator], objectOperator(operator));
    const nullOperator = (operator) => ((table, input) => {
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
        return native.and(...conditions);
    });
    const groupOperator = (operator) => (input, options) => {
        const table = resolveTable(input);
        const sqlConditions = [];
        for (const [name, values] of recordEntries(options)) {
            if (!Object.hasOwn(conditions, name) || name === 'and' || name === 'or') {
                throw new Error(`Condition: unknown operator "${name}".`);
            }
            if (values === undefined)
                continue;
            if (name === 'isNull' || name === 'isNotNull') {
                const condition = nullOperator(name)(table, values);
                if (condition !== undefined)
                    sqlConditions.push(condition);
            }
            else {
                const group = native.and(...valueConditions(table, values, name));
                if (group !== undefined)
                    sqlConditions.push(group);
            }
        }
        return native[operator](...sqlConditions);
    };
    const logicalOperator = (operator) => extendOperator((...conditions) => native[operator](...conditions.filter((condition) => condition !== false && condition !== undefined)), groupOperator(operator));
    const conditions = {
        eq: binaryOperator('eq'),
        ne: binaryOperator('ne'),
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
        and: logicalOperator('and'),
        or: logicalOperator('or'),
    };
    return conditions;
}function TableColumns(first, ...rest) {
    var _a, _b;
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
            const name = ((_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : selection).trim();
            const alias = (_b = match === null || match === void 0 ? void 0 : match[2]) === null || _b === void 0 ? void 0 : _b.trim();
            if (!Object.hasOwn(tableColumns, name)) {
                throw new Error(`columns: unknown column "${name}".`);
            }
            if (alias)
                selected[alias] = sql `${tableColumns[name]}`.as(alias);
            else
                selected[tableColumns[name].name] = tableColumns[name];
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
        const columns = getTableColumns(table);
        if (!Object.hasOwn(columns, columnOrName))
            throw new Error(`aggregate: unknown column "${columnOrName}".`);
        return columns[columnOrName];
    }
    resolveOrderColumn(name, table) {
        if (name === undefined)
            throw new Error('orderBy: column name is required.');
        const columns = getTableColumns(table);
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
        return asc(this.resolveOrderColumn(columnName, table));
    }
    desc(tableOrName, name) {
        const table = typeof tableOrName === 'string' ? this.t : tableOrName;
        const columnName = typeof tableOrName === 'string' ? tableOrName : name;
        return desc(this.resolveOrderColumn(columnName, table));
    }
    resolveFields(fields, table = this.t) {
        if (Array.isArray(fields) && fields.length > 0 && fields.every((field) => typeof field === 'string')) {
            return TableColumns(table, ...fields);
        }
        if (typeof fields !== 'function')
            return normalizeFields(fields, table);
        const query = {
            t: table,
            columns: (...names) => TableColumns(table, ...names),
            min: (columnOrName) => min(this.resolveAggregateColumn(columnOrName, table)),
            max: (columnOrName) => max(this.resolveAggregateColumn(columnOrName, table)),
        };
        return normalizeFields(fields(query), table);
    }
    select(fieldsOrAlias, fields) {
        const tx = this.getTx();
        const isAlias = isTable(fieldsOrAlias);
        const table = isAlias ? fieldsOrAlias : this.t;
        const selectedFields = this.resolveFields(isAlias ? fields : fieldsOrAlias, table);
        const selectBuilder = tx.select(selectedFields !== null && selectedFields !== void 0 ? selectedFields : TableColumns(table));
        const enhance = (query) => {
            if (typeof query !== 'object' || query === null)
                return query;
            const builder = query;
            const originalWhere = builder.where.bind(query);
            const bindCondition = (operator) => (input) => Reflect.apply(this.drizzle[operator], undefined, [table, input]);
            const whereQuery = {
                t: table,
                eq: bindCondition('eq'),
                ne: bindCondition('ne'),
                gt: bindCondition('gt'),
                gte: bindCondition('gte'),
                lt: bindCondition('lt'),
                lte: bindCondition('lte'),
                inArray: bindCondition('inArray'),
                notInArray: bindCondition('notInArray'),
                between: bindCondition('between'),
                notBetween: bindCondition('notBetween'),
                like: bindCondition('like'),
                notLike: bindCondition('notLike'),
                ilike: bindCondition('ilike'),
                notIlike: bindCondition('notIlike'),
                isNull: bindCondition('isNull'),
                isNotNull: bindCondition('isNotNull'),
                and: bindCondition('and'),
                or: bindCondition('or'),
            };
            return Object.assign(query, {
                where: (condition) => originalWhere(typeof condition === 'function'
                    ? () => condition(whereQuery)
                    : condition),
                top: (count) => typeof selectBuilder.top === 'function' ? enhance(selectBuilder.top(count).from(table)) : query,
            });
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
        const condition = typeof where === 'function' ? where(this) : where;
        if (condition !== undefined && !is(condition, SQL)) {
            throw new Error('count: the where callback must return SQL or undefined.');
        }
        const [{ cnt }] = await this.select({ cnt: count() }).where(condition);
        return cnt;
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
            const blocked = (operation === 'update' && policy.timestamp === 'created') ||
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
        const items = Array.isArray(value) ? value : [value];
        const values = items.map((item) => this.prepareValues(item, 'insert'));
        return this.executeInsert((Array.isArray(value) ? values : values[0]));
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
        const condition = typeof where === 'function' ? where(this) : where;
        if (!is(condition, SQL)) {
            throw new Error('remove: a SQL where condition is required.');
        }
        const tx = this.getTx();
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
    /********************************************************************************************************************
     * and
     * ******************************************************************************************************************/
    and(options) {
        return this.drizzle.and(this.t, options);
    }
    /********************************************************************************************************************
     * or
     * ******************************************************************************************************************/
    or(options) {
        return this.drizzle.or(this.t, options);
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
        if (typeof group !== 'object' || group === null || Array.isArray(group) || isTable(group) || is(group, SQL)) {
            throw new Error('fields: expected a selection object or an array of selection objects.');
        }
        Object.assign(result, group);
    }
    for (const [name, field] of Object.entries(result)) {
        if (typeof field === 'string') {
            const column = table && getTableColumns(table)[field];
            if (!column)
                throw new Error(`select: unknown column "${field}".`);
            result[name] = sql `${column}`.mapWith(column).as(name);
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
};function createConnection(options) {
    const raw = drizzle({ connection: options.url, relations: defineRelations(options.schema) });
    const context = new AsyncLocalStorage();
    const current = Object.assign(() => { var _a; return (_a = context.getStore()) !== null && _a !== void 0 ? _a : raw; }, { getTimestamp: options.getTimestamp });
    const trans = (callback) => {
        const parent = context.getStore();
        const execute = (tx) => context.run(tx, callback);
        return parent ? parent.transaction(execute) : raw.transaction(execute);
    };
    const paginate = async (builder, page, limit) => {
        var _a;
        if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
            throw new RangeError('page and limit must be positive integers');
        }
        const offset = (page - 1) * limit;
        // Drizzle의 SQL Server 빌더는 offset/fetch가 호출된 빌더의 설정을 직접 변경한다.
        // 집계와 데이터 조회 모두 SQL Server 2012의 ORDER BY ... OFFSET 문법을 따라야 한다.
        const config = builder.config;
        const tail = config.setOperators.length ? config.setOperators[config.setOperators.length - 1] : config;
        if (!((_a = tail.orderBy) === null || _a === void 0 ? void 0 : _a.length)) {
            builder.orderBy(sql `(select 0)`);
        }
        // 같은 빌더로 재호출할 때 이전 페이지의 FETCH가 전체 건수에 섞이지 않도록 한다.
        tail.fetch = undefined;
        const [{ total }] = await current().select({ total: count() }).from(builder.offset(0).as('a'));
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
    return Object.assign(Object.assign(Object.assign(Object.assign({ asc: native.asc, desc: native.desc, count: native.count, countDistinct: native.countDistinct, avg: native.avg, avgDistinct: native.avgDistinct, sum: native.sum, sumDistinct: native.sumDistinct, max: native.max, min: native.min, not: native.not, exists: native.exists, notExists: native.notExists, arrayContains: native.arrayContains, arrayContained: native.arrayContained, arrayOverlaps: native.arrayOverlaps, s: options.schema, a: createAlias(options.schema) }, createConditions(options.schema)), { columns: TableColumns, sql, sqlNumber: (value) => (is(value, SQL) ? value : sql `${value}`).mapWith(Number), sqlString: (value) => (is(value, SQL) ? value : sql `${value}`).mapWith(String), sqlBoolean: (value) => (is(value, SQL) ? value : sql `${value}`).mapWith((v) => v === true || v === 1) }), connection), { query: (table) => new MsSqlQuery(table, connection.current) });
}export{MsSqlQuery,TableColumns,createConditions,drizzleMsSql as default,drizzleMsSql,mssqlTable};