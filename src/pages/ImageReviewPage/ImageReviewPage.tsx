import { useMemo } from 'react'

import type { WordDifficulty } from '../../types'
import { CategorySection } from './CategorySection'
import { ExportPanel } from './ExportPanel'
import styles from './ImageReviewPage.module.css'
import type { ReviewCategory, ReviewState, ReviewWord } from './types'
import { useImageReviewData } from './useImageReviewData'
import { useReviewState } from './useReviewState'
import { getChangeForKey } from './utils'

const DIFFICULTIES: WordDifficulty[] = ['simple', 'medium', 'complex']

function initBuckets(categories: ReviewCategory[]): Map<string, Map<string, ReviewWord[]>> {
  const buckets = new Map<string, Map<string, ReviewWord[]>>()
  for (const cat of categories) {
    const diffMap = new Map<string, ReviewWord[]>()
    for (const d of DIFFICULTIES) {
      diffMap.set(d, [])
    }
    buckets.set(cat.id, diffMap)
  }
  return buckets
}

function resolveEffectivePlacement(
  word: ReviewWord,
  state: ReviewState
): { categoryId: string; difficulty: WordDifficulty } {
  const change = getChangeForKey(state, word.stateKey)
  // Deleted words stay in their original position so the user can undelete
  const categoryId = change?.markedForDeletion
    ? word.categoryId
    : change?.moveToCategoryId || word.categoryId
  const difficulty = (change?.difficultyOverride || word.difficulty) as WordDifficulty
  return { categoryId, difficulty }
}

function addWordToBucket(
  word: ReviewWord,
  buckets: Map<string, Map<string, ReviewWord[]>>,
  categoryId: string,
  difficulty: WordDifficulty
): void {
  const diffMap = buckets.get(categoryId)
  if (!diffMap) {
    return
  }
  if (!diffMap.has(difficulty)) {
    diffMap.set(difficulty, [])
  }
  const diffWords = diffMap.get(difficulty)
  if (diffWords) {
    diffWords.push({ ...word, categoryId, difficulty })
  }
}

function placeWordsIntoBuckets(
  categories: ReviewCategory[],
  state: ReviewState,
  buckets: Map<string, Map<string, ReviewWord[]>>
): void {
  for (const cat of categories) {
    for (const word of cat.words) {
      const placement = resolveEffectivePlacement(word, state)
      addWordToBucket(word, buckets, placement.categoryId, placement.difficulty)
    }
  }
}

function getOrderOverride(state: ReviewState, stateKey: string): number | null {
  const change = getChangeForKey(state, stateKey)
  return change?.orderOverride ?? null
}

function applyOrderOverrides(
  buckets: Map<string, Map<string, ReviewWord[]>>,
  state: ReviewState
): void {
  for (const diffMap of buckets.values()) {
    for (const [diff, words] of diffMap) {
      const withOverride = words.filter(w => getOrderOverride(state, w.stateKey) !== null)
      const without = words.filter(w => getOrderOverride(state, w.stateKey) === null)

      if (withOverride.length > 0) {
        const result = Array.from(without)
        // Sort overrides by target position ascending so insertions are stable
        withOverride.sort(
          (a, b) =>
            (getOrderOverride(state, a.stateKey) ?? 0) - (getOrderOverride(state, b.stateKey) ?? 0)
        )
        for (const w of withOverride) {
          const target = Math.min(getOrderOverride(state, w.stateKey) ?? 0, result.length)
          result.splice(target, 0, w)
        }
        diffMap.set(diff, result)
      }
    }
  }
}

function assembleCategoryWords(
  cat: ReviewCategory,
  buckets: Map<string, Map<string, ReviewWord[]>>
): ReviewWord[] {
  const diffMap = buckets.get(cat.id)
  if (!diffMap) {
    return []
  }
  const words: ReviewWord[] = []
  for (const d of DIFFICULTIES) {
    const diffWords = diffMap.get(d) ?? []
    words.push(...diffWords.map((w, i) => ({ ...w, wordIndex: i })))
  }
  return words
}

function buildEffectiveCategories(
  categories: ReviewCategory[],
  state: ReviewState
): ReviewCategory[] {
  const buckets = initBuckets(categories)
  placeWordsIntoBuckets(categories, state, buckets)
  applyOrderOverrides(buckets, state)

  return categories.map(cat => ({
    ...cat,
    words: assembleCategoryWords(cat, buckets),
  }))
}

export function ImageReviewPage() {
  const rawCategories = useImageReviewData()
  const {
    state,
    selectVariant,
    deselectVariant,
    setArasaacId,
    toggleDeletion,
    setEnglishWord,
    setRussianWord,
    setMoveCategory,
    setDifficulty,
    setOrder,
    reset,
    changeCount,
  } = useReviewState()

  const categories = useMemo(
    () => buildEffectiveCategories(rawCategories, state),
    [rawCategories, state]
  )

  const totalWords = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.words.length, 0),
    [categories]
  )

  const totalWithImages = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.words.filter(w => w.hasImages).length, 0),
    [categories]
  )

  const totalVariants = useMemo(
    () =>
      categories.reduce(
        (sum, cat) => sum + cat.words.reduce((s, w) => s + w.variants.length, 0),
        0
      ),
    [categories]
  )

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Image Review</h1>
        <p className={styles.pageSubtitle}>
          Review and curate vocabulary pictograms across all categories
        </p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{categories.length}</span> categories
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalWords}</span> words
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalWithImages}</span> with images
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalVariants}</span> variants
          </div>
        </div>
      </div>

      <div className={styles.exportWrap}>
        <ExportPanel
          categories={rawCategories}
          state={state}
          changeCount={changeCount}
          onReset={reset}
        />
      </div>

      <div className={styles.categories}>
        {categories.map(cat => (
          <CategorySection
            key={cat.id}
            category={cat}
            allCategories={categories}
            state={state}
            onSelectVariant={selectVariant}
            onDeselectVariant={deselectVariant}
            onSetArasaacId={setArasaacId}
            onToggleDeletion={toggleDeletion}
            onSetEnglishWord={setEnglishWord}
            onSetRussianWord={setRussianWord}
            onSetMoveCategory={setMoveCategory}
            onSetDifficulty={setDifficulty}
            onSetOrder={setOrder}
          />
        ))}
      </div>
    </div>
  )
}
