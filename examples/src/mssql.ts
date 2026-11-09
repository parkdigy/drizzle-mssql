import drizzleMsSql from '@pdg/drizzle-mssql';
import 'dotenv/config';
import * as schema from './schema';

export const mssql = drizzleMsSql({
  url: process.env.DATABASE_URL!,
  schema,
  getTimestamp: () => new Date(),
});

export default mssql;
