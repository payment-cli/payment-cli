import { createId } from "@paralleldrive/cuid2";
import { nanoid } from "nanoid";
import {
  index,
  integer,
  pgTable,
  text,
  json,
  timestamp,
  varchar,
  pgEnum,
  unique,
  PgColumn,
  PgTableWithColumns,
} from "drizzle-orm/pg-core";
import { Jsonifiable } from "type-fest";
import { GeneratedColumnConfig } from "drizzle-orm";

export const environments = ["production", "staging", "development"] as const;

export const environment = pgEnum("environment", environments);

export const defaultPaymentIntentSchema = pgTable(
  "paymentcli_paymentIntent",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    externalId: text().notNull(),
    serviceName: text().notNull(),
    currency: text().notNull(),
    baseUnit: integer().notNull(),
    status: text().notNull().default("PROCESSING"),
    metadata: json().$type<Jsonifiable | null>(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    index("externalId_idx").on(table.externalId),
    index("serviceName_idx").on(table.status),
  ]
);

export const defaultApiKeySchema = pgTable(
  "paymentcli_apiKey",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    environment: environment().notNull().default("development"),
    token: text().notNull(),
    userId: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    index("token_apiKey_idx").on(table.token),
    unique("userId_environment_apiKey_idx").on(table.userId, table.environment),
  ]
);

export function defineTables(
  schema: Partial<DefaultPostgresSchema> = {}
): Required<DefaultPostgresSchema> {
  const paymentIntentSchema =
    schema.paymentIntentSchema ?? defaultPaymentIntentSchema;
  const apiKeySchema = schema.apiKeySchema ?? defaultApiKeySchema;

  return {
    paymentIntentSchema,
    apiKeySchema,
  };
}

type DefaultPostgresColumn<
  T extends {
    data: string | number | boolean | Date | unknown;
    dataType: "string" | "number" | "boolean" | "date" | "json";
    notNull: boolean;
    isPrimaryKey?: boolean;
    columnType:
      | "PgVarchar"
      | "PgText"
      | "PgBoolean"
      | "PgTimestamp"
      | "PgInteger"
      | "PgUUID"
      | "PgJson";
  },
> = PgColumn<{
  name: string;
  isAutoincrement: boolean;
  isPrimaryKey: T["isPrimaryKey"] extends true ? true : false;
  hasRuntimeDefault: boolean;
  generated: GeneratedColumnConfig<T["data"]> | undefined;
  columnType: T["columnType"];
  data: T["data"];
  driverParam: string | number | boolean | unknown;
  notNull: T["notNull"];
  hasDefault: boolean;
  enumValues: any;
  dataType: T["dataType"];
  tableName: string;
}>;

type DefaultPostgresPaymentIntentTable = PgTableWithColumns<{
  name: string;
  columns: {
    id: DefaultPostgresColumn<{
      columnType: "PgVarchar" | "PgText" | "PgUUID";
      isPrimaryKey: true;
      data: string;
      notNull: true;
      dataType: "string";
    }>;
    externalId: DefaultPostgresColumn<{
      columnType: "PgVarchar" | "PgText";
      data: string;
      notNull: true;
      dataType: "string";
    }>;

    serviceName: DefaultPostgresColumn<{
      columnType: "PgVarchar" | "PgText";
      data: string;
      notNull: true;
      dataType: "string";
    }>;
    currency: DefaultPostgresColumn<{
      columnType: "PgVarchar" | "PgText";
      data: string;
      notNull: true;
      dataType: "string";
    }>;
    baseUnit: DefaultPostgresColumn<{
      columnType: "PgInteger";
      data: number;
      notNull: true;
      dataType: "number";
    }>;

    status: DefaultPostgresColumn<{
      columnType: "PgVarchar" | "PgText";
      data: string;
      notNull: true;
      dataType: "string";
    }>;

    metadata: DefaultPostgresColumn<{
      columnType: "PgJson";
      data: unknown;
      driverParam: unknown;
      notNull: false;
      dataType: "json";
    }>;

    createdAt: DefaultPostgresColumn<{
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      notNull: true;
    }>;
    updatedAt: DefaultPostgresColumn<{
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      notNull: false;
    }>;
  };
  dialect: "pg";
  schema: string | undefined;
}>;

type PostgresApiKeyEnvironmentEnum = PgColumn<{
  name: string;
  tableName: string;
  columnType: "PgEnumColumn";
  data: "production" | "staging" | "development";
  hasDefault: true;
  enumValues: any;
  driverParam: string;
  notNull: true;
  dataType: "string";
  hasRuntimeDefault: boolean;
  isPrimaryKey: false;
  isAutoincrement: false;
  generated: any;
}>;

type DefaultPostgresApiKeyTable = PgTableWithColumns<{
  name: string;
  columns: {
    id: DefaultPostgresColumn<{
      columnType: "PgVarchar" | "PgText";
      isPrimaryKey: true;
      data: string;
      notNull: true;
      dataType: "string";
    }>;

    environment: PostgresApiKeyEnvironmentEnum;
    token: DefaultPostgresColumn<{
      columnType: "PgVarchar" | "PgText";
      data: string;
      notNull: true;
      dataType: "string";
    }>;
    userId: DefaultPostgresColumn<{
      columnType: "PgVarchar" | "PgText";
      data: string;
      notNull: true;
      dataType: "string";
    }>;

    createdAt: DefaultPostgresColumn<{
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      notNull: true;
    }>;
    updatedAt: DefaultPostgresColumn<{
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      notNull: false;
    }>;
  };
  dialect: "pg";
  schema: string | undefined;
}>;

export type DefaultPostgresSchema = {
  paymentIntentSchema: DefaultPostgresPaymentIntentTable;
  apiKeySchema: DefaultPostgresApiKeyTable;
};
