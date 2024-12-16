import axios from "axios";

export const getSessionToken = async (
  session: {
    amount: number;
    currency: string;
    customer_email: string | null;
  },
  secretKey: string
) => {
  const result = await axios.post<{ session_token: string }>(
    "https://api.fintoc.com/v1/checkout_sessions",
    session,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: secretKey,
      },
    }
  );

  return result.data.session_token;
};
