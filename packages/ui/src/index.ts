export { PostHogProvider } from './components/posthog-provider'
export { cn } from './lib/utils'
export type { ClassValue } from 'clsx'
export { usePostHog } from 'posthog-js/react'

// PostHog event tracking utilities
export {
  captureEvent,
  capturePageView,
  captureButtonClick,
  captureFeatureUsed,
  identifyUser,
  resetUser
} from './lib/posthog-events'
export type { PostHogEventName, PostHogEventProperties } from './lib/posthog-events'
