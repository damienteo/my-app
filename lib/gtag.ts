// Otherwise, you'll get "gtag is not defined errors" during dev and build (not an issue in production because the analytics script is loaded)
declare global {
  interface Window {
    gtag: any
  }
}

type Event = { action: string; category: string; label: string; value?: string }
// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: Event) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
