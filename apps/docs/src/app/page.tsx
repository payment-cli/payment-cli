import { BuyNowButton } from "@/components/BuyNowButton";

export default function Page() {
  return (
    <>
      <h1>Web</h1>
      <button>Boop</button>
      <BuyNowButton price={10000} currency="CLP" />
    </>
  );
}
