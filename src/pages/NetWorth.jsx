import { useEffect, useMemo, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  RefreshIcon,
  SpinnerIcon,
  CaretUpIcon,
  CaretDownIcon,
  ShuffleIcon,
  DashIcon,
} from "../icons";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { fetchSchwabBalances } from "../utils/schwabApi";
import { generateFinancialAccounts } from "../data/netWorth";
import { computeNetWorth, formatCurrency } from "../utils/netWorth";
import {
  CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS,
  FINANCIAL_ACCOUNT_MAX_DIGITS,
  RENDER_DELAY_HALF_SECOND_MS,
  NET_WORTH_PIE_CHART_COLORS,
} from "../utils/constants";

const NetWorth = () => {
  const {
    prices: cryptoPrices,
    changes24h: cryptoChanges24h,
    error: cryptoError,
    lastUpdated: cryptoLastUpdated,
    refreshPrices,
    isLoading: isCryptoLoading,
  } = useCryptoPrices();
  const [accounts, setAccounts] = useState(generateFinancialAccounts());
  const [sortKey, setSortKey] = useState("balance");
  const [sortDir, setSortDir] = useState("desc"); // default: highest balance first
  const [priceError, setPriceError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const loadSchwabBalances = async () => {
      try {
        const schwabData = await fetchSchwabBalances().catch((err) => {
          console.warn("Schwab API fetch failed:", err);
          return null;
        });

        // Use current accounts state, or fall back to financialAccounts if accounts haven't been set yet
        const currentAccounts =
          accounts.length > 0 ? accounts : generateFinancialAccounts();
        const next = currentAccounts?.map((financialAccount) => {
          // Update crypto balances from context
          if (
            financialAccount.taxType === "Crypto" &&
            financialAccount.symbol &&
            financialAccount.quantity &&
            cryptoPrices
          ) {
            const price = cryptoPrices[financialAccount.symbol];
            if (price) {
              return {
                ...financialAccount,
                balance: price * financialAccount.quantity,
                livePrice: price,
              };
            }
          }

          // Update Schwab account balances
          if (financialAccount.schwabAccountType && schwabData) {
            const balance = schwabData[financialAccount.schwabAccountType];
            if (balance !== undefined) {
              return {
                ...financialAccount,
                balance: balance,
              };
            }
          }

          return financialAccount;
        });

        setAccounts(next);

        // Set error messages
        // TODO: Implement after Schwab API is setup
        /*
        if (cryptoError) {
          setPriceError(cryptoError);
        } else if (schwabData === null) {
          setPriceError(
            "Schwab account balances unavailable; showing last saved values."
          );
        } else {
          setPriceError(null);
        }
        */

        // Use crypto context's lastUpdated if available, otherwise current time
        setLastUpdated(cryptoLastUpdated || new Date());

        // Mark chart as ready after a short delay to allow rendering
        setTimeout(() => {
          setIsChartLoading(false);
        }, RENDER_DELAY_HALF_SECOND_MS);
      } catch (err) {
        // If update fails, keep static balances
        console.error("Error loading Schwab balances:", err);
        setPriceError("Live prices unavailable; showing last saved values.");
        setIsChartLoading(false);
      }
    };

    // Reset chart loading when crypto prices change
    if (isCryptoLoading) {
      setIsChartLoading(true);
    }

    loadSchwabBalances();
    // Note: accounts is intentionally excluded to prevent infinite loops
    // The effect updates accounts, so including it would cause re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptoPrices, cryptoError, cryptoLastUpdated, isCryptoLoading]);

  const {
    total,
    byCategory,
    accounts: accountList,
  } = useMemo(() => computeNetWorth(accounts), [accounts]);

  const categoryData = useMemo(
    () =>
      Object.entries(byCategory)?.map(([name, info]) => ({
        name,
        value: info.total,
      })),
    [byCategory]
  );

  const largestCategory = useMemo(() => {
    if (!categoryData || categoryData.length === 0) {
      return { name: "Unknown", value: 0 };
    }
    return categoryData.sort((a, b) => b.value - a.value)[0];
  }, [categoryData]);

  const sortedAccounts = useMemo(() => {
    const list = [...accountList];
    list?.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "balance") return (a.balance - b.balance) * dir;
      const valA = (a[sortKey] ?? "").toString().toLowerCase();
      const valB = (b[sortKey] ?? "").toString().toLowerCase();
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
    return list;
  }, [accountList, sortDir, sortKey]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  const isCryptoAccount = (account) => {
    return account.taxType === "Crypto" && account.quantity;
  };

  const SortableTableHeader = ({
    sortable = true,
    sortKey: headerKey,
    label,
    align = "left",
  }) => (
    <th className={`px-4 py-3 text-${align}`}>
      <button
        type="button"
        onClick={() => toggleSort(headerKey)}
        className={`flex items-center gap-1 ${
          sortable ? "cursor-pointer" : "cursor-default"
        }`}
        disabled={!sortable}
      >
        {label}
        {sortable && (
          <span className="text-xs text-slate-500">{sortIcon(headerKey)}</span>
        )}
      </button>
    </th>
  );

  const handleRefresh = () => {
    // TODO: Fix for when on the public URL: https://bradguthrie-swa.github.io/networth-dashboard/
    // Refreshing for the crypto prices seems to cause an error on the page - likely due to data rendering/not using optional chaining.
    // This issue appears to happen when the setIsChartLoading state changes.
    if (import.meta.env.DEV) {
      refreshPrices();
    } else {
      console.info("Refreshing for values is disabled on the public website.");
    }
  };

  const regenerateMockData = () => {
    // Regenerate all account data with new random values
    const regeneratedAccounts = generateFinancialAccounts();
    setAccounts(regeneratedAccounts);
    setIsChartLoading(true);
    refreshPrices();

    // Mark chart as ready after a short delay to allow rendering
    setTimeout(() => {
      setIsChartLoading(false);
    }, RENDER_DELAY_HALF_SECOND_MS);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Net Worth
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Snapshot across retirement accounts, taxable brokerage accounts,
              and cryptocurrency holdings.
            </p>
            <p className="text-sm text-slate-500">
              Cryptocurrency holdings refresh automatically using the CoinGecko
              API based off the amounts tracked in-code. All other values are
              tracked manually for demonstration purposes.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="text-md text-slate-500">Total net worth</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(total, FINANCIAL_ACCOUNT_MAX_DIGITS)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="text-md text-slate-500">Largest category</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              <span className="text-xl font-semibold text-slate-900">
                {largestCategory.name}
              </span>
              <span className="text-xl font-semibold mx-2 text-slate-900">
                —
              </span>
              <span className="text-xl font-semibold text-slate-900">
                {formatCurrency(
                  largestCategory.value,
                  FINANCIAL_ACCOUNT_MAX_DIGITS
                )}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="text-md text-slate-500">Investments tracked</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              <span className="text-xl font-semibold text-slate-900">
                {accountList?.length}
              </span>
              <span className="ml-2 text-xl font-semibold text-slate-900">
                {accountList?.length === 1
                  ? "Investment Account"
                  : "Investment Accounts"}
              </span>
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-md text-slate-500">Allocation</p>
                <p className="text-xl font-semibold text-slate-900">
                  By category
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={regenerateMockData}
                  disabled={isChartLoading}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 min-h-10 flex items-center justify-center text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Regenerate mock account data with new randomized values."
                >
                  {isChartLoading ? (
                    <span className="flex items-center gap-1.5">
                      <SpinnerIcon className="h-4 w-4" />
                      Regenerating Data...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <ShuffleIcon className="h-4 w-4" />
                      Regenerate Mock Data
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={
                    !import.meta.env.DEV || isCryptoLoading || isChartLoading
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 min-h-10 flex items-center justify-center text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Refresh cryptocurrency prices. Disabled on public URL to prevent API spamming."
                >
                  {isCryptoLoading || isChartLoading ? (
                    <span className="flex items-center gap-1.5">
                      <SpinnerIcon className="h-4 w-4" />
                      Refreshing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <RefreshIcon className="h-4 w-4" />
                      Refresh
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="mt-4 h-80 relative">
              {isChartLoading ||
              isCryptoLoading ||
              categoryData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <SpinnerIcon className="h-8 w-8 text-slate-400" />
                    <p className="text-sm text-slate-500">Loading chart...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer className="[&_*]:outline-none [&_*]:border-none">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius="90%"
                      isAnimationActive={false}
                      label={
                        isMobile
                          ? false
                          : ({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={!isMobile}
                      legendType="circle"
                    >
                      {categoryData?.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            NET_WORTH_PIE_CHART_COLORS[
                              index % NET_WORTH_PIE_CHART_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value, FINANCIAL_ACCOUNT_MAX_DIGITS)
                      }
                    />
                    <Legend wrapperStyle={{ paddingTop: 30 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Feature Roadmap
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                ✅ — Enable automatic deployments on every merge to the
                <code> main </code>branch with GitHub Pages
              </li>
              <li>
                ✅ — Randomize the data in <code> src/data/netWorth.js </code>
                for mocking purposes.
              </li>
              <li>
                ✅ — Connect to the<strong> CoinGecko API </strong>to refresh
                cryptocurrency prices for
                <strong> Bitcoin, Ethereum, and Dogecoin</strong>.
              </li>
              <li>
                ❌ — Connect to the<strong> Schwab Developer API </strong>to
                refresh account balances for accounts within
                <strong> Charles Schwab </strong>such as a taxable brokerage,
                checking account, individual retirement account
                <strong> (IRA)</strong>, Roth individual retirement account
                <strong> (Roth IRA)</strong>, etc.
              </li>
              <li>
                ❌ — Connect to the <strong>Empower API</strong> to refresh
                retirement account balances for accounts such as a
                <strong> 401k, Roth 401k, HSA</strong>, etc.
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md text-slate-500">Accounts</p>
              <p className="text-xl font-semibold text-slate-900">
                Balances by account
              </p>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y-2 divide-slate-100 text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <SortableTableHeader sortKey="name" label="Account" />
                  <SortableTableHeader sortKey="balance" label="Balance" />
                  <SortableTableHeader
                    sortable={false}
                    sortKey="24hChange"
                    label="24h Change"
                  />
                  <SortableTableHeader sortKey="category" label="Category" />
                  <SortableTableHeader sortKey="taxType" label="Tax Type" />
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 bg-white">
                {sortedAccounts?.map((sortedAccount) => (
                  <tr key={sortedAccount.id}>
                    <td className="px-4 py-3">
                      <div
                        className="font-semibold text-slate-900"
                        title={
                          isCryptoAccount(sortedAccount)
                            ? `${sortedAccount.quantity} ${sortedAccount.description}`
                            : sortedAccount.name
                        }
                      >
                        <div className="items-center gap-1">
                          <div>{sortedAccount.name}</div>
                          <div className="text-xs text-slate-500">
                            {sortedAccount.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-left font-semibold text-slate-900">
                      {formatCurrency(
                        sortedAccount.balance ?? 0,
                        FINANCIAL_ACCOUNT_MAX_DIGITS
                      )}
                      {isCryptoAccount(sortedAccount) &&
                        (() => {
                          const cryptoMaxDecimalPoints =
                            sortedAccount.livePrice < 1
                              ? CRYPTOCURRENCY_ACCOUNT_MAX_DIGITS
                              : 2;
                          const cryptoQuantityString = `${sortedAccount.quantity} ${sortedAccount.description}`;
                          const cryptoPriceString = `At ${formatCurrency(
                            sortedAccount.livePrice,
                            cryptoMaxDecimalPoints
                          )} each.`;
                          return (
                            <div className="text-xs text-slate-500">
                              <div>{cryptoQuantityString}</div>
                              <div>{cryptoPriceString}</div>
                            </div>
                          );
                        })()}
                    </td>
                    <td className="px-4 py-3">
                      {isCryptoAccount(sortedAccount) &&
                      sortedAccount.symbol &&
                      cryptoChanges24h?.[sortedAccount.symbol] !== null &&
                      cryptoChanges24h?.[sortedAccount.symbol] !== undefined ? (
                        <div
                          className={`flex items-center justify-end gap-1 text-sm font-medium w-20 ${
                            cryptoChanges24h[sortedAccount.symbol] >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {cryptoChanges24h[sortedAccount.symbol] >= 0 ? (
                            <CaretUpIcon className="h-3 w-3" />
                          ) : (
                            <CaretDownIcon className="h-3 w-3" />
                          )}
                          <span>
                            {Math.abs(
                              cryptoChanges24h[sortedAccount.symbol]
                            ).toFixed(2)}
                            %
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end w-20">
                          <DashIcon className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{sortedAccount.category}</td>
                    <td className="px-4 py-3">{sortedAccount.taxType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {priceError ? (
            <p className="mt-2 text-xs text-amber-600">{priceError}</p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Crypto balances refresh via CoinGecko API. Schwab account balances
              refresh via Schwab API. Automatically updates every minute when
              developing locally, otherwise, automatically updates every 8
              hours.
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Last updated: {lastUpdated ? lastUpdated.toLocaleString() : "—"}
          </p>
        </section>
      </div>
    </div>
  );
};

export default NetWorth;
