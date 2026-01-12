export { PostHogProvider } from './components/posthog-provider'
export { cn } from './lib/utils'
export type { ClassValue } from 'clsx'
export { usePostHog } from 'posthog-js/react'

// UI Components
export type { ButtonProps } from './components/button'
export { Button, buttonVariants } from './components/button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/card'
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/dialog'
export { Input } from './components/input'
export { ScrollArea, ScrollBar } from './components/scroll-area'
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './components/select'
export { Skeleton } from './components/skeleton'
export { Textarea } from './components/textarea'

// PostHog event tracking utilities
export type { PostHogEventName, PostHogEventProperties } from './lib/posthog-events'
export {
  captureButtonClick,
  captureEvent,
  captureFeatureUsed,
  capturePageView,
  identifyUser,
  resetUser
} from './lib/posthog-events'
