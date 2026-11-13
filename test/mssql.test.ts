import { drizzle } from 'drizzle-orm/node-mssql';
import { asc as drizzleAsc, eq as drizzleEq, sql, type SQL } from 'drizzle-orm';
import { int, mssqlTable, nvarchar, primaryKey } from 'drizzle-orm/mssql-core';
import { MsSqlQuery } from '../src/MsSqlQuery';
import { createConditions } from '../src/conditions';
import { createAlias } from '../src/alias';
import { TableColumns } from '../src/columns';

const users = mssqlTable('users', {
  id: int('id').identity().primaryKey(),
  name: nvarchar('name', { length: 100 }).notNull(),
});
const memberships = mssqlTable(
  'memberships',
  {
    userId: int('user_id').notNull(),
    groupId: int('group_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.groupId] })]
);
const db = drizzle.mock();
const usersQuery = new MsSqlQuery(
  users,
  () => db,
  () => new Date()
);

test('컬럼 선택과 조건을 MSSQL SQL로 생성한다', () => {
  const query = usersQuery
    .select(['id', 'name'])
    .where(usersQuery.eq({ name: '홍길동' }))
    .toSQL();
  expect(query.sql).toMatch(/select .* from \[users\] where \[users\]\.\[name\] = @par0/i);
  expect(query.params).toEqual(['홍길동']);
});

test('where 콜백에는 컬럼 대신 조건 헬퍼만 제공한다', () => {
  const alias = createAlias({ users }).users('u');
  if (false) {
    usersQuery.select(['id']).where((q) => {
      // @ts-expect-error where 콜백은 테이블 컬럼을 노출하지 않는다.
      return drizzleEq(q.name, 'Ada');
    });
    usersQuery.select(alias, ['id']).where((q) => {
      // @ts-expect-error 별칭 테이블 컬럼도 조건 헬퍼로만 참조한다.
      return drizzleEq(q.name, 'Ada');
    });
  }
});

test('where 콜백에서 테이블 컬럼과 조건 헬퍼를 함께 사용한다', () => {
  const alias = createAlias({ users }).users('u');
  const tableColumn = usersQuery
    .select(['id'])
    .where((q) => drizzleEq(q.t.name, 'Ada'))
    .toSQL();
  const aliasTableColumn = usersQuery
    .select(alias, ['id'])
    .where((q) => drizzleEq(q.t.name, 'Ada'))
    .toSQL();
  const queryCondition = usersQuery
    .select(['id'])
    .where((q) => q.eq({ name: 'Ada' }))
    .toSQL();
  const groupedCondition = usersQuery
    .select(['id'])
    .where((q) => q.and({ eq: { name: 'Ada' }, gt: { id: 1 } }))
    .toSQL();
  const aliasCondition = usersQuery
    .select(alias, ['id'])
    .where((q) => q.eq({ name: 'Ada' }))
    .toSQL();

  expect(tableColumn.sql).toMatch(/where \[users\]\.\[name\] = @par0/i);
  expect(tableColumn.params).toEqual(['Ada']);
  expect(aliasTableColumn.sql).toMatch(/where \[u\]\.\[name\] = @par0/i);
  expect(aliasTableColumn.params).toEqual(['Ada']);
  expect(queryCondition.sql).toMatch(/where \[users\]\.\[name\] = @par0/i);
  expect(queryCondition.params).toEqual(['Ada']);
  expect(groupedCondition.sql).toMatch(/where \(\(\[users\]\.\[name\] = @par0\) and \(\[users\]\.\[id\] > @par1\)\)/i);
  expect(groupedCondition.params).toEqual(['Ada', 1]);
  expect(aliasCondition.sql).toMatch(/where \[u\]\.\[name\] = @par0/i);
  expect(aliasCondition.params).toEqual(['Ada']);
});

test('and 객체 조건 안에서 or 조건을 중첩한다', () => {
  const directCondition = usersQuery
    .select(['id'])
    .where(
      usersQuery.and({
        eq: { id: 1 },
        or: {
          eq: { name: 'name' },
          ne: { name: 'name2' },
        },
      })
    )
    .toSQL();
  const callbackCondition = usersQuery
    .select(['id'])
    .where((q) =>
      q.and({
        eq: { id: 1 },
        or: {
          eq: { name: 'name' },
          ne: { name: 'name2' },
        },
      })
    )
    .toSQL();

  expect(directCondition.sql).toMatch(/\[users\]\.\[id\] = @par0/);
  expect(directCondition.sql).toMatch(/\[users\]\.\[name\] = @par1/);
  expect(directCondition.sql).toMatch(/\[users\]\.\[name\] <> @par2/);
  expect(directCondition.params).toEqual([1, 'name', 'name2']);
  expect(callbackCondition.sql).toBe(directCondition.sql);
  expect(callbackCondition.params).toEqual(directCondition.params);
  expect(() => Reflect.apply(usersQuery.and, usersQuery, [{ and: {} }])).toThrow('cannot nest "and" inside itself');
  expect(() => Reflect.apply(usersQuery.or, usersQuery, [{ or: {} }])).toThrow('cannot nest "or" inside itself');
});

test('join 콜백은 조인 컬럼 조건 헬퍼와 기준 테이블 q.t를 제공한다', () => {
  const baseAlias = createAlias({ users }).users('base');
  const joinAlias = createAlias({ users }).users('joined');
  const query = usersQuery
    .select()
    .innerJoin(joinAlias, (q) => q.eq({ id: q.t.id }))
    .toSQL();
  const aliasQuery = usersQuery
    .select(baseAlias)
    .innerJoin(joinAlias, (q) => q.eq({ id: q.t.id }))
    .toSQL();

  expect(query.sql).toMatch(/inner join \[users\] \[joined\] on \[joined\]\.\[id\] = \[users\]\.\[id\]/i);
  expect(aliasQuery.sql).toMatch(/inner join \[users\] \[joined\] on \[joined\]\.\[id\] = \[base\]\.\[id\]/i);
});

test('조인 후 where 콜백도 조인 전과 같은 조건 헬퍼를 제공한다', () => {
  const joinedTable = createAlias({ users }).users('joined');
  const secondJoinedTable = createAlias({ users }).users('second_joined');
  const beforeJoin = usersQuery
    .select()
    .where((q) => q.eq({ id: 1 }))
    .toSQL();
  const afterJoin = usersQuery
    .select()
    .innerJoin(joinedTable, drizzleEq(joinedTable.id, users.id))
    .where((q) => q.eq({ id: 1 }))
    .toSQL();
  const afterTwoJoins = usersQuery
    .select()
    .innerJoin(joinedTable, drizzleEq(joinedTable.id, users.id))
    .innerJoin(secondJoinedTable, drizzleEq(secondJoinedTable.id, users.id))
    .where((q) => q.eq({ id: 1 }))
    .orderBy((q) => q.desc('name'))
    .toSQL();

  expect(beforeJoin.sql).toMatch(/where \[users\]\.\[id\] = @par0/i);
  expect(afterJoin.sql).toMatch(
    /inner join \[users\] \[joined\] on \[joined\]\.\[id\] = \[users\]\.\[id\] where \[users\]\.\[id\] = @par0/i
  );
  expect(afterJoin.params).toEqual([1]);
  expect(afterTwoJoins.sql).toMatch(
    /inner join \[users\] \[joined\].*inner join \[users\] \[second_joined\].*where \[users\]\.\[id\] = @par0 order by \[users\]\.\[name\] desc/i
  );
  expect(afterTwoJoins.params).toEqual([1]);
});

test('select 서브쿼리를 직접 조건으로 조인한다', () => {
  const builder = usersQuery.select(['id']).top(1).orderBy(usersQuery.desc('id'));
  const subquery = builder.as('latest');
  const query = usersQuery.select().innerJoin(subquery, drizzleEq(subquery.id, users.id)).toSQL();
  const callbackQuery = usersQuery
    .select()
    .innerJoin(subquery, (q) => q.eq({ id: q.t.id }))
    .toSQL();

  expect(query.sql).toMatch(
    /inner join \(select top\(@par0\) \[id\] from \[users\] order by \[users\]\.\[id\] desc\) \[latest\] on \[latest\]\.\[id\] = \[users\]\.\[id\]/i
  );
  expect(query.params).toEqual([1]);
  expect(callbackQuery.sql).toMatch(
    /inner join \(select top\(@par0\) \[id\] from \[users\] order by \[users\]\.\[id\] desc\) \[latest\] on \[latest\]\.\[id\] = \[users\]\.\[id\]/i
  );
  expect(callbackQuery.params).toEqual([1]);
});

test('서브쿼리 별칭의 컬럼을 columns 선택자로 고른다', () => {
  const builder = usersQuery.select(['id']).top(1).orderBy(usersQuery.desc('id'));
  const subquery = builder.as('latest');
  const query = usersQuery
    .select(TableColumns(subquery, 'id'))
    .innerJoin(subquery, drizzleEq(subquery.id, users.id))
    .toSQL();

  expect(query.sql).toMatch(
    /select \[latest\]\.\[id\] as \[id\] from \[users\] inner join \(select top\(@par0\) \[id\] from \[users\] order by \[users\]\.\[id\] desc\) \[latest\] on \[latest\]\.\[id\] = \[users\]\.\[id\]/i
  );
  expect(query.params).toEqual([1]);
});

test('select 빌더에서 top 제한을 지정한다', () => {
  const query = usersQuery.select(['id', 'name']).top(1);
  type Row = Awaited<typeof query>[number];
  const row: Row = { id: 1, name: 'Ada' };

  expect(query.toSQL().sql).toMatch(/^select top\(@par0\) \[id\], \[name\] from \[users\]/i);
  expect(query.toSQL().params).toEqual([1]);
  expect(row).toEqual({ id: 1, name: 'Ada' });
});

test('eq에서 컬럼명 또는 별칭 컬럼과 서브쿼리 빌더를 비교한다', () => {
  const builder = usersQuery.select(['id']).top(1).orderBy(usersQuery.desc('id'));
  const alias = createAlias({ users }).users('u');
  const condition = db.select().from(users).where(usersQuery.eq('id', builder)).toSQL();
  const aliasCondition = db
    .select()
    .from(alias)
    .where(usersQuery.eq(alias, 'id', builder))
    .toSQL();

  expect(condition.sql).toMatch(
    /where \[users\]\.\[id\] = \(select top\(@par0\) \[id\] from \[users\] order by \[users\]\.\[id\] desc\)/i
  );
  expect(condition.params).toEqual([1]);
  expect(aliasCondition.sql).toMatch(
    /where \[u\]\.\[id\] = \(select top\(@par0\) \[id\] from \[users\] order by \[users\]\.\[id\] desc\)/i
  );
  expect(aliasCondition.params).toEqual([1]);
});

test('서브쿼리 SQL 표현식과 일반 컬럼을 함께 선택한다', () => {
  const builder = usersQuery.select(['id']).top(1).orderBy(usersQuery.desc('id'));
  const statement = usersQuery.select({ id: 'id', test: builder });
  type Row = Awaited<typeof statement>[number];
  const row: Row = { id: 1, test: 1 };
  const selected = statement.toSQL();

  expect(selected.sql).toMatch(
    /select .*\[id\] as \[id\].*\(select top\(@par0\) \[id\] from \[users\] order by \[users\]\.\[id\] desc\) as \[test\] from \[users\]/i
  );
  expect(selected.params).toEqual([1]);
  expect(row).toEqual({ id: 1, test: 1 });
  const rawSqlSelection = usersQuery.select({ id: 'id', test: sql`(${builder})` }).toSQL();
  expect(rawSqlSelection.sql).toMatch(/as \[test\] from \[users\]/i);
});

test('컬럼명과 별칭 테이블로 오름차순과 내림차순을 지정한다', () => {
  const alias = createAlias({ users }).users('u');
  const descending = usersQuery.select().orderBy(usersQuery.desc('id')).toSQL();
  const ascending = usersQuery.select().orderBy(usersQuery.asc('id')).toSQL();
  const callbackDescending = usersQuery
    .select(['id'])
    .orderBy((q) => q.desc('id'))
    .toSQL();
  const callbackAscending = usersQuery
    .select(['id'])
    .orderBy((q) => q.asc('id'))
    .toSQL();
  const callbackColumn = usersQuery
    .select(['id'])
    .orderBy((q) => drizzleAsc(q.t.id))
    .toSQL();
  const aliasDescending = usersQuery.select(alias).orderBy(usersQuery.desc(alias, 'id')).toSQL();
  const aliasAscending = usersQuery.select(alias).orderBy(usersQuery.asc(alias, 'id')).toSQL();

  expect(descending.sql).toMatch(/order by \[users\]\.\[id\] desc/i);
  expect(ascending.sql).toMatch(/order by \[users\]\.\[id\] asc/i);
  expect(callbackDescending.sql).toMatch(/order by \[users\]\.\[id\] desc/i);
  expect(callbackAscending.sql).toMatch(/order by \[users\]\.\[id\] asc/i);
  expect(callbackColumn.sql).toMatch(/order by \[users\]\.\[id\] asc/i);
  expect(aliasDescending.sql).toMatch(/order by \[u\]\.\[id\] desc/i);
  expect(aliasAscending.sql).toMatch(/order by \[u\]\.\[id\] asc/i);
  expect(() => usersQuery.desc('missing' as never)).toThrow('orderBy: unknown column "missing".');
});

test('select 빌더를 조건과 선택 필드의 서브쿼리로 사용한다', () => {
  const builder = usersQuery.select({ id: usersQuery.min('id').as('id') }).where(usersQuery.gt({ id: 2 }));
  const condition = db
    .select()
    .from(users)
    .where(usersQuery.eq({ id: builder }))
    .toSQL();
  const selected = usersQuery.select({ sub_query_value: sql`(${builder})`.as('sub_query_value') }).toSQL();

  expect(condition.sql).toMatch(
    /where \[users\]\.\[id\] = \(select min\(\[id\]\) as \[id\] from \[users\] where \[users\]\.\[id\] > @par0\)/i
  );
  expect(condition.params).toEqual([2]);
  expect(selected.sql).toMatch(
    /select \(\(select min\(\[id\]\) as \[id\] from \[users\] where \[users\]\.\[id\] > @par0\)\) as \[sub_query_value\] from \[users\]/i
  );
  expect(selected.params).toEqual([2]);
});

test('문자열 컬럼 매핑 객체의 키를 결과 별칭으로 사용한다', () => {
  const selected = usersQuery.select({ id_2: 'id', display_name: 'name' });
  type Row = Awaited<typeof selected>[number];
  const row: Row = { id_2: 1, display_name: 'Ada' };
  expect(selected.toSQL().sql).toMatch(/select \[id\] as \[id_2\], \[name\] as \[display_name\] from \[users\]/i);
  expect(row).toEqual({ id_2: 1, display_name: 'Ada' });
  expect(() => usersQuery.select({ missing: 'missing' } as never)).toThrow('select: unknown column "missing".');
  if (false) {
    const found = usersQuery.find({ id_2: 'id' });
    const foundByPrimaryKey = usersQuery.findByPrimaryKey({ id_2: 'id' }, 1);
    const aggregates = usersQuery.find({ min_id: usersQuery.min('id'), max_name: usersQuery.max('name') });
    const aggregatesWithCondition = usersQuery.find(
      { min_id: usersQuery.min('id'), max_name: usersQuery.max('name') },
      usersQuery.eq({ id: 1 })
    );
    const aggregatesByPrimaryKey = usersQuery.findByPrimaryKey(
      { min_id: usersQuery.min('id'), max_name: usersQuery.max('name') },
      1
    );
    type FoundRow = NonNullable<Awaited<typeof found>>;
    const foundRow: FoundRow = { id_2: 1 };
    void [foundByPrimaryKey, aggregates, aggregatesWithCondition, aggregatesByPrimaryKey, foundRow];
  }
});

test('복합 기본 키 조건과 안전한 수정 삭제를 지원한다', () => {
  const query = new MsSqlQuery(
    memberships,
    () => db,
    () => new Date()
  );
  expect(query.removeByPrimaryKey({ userId: 1, groupId: 2 }).toSQL().params).toEqual([1, 2]);
  const removeAll = usersQuery.remove().toSQL();
  expect(removeAll.sql).toMatch(/delete from \[users\]/i);
  expect(removeAll.sql).not.toMatch(/where/i);
  expect(removeAll.params).toEqual([]);
  expect(() => usersQuery.remove(undefined as never)).toThrow(/where condition is required/);
  expect(() => usersQuery.edit({ name: 'x' }, undefined as never)).toThrow(/where condition is required/);
});

test('스키마 키와 잘못된 컬럼을 확인한다', () => {
  const conditions = createConditions({ users });
  expect(
    db
      .select()
      .from(users)
      .where(conditions.eq('users', { id: 1 }))
      .toSQL().params
  ).toEqual([1]);
  expect(() => conditions.eq('users', { missing: 1 } as never)).toThrow();
});

test('IDENTITY 삽입은 OUTPUT 결과에서 생성된 키를 반환한다', async () => {
  const values = jest.fn().mockResolvedValue([{ id: 42 }]);
  const output = jest.fn(() => ({ values }));
  const insert = jest.fn(() => ({ output }));
  const query = new MsSqlQuery(
    users,
    () => ({ insert }) as unknown as typeof db,
    () => new Date()
  );
  await expect(query.add({ name: '홍길동' })).resolves.toBe(42);
  expect(insert).toHaveBeenCalledWith(users);
  expect(values).toHaveBeenCalledWith({ name: '홍길동' });
});

test('IDENTITY가 없는 삽입은 undefined를 반환한다', async () => {
  const values = jest.fn().mockResolvedValue({});
  const insert = jest.fn(() => ({ values }));
  const query = new MsSqlQuery(
    memberships,
    () => ({ insert }) as unknown as typeof db,
    () => new Date()
  );
  await expect(query.add({ userId: 1, groupId: 2 })).resolves.toBeUndefined();
});

test('min과 max가 컬럼 객체와 속성명의 결과 타입 및 SQL을 유지한다', () => {
  const statement = usersQuery.select({ minId: usersQuery.min('id'), maxName: usersQuery.max(users.name) });
  type Row = Awaited<typeof statement>[number];
  const row: Row = { minId: 1, maxName: null };
  expect(row.minId).toBe(1);
  expect(statement.toSQL().sql).toMatch(/min\(\[id\]\).*max\(\[name\]\)/i);
  expect(() => usersQuery.min('missing' as never)).toThrow('aggregate: unknown column "missing"');
  expect(() => usersQuery.max('toString' as never)).toThrow('aggregate: unknown column "toString"');
  if (false) {
    // @ts-expect-error 스키마에 없는 컬럼은 집계할 수 없다.
    usersQuery.min('missing');
    // @ts-expect-error 숫자 컬럼 집계는 문자열이 아니다.
    const invalid: Row = { minId: '1', maxName: null };
    void invalid;
  }
});

test('선택 콜백의 집계는 별칭 테이블을 사용한다', () => {
  const alias = createAlias({ users }).users('u');
  const query = usersQuery.select(alias, (q) => ({ minId: q.min('id'), maxName: q.max(q.t.name) }));
  expect(query.leftJoin(users, sql`1 = 1`).toSQL().sql).toMatch(
    /min\(\[u\]\.\[id\]\).*max\(\[u\]\.\[name\]\).*from \[users\] \[u\]/i
  );
});

test('find에서도 집계 선택과 선택 콜백을 사용할 수 있다', async () => {
  const captured: string[] = [];
  const fake = {
    select: (fields: Parameters<typeof db.select>[0]) => ({
      from: (table: typeof users) => {
        captured.push(db.select(fields).from(table).toSQL().sql);
        return { where: async () => [{ minId: 1 }] };
      },
    }),
  } as unknown as typeof db;
  const query = new MsSqlQuery(users, () => fake);
  await expect(query.find({ minId: query.min('id') }, query.eq({ id: 1 }))).resolves.toEqual({ minId: 1 });
  await expect(query.find((q) => ({ minId: q.min('id') }), query.eq({ id: 1 }))).resolves.toEqual({ minId: 1 });
  expect(captured).toHaveLength(2);
  expect(captured.every((sql) => /min\(\[id\]\)/i.test(sql))).toBe(true);
});

test('배열 조건에서 일반 값과 별칭 컬럼 및 SQL 표현식을 함께 사용한다', () => {
  const td = createAlias({ users }).users('td');
  const conditions = createConditions({ users });
  const grouped = db
    .select()
    .from(td)
    .where(
      conditions.and(td, {
        inArray: { id: [0, td.id] },
      })
    )
    .toSQL();
  expect(grouped.sql).toContain('[td].[id] in (@par0, [td].[id])');
  expect(grouped.params).toEqual([0]);

  const excluded = db
    .select()
    .from(td)
    .where(
      conditions.notInArray(td, {
        id: [0, td.id, sql`1 + 1`],
      })
    )
    .toSQL();
  expect(excluded.sql).toContain('[td].[id] not in (@par0, [td].[id], 1 + 1)');
  expect(excluded.params).toEqual([0]);

  const queryCondition = usersQuery
    .select()
    .where((q) => q.inArray({ id: [0, q.t.id] }))
    .toSQL();
  expect(queryCondition.sql).toContain('[users].[id] in (@par0, [users].[id])');
  expect(queryCondition.params).toEqual([0]);

  if (false) {
    // @ts-expect-error 숫자 컬럼의 배열에는 문자열 값을 넣을 수 없다.
    conditions.and(td, { inArray: { id: [0, 'wrong'] } });
    // @ts-expect-error notInArray도 컬럼의 값 타입을 검사한다.
    conditions.notInArray(td, { id: ['wrong'] });
  }
});

test('orEq와 orNe는 쿼리·스키마 키·별칭에서 컬럼 비교를 OR로 결합한다', () => {
  const conditions = createConditions({ users });
  const alias = createAlias({ users }).users('u');
  const optional = mssqlTable('optional', { id: int('id'), name: nvarchar('name', { length: 100 }) });
  for (const operator of ['orEq', 'orNe'] as const) {
    const comparison = operator === 'orEq' ? '=' : '<>';
    for (const condition of [
      usersQuery[operator]({ id: 1, name: 'Ada' }),
      conditions[operator]('users', { id: 1, name: 'Ada' }),
      conditions[operator](users, { id: 1, name: 'Ada' }),
    ]) {
      const query = db.select().from(users).where(condition).toSQL();
      expect(query.sql.replace(/[()]/g, '')).toContain(
        `[users].[id] ${comparison} @par0 or [users].[name] ${comparison} @par1`
      );
      expect(query.params).toEqual([1, 'Ada']);
    }
    const aliased = db
      .select()
      .from(alias)
      .where(conditions[operator](alias, { id: 1, name: 'Ada' }))
      .toSQL();
    expect(aliased.sql.replace(/[()]/g, '')).toContain(
      `[u].[id] ${comparison} @par0 or [u].[name] ${comparison} @par1`
    );
    expect(usersQuery[operator]({})).toBeUndefined();
    expect(conditions[operator](users, { id: undefined })).toBeUndefined();
    const nullable = db
      .select()
      .from(optional)
      .where(conditions[operator](optional, { id: null, name: undefined }))
      .toSQL();
    expect(nullable.sql).toContain(operator === 'orEq' ? '[optional].[id] is null' : '[optional].[id] is not null');
    expect(nullable.params).toEqual([]);
    expect(() => conditions[operator](users, { missing: 1 } as never)).toThrow('unknown column');
  }
  const callback = usersQuery
    .select()
    .where((q) => q.orEq({ id: 1, name: 'Ada' }))
    .toSQL();
  expect(callback.sql).toContain(' or ');
  const aliasCallback = usersQuery
    .select(alias)
    .where((q) => q.orNe({ id: 1, name: 'Ada' }))
    .toSQL();
  expect(aliasCallback.sql.replace(/[()]/g, '')).toContain('[u].[id] <> @par0 or [u].[name] <> @par1');
  if (false) {
    // @ts-expect-error 존재하지 않는 컬럼은 허용하지 않는다.
    usersQuery.orEq({ missing: 1 });
    // @ts-expect-error 컬럼 값의 타입을 검사한다.
    conditions.orNe(alias, { id: 'invalid' });
  }
});

test('모든 OR 조건은 기존 비교 규칙을 유지하고 컬럼 사이만 OR로 결합한다', () => {
  const conditions = createConditions({ users });
  const alias = createAlias({ users }).users('u');
  const cases = {
    gt: { id: 1, name: 'Ada' },
    gte: { id: 1, name: 'Ada' },
    lt: { id: 1, name: 'Ada' },
    lte: { id: 1, name: 'Ada' },
    inArray: { id: [1, 2], name: ['Ada'] },
    notInArray: { id: [1, 2], name: ['Ada'] },
    between: { id: [1, 2], name: ['A', 'Z'] },
    notBetween: { id: [1, 2], name: ['A', 'Z'] },
    like: { name: 'A%' },
    notLike: { name: 'A%' },
    ilike: { name: 'A%' },
    notIlike: { name: 'A%' },
    isNull: ['id', 'name'],
    isNotNull: ['id', 'name'],
  };
  for (const [base, values] of Object.entries(cases)) {
    const operator = `or${base.charAt(0).toUpperCase()}${base.slice(1)}`;
    const call = (target: object, method: string, ...args: unknown[]) =>
      Reflect.apply((target as Record<string, (...args: unknown[]) => SQL | undefined>)[method]!, target, args);
    for (const table of [users, alias, 'users'] as const) {
      const oldSql = db
        .select()
        .from(users)
        .where(call(conditions, base, table, values))
        .toSQL();
      const newSql = db
        .select()
        .from(users)
        .where(call(conditions, operator, table, values))
        .toSQL();
      // BETWEEN 자체의 AND는 유지한다.
      expect(newSql.sql).toEqual(oldSql.sql.replace(/\) and \(/g, ') or ('));
      expect(newSql.params).toEqual(oldSql.params);
    }
    const direct = usersQuery
      .select()
      .where(call(usersQuery, operator, values))
      .toSQL();
    const callback = usersQuery
      .select()
      .where((q) => call(q, operator, values))
      .toSQL();
    expect(callback).toEqual(direct);
    expect(call(conditions, operator, users, base.startsWith('is') ? [] : {})).toBeUndefined();
    const grouped = conditions.and('users', { [operator]: values });
    expect(db.select().from(users).where(grouped).toSQL()).toEqual(direct);
  }
  if (false) {
    // @ts-expect-error 숫자 컬럼에는 문자열 패턴을 지정할 수 없다.
    usersQuery.orLike({ id: '%' });
    // @ts-expect-error 범위는 두 값이 필요하다.
    conditions.orBetween(alias, { id: [1] });
    // @ts-expect-error 존재하지 않는 컬럼은 허용하지 않는다.
    usersQuery.orIsNull(['missing']);
  }
});

test('OR 패턴·NULL 조건과 서브쿼리 콜백에서도 여러 컬럼을 결합한다', () => {
  const contacts = mssqlTable('contacts', {
    name: nvarchar('name', { length: 100 }),
    email: nvarchar('email', { length: 100 }),
  });
  const conditions = createConditions({ contacts });
  for (const op of ['orLike', 'orNotLike', 'orIlike', 'orNotIlike'] as const) {
    const generated = db
      .select()
      .from(contacts)
      .where(conditions[op](contacts, { name: 'A%', email: '%@a' }))
      .toSQL();
    expect(generated.sql).toContain(' or ');
    expect(generated.params).toEqual(['A%', '%@a']);
  }
  expect(() => conditions.orBetween(contacts, { name: ['A'] } as never)).toThrow('two non-null bounds');
  expect(() => conditions.orInArray(contacts, { name: 'A' } as never)).toThrow('array or a SQL query');
  expect(() => conditions.orIsNull(contacts, ['missing'] as never)).toThrow('unknown column');
  const subquery = usersQuery.select(['id', 'name']).as('sq');
  const generated = usersQuery
    .select(subquery)
    .where((q) => q.orGt({ id: 1, name: 'A' }))
    .toSQL();
  expect(generated.sql).toContain('[sq].[id] > @par0');
  expect(generated.sql).toContain(' or ');
  const nulls = usersQuery
    .select(subquery)
    .where((q) => q.orIsNull(['id', 'name']))
    .toSQL();
  expect(nulls.sql).toContain(' or ');
});
