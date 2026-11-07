import { placeholder, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-mssql';
import { bigint, int, mssqlTable, nvarchar, MsSqlQuery } from '../src';
import type { MsSqlAddValues, MsSqlEditValues } from '../src';

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
const allowedIdentity = mssqlTable('allowed_identity', {
  id: int().identity().primaryKey().updateAllowed(),
  name: nvarchar({ length: 50 }).notNull(),
});
const requiredIdentity = mssqlTable('required_identity', (t) => ({
  id: t.int().identity().updateRequired(),
  longId: t.bigint({ mode: 'bigint' }).identity().updateAllowed(),
}));
const requiredPrimary = mssqlTable('required_primary', {
  id: int().identity().primaryKey().updateRequired(),
  name: nvarchar({ length: 50 }),
});
const createdIdentity = mssqlTable('created_identity', {
  id: int().identity().updateAllowed().createdAt(),
  name: nvarchar({ length: 50 }),
});
const raw = drizzle.mock();
if (false) {
  const insert: MsSqlAddValues<typeof table> = { name: 'name' };
  const update: MsSqlEditValues<typeof table> = { required: 1, name: 'changed' };
  // @ts-expect-error IDENTITY는 기본적으로 등록할 수 없다.
  const badInsert: MsSqlAddValues<typeof table> = { id: 1, name: 'name' };
  // @ts-expect-error 일반 필수 컬럼은 생략할 수 없다.
  const missingName: MsSqlAddValues<typeof table> = {};
  // @ts-expect-error IDENTITY는 기본적으로 수정할 수 없다.
  const badIdentityUpdate: MsSqlEditValues<typeof table> = { id: 1, required: 1 };
  // @ts-expect-error 필수 수정 컬럼이 누락되었다.
  const badUpdate: MsSqlEditValues<typeof table> = { name: 'name' };
  // @ts-expect-error 생성 시각은 수정할 수 없다.
  const badCreated: MsSqlEditValues<typeof table> = { required: 1, created: 'x' };
  // @ts-expect-error 기본 IDENTITY 등록은 허용하지 않는다.
  const identityInsert: MsSqlAddValues<typeof identityCases> = { normal: 1, id: 1 };
  // @ts-expect-error 기본 IDENTITY 수정은 허용하지 않는다.
  const identityUpdate: MsSqlEditValues<typeof identityCases> = { id: 1 };
  // @ts-expect-error bigint IDENTITY도 등록할 수 없다.
  const bigintInsert: MsSqlAddValues<typeof identityCases> = { normal: 1, longId: BigInt(1) };
  const idResult: Promise<number> = new MsSqlQuery(table, () => raw).add({ name: 'name' });
  const noIdResult: Promise<undefined> = new MsSqlQuery(noIdentity, () => raw).add({ name: 'name' });
  const allowedUpdate: MsSqlEditValues<typeof allowedIdentity> = { id: 2 };
  const allowedSql: MsSqlEditValues<typeof allowedIdentity> = { id: sql`2` };
  const allowedPlaceholder: MsSqlEditValues<typeof allowedIdentity> = { id: placeholder('id') };
  const requiredUpdate: MsSqlEditValues<typeof requiredIdentity> = { id: 2, longId: BigInt(3) };
  // @ts-expect-error updateAllowed를 지정해도 IDENTITY 등록은 금지한다.
  const allowedInsert: MsSqlAddValues<typeof allowedIdentity> = { id: 2, name: 'name' };
  // @ts-expect-error 허용한 IDENTITY에도 원래 값 타입을 적용한다.
  const wrongIdentityType: MsSqlEditValues<typeof allowedIdentity> = { id: '2' };
  // @ts-expect-error bigint IDENTITY에 number를 지정할 수 없다.
  const wrongBigintType: MsSqlEditValues<typeof requiredIdentity> = { id: 2, longId: 3 };
  // @ts-expect-error updateRequired의 IDENTITY는 생략할 수 없다.
  const missingIdentity: MsSqlEditValues<typeof requiredIdentity> = {};
  // @ts-expect-error 기본 키는 updateRequired만으로 수정할 수 없다.
  const requiredPrimaryUpdate: MsSqlEditValues<typeof requiredPrimary> = { id: 2 };
  // @ts-expect-error createdAt의 수정 금지는 updateAllowed보다 우선한다.
  const createdIdentityUpdate: MsSqlEditValues<typeof createdIdentity> = { id: 2 };
  // @ts-expect-error 사용자가 명시적으로 제외한 컬럼도 차단한다.
  const excludedIdentity: MsSqlEditValues<typeof allowedIdentity, 'id'> = { id: 2 };
  const explicitlyRequired: MsSqlEditValues<typeof allowedIdentity, never, 'id'> = { id: 2 };
  const schema = { allowedIdentity };
  abstract class Query<K extends keyof typeof schema> extends MsSqlQuery<(typeof schema)[K]> {
    constructor(key: K) {
      super(schema[key], () => raw);
    }
  }
  class AllowedQuery extends Query<'allowedIdentity'> {
    check() {
      this.edit({ id: 2 }, this.eq({ id: 1 }));
      this.editByPrimaryKey(this.editValues({ id: 2 }), 1);
    }
  }
  void [insert, update, badInsert, missingName, badIdentityUpdate, badUpdate, badCreated, identityInsert, identityUpdate, bigintInsert, idResult, noIdResult, allowedUpdate, allowedSql, allowedPlaceholder, requiredUpdate, allowedInsert, wrongIdentityType, wrongBigintType, missingIdentity, requiredPrimaryUpdate, createdIdentityUpdate, excludedIdentity, explicitlyRequired, AllowedQuery];
}

test('허용한 IDENTITY를 edit와 editByPrimaryKey의 SET 절에 전달한다', () => {
  const query = new MsSqlQuery(allowedIdentity, () => raw);
  const values = query.editValues({ id: 2 });
  for (const builder of [
    query.edit(values, query.eq({ id: 1 })),
    query.editByPrimaryKey(values, 1),
  ]) {
    expect(builder.toSQL()).toEqual({
      sql: 'update [allowed_identity] set [id] = @par0 where [allowed_identity].[id] = @par1',
      params: [2, 1],
    });
  }
});

test('IDENTITY의 필수·생성 시각·기본 키 정책을 유지한다', () => {
  const required = new MsSqlQuery(requiredIdentity, () => raw);
  expect(required.edit({ id: 2, longId: BigInt(3) }, sql`1 = 1`).toSQL().params).toEqual([2, BigInt(3)]);
  expect(() => required.edit({} as never, sql`1 = 1`)).toThrow('id');
  expect(() => new MsSqlQuery(requiredPrimary, () => raw).edit({ id: 2 } as never, sql`1 = 1`)).toThrow('id');
  expect(() => new MsSqlQuery(createdIdentity, () => raw).edit({ id: 2 } as never, sql`1 = 1`)).toThrow('id');
});

test('입력 정책과 시각 자동 입력을 등록과 수정에 적용한다', async () => {
  const inserted: unknown[] = [];
  const updated: unknown[] = [];
  const fake = {
    insert: () => ({ output: () => ({ values: (v: unknown) => { inserted.push(v); return Promise.resolve([{ id: 1 }]); } }) }),
    update: () => ({ set: (v: unknown) => { updated.push(v); return { where: () => Promise.resolve() }; } }),
  } as unknown as typeof raw;
  const query = new MsSqlQuery(table, () => fake, () => 'now');
  const values = query.addValues({ name: 'first', created: 'manual' });
  expect(query.addValues(values)).toBe(values);
  await query.add(values);
  await query.edit(query.editValues({ required: 1 }), sql`1 = 1`);
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
