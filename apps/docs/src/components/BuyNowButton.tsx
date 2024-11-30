"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, ShoppingCartIcon as Paypal, Apple } from "lucide-react";
import { payWithProvider } from "./action";

type PaymentProvider = "stripe" | "paypal" | "mercadopago";

type BuyNowButtonProps = {
  price: number;
  currency: string;
};

export function BuyNowButton({ price, currency }: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProvider | null>(null);

  const handlePurchase = async (provider: PaymentProvider) => {
    setIsLoading(true);
    setSelectedProvider(provider);
    try {
      await payWithProvider(provider, price);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsLoading(false);
      setSelectedProvider(null);
    }
  };

  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider) {
      case "stripe":
        return <CreditCard className="mr-2 h-4 w-4" />;
      case "paypal":
        return <Paypal className="mr-2 h-4 w-4" />;
      case "mercadopago":
        return <Apple className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="w-full sm:w-auto transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span>
              Buy Now - {price.toFixed(2)} {currency}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem onClick={() => handlePurchase("mercadopago")}>
          {getProviderIcon("mercadopago")} Pay with Stripe
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePurchase("paypal")}>
          {getProviderIcon("paypal")} Pay with PayPal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePurchase("stripe")}>
          {getProviderIcon("stripe")} Pay with Stripe
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
