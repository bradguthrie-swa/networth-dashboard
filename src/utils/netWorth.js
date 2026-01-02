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

// maximum decimal points for number formatting
export const ACCOUNT_SUMMARY_NET_WORTH_MAX_DIGITS = 2;
export const RETIREMENT_INVESTMENT_ACCOUNT_MAX_DIGITS = 2;
export const CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS = 4;

/**
 * Generates a randomized number within a given range and a given number of digits.
 *
 * @param {Number} min - A minimum value for the randomized number.
 * @param {Number} max - A maximum value for the randomized number.
 * @param {Number} maxDecimalPoints - A maximum number of decimal points for the randomized number.
 * @returns {Number} maxDecimalPoints - A randomized number within the given range and within the given maximum decimal points.
 */
export const generateRandomNumberInRangeWithMaxDigits = (
  min,
  max,
  maxDecimalPoints = RETIREMENT_INVESTMENT_ACCOUNT_MAX_DIGITS
) => {
  const randomNumber = Math.random() * (max - min) + min;
  const randomNumberWithMaxDecimalPoints = Number(
    randomNumber.toFixed(maxDecimalPoints)
  );
  return randomNumberWithMaxDecimalPoints;
};
