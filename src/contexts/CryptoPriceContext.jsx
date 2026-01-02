import { createContext, useContext, useEffect, useState } from "react";
import { fetchCryptoPrices } from "../utils/cryptoPrices";
import {
  POLLING_INTERVAL_5_SECONDS_MS,
  POLLING_INTERVAL_5_MINUTES_MS,
} from "../utils/constants";
const CryptoPriceContext = createContext(null);

const CACHE_KEY = "crypto_prices_cache";
const CACHE_DURATION = POLLING_INTERVAL_5_MINUTES_MS;

const getCachedPrices = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { prices, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid (within 5 minutes)
    if (now - timestamp < CACHE_DURATION) {
      return { prices, timestamp };
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (err) {
    console.warn("Failed to read cached prices:", err);
    return null;
  }
};

const getCachedPricesExpired = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { prices, timestamp } = JSON.parse(cached);
    return { prices, timestamp };
  } catch (err) {
    console.warn("Failed to read cached prices:", err);
    return null;
  }
};

const setCachedPrices = (prices) => {
  try {
    const cacheData = {
      prices,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (err) {
    console.warn("Failed to cache prices:", err);
  }
};

export const CryptoPriceProvider = ({ children }) => {
  const initialCache = getCachedPrices();
  const [prices, setPrices] = useState(() => initialCache?.prices || null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() =>
    initialCache?.timestamp ? new Date(initialCache.timestamp) : null
  );

  const loadPrices = async (forceRefresh = false) => {
    // Check cache first unless forcing refresh
    if (!forceRefresh) {
      const cached = getCachedPrices();
      if (cached) {
        setPrices(cached.prices);
        setLastUpdated(new Date(cached.timestamp));
        setError(null);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const newPrices = await fetchCryptoPrices();
      setPrices(newPrices);
      setCachedPrices(newPrices);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      // Try to use cached prices even if expired as fallback
      const cached = getCachedPricesExpired();
      if (cached) {
        setPrices(cached.prices);
        setLastUpdated(new Date(cached.timestamp));
        // Check if it's a 429 rate limit error
        if (err.status === 429 || err.message?.includes("429")) {
          setError("Rate limit exceeded. Using cached prices.");
        } else {
          setError("Using cached prices. API request failed.");
        }
      } else {
        // No cache available at all
        if (err.status === 429 || err.message?.includes("429")) {
          setError(
            "Rate limit exceeded. Crypto prices unavailable; showing last saved values."
          );
        } else {
          setError("Crypto prices unavailable; showing last saved values.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load prices on mount
  useEffect(() => {
    loadPrices();
  }, []);

  // Set up interval to refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadPrices(true); // Force refresh after 5 minutes
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <CryptoPriceContext.Provider
      value={{
        prices,
        error,
        isLoading,
        lastUpdated,
        refreshPrices: () => loadPrices(true),
      }}
    >
      {children}
    </CryptoPriceContext.Provider>
  );
};

export const useCryptoPrices = () => {
  const context = useContext(CryptoPriceContext);
  if (!context) {
    throw new Error("useCryptoPrices must be used within CryptoPriceProvider");
  }
  return context;
};
