import type { WordDifficulty } from '../../types'

export interface ImageVariant {
  url: string
  arasaacId: string
  filename: string
}

export interface WordImageData {
  slug: string
  canonicalUrl: string | null
  variants: ImageVariant[]
}

export interface ReviewWord {
  stateKey: string
  slug: string
  englishWord: string
  russianWord: string
  difficulty: WordDifficulty
  wordIndex: number
  categoryId: string
  canonicalUrl: string | null
  variants: ImageVariant[]
  hasImages: boolean
}

export interface ReviewCategory {
  id: string
  enName: string
  ruName: string
  words: ReviewWord[]
}

export interface WordChange {
  selectedVariantUrl: string | null
  arasaacId: string
  markedForDeletion: boolean
  englishWordOverride: string
  russianWordOverride: string
  moveToCategoryId: string
  difficultyOverride: string
  orderOverride: number | null
}

export type ReviewState = Record<string, WordChange>

export type ReviewAction =
  | { type: 'SELECT_VARIANT'; key: string; variantUrl: string }
  | { type: 'DESELECT_VARIANT'; key: string }
  | { type: 'SET_ARASAAC_ID'; key: string; id: string }
  | { type: 'TOGGLE_DELETION'; key: string }
  | { type: 'SET_ENGLISH_WORD'; key: string; value: string }
  | { type: 'SET_RUSSIAN_WORD'; key: string; value: string }
  | { type: 'SET_MOVE_CATEGORY'; key: string; categoryId: string }
  | { type: 'SET_DIFFICULTY'; key: string; difficulty: string }
  | { type: 'SET_ORDER'; key: string; order: number | null }
  | { type: 'RESET' }
