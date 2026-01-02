import { Route, Routes } from "react-router-dom";
import { CryptoPriceProvider } from "./contexts/CryptoPriceContext";
import NetWorth from "./pages/NetWorth";

function App() {
  return (
    <CryptoPriceProvider>
      <Routes>
        <Route path="/" element={<NetWorth />} />
      </Routes>
    </CryptoPriceProvider>
  );
}

export default App;
