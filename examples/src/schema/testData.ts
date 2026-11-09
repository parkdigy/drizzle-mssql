import { mssqlTable, int, varchar, bit, datetime } from '@pdg/drizzle-mssql';

export const testData = mssqlTable('test_data', {
  id: int().identity().primaryKey(),
  name: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 100 }).notNull(),
  is_lock: bit().default(false).notNull().insertBlocked(),
  insert_date: datetime().notNull().createdAt(),
  update_date: datetime().notNull().updatedAt(),
});
