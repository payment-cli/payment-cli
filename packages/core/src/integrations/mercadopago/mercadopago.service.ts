import axios from "axios";

import type { CreatePreferencePayload } from "mercadopago/models/preferences/create-payload.model";
import type { PaymentSearchResponse } from "mercadopago/resources/payment";

export async function createMercadoPagoPaymentLink(
  preference: CreatePreferencePayload,
  MERCADO_PAGO_ACCESS_TOKEN: string
): Promise<{ id: string; link: string }> {
  try {
    const response = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      preference,
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { id, init_point } = response.data;

    return {
      id,
      link: init_point,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error creating MercadoPago payment link");
  }
}
interface PaymentData {
  id: number;
  status: string;
  external_reference: string;
  date_created: string;
  last_updated: string;
  transaction_amount: number;
  payment_method_id: string;
  payer: Payer;
}
interface Payer {
  id: string;
  email: string;
  identification: Identification;
}
interface Identification {
  type: string;
  number: string;
}
export async function getMercadoPagoPaymentData(
  paymentId: number,
  MERCADO_PAGO_ACCESS_TOKEN: string
): Promise<PaymentData> {
  try {
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Error retrieving MercadoPago payment data");
  }
}

export async function searchPaymentData(
  orderId: string,
  MERCADO_PAGO_ACCESS_TOKEN: string
) {
  try {
    const response = await axios.get<PaymentSearchResponse["body"]>(
      `https://api.mercadopago.com/v1/payments/search`,
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
        params: {
          external_reference: orderId,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log({ error });
    throw new Error("Error retrieving MercadoPago payment data");
  }
}
