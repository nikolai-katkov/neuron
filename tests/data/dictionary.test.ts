import { describe, expect, it } from 'vitest'

import { getVocabularyWord } from '../../src/hooks/useDictionary'
import { VOCABULARY_BY_LANGUAGE } from '../../src/i18n/translations'
import {
  EVERYDAY_CATEGORY_IDS,
  getLevelCategoryIds,
  getWordId,
  MOTIVATING_CATEGORY_IDS,
  parseWordId,
} from '../../src/types/dictionary'

describe('Word ID helpers', () => {
  describe('getWordId', () => {
    it('produces category/difficulty/slug format', () => {
      expect(getWordId('toys', 'simple', 0)).toBe('toys/simple/doll')
      expect(getWordId('fruits', 'simple', 0)).toBe('fruits/simple/apple')
    })

    it('slugifies multi-word terms', () => {
      expect(getWordId('toys', 'simple', 3)).toBe('toys/simple/teddy-bear')
    })
  })

  describe('parseWordId', () => {
    it('parses valid word IDs', () => {
      expect(parseWordId('toys/simple/doll')).toEqual({
        categoryId: 'toys',
        difficulty: 'simple',
        slug: 'doll',
      })
      expect(parseWordId('body-parts/complex/wrist')).toEqual({
        categoryId: 'body-parts',
        difficulty: 'complex',
        slug: 'wrist',
      })
    })

    it('returns null for invalid IDs', () => {
      expect(parseWordId('')).toBeNull()
      expect(parseWordId('toys')).toBeNull()
      expect(parseWordId('toys/simple')).toBeNull()
      expect(parseWordId('toys/invalid/doll')).toBeNull()
    })

    it('round-trips with getWordId', () => {
      const id = getWordId('fruits', 'medium', 0)
      const parsed = parseWordId(id)
      expect(parsed).toEqual({ categoryId: 'fruits', difficulty: 'medium', slug: 'apricot' })
    })
  })
})

describe('getLevelCategoryIds', () => {
  it('returns motivating categories for tact levels 1-2', () => {
    expect(getLevelCategoryIds('tact-1')).toBe(MOTIVATING_CATEGORY_IDS)
    expect(getLevelCategoryIds('tact-2')).toBe(MOTIVATING_CATEGORY_IDS)
  })

  it('returns motivating categories for mand levels 1-2', () => {
    expect(getLevelCategoryIds('mand-1')).toBe(MOTIVATING_CATEGORY_IDS)
    expect(getLevelCategoryIds('mand-2')).toBe(MOTIVATING_CATEGORY_IDS)
  })

  it('returns everyday categories for tact level 3', () => {
    expect(getLevelCategoryIds('tact-3')).toBe(EVERYDAY_CATEGORY_IDS)
  })

  it('returns null (all categories) for tact levels 4-5', () => {
    expect(getLevelCategoryIds('tact-4')).toBeNull()
    expect(getLevelCategoryIds('tact-5')).toBeNull()
  })

  it('returns null (all categories) for mand levels 3-5', () => {
    expect(getLevelCategoryIds('mand-3')).toBeNull()
    expect(getLevelCategoryIds('mand-4')).toBeNull()
    expect(getLevelCategoryIds('mand-5')).toBeNull()
  })

  it('returns null for unsupported sections', () => {
    expect(getLevelCategoryIds('echoic-1')).toBeNull()
    expect(getLevelCategoryIds('listener-responding-1')).toBeNull()
  })
})

describe('getVocabularyWord', () => {
  const vocabulary = VOCABULARY_BY_LANGUAGE.en

  it('returns word for valid ID', () => {
    const word = getVocabularyWord(vocabulary, 'toys/simple/doll')
    expect(word).toMatchObject({ id: 'toys/simple/doll' })
    expect(word?.text).toBe(vocabulary[0].words.simple[0])
  })

  it('returns null for invalid word ID format', () => {
    expect(getVocabularyWord(vocabulary, 'invalid')).toBeNull()
    expect(getVocabularyWord(vocabulary, '')).toBeNull()
  })

  it('returns null for non-existent category', () => {
    expect(getVocabularyWord(vocabulary, 'nonexistent/simple/doll')).toBeNull()
  })

  it('returns null for non-existent slug', () => {
    expect(getVocabularyWord(vocabulary, 'toys/simple/nonexistent')).toBeNull()
  })
})
