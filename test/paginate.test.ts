import { drizzle } from 'drizzle-orm/node-mssql';
import { count, eq } from 'drizzle-orm';
import { drizzleMsSql, int, mssqlTable, nvarchar } from '../src';

const users = mssqlTable('users', { id: int().primaryKey(), name: nvarchar({ length: 50 }) });
const mock = drizzle.mock();
const database = drizzleMsSql({ url: 'Server=localhost;Database=test;User Id=test;Password=test', schema: { users }, getTimestamp: () => 'now' });

test.each([false, true])('정렬 지정 여부 %s에서 SQL Server 집계와 페이지 SQL을 생성한다', async (ordered) => {
  const query = mock.select().from(users).where(eq(users.name, '홍길동')).$dynamic();
  if (ordered) query.orderBy(users.id);
  const captured: { sql: string; params: unknown[] }[] = [];
  const select = jest.spyOn(database.current(), 'select').mockImplementation(() => ({
    from: (subquery: Parameters<ReturnType<typeof mock.select>['from']>[0]) => {
      captured.push(mock.select({ total: count() }).from(subquery).toSQL());
      return Promise.resolve([{ total: 25 }]);
    },
  }) as never);
  const originalFetch = query.fetch.bind(query);
  const fetch = jest.spyOn(query, 'fetch').mockImplementation((limit) => {
    originalFetch(limit);
    captured.push(query.toSQL());
    return Promise.resolve([{ id: 11, name: '홍길동' }]) as never;
  });
  try {
    const result = await database.paginate(query, 2, 10);
    expect(result.paging).toMatchObject({ total: 25, current_page: 2, from: 10, to: 11 });
    expect(captured[0]?.sql).toContain(ordered ? 'order by [users].[id] offset' : 'order by (select 0) offset');
    expect(captured[0]?.sql).not.toContain('fetch next');
    expect(captured[0]?.params).toEqual(['홍길동', 0]);
    expect(captured[1]?.sql).toContain(ordered ? 'order by [users].[id] offset' : 'order by (select 0) offset');
    expect(captured[1]?.sql).toContain('fetch next');
    expect(captured[1]?.params).toEqual(['홍길동', 10, 10]);
    await database.paginate(query, 3, 10);
    expect(captured[2]?.sql).not.toContain('fetch next');
    expect(captured[2]?.params).toEqual(['홍길동', 0]);
    expect(captured[3]?.params).toEqual(['홍길동', 20, 10]);
  } finally {
    select.mockRestore();
    fetch.mockRestore();
  }
});
