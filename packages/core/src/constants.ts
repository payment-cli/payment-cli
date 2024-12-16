export type PaymentIntentStatus = "PROCESSING" | "SUCCEEDED" | "FAILED";

export type SupportedCurrencies = "USD" | "CLP" | "MXN";
export const SupportedCurrencies = { USD: "USD", CLP: "CLP", MXN: "MXN" };

export enum SupportedHTTPMethod {
  GET = "GET",
  POST = "POST",
}
