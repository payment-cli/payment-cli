import {
  Core,
  createMercadoPagoIntegration,
  createStripeIntegration,
} from "@rccpr/core";
import { prismaAdapter } from "@rccpr/adapter-prisma";
import { db } from "../../../server/db";
import { env } from "../../../env";

const core = new Core({
  basePath: "/api/pay",
  integrations: [
    createMercadoPagoIntegration({
      accessToken: env.MP_ACCESS_TOKEN,
    }),
    createStripeIntegration({
      secretKey: env.STRIPE_SECRET_KEY,
      publicKey: env.STRIPE_PUSHABLE_KEY,
    }),
  ],
  adapter: prismaAdapter(db),
  config: {
    onApproved(data) {
      console.log(data);
    },
    onPending(data) {
      console.log(data);
    },
    onRejected(data) {
      console.log(data);
    },
  },
});

const handler = (request: Request) => core.processRequest(request);
export const POST = handler;
export const GET = handler;
