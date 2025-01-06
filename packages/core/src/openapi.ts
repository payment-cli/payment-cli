import "zod-openapi/extend";
import { z } from "zod";
import { createDocument } from "zod-openapi";
import packageJson from "../package.json";

const jobId = z.string().openapi({
  description: "A unique identifier for a job",
  example: "12345",
  ref: "jobId",
});

const title = z.string().openapi({
  description: "Job title",
  example: "My job",
});

export const openapiDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "PaymentCLI API",
    version: packageJson.version,
  },
  paths: {
    "/jobs/{jobId}": {
      put: {
        requestParams: { path: z.object({ jobId }) },
        requestBody: {
          content: {
            "application/json": { schema: z.object({ title }) },
          },
        },
        responses: {
          "200": {
            description: "200 OK",
            content: {
              "application/json": { schema: z.object({ jobId, title }) },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
}) as any;
