import drizzleMsSql from '@pdg/drizzle-mssql';
import 'dotenv/config';
import * as schema from './schema';

export const mssql = drizzleMsSql({
  // url: process.env.DB_URL!,
  server: process.env.DB_SERVER!,
  port: Number(process.env.DB_PORT!),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    useUTC: false,
  },
  schema,
});

export default mssql;
