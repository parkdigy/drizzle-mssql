import { drizzle } from 'drizzle-orm/node-mssql';
import { int, mssqlTable, nvarchar, primaryKey } from 'drizzle-orm/mssql-core';
import { MsSqlQuery } from '../src/MsSqlQuery';
import { createConditions } from '../src/conditions';

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
