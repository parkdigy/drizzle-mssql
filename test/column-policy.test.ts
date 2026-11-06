import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-mssql';
import { bigint, int, mssqlTable, nvarchar, MsSqlQuery } from '../src';
import type { MsSqlInsertValues, MsSqlUpdateValues } from '../src';

const table = mssqlTable('policy_test', {
  id: int().identity().primaryKey(),
  name: nvarchar({ length: 50 }).notNull(),
  locked: int().updateBlocked(),
  required: int().updateRequired(),
  created: nvarchar({ length: 50 }).notNull().createdAt(),
  updated: nvarchar({ length: 50 }).notNull().updatedAt(),
});
const identityCases = mssqlTable('identity_cases', (t) => ({
  id: t.int().identity({ seed: 10, increment: 2 }),
  longId: bigint({ mode: 'bigint' }).identity(),
  normal: t.int().notNull(),
}));
const noIdentity = mssqlTable('no_identity', { name: nvarchar({ length: 20 }).notNull() });
const raw = drizzle.mock();
if (false) {
  const insert: MsSqlInsertValues<typeof table> = { name: 'name' };
  const update: MsSqlUpdateValues<typeof table> = { required: 1, name: 'changed' };
  // @ts-expect-error IDENTITY는 기본적으로 등록할 수 없다.
  const badInsert: MsSqlInsertValues<typeof table> = { id: 1, name: 'name' };
  // @ts-expect-error 일반 필수 컬럼은 생략할 수 없다.
  const missingName: MsSqlInsertValues<typeof table> = {};
  // @ts-expect-error IDENTITY는 기본적으로 수정할 수 없다.
  const badIdentityUpdate: MsSqlUpdateValues<typeof table> = { id: 1, required: 1 };
  // @ts-expect-error 필수 수정 컬럼이 누락되었다.
  const badUpdate: MsSqlUpdateValues<typeof table> = { name: 'name' };
  // @ts-expect-error 생성 시각은 수정할 수 없다.
  const badCreated: MsSqlUpdateValues<typeof table> = { required: 1, created: 'x' };
  // @ts-expect-error 기본 IDENTITY 등록은 허용하지 않는다.
  const identityInsert: MsSqlInsertValues<typeof identityCases> = { normal: 1, id: 1 };
  // @ts-expect-error 기본 IDENTITY 수정은 허용하지 않는다.
  const identityUpdate: MsSqlUpdateValues<typeof identityCases> = { id: 1 };
  // @ts-expect-error bigint IDENTITY도 등록할 수 없다.
  const bigintInsert: MsSqlInsertValues<typeof identityCases> = { normal: 1, longId: BigInt(1) };
  const idResult: Promise<number> = new MsSqlQuery(table, () => raw).add({ name: 'name' });
  const noIdResult: Promise<undefined> = new MsSqlQuery(noIdentity, () => raw).add({ name: 'name' });
  void [insert, update, badInsert, missingName, badIdentityUpdate, badUpdate, badCreated, identityInsert, identityUpdate, bigintInsert, idResult, noIdResult];
}

test('입력 정책과 시각 자동 입력을 등록과 수정에 적용한다', async () => {
  const inserted: unknown[] = [];
  const updated: unknown[] = [];
  const fake = {
    insert: () => ({ output: () => ({ values: (v: unknown) => { inserted.push(v); return Promise.resolve([{ id: 1 }]); } }) }),
    update: () => ({ set: (v: unknown) => { updated.push(v); return { where: () => Promise.resolve() }; } }),
  } as unknown as typeof raw;
  const query = new MsSqlQuery(table, () => fake, () => 'now');
  const values = query.insertValues({ name: 'first', created: 'manual' });
  expect(query.insertValues(values)).toBe(values);
  await query.add(values);
  await query.edit(query.updateValues({ required: 1 }), sql`1 = 1`);
  expect(inserted).toEqual([{ name: 'first', created: 'manual', updated: 'now' }]);
  expect(updated).toEqual([{ required: 1, updated: 'now' }]);
  expect(() => query.add({ id: undefined, name: 'x' } as never)).toThrow('id');
  expect(() => query.edit({ required: 1, created: 'x' } as never, sql`1 = 1`)).toThrow('created');
  expect(() => query.edit({ locked: 1 } as never, sql`1 = 1`)).toThrow();
  expect(() => query.edit({ name: 'x' } as never, sql`1 = 1`)).toThrow('required');
});

test.each(['as', 'AS', 'As', 'aS'] as const)('별칭 %s를 타입과 런타임에서 처리한다', (keyword) => {
  const query = new MsSqlQuery(table, () => raw);
  const fields = query.columns(`name ${keyword} DisplayName`);
  expect(fields.DisplayName.fieldAlias).toBe('DisplayName');
});
