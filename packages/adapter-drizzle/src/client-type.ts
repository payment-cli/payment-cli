import type {
  MySqlQueryResultHKT,
  PreparedQueryHKTBase,
} from "drizzle-orm/mysql-core";
import { MySqlDatabase } from "drizzle-orm/mysql-core";
import { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

//import { DefaultMySqlSchema } from './schemas/mysql';
import type { DefaultPostgresSchema } from "./schema/index";
// import { DefaultSQLiteSchema } from './schemas/sqlite';

type AnyPostgresDatabase = PgDatabase<PgQueryResultHKT, any>;
type AnyMySqlDatabase = MySqlDatabase<
  MySqlQueryResultHKT,
  PreparedQueryHKTBase,
  any
>;
type AnySQLiteDatabase = BaseSQLiteDatabase<"sync" | "async", any, any>;

export type SqlFlavorOptions =
  | AnyPostgresDatabase
  | AnyMySqlDatabase
  | AnySQLiteDatabase;

// letting the adapter fail while we implement sqlite and mysql
export type DefaultSchema<Flavor extends SqlFlavorOptions> =
  Flavor extends AnyMySqlDatabase
    ? /* DefaultMySqlSchema */ never
    : Flavor extends AnyPostgresDatabase
      ? DefaultPostgresSchema
      : Flavor extends AnySQLiteDatabase
        ? /* DefaultSQLiteSchema */ never
        : never;
