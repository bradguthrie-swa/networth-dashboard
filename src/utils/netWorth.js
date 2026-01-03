import { FINANCIAL_ACCOUNT_MAX_DIGITS } from "./constants";

/**
 * Formats a number as a currency string in USD format.
 *
 * @param {Number} value - Numeric value to format as currency.
 * @param {Number} maxDigits - Maximum number of decimal digits to display (default: 2)
 * @returns {String} Formatted currency string in USD format.
 */
export const formatCurrency = (
  value,
  maxDigits = FINANCIAL_ACCOUNT_MAX_DIGITS
) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDigits,
  }).format(value);
};

/**
 * Computes net worth totals from an array of financial accounts.
 *
 * @param {Array} accounts - Array of account objects with balance and category properties.
 * @returns {Object} Object containing total net worth, accounts grouped by category, and the original accounts array.
 */
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
/**
 * Generates a randomized number within a given range and a given number of maximum decimal points.
 *
 * @param {Number} min - Minimum value for the randomized number.
 * @param {Number} max - Maximum value for the randomized number.
 * @param {Number} maxDecimalPoints - Maximum number of decimal points for the randomized number.
 * @returns {Number} Randomized number within the given range and within the given maximum decimal points.
 */
export const generateRandomNumberInRangeWithMaxDigits = (
  min,
  max,
  maxDecimalPoints = FINANCIAL_ACCOUNT_MAX_DIGITS
) => {
  const randomNumber = Math.random() * (max - min) + min;
  const randomNumberWithMaxDecimalPoints = Number(
    randomNumber.toFixed(maxDecimalPoints)
  );
  return randomNumberWithMaxDecimalPoints;
};
