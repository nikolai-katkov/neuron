import { parseWordId } from '../types/dictionary'

export const PLACEHOLDER_IMAGE_URL = '/images/vocabulary/placeholder.png'

export function getWordImageUrl(wordId: string): string {
  const parsed = parseWordId(wordId)
  if (!parsed) {
    return PLACEHOLDER_IMAGE_URL
  }

  return `/images/vocabulary/${parsed.categoryId}/${parsed.slug}.png`
}
