import { VOCABULARY_BY_LANGUAGE } from '../i18n/translations/vocabulary'
import { parseWordId } from '../types/dictionary'

function slugify(word: string): string {
  return word
    .toLowerCase()
    .replace(/\s+/gu, '-')
    .replace(/[^-0-9a-z]/gu, '')
}

export function getWordImageUrl(wordId: string): string {
  const parsed = parseWordId(wordId)
  if (!parsed) {
    return PLACEHOLDER_IMAGE_URL
  }

  const category = VOCABULARY_BY_LANGUAGE.en.find(c => c.id === parsed.categoryId)
  const word = category?.words[parsed.difficulty]?.[parsed.index]
  if (!word) {
    return PLACEHOLDER_IMAGE_URL
  }

  return `/images/vocabulary/${parsed.categoryId}/${slugify(word)}.png`
}

export const PLACEHOLDER_IMAGE_URL = '/images/vocabulary/placeholder.png'
