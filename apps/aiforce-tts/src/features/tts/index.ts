/**
 * TTS Feature - Barrel Export
 *
 * 統一匯出 TTS 功能模組的所有公開 API
 */

// Hooks
export { useTts, ttsConfig } from './hooks/use-tts'
export type { UseTtsReturn } from './hooks/use-tts'

// Services
export {
  convertTextToSpeech,
  detectLanguage,
  validateLanguageMatch
} from './services/tts-service'

// Types
export type * from './types'
