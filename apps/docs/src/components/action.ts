"use server";

import { sdk } from "@/server/sdk";

export const payWithProvider = async (
  provider: string,
  amount: number,
  currency = "CLP"
) => {
  return sdk.requestPaymentLink({
    service: provider,
    selectedCurrency: currency as "CLP",
    unitBase: amount,
    referenceId: "123",
  });
};
