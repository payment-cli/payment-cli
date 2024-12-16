import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  pgTable,
  text,
  json,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { Jsonifiable } from "type-fest";

export const defaultPaymentIntentSchema = pgTable(
  "paymentIntent",
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

export function defineTables(
  schema: Partial<DefaultPostgresSchema> = {}
): Required<DefaultPostgresSchema> {
  const paymentIntentSchema =
    schema.paymentIntentSchema ?? defaultPaymentIntentSchema;

  return {
    paymentIntentSchema,
  };
}

export type DefaultPostgresSchema = {
  paymentIntentSchema: typeof defaultPaymentIntentSchema;
};
