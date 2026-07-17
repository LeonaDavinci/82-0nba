import { useEffect } from "react";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Keeps per-route SEO metadata in sync on the client (titles, description,
 * canonical, Open Graph / Twitter). Static crawlers read the prerendered shell;
 * JS-capable crawlers (e.g. Googlebot) pick up the route-accurate values here.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    upsertMeta("property", "og:title", title);
    upsertMeta("name", "twitter:title", title);

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }

    if (typeof window !== "undefined") {
      const url = window.location.origin + window.location.pathname;
      upsertLink("canonical", url);
      upsertMeta("property", "og:url", url);
    }
  }, [title, description]);
}
