import ts from 'typescript';
import path from 'node:path';

test('200개 테이블과 200개 추가 컬럼에서도 공개 API의 자동완성과 선택 결과 타입을 유지한다', () => {
  const file = path.resolve('test/__autocomplete_fixture.ts');
  const wideColumns = Array.from({ length: 200 }, (_, i) => `extra${i}: int()`).join(',');
  const tables = Array.from(
    { length: 200 },
    (_, i) =>
      `const table${i} = mssqlTable('table${i}', { id: int().notNull(), name: varchar({length: 100}), ${i === 199 ? wideColumns : ''} });`
  ).join('\n');
  const marked = `
    import { drizzleMsSql, mssqlTable, int, varchar } from '../src/index';
    ${tables}
    const db = drizzleMsSql({ url: '', getTimestamp: () => 0, schema: {
      ${Array.from({ length: 200 }, (_, i) => `table${i}`).join(',')}
    }});
    const a = db.a.table199('a');
    db./*members*/s;
    db.a./*aliases*/table199;
    // @ts-expect-error 자동완성용 미완성 컬럼명
    db.columns(a, '/*columns*/');
    // @ts-expect-error 자동완성용 미완성 컬럼명
    db.query(a).columns('/*query*/');
    db.eq(a, { /*condition*/ });
    db.eq('table199', { /*namedCondition*/ });
    const directSelected = db.select('table199', ['id', 'name']);
    const directAlias = db.select(a, (q) => q.columns('id', 'name'));
    const directRow: { id: number; name: string | null } = {} as Awaited<typeof directSelected>[number];
    const directAliasRow: { id: number; name: string | null } = {} as Awaited<typeof directAlias>[number];
    // @ts-expect-error 선택하지 않은 컬럼은 포함하지 않는다
    ({} as Awaited<typeof directSelected>[number]).extra0;
    void [directRow, directAliasRow];
    const query = db.query(table199);
    // @ts-expect-error 자동완성용 미완성 컬럼명
    query.select(['id', '/*nextColumn*/']);
    // @ts-expect-error 별칭 선택의 자동완성용 미완성 컬럼명
    query.select(a, ['id', '/*aliasNextColumn*/']);
    const j = query.select(['id', 'name']).top(1).orderBy(query.desc('id')).as('j');
    // @ts-expect-error 서브쿼리 선택 콜백의 자동완성용 미완성 컬럼명
    db.select(j, q => q.columns('id', '/*subquerySelect*/'));
    // @ts-expect-error 자동완성용 미완성 컬럼명
    db.columns(j, '/*subqueryFirst*/');
    // @ts-expect-error 자동완성용 미완성 컬럼명
    db.columns(j, 'id', '/*subqueryNext*/');
    // @ts-expect-error 자동완성용 미완성 컬럼명
    db.columns(j, 'id', 'name', '/*subqueryThird*/');
    const subqueryFields = db.columns(j, 'id');
    const subqueryBoth = db.columns(j, 'id', 'name');
    const subqueryId: typeof j.id = subqueryFields.id;
    const subqueryName: typeof j.name = subqueryBoth.name;
    // @ts-expect-error 선택하지 않은 컬럼은 결과에 포함하지 않는다
    subqueryFields.name;
    // @ts-expect-error 서브쿼리에서 선택하지 않은 컬럼은 허용하지 않는다
    db.columns(j, 'extra0');
    void [subqueryId, subqueryName];
    const selected = query.select({ renamed: 'id' });
    const selectedId = query.select(['id']);
    const merged = query.select([query.columns('id'), { label: table199.name }]);
    const aliased = query.select(a, ['id', 'name as displayName']);
    const callbackSelected = query.select(a, (q) => {
      const aliasTable: typeof a = q.t;
      void aliasTable;
      return q.columns('id', 'name');
    });
    const baseCallbackSelected = query.select((q) => q.columns('id', 'name'));
    const arrayCallbackSelected = query.select(a, (q) => [q.columns('id'), { name: q.t.name }] as const);
    const baseCallbackRow: {id: number; name: string | null} = {} as Awaited<typeof baseCallbackSelected>[number];
    const arrayCallbackRow: Awaited<typeof arrayCallbackSelected>[number] = { id: 1, name: 'Ada' };
    void [baseCallbackRow, arrayCallbackRow];
    type CallbackRow = Awaited<typeof callbackSelected>[number];
    const callbackRow: CallbackRow = { id: 1, name: null };
    const validBaseCallbackRow: Awaited<typeof baseCallbackSelected>[number] = { id: 1, name: 'Ada' };
    void validBaseCallbackRow;
    // @ts-expect-error 선택하지 않은 컬럼은 결과에 포함하지 않는다
    ({} as CallbackRow).extra0;
    // @ts-expect-error id는 숫자여야 한다
    const invalidCallbackRow: CallbackRow = { id: 'wrong', name: null };
    void [callbackRow, invalidCallbackRow];
    const found = query.find({ renamed: 'id' });
    const foundByKey = query.findByPrimaryKey({ renamed: 'id' }, {});
    type Row = Awaited<typeof selected>[number];
    const row: Row = { renamed: 1 };
    type IdOnlyRow = Awaited<typeof selectedId>[number];
    const idOnlyRow: IdOnlyRow = { id: 1 };
    // @ts-expect-error 컬럼 이름 배열도 선택한 컬럼만 결과에 포함한다
    const invalidIdOnlyRow: IdOnlyRow = { id: 1, name: 'Ada' };
    // @ts-expect-error 선택 결과는 숫자 타입을 유지한다
    const invalidRow: Row = { renamed: 'wrong' };
    // @ts-expect-error 존재하지 않는 컬럼은 허용하지 않는다
    query.select(['missing']);
    void [merged, aliased, found, foundByKey, row, invalidRow, idOnlyRow, invalidIdOnlyRow];
    const fields = db.columns(a, 'id', 'name as displayName');
    db.current().select(fields).from(a).then(rows => {
      const row: {id: number; displayName: string | null} = rows[0];
      void row;
    });
    // @ts-expect-error 존재하지 않는 컬럼은 허용하지 않는다
    db.columns(a, 'missing');
  `;
  const positions: Record<string, number> = {};
  let removed = 0;
  const source = marked.replace(/\/\*(\w+)\*\//g, (match, name: string, offset: number) => {
    positions[name] = offset - removed;
    removed += match.length;
    return '';
  });
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  };
  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => [file],
    getScriptVersion: () => '1',
    getScriptSnapshot: (name) => {
      const content = name === file ? source : ts.sys.readFile(name);
      return content === undefined ? undefined : ts.ScriptSnapshot.fromString(content);
    },
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCompilationSettings: () => options,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
  };
  const service = ts.createLanguageService(host);
  try {
    for (const [name, expected] of Object.entries({
      members: ['columns', 'query', 'current', 'eq'],
      aliases: ['table0', 'table199'],
      columns: ['id', 'name'],
      subquerySelect: ['id', 'name'],
      subqueryFirst: ['id', 'name'],
      subqueryNext: ['id', 'name'],
      subqueryThird: ['id', 'name'],
      nextColumn: ['id', 'name', 'extra0', 'extra199'],
      aliasNextColumn: ['id', 'name', 'extra0', 'extra199'],
      query: ['id', 'name'],
      condition: ['id', 'name'],
      namedCondition: ['id', 'name'],
    })) {
      const entries = service.getCompletionsAtPosition(file, positions[name], {})?.entries.map((entry) => entry.name);
      expect({ name, entries }).toEqual({ name, entries: expect.arrayContaining(expected) });
    }
    const diagnostics = service.getSemanticDiagnostics(file);
    expect(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual([]);
  } finally {
    service.dispose();
  }
}, 30000);
