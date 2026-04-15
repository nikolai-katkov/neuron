import { VOCABULARY_BY_LANGUAGE } from '../i18n/translations/vocabulary'
import type { WordDifficulty } from './vocabulary'

export type VerbalOperant = 'mand' | 'tact' | 'listenerResponding' | 'echoic'

export type MasteryTier = 'notStarted' | 'emerging' | 'mastered'

export type WordInclusionStatus = 'included' | 'excluded'

export type OnboardingLevel = 'beginner' | 'intermediate' | 'advanced'

export const VERBAL_OPERANTS: VerbalOperant[] = ['mand', 'tact', 'listenerResponding', 'echoic']

export interface MasteryRecord {
  tier: MasteryTier
  updatedAt: number | null
}

export const DEFAULT_MASTERY: Record<VerbalOperant, MasteryRecord> = {
  mand: { tier: 'notStarted', updatedAt: null },
  tact: { tier: 'notStarted', updatedAt: null },
  listenerResponding: { tier: 'notStarted', updatedAt: null },
  echoic: { tier: 'notStarted', updatedAt: null },
}

/** Categories that are naturally motivating for early learners (Tact Levels 1-2). */
export const MOTIVATING_CATEGORY_IDS: string[] = [
  'toys',
  'domestic-animals',
  'food',
  'fruits',
  'body-parts',
  'transport',
]

export interface WordState {
  inclusion: WordInclusionStatus
  mastery: Record<VerbalOperant, MasteryRecord>
}

export interface DictionaryState {
  version: 1 | 2
  onboardingCompleted: boolean
  onboardingLevel: OnboardingLevel | null
  words: Record<string, WordState>
}

export interface VocabularyWord {
  id: string
  text: string
}

/** Everyday/mundane categories used for Tact Level 3 (non-preferred items). */
export const EVERYDAY_CATEGORY_IDS: string[] = [
  'clothing',
  'footwear',
  'furniture',
  'dishes',
  'appliances',
  'headwear',
  'school-supplies',
]

/**
 * Returns which category IDs are relevant for a given level.
 * - tact-1, tact-2, mand-1, mand-2: motivating categories (favorites, animals, food)
 * - tact-3: everyday mundane categories (non-preferred objects)
 * - tact-4, tact-5, mand-3..5: all categories
 * Returns null if the level has no vocabulary association.
 */
export function getLevelCategoryIds(levelId: string): string[] | null {
  const [sectionId, levelStr] = levelId.split('-')
  const level = Number(levelStr)

  if (sectionId === 'tact' || sectionId === 'mand') {
    if (level <= 2) {
      return MOTIVATING_CATEGORY_IDS
    }
    if (sectionId === 'tact' && level === 3) {
      return EVERYDAY_CATEGORY_IDS
    }
    return null // all categories — caller should pass all vocabulary
  }

  return null // other sections not yet supported
}

// --- Word ID helpers ---

function slugify(word: string): string {
  return word
    .toLowerCase()
    .replace(/\s+/gu, '-')
    .replace(/[^-0-9a-z]/gu, '')
}

export function getWordId(categoryId: string, difficulty: WordDifficulty, index: number): string {
  const enCategory = VOCABULARY_BY_LANGUAGE.en.find(c => c.id === categoryId)
  const word = enCategory?.words[difficulty][index] ?? String(index)
  return `${categoryId}/${difficulty}/${slugify(word)}`
}

export function parseWordId(
  wordId: string
): { categoryId: string; difficulty: WordDifficulty; slug: string } | null {
  const parts = wordId.split('/')
  if (parts.length !== 3) {
    return null
  }

  const [categoryId, difficulty, slug] = parts

  if (!categoryId || !isWordDifficulty(difficulty) || !slug) {
    return null
  }

  return { categoryId, difficulty, slug }
}

function isWordDifficulty(value: string): value is WordDifficulty {
  return value === 'simple' || value === 'medium' || value === 'complex'
}

/** Maps section IDs to their verbal operant. Returns null for unsupported sections. */
export function getOperantForSection(sectionId: string): VerbalOperant | null {
  if (sectionId === 'mand') {
    return 'mand'
  }
  if (sectionId === 'tact') {
    return 'tact'
  }
  return null
}
