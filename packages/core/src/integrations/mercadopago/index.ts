import { Effect, Layer } from "effect";
import { GetValueByName, getValueFrom } from "../../helpers/get-value-from";
import { createIntegration, IntegrationDetail } from "../base-integration";
import {
  createMercadoPagoPaymentLink,
  getMercadoPagoPaymentData,
} from "./mercadopago.service";
import { CreatePreferencePayload } from "mercadopago/models/preferences/create-payload.model";
type BackUrls = {
  /** return URL in case of successful payment  */
  success?: string | GetValueByName<string>;
  /** return URL in case of pending payment  */
  pending?: string | GetValueByName<string>;
  /** return URL in case of failed payment  */
  failure?: string | GetValueByName<string>;
};

type AccessTokenConfig = {
  /**
   * string or function that returns the Mercado Pago Access Token
   */
  accessToken: string | GetValueByName<string>;
};

export type MercadoPagoIntegrationConfig = AccessTokenConfig & {
  back_urls?: BackUrls | GetValueByName<BackUrls>;
  itemTitle?: string | GetValueByName<string>;
};

const getConfigValues = async (
  config: MercadoPagoIntegrationConfig,
  referenceId: string
) => {
  const accessTokenP = getValueFrom(config.accessToken, [referenceId]);
  const backUrlsP = config.back_urls
    ? { backUrls: getValueFrom(config.back_urls, [referenceId]) }
    : {};
  const itemTitle = config.itemTitle
    ? await getValueFrom(config.itemTitle, [referenceId])
    : "Payment vía ";
  return {
    accessToken: await accessTokenP,
    backUrls: await backUrlsP,
    itemTitle,
  };
};

enum PaymentActions {
  CREATED = "payment.created",
  UPDATED = "payment.updated",
}

export const createMercadoPagoIntegration = (
  config: MercadoPagoIntegrationConfig
) => {
  const name = "mercadopago" as const;

  const mercadoPagoLive = Layer.succeed(
    IntegrationDetail,
    IntegrationDetail.of({
      name,
      supportedCurrencies: ["CLP"],
      getPaymentIntentStatus(paymentIntentId: string) {
        return Effect.gen(function* () {
          const accessToken = yield* Effect.promise(() =>
            getValueFrom(config.accessToken, [paymentIntentId])
          );

          const paymentData = yield* Effect.promise(() =>
            getMercadoPagoPaymentData(Number(paymentIntentId), accessToken)
          );

          const externalId = paymentData.external_reference;

          if (paymentData.status === "approved")
            return { status: "SUCCEEDED", externalId };

          if (paymentData.status === "rejected")
            return { status: "FAILED", externalId };

          return { status: "PROCESSING", externalId };
        });
      },

      createPaymentIntent({ baseUnit, externalId, paymentIntentId }) {
        return Effect.gen(function* () {
          const { accessToken, backUrls, itemTitle } = yield* Effect.promise(
            () => getConfigValues(config, externalId)
          );

          const preference: CreatePreferencePayload = {
            items: [
              {
                title: itemTitle,
                unit_price: baseUnit,
                quantity: 1,
              },
            ],
            external_reference: paymentIntentId,
            ...backUrls,
          };

          const mpResponse = yield* Effect.promise(() =>
            createMercadoPagoPaymentLink(preference, accessToken)
          );

          return mpResponse;
        });
      },
      handleWebhookRequest: (originalRequest, req) => {
        const body = req.body;

        if (!body) throw new Error("Bad event");
        if (
          ![PaymentActions.CREATED, PaymentActions.UPDATED].includes(
            body["action"]
          )
        )
          throw new Error("Bad event: unknown actions");

        const id = body["data"]?.id as string | undefined;

        if (!id) throw new Error("No id");

        return Effect.succeed({ id });
      },
    })
  );

  return { [name]: mercadoPagoLive.pipe(createIntegration) };
};
