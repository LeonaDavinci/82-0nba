import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root")!;

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const path = window.location.pathname.replace(/\/$/, "") || "/";
const relative = base && path.startsWith(base) ? path.slice(base.length) || "/" : path;

// The home route ("/") is pre-rendered to static HTML at build time, so hydrate
// it in place. All other routes ship the SPA shell, so render fresh.
if (rootEl.hasChildNodes() && relative === "/") {
  hydrateRoot(rootEl, <App />);
} else {
  rootEl.innerHTML = "";
  createRoot(rootEl).render(<App />);
}
