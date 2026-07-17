import { renderToString } from "react-dom/server";
import App from "./App";

/**
 * Server entry used at build time to pre-render routes to static HTML.
 * Each route is rendered with React on the server so crawlers receive
 * fully-formed markup instead of an empty SPA shell.
 */
export function render(path: string): string {
  return renderToString(<App ssrPath={path} />);
}
