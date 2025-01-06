import type { SupportedCurrencies as SupportedCurrenciesType } from "@rccpr/core";

export const SupportedCurrencies = {
  USD: "USD",
  CLP: "CLP",
  MXN: "MXN",
} as const satisfies Record<SupportedCurrenciesType, SupportedCurrenciesType>;

type _SupportedCurrencies = typeof SupportedCurrencies;

export type SupportedCurrencies = keyof _SupportedCurrencies;
