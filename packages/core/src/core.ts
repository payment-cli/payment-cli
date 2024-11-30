import { Context, Effect, Layer } from "effect";
import {
  Integration,
  IntegrationConfigContext,
} from "./integrations/base-integration";
import { DataService } from "./services/data.service";
import { TrieRouter } from "@rccpr/trie-router";
import { RccprHandler } from "./internal.types";
import { SupportedCurrencies, SupportedHTTPMethod } from "./constants";
import z from "zod";
import { processRequest } from "./request-handler";

type Integrations = {
  [T in string]: Layer.Layer<
    Integration,
    never,
    DataService | IntegrationConfigContext
  >;
}[];

export type DataServiceType = Context.Tag.Service<DataService>;
type IntegrationConfigContextType =
  Context.Tag.Service<IntegrationConfigContext>;

type InternalOptions = {
  basePath?: string;
  integrations: Integrations;
  adapter: DataServiceType;
  config: IntegrationConfigContextType;
};

const requestBody = z.object({
  unitBase: z.number().int(),
  currency: z.enum([
    "USD",
    "CLP",
    "MXN",
  ] as const satisfies SupportedCurrencies[]),
  referenceId: z.string(),
});

class SchemaError {
  readonly _tag = "SchemaError";
  constructor(readonly cause: string) {}
}

export class Core {
  router = new TrieRouter<RccprHandler>();
  integrations: Integrations;
  basePath?: string;
  dataServiceLive: Layer.Layer<DataService>;
  configLive: Layer.Layer<IntegrationConfigContext>;

  constructor(options: InternalOptions) {
    if (options.basePath) {
      this.basePath = options?.basePath;
    }
    this.integrations = options.integrations;
    this.dataServiceLive = Layer.succeed(
      DataService,
      DataService.of(options.adapter)
    );
    this.configLive = Layer.succeed(
      IntegrationConfigContext,
      IntegrationConfigContext.of(options.config)
    );
    this.init();
  }

  init() {
    for (const integration of this.integrations) {
      const [integrationName, integrationLive] = Object.entries(integration)[0];

      const newLive = integrationLive.pipe(
        Layer.provide(this.dataServiceLive),
        Layer.provide(this.configLive)
      );

      this.addIntegration(integrationName, newLive);
      this.addGeneralRoutes();
      this.addInternalRoutes(newLive);
    }
  }

  addIntegration = (
    integrationName: string,
    integrationLive: Layer.Layer<Integration>
  ) => {
    this.router.add(
      SupportedHTTPMethod.POST,
      `/integration/${integrationName}/create_request`,
      async (ctx) => {
        const program = Effect.gen(function* () {
          const integration = yield* Integration;
          const parsedBody = requestBody.safeParse(ctx.req.body);

          if (!parsedBody.success) {
            return yield* Effect.fail(
              new SchemaError(
                parsedBody.error.flatten().formErrors.at(0) ?? "Schema error "
              )
            );
          }
          const paymentIntent = yield* integration.createPaymentIntent({
            baseUnit: parsedBody.data.unitBase,
            currency: parsedBody.data.currency,
            paymentIntentId: parsedBody.data.referenceId,
            externalId: "",
          });

          return {
            headers: { "Content-Type": "application/json" },
            body: paymentIntent,
          };
        }).pipe(
          Effect.catchTags({
            SchemaError: ({ cause }) =>
              Effect.succeed({
                status: 422,
                body: JSON.stringify({
                  cause,
                }),
              }),
          })
        );

        const runnable = Effect.provide(program, integrationLive);

        return Effect.runPromise(runnable);
      }
    );

    this.router.add(
      SupportedHTTPMethod.POST,
      `/integration/${integrationName}/webhook`,
      async ({ originalRequest, req }) => {
        const program = Effect.gen(function* () {
          const integration = yield* Integration;

          const { id } = yield* integration.handleWebhookRequest(
            originalRequest,
            req
          );

          const body = req.body;
          yield* integration.processPayment(id);
        });

        const runnable = Effect.provide(program, integrationLive);

        try {
          await Effect.runPromise(runnable);
        } catch (e) {
          console.log(e);
        }

        return {
          headers: { "Content-Type": "application/json" },
          body: {},
        };
      }
    );
  };

  private addInternalRoutes = (integrationLive: Layer.Layer<Integration>) => {
    try {
      const router = this.router;
      console.log("Adding internal routes");
      const program = Effect.gen(function* () {
        console.log("getting integration");
        const integration = yield* Integration;
        console.log({ integration });

        integration.internalRoutes?.forEach(([method, path, handler]) => {
          console.log({ method, path });
          router.add(method, path, handler);
        });
      });
      const runnable = Effect.provide(program, integrationLive);

      return Effect.runPromise(runnable);
    } catch (e) {
      console.log(e);
    }
  };
  private addGeneralRoutes = () => {
    try {
      const router = this.router;
      router.add(
        SupportedHTTPMethod.GET,
        "/general/supported_currencies",
        async () => {
          return {
            headers: { "Content-Type": "application/json" },
            body: Object.values(SupportedCurrencies),
          };
        }
      );
      router.add(
        SupportedHTTPMethod.GET,
        "/general/supported_services",
        async () => {
          return {
            headers: { "Content-Type": "application/json" },
            body: Object.keys(this.integrations),
          };
        }
      );
    } catch (e) {
      console.log(e);
    }
  };
  processRequest = async (req: Request) => {
    console.log("Processing request");
    return processRequest(this.router, req, this.basePath);
  };
}
