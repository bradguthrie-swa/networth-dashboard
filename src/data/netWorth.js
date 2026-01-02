// financial accounts
export const financialAccounts = [
  // Retirement accounts
  {
    id: "401k",
    name: "401k",
    category: "Retirement",
    taxType: "Tax-Deferred",
    description: "401k",
    balance: 125000,
  },
  {
    id: "roth-401k",
    name: "Roth 401k",
    category: "Retirement",
    taxType: "Roth",
    description: "Roth 401k",
    balance: 35000,
  },
  {
    id: "hsa",
    name: "HSA",
    category: "Retirement",
    taxType: "Tax-Advantaged",
    description: "HSA",
    balance: 25000,
  },
  // Investment accounts
  {
    id: "taxable-brokerage",
    name: "Schwab Taxable Brokerage",
    category: "Investments",
    taxType: "Taxable",
    description: "Low Risk Investments",
    balance: 16135.31,
  },
  {
    id: "taxable-brokerage-2",
    name: "Schwab High Risk Taxable Brokerage",
    category: "Investments",
    taxType: "Taxable",
    description: "High Risk Investments",
    balance: 11491.31,
  },
  // Crypto accounts
  {
    id: "btc",
    name: "Bitcoin",
    category: "Crypto",
    taxType: "Crypto",
    description: "BTC",
    symbol: "bitcoin",
    quantity: 0.1,
  },
  {
    id: "eth",
    name: "Ethereum",
    category: "Crypto",
    taxType: "Crypto",
    description: "ETH",
    symbol: "ethereum",
    quantity: 2.5,
  },
  {
    id: "doge",
    name: "Dogecoin",
    category: "Crypto",
    taxType: "Crypto",
    description: "DOGE",
    symbol: "dogecoin",
    quantity: 500.0,
  },
];
