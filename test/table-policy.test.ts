import { sql } from 'drizzle-orm';
import ts from 'typescript';
import { getTableConfig, mssqlTable as nativeTable, type MsSqlTable } from 'drizzle-orm/mssql-core';
import type { NodeMsSqlDatabase } from 'drizzle-orm/node-mssql';
import { drizzleMsSql, index, int, mssqlTable, MsSqlQuery, varchar, type TablePolicy } from '../src';

test('빈 정책 객체에서 수정·삭제 금지 옵션을 자동완성한다', () => {
  const file = `${process.cwd()}/test/table-policy-completion.ts`;
  const source = [
    "import { mssqlTable, int, index } from '../src';",
    "mssqlTable('third', { id: int() }, { /* third */ });",
    "mssqlTable('fourth', { id: int() }, t => [index('id_idx').on(t.id)], { /* fourth */ });",
    "mssqlTable('prefix', { id: int() }, { up/* prefix */ });",
    "mssqlTable('incomplete', { id: int() }, { /* incomplete */",
  ].join('\n');
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
  };
  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => [file],
    getScriptVersion: () => '0',
    getScriptSnapshot: (path) => {
      const text = path === file ? source : ts.sys.readFile(path);
      return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
  };
  const service = ts.createLanguageService(host);
  try {
    for (const marker of ['/* third */', '/* fourth */', '/* prefix */', '/* incomplete */']) {
      const completions = service.getCompletionsAtPosition(file, source.indexOf(marker), {});
      expect(completions?.entries.map((entry) => entry.name)).toEqual(
        expect.arrayContaining(['updateBlocked', 'deleteBlocked'])
      );
    }
  } finally {
    service.dispose();
  }
});

const columns = () => ({
  id: int().identity().primaryKey(),
  name: varchar({ length: 50 }).notNull().updateAllowed(),
});
const logs = mssqlTable('logs', columns(), { updateBlocked: true, deleteBlocked: true });
const indexedLogs = mssqlTable(
  'indexed_logs',
  (types) => ({
    id: types.int().identity().primaryKey(),
    name: types.varchar({ length: 50 }).notNull().updateAllowed(),
  }),
  (t) => [index('logs_name_idx').on(t.name)],
  { updateBlocked: true, deleteBlocked: true }
);
const updateOnly = mssqlTable('update_only', columns(), { deleteBlocked: true });
const deleteOnly = mssqlTable('delete_only', columns(), { updateBlocked: true });
const unrestricted = mssqlTable('unrestricted', columns(), { updateBlocked: false, deleteBlocked: false });

function checkTypes(current: () => NodeMsSqlDatabase) {
  const query = new MsSqlQuery(logs, current);
  query.add({ name: 'x' });
  query.add([{ name: 'x' }]);
  query.select();
  query.findByPrimaryKey(1);
  // @ts-expect-error 테이블의 수정 금지는 컬럼의 updateAllowed보다 우선한다.
  query.edit({ name: 'x' }, sql`1 = 1`);
  // @ts-expect-error 기본 키 수정도 차단한다.
  query.editByPrimaryKey({ name: 'x' }, 1);
  // @ts-expect-error 삭제를 차단한다.
  query.remove(sql`1 = 1`);
  // @ts-expect-error 기본 키 삭제도 차단한다.
  query.removeByPrimaryKey(1);
  const indexed = new MsSqlQuery(indexedLogs, current);
  // @ts-expect-error 네 번째 인자의 수정 금지도 타입에 적용한다.
  indexed.edit({ name: 'x' }, sql`1 = 1`);
  // @ts-expect-error 네 번째 인자의 삭제 금지도 타입에 적용한다.
  indexed.removeByPrimaryKey(1);
  new MsSqlQuery(updateOnly, current).editByPrimaryKey({ name: 'x' }, 1);
  const updateBlocked = new MsSqlQuery(deleteOnly, current);
  // @ts-expect-error 세 번째 인자에 updateBlocked만 지정해도 수정을 차단한다.
  updateBlocked.edit({ name: 'x' }, sql`1 = 1`);
  // @ts-expect-error 세 번째 인자에 updateBlocked만 지정해도 기본 키 수정을 차단한다.
  updateBlocked.editByPrimaryKey({ name: 'x' }, 1);
  updateBlocked.remove(sql`1 = 1`);
  updateBlocked.removeByPrimaryKey(1);
  const allowed = new MsSqlQuery(unrestricted, current);
  allowed.edit({ name: 'x' }, sql`1 = 1`);
  allowed.editByPrimaryKey({ name: 'x' }, 1);
  allowed.remove(sql`1 = 1`);
  allowed.removeByPrimaryKey(1);
  const plain = nativeTable('plain', columns());
  new MsSqlQuery(plain, current).edit({ name: 'x' }, sql`1 = 1`);
  const db = drizzleMsSql({
    url: 'Server=localhost;Database=example;User Id=example;Password=example;TrustServerCertificate=true',
    schema: { logs, indexedLogs, unrestricted },
    getTimestamp: () => 'now',
  });
  // @ts-expect-error db.query에서도 테이블의 수정 금지를 유지한다.
  db.query(logs).editByPrimaryKey({ name: 'x' }, 1);
  // @ts-expect-error db.query에서도 테이블의 삭제 금지를 유지한다.
  db.query(indexedLogs).remove(sql`1 = 1`);
  db.query(unrestricted).removeByPrimaryKey(1);
}
void checkTypes;

test('스키마 키 기반 중간 클래스를 상속해도 테이블 정책을 타입에서 유지한다', () => {
  const schema = { logs, deleteOnly, unrestricted };
  const current = jest.fn<ReturnType<() => NodeMsSqlDatabase>, []>();
  abstract class Query<K extends keyof typeof schema> extends MsSqlQuery<(typeof schema)[K]> {
    constructor(key: K) {
      super(schema[key], current);
    }
  }
  class LogsQuery extends Query<'logs'> {
    check() {
      const values = this.updateValues({ name: 'x' });
      // @ts-expect-error 상속 클래스 내부의 this에서도 수정 금지를 유지한다.
      this.edit(values, sql`1 = 1`);
      // @ts-expect-error 상속 클래스 내부의 기본 키 수정도 차단한다.
      this.editByPrimaryKey(values, 1);
      // @ts-expect-error 상속 클래스 내부의 삭제도 차단한다.
      this.remove(sql`1 = 1`);
      // @ts-expect-error 상속 클래스 내부의 기본 키 삭제도 차단한다.
      this.removeByPrimaryKey(1);
    }
  }
  class UpdateBlockedQuery extends Query<'deleteOnly'> {
    check() {
      const values = this.updateValues({ name: 'x' });
      // @ts-expect-error updateBlocked만 선언한 상속 클래스에서도 차단한다.
      this.editByPrimaryKey(values, 1);
      this.removeByPrimaryKey(1);
    }
  }
  class AllowedQuery extends Query<'unrestricted'> {
    check() {
      this.editByPrimaryKey(this.updateValues({ name: 'x' }), 1);
      this.removeByPrimaryKey(1);
    }
  }
  void [LogsQuery, UpdateBlockedQuery, AllowedQuery];
  expect(current).not.toHaveBeenCalled();
});

test.each([logs, indexedLogs])('DB와 조건 콜백 접근 전에 수정·삭제를 거부한다: %s', (table) => {
  const current = jest.fn<ReturnType<() => NodeMsSqlDatabase>, []>();
  const where = jest.fn(() => sql`1 = 1`);
  // 타입 정보가 사라져도 런타임 정책을 적용한다.
  const query = new MsSqlQuery<MsSqlTable>(table, current);
  expect(() => query.edit({ name: 'x' } as never, where)).toThrow(
    `edit: update is blocked for table "${getTableConfig(table).name}"`
  );
  expect(() => query.editByPrimaryKey({ name: 'x' } as never, 1)).toThrow('editByPrimaryKey: update is blocked');
  expect(() => query.remove(where)).toThrow('remove: delete is blocked');
  expect(() => query.removeByPrimaryKey(1)).toThrow('removeByPrimaryKey: delete is blocked');
  expect(where).not.toHaveBeenCalled();
  expect(current).not.toHaveBeenCalled();
});

test('등록·배열 등록·조회와 인덱스 설정을 유지한다', async () => {
  const insert = jest.fn(() => ({
    output: jest.fn(() => ({ values: async () => [{ id: 7 }] })),
  }));
  const from = jest.fn(() => 'select builder');
  const select = jest.fn(() => ({ from }));
  const current = () => ({ insert, select }) as unknown as NodeMsSqlDatabase;
  for (const table of [logs, indexedLogs]) {
    const query = new MsSqlQuery(table, current);
    expect(await query.add({ name: 'x' })).toBe(7);
    expect(await query.add([{ name: 'x' }])).toEqual([7]);
    expect(query.select()).toBe('select builder');
    expect(from).toHaveBeenLastCalledWith(table);
  }
  expect(getTableConfig(indexedLogs).indexes[0].config.name).toBe('logs_name_idx');
});

test('생략·false·일부 정책과 기존 설정 콜백을 유지한다', async () => {
  const oldConfig = mssqlTable('old_config', columns(), (t) => [index('old_name_idx').on(t.name)]);
  const noPolicy = mssqlTable('no_policy', columns());
  const undefinedConfig = mssqlTable('undefined_config', columns(), undefined, { updateBlocked: true });
  const options: TablePolicy = { updateBlocked: true };
  const dynamic = mssqlTable('dynamic', columns(), options);
  options.updateBlocked = false;
  const where = jest.fn(() => Promise.resolve());
  const update = jest.fn(() => ({ set: () => ({ where }) }));
  const remove = jest.fn(() => ({ where }));
  const current = () => ({ update, delete: remove }) as unknown as NodeMsSqlDatabase;
  for (const table of [oldConfig, noPolicy, unrestricted]) {
    const query = new MsSqlQuery(table, current);
    await query.edit({ name: 'x' }, sql`1 = 1`);
    await query.editByPrimaryKey({ name: 'x' }, 1);
    await query.remove(sql`1 = 1`);
    await query.removeByPrimaryKey(1);
  }
  await new MsSqlQuery(updateOnly, current).editByPrimaryKey({ name: 'x' }, 1);
  await new MsSqlQuery(deleteOnly, current).removeByPrimaryKey(1);
  for (const table of [deleteOnly, undefinedConfig, dynamic]) {
    const query = new MsSqlQuery<MsSqlTable>(table, current);
    expect(() => query.edit({ name: 'x' } as never, sql`1 = 1`)).toThrow('update is blocked');
  }
  expect(() => new MsSqlQuery<MsSqlTable>(updateOnly, current).remove(sql`1 = 1`)).toThrow('delete is blocked');
  expect(update).toHaveBeenCalledTimes(7);
  expect(remove).toHaveBeenCalledTimes(7);
  expect(getTableConfig(oldConfig).indexes[0].config.name).toBe('old_name_idx');
});

test('기본 키 편의 메서드는 기존처럼 edit과 remove에 위임한다', async () => {
  const where = () => Promise.resolve();
  const current = () =>
    ({
      update: () => ({ set: () => ({ where }) }),
      delete: () => ({ where }),
    }) as unknown as NodeMsSqlDatabase;
  const query = new MsSqlQuery(unrestricted, current);
  const edit = jest.spyOn(query, 'edit');
  const remove = jest.spyOn(query, 'remove');
  await query.editByPrimaryKey({ name: 'x' }, 1);
  await query.removeByPrimaryKey(1);
  expect(edit).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledTimes(1);
});
