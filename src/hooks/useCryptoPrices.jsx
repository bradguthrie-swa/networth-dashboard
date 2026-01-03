import { useContext } from "react";
import { CryptoPriceContext } from "../context/CryptoPriceContext.js";

export const useCryptoPrices = () => {
  const context = useContext(CryptoPriceContext);
  if (!context) {
    throw new Error("useCryptoPrices must be used within CryptoPriceProvider");
  }
  return context;
};
