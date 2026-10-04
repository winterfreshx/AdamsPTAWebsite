// Date windows for time-sensitive content (announcements, seasonal cards, the Donate button).
//
// Every scheduled element is rendered into the page at build time with data attributes, and an inline
// script in BaseLayout re-evaluates them in the visitor's browser on each page load. So content turns
// on and off on the right day even if the site hasn't been rebuilt. All dates are Seattle dates.

export type DateWindow = {
  starts?: string; // YYYY-MM-DD, first day shown (inclusive)
  expires?: string; // YYYY-MM-DD, last day shown (inclusive)
};

export const TIME_ZONE = 'America/Los_Angeles';

/** Today's date in Seattle as YYYY-MM-DD, regardless of the build machine's or visitor's time zone. */
export const seattleToday = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

export const inWindow = (w: DateWindow, today = seattleToday()) =>
  (!w.starts || w.starts <= today) && (!w.expires || w.expires >= today);

/**
 * Spread onto an element to schedule it: `<div {...scheduled(window)}>`.
 * `invert` shows the element only OUTSIDE the window (e.g. a fallback card).
 * The build-time `hidden` value is only the initial state; the browser script corrects it.
 */
export const scheduled = (w: DateWindow, { invert = false } = {}) => ({
  'data-schedule': '',
  'data-starts': w.starts,
  'data-expires': w.expires,
  'data-invert': invert ? '' : undefined,
  hidden: inWindow(w) === invert ? true : undefined,
});

/** A link whose href depends on the window: `<a {...scheduledHref(window, '/in', '/out')}>`. */
export const scheduledHref = (w: DateWindow, inside: string, outside: string) => ({
  href: inWindow(w) ? inside : outside,
  'data-schedule-href': '',
  'data-starts': w.starts,
  'data-expires': w.expires,
  'data-href-in': inside,
  'data-href-out': outside,
});
