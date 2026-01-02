import { useEffect, useMemo, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
} from "recharts";
import { financialAccounts } from "../data/netWorth";
import { computeNetWorth, formatCurrency } from "../utils/netWorth";
import { useCryptoPrices } from "../contexts/CryptoPriceContext";
import { fetchSchwabBalances } from "../utils/schwabApi";
import { RefreshIcon } from "../icons/RefreshIcon";
import { SpinnerIcon } from "../icons/SpinnerIcon";
import { RENDER_DELAY_1_SECOND_MS } from "../utils/constants";

const COLORS = [
  "#0ea5e9", // blue
  "#22c55e", // green
  "#ef4444", // red
  "#f59e0b", // yellow
  "#6366f1", // purple
  "#14b8a6", // teal
];

const NetWorth = () => {
  const {
    prices: cryptoPrices,
    error: cryptoError,
    lastUpdated: cryptoLastUpdated,
    refreshPrices,
    isLoading: isCryptoLoading,
  } = useCryptoPrices();
  const [accounts, setAccounts] = useState(financialAccounts);
  const [sortKey, setSortKey] = useState("balance");
  const [sortDir, setSortDir] = useState("desc"); // default: highest balance first
  const [priceError, setPriceError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isChartLoading, setIsChartLoading] = useState(true);

  useEffect(() => {
    const loadSchwabBalances = async () => {
      try {
        const schwabData = await fetchSchwabBalances().catch((err) => {
          console.warn("Schwab API fetch failed:", err);
          return null;
        });

        const next = financialAccounts?.map((acct) => {
          // Update crypto balances from context
          if (
            acct.taxType === "Crypto" &&
            acct.symbol &&
            acct.quantity &&
            cryptoPrices
          ) {
            const price = cryptoPrices[acct.symbol];
            if (price) {
              return {
                ...acct,
                balance: price * acct.quantity,
                livePrice: price,
              };
            }
          }

          // Update Schwab account balances
          if (acct.schwabAccountType && schwabData) {
            const balance = schwabData[acct.schwabAccountType];
            if (balance !== undefined) {
              return {
                ...acct,
                balance: balance,
              };
            }
          }

          return acct;
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
        }, RENDER_DELAY_1_SECOND_MS);
      } catch (err) {
        // If update fails, keep static balances
        setPriceError("Live prices unavailable; showing last saved values.");
        setIsChartLoading(false);
      }
    };

    // Reset chart loading when crypto prices change
    if (isCryptoLoading) {
      setIsChartLoading(true);
    }

    loadSchwabBalances();
  }, [cryptoPrices, cryptoError, cryptoLastUpdated, isCryptoLoading]);

  const {
    total,
    byCategory,
    accounts: acctList,
  } = useMemo(() => computeNetWorth(accounts), [accounts]);

  const categoryData = useMemo(
    () =>
      Object.entries(byCategory)?.map(([name, info]) => ({
        name,
        value: info.total,
      })),
    [byCategory]
  );

  const sortedAccounts = useMemo(() => {
    const list = [...acctList];
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
  }, [acctList, sortDir, sortKey]);

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

  const handleRefresh = () => {
    setIsChartLoading(true);
    // TODO: Fix for when on the public URL: https://bradguthrie-swa.github.io/networth-dashboard/
    // Refreshing prices works fine locally, but not on the public website.
    if (import.meta.env.DEV) {
      refreshPrices();
    } else {
      console.info("Refreshing for values is disabled on the public website.");
    }
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
              and Crypto holdings.
            </p>
            <p className="text-sm text-slate-500">
              Crypto holdings refresh automatically using the CoinGecko API. All
              others are tracked manually.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total net worth</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {formatCurrency(total, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Largest category</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              <span className="text-2xl font-semibold text-slate-900">
                {categoryData?.sort((a, b) => b.value - a.value)[0]?.name ??
                  "Unknown"}
              </span>
              <span className="text-2xl font-semibold mx-2 text-slate-500">
                —
              </span>
              <span className="text-2xl font-semibold text-slate-900">
                {formatCurrency(
                  categoryData?.sort((a, b) => b.value - a.value)[0]?.value ??
                    0,
                  0
                )}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Accounts tracked</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {acctList.length}
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Allocation</p>
                <p className="text-xl font-semibold text-slate-900">
                  By category
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={
                  !import.meta.env.DEV || isCryptoLoading || isChartLoading
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                title="Refresh crypto prices. Disabled on public URL to prevent API spamming."
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
                      outerRadius={110}
                      isAnimationActive={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData?.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ReTooltip
                      formatter={(value) => formatCurrency(value, 2)}
                    />
                    <ReLegend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Future Features
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <s>• Connect to the CoinGecko API to refresh crypto prices</s>
              </li>
              <li>• Connect to the Schwab API to refresh account balances</li>
              <li>
                • Connect to the Empower API to refresh retirement account
                balances
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Accounts</p>
              <p className="text-xl font-semibold text-slate-900">
                Balances by account
              </p>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-1"
                    >
                      Account{" "}
                      <span className="text-xs text-slate-500">
                        {sortIcon("name")}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("category")}
                      className="flex items-center gap-1"
                    >
                      Category{" "}
                      <span className="text-xs text-slate-500">
                        {sortIcon("category")}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("taxType")}
                      className="flex items-center gap-1"
                    >
                      Tax Type{" "}
                      <span className="text-xs text-slate-500">
                        {sortIcon("taxType")}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("description")}
                      className="flex items-center gap-1"
                    >
                      Description{" "}
                      <span className="text-xs text-slate-500">
                        {sortIcon("description")}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort("balance")}
                      className="flex items-center gap-1"
                    >
                      Balance{" "}
                      <span className="text-xs text-slate-500">
                        {sortIcon("balance")}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedAccounts?.map((acct) => (
                  <tr key={acct.id}>
                    <td className="px-4 py-3">
                      <div
                        className="font-semibold text-slate-900"
                        title={
                          acct.taxType === "Crypto" && acct.quantity
                            ? `${acct.quantity} ${acct.description}`
                            : acct.name
                        }
                      >
                        {acct.name}
                      </div>
                      {acct.note ? (
                        <div className="text-xs text-slate-500">
                          {acct.note}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{acct.category}</td>
                    <td className="px-4 py-3">{acct.taxType}</td>
                    <td className="px-4 py-3">{acct.description}</td>
                    <td className="px-4 py-3 text-left font-semibold text-slate-900">
                      {formatCurrency(acct.balance ?? 0)}
                      {acct.taxType === "Crypto" && acct.quantity ? (
                        <div className="text-xs text-slate-500">
                          <div>
                            {acct.quantity} {acct.description}
                          </div>
                          <div>At {formatCurrency(acct.livePrice)} each.</div>
                        </div>
                      ) : null}
                    </td>
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
              refresh via Schwab API. Updates every 5 minutes.
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
