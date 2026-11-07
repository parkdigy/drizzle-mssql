import { drizzle } from 'drizzle-orm/node-mssql';
import { sql } from 'drizzle-orm';
import { int, mssqlTable, nvarchar, primaryKey } from 'drizzle-orm/mssql-core';
import { MsSqlQuery } from '../src/MsSqlQuery';
import { createConditions } from '../src/conditions';
import { createAlias } from '../src/alias';

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

test('복합 기본 키 조건과 안전한 수정 삭제를 지원한다', () => {
  const query = new MsSqlQuery(
    memberships,
    () => db,
    () => new Date()
  );
  expect(query.removeByPrimaryKey({ userId: 1, groupId: 2 }).toSQL().params).toEqual([1, 2]);
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
  expect(query.leftJoin(users, sql`1 = 1`).toSQL().sql).toMatch(/min\(\[u\]\.\[id\]\).*max\(\[u\]\.\[name\]\).*from \[users\] \[u\]/i);
});

test('find에서도 집계 선택과 선택 콜백을 사용할 수 있다', async () => {
  const captured: string[] = [];
  const fake = {
    select: (fields: Parameters<typeof db.select>[0]) => ({
      from: (table: typeof users) => {
        captured.push(db.select(fields).from(table).toSQL().sql);
        return { where: () => ({ orderBy: () => ({ offset: () => ({ fetch: async () => [{ minId: 1 }] }) }) }) };
      },
    }),
  } as unknown as typeof db;
  const query = new MsSqlQuery(users, () => fake);
  await expect(query.find({ minId: query.min('id') }, query.eq({ id: 1 }))).resolves.toEqual({ minId: 1 });
  await expect(query.find((q) => ({ minId: q.min('id') }), query.eq({ id: 1 }))).resolves.toEqual({ minId: 1 });
  expect(captured).toHaveLength(2);
  expect(captured.every((sql) => /min\(\[id\]\)/i.test(sql))).toBe(true);
});
