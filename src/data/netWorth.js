import {
  CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS,
  RETIREMENT_INVESTMENT_ACCOUNT_MAX_DIGITS,
  generateRandomNumberInRangeWithMaxDigits,
} from "../utils/netWorth";
export const financialAccounts = [
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
      RETIREMENT_INVESTMENT_ACCOUNT_MAX_DIGITS
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
      RETIREMENT_INVESTMENT_ACCOUNT_MAX_DIGITS
    ),
  },
  {
    id: "hsa",
    name: "HSA",
    category: "Retirement",
    taxType: "Tax-Advantaged",
    description: "HSA",
    balance: generateRandomNumberInRangeWithMaxDigits(
      100_000,
      150_000,
      RETIREMENT_INVESTMENT_ACCOUNT_MAX_DIGITS
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
      75_000,
      100_000,
      RETIREMENT_INVESTMENT_ACCOUNT_MAX_DIGITS
    ),
  },
  {
    id: "taxable-brokerage-2",
    name: "Schwab High Risk Taxable Brokerage",
    category: "Investments",
    taxType: "Taxable",
    description: "High Risk Investments",
    balance: generateRandomNumberInRangeWithMaxDigits(
      25_000,
      75_000,
      RETIREMENT_INVESTMENT_ACCOUNT_MAX_DIGITS
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
      0.1,
      0.25,
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
      100,
      500,
      CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS
    ),
  },
];
