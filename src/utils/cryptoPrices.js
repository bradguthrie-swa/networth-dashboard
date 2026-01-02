import { CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS } from "./constants";

export const fetchCryptoPrices = async (
  coins = ["bitcoin", "ethereum", "dogecoin"],
  currencies = ["usd"]
) => {
  const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(
    ","
  )}&vs_currencies=${currencies.join(
    ","
  )}&precision=${CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS}&include_24hr_change=true
  `;
  const res = await fetch(COINGECKO_URL);

  if (!res.ok) {
    const error = new Error(
      res.status === 429
        ? "Rate limit exceeded. Please try again later."
        : "Failed to fetch crypto prices"
    );
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return {
    ...coins.reduce((acc, coin) => {
      acc[coin] = data?.[coin]?.usd ?? null;
      return acc;
    }, {}),
  };
};
