// Funnel analytics: track user drop-off events on the upgrade screen.
// Events are logged to a Firestore collection for analysis in the admin panel.

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'

export type FunnelEventType =
  | 'upgrade_page_view'      // user landed on the upgrade page
  | 'upgrade_scroll_50'      // scrolled past 50% of the page
  | 'upgrade_scroll_100'     // scrolled to the bottom
  | 'upgrade_price_seen'     // price was visible in viewport
  | 'upgrade_cta_click'     // clicked the subscribe button
  | 'upgrade_bounce'         // left the page without clicking CTA

interface FunnelEvent {
  type: FunnelEventType
  uid: string
  page: string
  timestamp: typeof serverTimestamp
  metadata?: Record<string, unknown>
}

let lastTrackedView = false
let trackedScroll50 = false
let trackedScroll100 = false
let trackedPriceSeen = false
let ctaClicked = false

async function logEvent(
  type: FunnelEventType,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const user = auth.currentUser
  if (!user) return
  try {
    await addDoc(collection(db, 'funnelEvents'), {
      type,
      uid: user.uid,
      page: '/upgrade',
      timestamp: serverTimestamp(),
      ...metadata,
    })
  } catch {
    // Non-critical — analytics should never break the UX
  }
}

/** Reset tracking state — call on page mount */
export function resetFunnelTracking(): void {
  lastTrackedView = false
  trackedScroll50 = false
  trackedScroll100 = false
  trackedPriceSeen = false
  ctaClicked = false
}

/** Track the initial page view */
export function trackUpgradePageView(): void {
  if (lastTrackedView) return
  lastTrackedView = true
  void logEvent('upgrade_page_view')
}

/** Track scroll depth — call on scroll */
export function trackUpgradeScroll(): void {
  const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
  if (!trackedScroll50 && scrollPercent >= 50) {
    trackedScroll50 = true
    void logEvent('upgrade_scroll_50')
  }
  if (!trackedScroll100 && scrollPercent >= 95) {
    trackedScroll100 = true
    void logEvent('upgrade_scroll_100')
  }
}

/** Track when the price becomes visible in the viewport */
export function trackPriceSeen(): void {
  if (trackedPriceSeen) return
  trackedPriceSeen = true
  void logEvent('upgrade_price_seen')
}

/** Track CTA click */
export function trackCtaClick(amount?: number): void {
  if (ctaClicked) return
  ctaClicked = true
  void logEvent('upgrade_cta_click', amount ? { amount } : undefined)
}

/** Track bounce — call on page unload if no CTA was clicked */
export function trackBounce(): void {
  if (!lastTrackedView || ctaClicked) return
  // Firestore logging already enforces the authenticated UID; sendBeacon
  // cannot attach the Firebase Bearer token and would create a spoofable API.
  void logEvent('upgrade_bounce')
}
