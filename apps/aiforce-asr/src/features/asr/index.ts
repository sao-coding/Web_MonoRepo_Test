/**
 * ASR Feature - Barrel Export
 *
 * 統一匯出 ASR 功能模組的所有公開 API
 */

// Hooks
export type { UseAsrReturn } from './hooks/use-asr'
export { asrConfig, useAsr } from './hooks/use-asr'

// Services
export { recognizeSpeech, validateAudioFormat } from './services/asr-service'

// Types
export type * from './types'
