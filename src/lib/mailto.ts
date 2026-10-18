import { site } from "./site";

// Until the site has a backend, quote requests and orders are sent by opening
// the customer's email app with a pre-filled message to the store.
// See README → "Next steps" to switch this to a server-side email service.
export function storeMailto(subject: string, lines: (string | false | undefined)[]): string {
  const body = lines.filter((l): l is string => typeof l === "string").join("\n");
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Opens the visitor's email app. Call from event handlers only. */
export function openEmail(href: string) {
  window.location.assign(href);
}
