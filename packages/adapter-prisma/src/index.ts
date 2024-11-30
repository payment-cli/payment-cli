import type { PrismaClient } from "@prisma/client";
import type { DataServiceType, PaymentIntent } from "@rccpr/core";

export const prismaAdapter = (prisma: PrismaClient): DataServiceType => {
  return {
    async updatePaymentIntent(
      find: Partial<PaymentIntent>,
      update: Partial<PaymentIntent>
    ) {
      const paymentIntent = await prisma.paymentIntent.update({
        data: { ...update, metadata: update.metadata || {} },
        where: find as any,
      });

      if (!paymentIntent) throw new Error("couldn't update order");
      return paymentIntent as PaymentIntent;
    },
    async createPaymentIntent(value) {
      return (await prisma.paymentIntent.create({
        data: { ...value, metadata: value.metadata || {} },
      })) as PaymentIntent;
    },
    async getOrderByExternalId(id: string) {
      return (await prisma.paymentIntent.findFirst({
        where: {
          externalId: id,
        },
      })) as PaymentIntent | null;
    },
    async getOrderById(id: string) {
      return (await prisma.paymentIntent.findUnique({
        where: {
          id: id,
        },
      })) as PaymentIntent | null;
    },
  };
};
