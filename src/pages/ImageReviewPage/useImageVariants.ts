import { useMemo } from 'react'
import imagePaths from 'virtual:image-manifest'

import type { ImageVariant, WordImageData } from './types'

const IMAGE_PATH_RE = /^\/images\/vocabulary\/([^/]+)\/(.+)\.png$/u
const VARIANT_RE = /^(.+)_(\d+)$/u

export type CategoryImageMap = Partial<Record<string, WordImageData[]>>

function getOrCreateCategory(map: CategoryImageMap, category: string): WordImageData[] {
  const existing = map[category]
  if (existing) {
    return existing
  }
  const words: WordImageData[] = []
  map[category] = words
  return words
}

function findOrCreateWordData(words: WordImageData[], slug: string): WordImageData {
  let wordData = words.find(w => w.slug === slug)
  if (!wordData) {
    wordData = { slug, canonicalUrl: null, variants: [] }
    words.push(wordData)
  }
  return wordData
}

function processVariantImage(words: WordImageData[], basename: string, url: string): void {
  const variantMatch = VARIANT_RE.exec(basename)
  if (variantMatch) {
    const [, slug, arasaacId] = variantMatch
    const wordData = findOrCreateWordData(words, slug)
    const variant: ImageVariant = { url, arasaacId, filename: `${basename}.png` }
    wordData.variants.push(variant)
  } else {
    const wordData = findOrCreateWordData(words, basename)
    wordData.canonicalUrl = url
  }
}

function parseImagePaths(paths: string[]): CategoryImageMap {
  const map: CategoryImageMap = {}

  for (const rawPath of paths) {
    const match = IMAGE_PATH_RE.exec(rawPath)
    if (!match) {
      continue
    }

    const [, category, basename] = match
    if (basename === 'placeholder') {
      continue
    }

    const words = getOrCreateCategory(map, category)
    processVariantImage(words, basename, rawPath)
  }

  // Sort variants by ARASAAC ID for stable order
  for (const words of Object.values(map)) {
    if (!words) {
      continue
    }
    for (const word of words) {
      word.variants.sort((a, b) => Number(a.arasaacId) - Number(b.arasaacId))
    }
  }

  return map
}

export function useImageVariants(): CategoryImageMap {
  return useMemo(() => parseImagePaths(imagePaths), [])
}
