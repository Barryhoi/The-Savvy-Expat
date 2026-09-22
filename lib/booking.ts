/**
 * Shared wiring for the Cal.com booking calendar: the event we book into,
 * the loader that both the calendar and its pre-warm step need, and the
 * pre-warm itself.
 */

export const CAL_ORIGIN = "https://app.cal.com";
export const CAL_SCRIPT = `${CAL_ORIGIN}/embed/embed.js`;
/** The Cal.com event the funnel books into. */
export const CAL_LINK = "team/the-savvy-expat/expat-relocation-discovery-call";
export const CAL_NAMESPACE = "expat-relocation-discovery-call";

export type CalFn = ((...args: unknown[]) => void) & {
  ns?: Record<string, (...args: unknown[]) => void>;
  loaded?: boolean;
  q?: unknown[];
};

declare global {
  interface Window {
    Cal?: CalFn;
  }
}

/**
 * The upstream Cal loader snippet, transcribed so it can run inside an effect.
 * It queues calls made before embed.js finishes downloading, so the namespace
 * is safe to use immediately after this returns.
 */
export function ensureCalLoader(): CalFn {
  const w = window;
  if (w.Cal) return w.Cal;

  const push = (target: { q?: unknown[] }, args: unknown) => {
    target.q = target.q || [];
    target.q.push(args);
  };

  const cal = function (...args: unknown[]) {
    const c = w.Cal as CalFn;
    if (!c.loaded) {
      c.ns = {};
      c.q = c.q || [];
      const script = document.createElement("script");
      script.src = CAL_SCRIPT;
      document.head.appendChild(script);
      c.loaded = true;
    }
    if (args[0] === "init") {
      const namespace = args[1];
      if (typeof namespace === "string") {
        const api = function (...inner: unknown[]) {
          push(api, inner);
        } as CalFn;
        api.q = api.q || [];
        c.ns![namespace] = c.ns![namespace] || api;
        push(c.ns![namespace] as unknown as { q?: unknown[] }, args);
        push(c, ["initNamespace", namespace]);
      } else {
        push(c, args);
      }
      return;
    }
    push(c, args);
  } as CalFn;

  w.Cal = cal;
  return cal;
}

/**
 * Warms the booking calendar before the visitor reaches it. Cal's `preload`
 * for an inline embed opens a hidden 0×0 iframe of the booking page, so its
 * app bundle, fonts and availability sit in the browser cache; when /booking
 * then mounts the real calendar, most of the work is already done. Fire this
 * from the step before the calendar, after that step's own embed has loaded
 * so the two never compete for bandwidth.
 */
export function preloadCalBooker() {
  const Cal = ensureCalLoader();
  Cal("init", CAL_NAMESPACE, { origin: CAL_ORIGIN });
  Cal.ns?.[CAL_NAMESPACE]?.("preload", { calLink: CAL_LINK });
}
