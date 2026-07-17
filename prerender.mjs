import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const templatePath = resolve(root, "dist/public/index.html");
const serverEntry = resolve(root, "dist/server/entry-server.js");

const SITE_URL = (process.env.SITE_URL || "https://82-0nba.com").replace(/\/$/, "");
// The HTML shell hardcodes this placeholder origin; keep canonical/OG/sitemap
// all driven by a single SITE_URL so custom domains stay consistent.
const PLACEHOLDER_ORIGIN = "https://82-0nba.com";

const template = readFileSync(templatePath, "utf-8").replaceAll(PLACEHOLDER_ORIGIN, SITE_URL);
const { render } = await import(serverEntry);

// Only the marketing landing page benefits from pre-rendering; the rest of the
// app is gated behind user interaction and client-only state.
const routes = ["/"];

for (const route of routes) {
  const appHtml = render(route);
  const html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );
  writeFileSync(templatePath, html, "utf-8");
  console.log(`prerendered ${route}`);
}

// Generate sitemap + robots with the production origin.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
writeFileSync(resolve(root, "dist/public/sitemap.xml"), sitemap, "utf-8");

const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;
writeFileSync(resolve(root, "dist/public/robots.txt"), robots, "utf-8");

console.log(`sitemap + robots written for ${SITE_URL}`);
