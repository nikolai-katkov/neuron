import { useMemo } from 'react'

import { VOCABULARY_BY_LANGUAGE } from '../../i18n/translations/vocabulary'
import type { WordDifficulty } from '../../types'
import type { ImageVariant, ReviewCategory, ReviewWord, WordImageData } from './types'
import type { CategoryImageMap } from './useImageVariants'
import { useImageVariants } from './useImageVariants'

const DIFFICULTIES: WordDifficulty[] = ['simple', 'medium', 'complex']

function slugify(word: string): string {
  return word
    .toLowerCase()
    .replace(/\s+/gu, '-')
    .replace(/[^-0-9a-z]/gu, '')
}

function resolveImageData(
  categoryImages: WordImageData[],
  slug: string
): { canonicalUrl: string | null; variants: ImageVariant[]; hasImages: boolean } {
  const imageData = categoryImages.find(img => img.slug === slug)
  const canonicalUrl = imageData?.canonicalUrl ?? null
  const variants = imageData?.variants ?? []
  const hasImages = Boolean(canonicalUrl || variants.length > 0)
  return { canonicalUrl, variants, hasImages }
}

function buildWordFromPair(
  enWord: string | undefined,
  ruWord: string | undefined,
  index: number,
  difficulty: WordDifficulty,
  categoryId: string,
  categoryImages: WordImageData[]
): ReviewWord | null {
  if (!enWord && !ruWord) {
    return null
  }
  const slug = slugify(enWord || `untranslated-${index}`)
  const imageInfo = resolveImageData(categoryImages, slug)

  return {
    stateKey: `${categoryId}/${slug}`,
    slug,
    englishWord: enWord || '',
    russianWord: ruWord || '',
    difficulty,
    wordIndex: index,
    categoryId,
    ...imageInfo,
  }
}

function buildWordsForDifficulty(
  enWords: string[],
  ruWords: string[],
  difficulty: WordDifficulty,
  categoryId: string,
  categoryImages: WordImageData[]
): ReviewWord[] {
  const words: ReviewWord[] = []
  const maxLen = Math.max(enWords.length, ruWords.length)

  for (let i = 0; i < maxLen; i++) {
    const word = buildWordFromPair(
      enWords[i],
      ruWords[i],
      i,
      difficulty,
      categoryId,
      categoryImages
    )
    if (word) {
      words.push(word)
    }
  }

  return words
}

function buildReviewData(imageMap: CategoryImageMap): ReviewCategory[] {
  const enCategories = VOCABULARY_BY_LANGUAGE.en
  const ruCategories = VOCABULARY_BY_LANGUAGE.ru

  return enCategories.map((enCat, catIndex) => {
    const ruCat = ruCategories[catIndex]
    const categoryImages = imageMap[enCat.id] ?? []

    const words: ReviewWord[] = []

    for (const difficulty of DIFFICULTIES) {
      const enWords = enCat.words[difficulty]
      const ruWords = ruCat.words[difficulty]
      const diffWords = buildWordsForDifficulty(
        enWords,
        ruWords,
        difficulty,
        enCat.id,
        categoryImages
      )
      words.push(...diffWords)
    }

    return {
      id: enCat.id,
      enName: enCat.name,
      ruName: ruCat.name,
      words,
    }
  })
}

export function useImageReviewData(): ReviewCategory[] {
  const imageMap = useImageVariants()
  return useMemo(() => buildReviewData(imageMap), [imageMap])
}
