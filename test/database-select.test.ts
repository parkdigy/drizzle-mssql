import { drizzleMsSql, int, mssqlTable, nvarchar } from '../src';

const users = mssqlTable('users', { id: int().notNull(), name: nvarchar({ length: 50 }) });
const db = drizzleMsSql({ url: '', schema: { users }, getTimestamp: () => new Date() });
const u = db.a.users('u');

test('연결 select는 테이블명과 alias에서 기존 선택 및 빌더 동작을 유지한다', () => {
  expect(db.select('users').toSQL()).toEqual(db.query(users).select().toSQL());
  expect(db.select(u).toSQL()).toEqual(db.query(u).select().toSQL());
  expect(db.select('users', ['id', 'name as label']).toSQL()).toEqual(
    db.query(users).select(['id', 'name as label']).toSQL()
  );
  const mapped = db.select(u, { label: 'name' }).where((q) => q.eq({ id: 1 })).orderBy((q) => q.desc('id'));
  expect(mapped.toSQL()).toEqual(
    db.query(u).select({ label: 'name' }).where((q) => q.eq({ id: 1 })).orderBy((q) => q.desc('id')).toSQL()
  );
  const callback = db.select(u, (q) => [q.columns('id'), { label: q.t.name }] as const);
  expect(callback.toSQL()).toEqual(db.query(u).select((q) => [q.columns('id'), { label: q.t.name }] as const).toSQL());
  expect(db.select('users', (q) => ({ maxId: q.max('id') })).toSQL()).toEqual(
    db.query(users).select((q) => ({ maxId: q.max('id') })).toSQL()
  );
  expect(db.select('users', []).toSQL()).toEqual(db.query(users).select([]).toSQL());
  type Row = Awaited<typeof callback>[number];
  const row: Row = { id: 1, label: null };
  void row;
  if (false) {
    // @ts-expect-error 등록되지 않은 테이블명
    db.select('missing');
    // @ts-expect-error 존재하지 않는 컬럼
    db.select('users', ['missing']);
    // @ts-expect-error alias의 존재하지 않는 컬럼
    db.select(u, { label: 'missing' });
    // @ts-expect-error 선택 결과는 숫자 id를 유지한다
    const invalid: Row = { id: 'wrong', label: null };
    void invalid;
  }
});

test('등록되지 않은 테이블명과 컬럼은 명확한 오류를 반환한다', () => {
  expect(() => db.select('missing' as 'users')).toThrow('select: unknown table "missing".');
  expect(() => db.select('users', { label: 'missing' } as unknown as { label: 'name' })).toThrow('select: unknown column "missing".');
});


test('columns로 전달한 컬럼 객체의 데이터 타입과 null 허용을 유지한다', () => {
  const all = db.query(users).select(u, db.columns(u));
  const idOnly = db.query(users).select(u, db.columns(u, 'id'));
  const direct = db.select(u, db.columns(u));
  const named = db.select('users', db.columns(users, 'id'));
  const mixed = db.query(users).select(u, { id: u.id, label: 'name', total: db.sqlNumber(1) });
  const plain = db.query(users).select(db.columns(users));
  const callback = db.select(u, (q) => q.columns('id'));
  if (false) {
    const fullRow: { id: number; name: string | null } = {} as Awaited<typeof all>[number];
    const idRow: { id: number } = {} as Awaited<typeof idOnly>[number];
    const directRow: { id: number; name: string | null } = {} as Awaited<typeof direct>[number];
    const namedRow: { id: number } = {} as Awaited<typeof named>[number];
    const mixedRow: { id: number; label: string | null; total: number } = {} as Awaited<typeof mixed>[number];
    const plainRow: { id: number; name: string | null } = {} as Awaited<typeof plain>[number];
    const callbackRow: { id: number } = {} as Awaited<typeof callback>[number];
    // @ts-expect-error id는 숫자 타입을 유지한다
    const invalid: Awaited<typeof idOnly>[number] = { id: 'wrong' };
    void [fullRow, idRow, directRow, namedRow, mixedRow, plainRow, callbackRow, invalid];
  }
  expect(all.toSQL()).toEqual(db.query(u).select(db.columns(u)).toSQL());
  expect(idOnly.toSQL()).toEqual(db.query(u).select(db.columns(u, 'id')).toSQL());
});
