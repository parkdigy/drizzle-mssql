import { MsSqlQuery as BaseQuery } from '@pdg/drizzle-mssql';
import mssql from './../mssql';
import * as schema from '../schema';

export abstract class MsSqlQuery<K extends keyof typeof schema> extends BaseQuery<(typeof schema)[K]> {
  constructor(table: K) {
    super(schema[table], mssql.current);
  }
}
