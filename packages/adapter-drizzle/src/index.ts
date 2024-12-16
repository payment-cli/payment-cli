import { and, eq, is } from "drizzle-orm";
import type { DataServiceType, PaymentIntent } from "@rccpr/core";
import { SqlFlavorOptions } from "./client-type";
import { DefaultSchema } from "./client-type";
import { MySqlDatabase } from "drizzle-orm/mysql-core";
import { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { DefaultPostgresSchema, defineTables } from "./schema";

export function drizzleAdapter<SqlFlavor extends SqlFlavorOptions>(
  db: SqlFlavor,
  schema?: DefaultSchema<SqlFlavor>
): DataServiceType {
  if (is(db, MySqlDatabase)) {
    throw Error("MySQL adapter is not implemented");
  } else if (is(db, PgDatabase)) {
    return postgresDrizzleAdapter(db, schema);
  } else if (is(db, BaseSQLiteDatabase)) {
    throw Error("SQLIte adapter is not implemented");
  }

  throw new Error(
    `Unsupported database type (${typeof db}) in Auth.js Drizzle adapter.`
  );
}

export default function postgresDrizzleAdapter(
  client: PgDatabase<PgQueryResultHKT, any>,
  schema?: DefaultPostgresSchema
): DataServiceType {
  const { paymentIntentSchema } = defineTables(schema);
  return {
    async updatePaymentIntent(
      find: Partial<PaymentIntent>,
      update: Partial<PaymentIntent>
    ) {
      const conditions = Object.keys(find)
        .filter((key) => find[key as keyof PaymentIntent] !== undefined)
        .map((key) =>
          eq(
            paymentIntentSchema[key as keyof PaymentIntent],
            find[key as keyof PaymentIntent]!
          )
        );

      const [paymentIntent] = await client
        .update(paymentIntentSchema)
        .set({ ...update, metadata: update.metadata || {} })
        .where(and(...conditions))
        .returning();

      if (!paymentIntent) throw new Error("couldn't update order");
      return paymentIntent as PaymentIntent;
    },
    async createPaymentIntent(value) {
      const [payment] = await client
        .insert(paymentIntentSchema)
        .values({
          ...value,
          metadata: value.metadata || {},
        })
        .returning();

      return payment as PaymentIntent;
    },
    async getOrderByExternalId(id: string) {
      const [payment] = await client
        .select()
        .from(paymentIntentSchema)
        .where(eq(paymentIntentSchema.externalId, id));

      return payment as PaymentIntent | null;
    },
    async getOrderById(id: string) {
      const [payment] = await client
        .select()
        .from(paymentIntentSchema)
        .where(eq(paymentIntentSchema.id, id));

      return payment as PaymentIntent | null;
    },
  };
}
