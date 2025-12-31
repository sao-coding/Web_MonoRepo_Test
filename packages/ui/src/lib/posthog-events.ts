import posthog from 'posthog-js'

/**
 * PostHog Event Types for type safety
 */
export type PostHogEventName =
  | 'button_clicked'
  | 'page_viewed'
  | 'form_submitted'
  | 'dialog_opened'
  | 'dialog_closed'
  | 'menu_opened'
  | 'menu_item_clicked'
  | 'tab_changed'
  | 'sidebar_toggled'
  | 'chat_message_sent'
  | 'file_uploaded'
  | 'search_performed'
  | 'error_occurred'
  | 'feature_used'

export interface PostHogEventProperties {
  [key: string]: unknown
  component?: string
  action?: string
  label?: string
  value?: string | number
}

/**
 * Capture a PostHog event with type safety
 */
export function captureEvent(
  eventName: PostHogEventName | string,
  properties?: PostHogEventProperties
) {
  if (typeof window === 'undefined') return

  try {
    posthog.capture(eventName, {
      timestamp: new Date().toISOString(),
      ...properties
    })
  } catch (error) {
    console.warn('[PostHog] Failed to capture event:', error)
  }
}

/**
 * Capture a page view event
 */
export function capturePageView(pageName: string, properties?: PostHogEventProperties) {
  captureEvent('page_viewed', {
    page_name: pageName,
    url: typeof window !== 'undefined' ? window.location.href : '',
    ...properties
  })
}

/**
 * Capture a button click event
 */
export function captureButtonClick(buttonName: string, properties?: PostHogEventProperties) {
  captureEvent('button_clicked', {
    button_name: buttonName,
    ...properties
  })
}

/**
 * Capture a feature usage event
 */
export function captureFeatureUsed(featureName: string, properties?: PostHogEventProperties) {
  captureEvent('feature_used', {
    feature_name: featureName,
    ...properties
  })
}

/**
 * Identify a user in PostHog
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  try {
    posthog.identify(userId, properties)
  } catch (error) {
    console.warn('[PostHog] Failed to identify user:', error)
  }
}

/**
 * Reset PostHog user (for logout)
 */
export function resetUser() {
  if (typeof window === 'undefined') return

  try {
    posthog.reset()
  } catch (error) {
    console.warn('[PostHog] Failed to reset user:', error)
  }
}
