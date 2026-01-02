import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Get base path from Vite config or use "/"
// For GitHub Pages, this should match the repo name (e.g., "/networth-dashboard/")
const basename = import.meta.env.BASE_URL || "/";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
