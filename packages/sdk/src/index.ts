import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { SupportedCurrencies } from "./supported-currencies";
import type { PaymentIntentOutput as _PaymentIntentOutput } from "@rccpr/core";
import type { IsEqual } from "type-fest";

type PaySdkOptions = {
  apiURL?: string;
  axiosOptions?: AxiosRequestConfig;
};

type PaymentIntentOutput = {
  id: string;
  link: string;
};

{
  type X = IsEqual<PaymentIntentOutput, _PaymentIntentOutput>;
  // the following line should not throw any error
  // and should be deleted at compile time (checking types only)
  void (true satisfies X);
}

export class PaySdk {
  axios: AxiosInstance;
  constructor(options: PaySdkOptions) {
    this.axios = axios.create({
      ...(options.axiosOptions ?? {}),
      baseURL:
        options.apiURL ??
        process.env.PC_API_URL ??
        "https://paymentcli.xyz/api/pay",
    });
  }

  getSupportedCurrencies = async (): Promise<SupportedCurrencies[]> => {
    const response = await this.axios.get<SupportedCurrencies[]>(
      "/general/supported_currencies"
    );

    return response.data;
  };

  getSupportedProviderForCurrency = async (
    currency: SupportedCurrencies
  ): Promise<string[]> => {
    const response = await this.axios.get<string[]>(
      `/general/supported_services/${currency}`
    );

    return response.data;
  };

  getSupportedProvider = async (): Promise<string[]> => {
    const response = await this.axios.get<string[]>(
      `/general/supported_services`
    );

    return response.data;
  };
  requestPaymentLink = async ({
    service,
    selectedCurrency,
    unitBase,
    referenceId,
  }: {
    service: string;
    selectedCurrency: SupportedCurrencies;
    unitBase: number;
    referenceId: string;
  }): Promise<PaymentIntentOutput> => {
    const serviceString = String(service);
    const response = await this.axios.post<PaymentIntentOutput>(
      `/integration/${serviceString}/create_request`,
      {
        currency: selectedCurrency,
        unitBase,
        referenceId,
      }
    );

    return response.data;
  };
}
