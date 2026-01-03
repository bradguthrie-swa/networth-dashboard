import {
  FINANCIAL_ACCOUNT_MAX_DIGITS,
  CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS,
} from "../utils/constants";
import { generateRandomNumberInRangeWithMaxDigits } from "../utils/netWorth";

/**
 * Generates an array of financial account objects with randomized values.
 *
 * @property {String} id - A unique identifier for the account.
 * @property {String} name - The display name of the account.
 * @property {String} category - The category classification (e.g., "Retirement", "Investments", "Cryptocurrency").
 * @property {String} taxType - The tax treatment type (e.g., "Tax-Deferred", "Roth", "Taxable", "Crypto").
 * @property {String} description - A description of the account or holding.
 * @property {Number} balance - The current balance value (for non-crypto accounts).
 * @property {String} symbol - The cryptocurrency coin name, used to fetch live prices from the CoinGecko API (for crypto accounts only).
 * @property {Number} quantity - The quantity of cryptocurrency held (for crypto accounts only).
 * @returns {Array<Object>} An array of financial account objects representing retirement accounts, investment accounts, and cryptocurrency holdings.
 */
export const generateFinancialAccounts = () => [
  // Retirement accounts (401k, Roth 401k, HSA)
  {
    id: "401k",
    name: "401k",
    category: "Retirement",
    taxType: "Tax-Deferred",
    description: "401k",
    balance: generateRandomNumberInRangeWithMaxDigits(
      500_000,
      1_500_000,
      FINANCIAL_ACCOUNT_MAX_DIGITS
    ),
  },
  {
    id: "roth-401k",
    name: "Roth 401k",
    category: "Retirement",
    taxType: "Roth",
    description: "Roth 401k",
    balance: generateRandomNumberInRangeWithMaxDigits(
      150_000,
      500_000,
      FINANCIAL_ACCOUNT_MAX_DIGITS
    ),
  },
  {
    id: "hsa",
    name: "HSA",
    category: "Retirement",
    taxType: "Tax-Advantaged",
    description: "HSA",
    balance: generateRandomNumberInRangeWithMaxDigits(
      125_000,
      150_000,
      FINANCIAL_ACCOUNT_MAX_DIGITS
    ),
  },
  // Investment accounts (Taxable Brokerage)
  {
    id: "taxable-brokerage",
    name: "Schwab Taxable Brokerage",
    category: "Investments",
    taxType: "Taxable",
    description: "Low Risk Investments",
    balance: generateRandomNumberInRangeWithMaxDigits(
      100_000,
      125_000,
      FINANCIAL_ACCOUNT_MAX_DIGITS
    ),
  },
  {
    id: "taxable-brokerage-2",
    name: "Schwab High Risk Taxable Brokerage",
    category: "Investments",
    taxType: "Taxable",
    description: "High Risk Investments",
    balance: generateRandomNumberInRangeWithMaxDigits(
      100_000,
      125_000,
      FINANCIAL_ACCOUNT_MAX_DIGITS
    ),
  },
  // Cryptocurrency accounts (Individual holdings for Bitcoin, Ethereum, Dogecoin)
  {
    id: "btc",
    name: "Bitcoin",
    category: "Cryptocurrency",
    taxType: "Crypto",
    description: "BTC",
    symbol: "bitcoin",
    quantity: generateRandomNumberInRangeWithMaxDigits(
      0.25,
      0.5,
      CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS
    ),
  },
  {
    id: "eth",
    name: "Ethereum",
    category: "Cryptocurrency",
    taxType: "Crypto",
    description: "ETH",
    symbol: "ethereum",
    quantity: generateRandomNumberInRangeWithMaxDigits(
      2.5,
      5.0,
      CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS
    ),
  },
  {
    id: "doge",
    name: "Dogecoin",
    category: "Cryptocurrency",
    taxType: "Crypto",
    description: "DOGE",
    symbol: "dogecoin",
    quantity: generateRandomNumberInRangeWithMaxDigits(
      10000,
      25000,
      CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS
    ),
  },
];
