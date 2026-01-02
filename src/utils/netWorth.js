export const formatCurrency = (value, maxDigits = 10) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDigits,
  }).format(value);
};

export const computeNetWorth = (accounts) => {
  const total = accounts.reduce((sum, acct) => sum + (acct.balance ?? 0), 0);

  const byCategory = {};
  accounts.forEach((acct) => {
    const cat = acct.category || "Other";
    if (!byCategory[cat]) {
      byCategory[cat] = { total: 0, accounts: [] };
    }
    byCategory[cat].total += acct.balance ?? 0;
    byCategory[cat].accounts.push(acct);
  });

  return {
    total,
    byCategory,
    accounts,
  };
};
