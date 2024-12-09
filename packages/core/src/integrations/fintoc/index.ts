import { Effect, Layer } from "effect";
import { Readable } from "stream";
import { createIntegration, IntegrationDetail } from "../base-integration";
import { SupportedHTTPMethod } from "../../constants";
import z from "zod";
import { GetValueByName, getValueFrom } from "../../helpers/get-value-from";
import { getSessionToken } from "./service";

type FintocHTMLOptions = {
  sessionToken: string;
  publicKey: string;
};

const fintocHTML = (options: FintocHTMLOptions) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1.0, maximum-scale=1.0"
      />
      <title>Fintoc Demo</title>
      <script src="https://js.fintoc.com/v1/"></script>
    </head>
    <body>
      <script>
        window.onload = () => {
          const widget = Fintoc.create({
            sessionToken: "${options.sessionToken}",
            product: "payments",
            publicKey:  "${options.publicKey}",
          });
          widget.open();
        };
      </script>
    </body>
  </html>
`;

type FintocConfig = {
  secretKey: string | GetValueByName<string>;
  publicKey: string | GetValueByName<string>;
};

export const createFintocIntegration = (config: FintocConfig) => {
  const name = "fintoc" as const;

  const fintocLive = Layer.succeed(
    IntegrationDetail,
    IntegrationDetail.of({
      name,
      supportedCurrencies: ["CLP", "MXN"],
      getPaymentIntentStatus(paymentIntentId: string) {
        return Effect.gen(function* () {
          return {} as any;
        });
      },

      createPaymentIntent({ baseUnit, externalId, currency, paymentIntentId }) {
        return Effect.gen(function* () {
          const secretKey = yield* Effect.promise(() =>
            getValueFrom(config.secretKey, [paymentIntentId])
          );
          const sessionToken = yield* Effect.promise(() =>
            getSessionToken(
              {
                currency: currency,
                amount: baseUnit,
                customer_email: null,
              },
              secretKey
            )
          );
          const [partOne, partTwo] = externalId.split("_");
          const id = [partOne, partTwo].join("_");

          return {
            id,
            link: `${"/api/pay"}/integration/${name}/internal/fintoc-html?sessionToken=${sessionToken}&publicKey=${config.publicKey}`,
          };
        });
      },
      handleWebhookRequest: (originalRequest, req) => {
        return {} as any;
      },
      internalRoutes: [
        [
          SupportedHTTPMethod.GET,
          `/integration/${name}/internal/fintoc-html`,
          ({ req }) => {
            const { sessionToken, publicKey } = z
              .object({
                sessionToken: z.string(),
                publicKey: z.string(),
              })
              .parse(req.query);

            const html = fintocHTML({
              sessionToken,
              publicKey,
            });

            const body = new Readable();
            body.push(html);
            body.push(null);

            return {
              body,
              headers: {
                "Content-Type": "text/html",
              },
            };
          },
        ],
      ],
    })
  );

  return { [name]: fintocLive.pipe(createIntegration) };
};
