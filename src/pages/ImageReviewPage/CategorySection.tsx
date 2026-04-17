import { ChevronRight } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import styles from './CategorySection.module.css'
import type { ReviewCategory, ReviewState } from './types'
import { getChangeForKey } from './utils'
import { WordReviewCard } from './WordReviewCard'

interface CategorySectionProps {
  category: ReviewCategory
  allCategories: ReviewCategory[]
  state: ReviewState
  onSelectVariant: (key: string, variantUrl: string) => void
  onDeselectVariant: (key: string) => void
  onSetArasaacId: (key: string, id: string) => void
  onToggleDeletion: (key: string) => void
  onSetEnglishWord: (key: string, value: string) => void
  onSetRussianWord: (key: string, value: string) => void
  onSetMoveCategory: (key: string, categoryId: string) => void
  onSetDifficulty: (key: string, difficulty: string) => void
  onSetOrder: (key: string, order: number | null) => void
}

export function CategorySection({
  category,
  allCategories,
  state,
  onSelectVariant,
  onDeselectVariant,
  onSetArasaacId,
  onToggleDeletion,
  onSetEnglishWord,
  onSetRussianWord,
  onSetMoveCategory,
  onSetDifficulty,
  onSetOrder,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setIsOpen(o => !o)
  }, [])

  // Count words with any pending change
  const changeCount = category.words.filter(w => {
    const c = getChangeForKey(state, w.stateKey)
    if (!c) {
      return false
    }
    return (
      c.selectedVariantUrl ||
      c.arasaacId ||
      c.markedForDeletion ||
      c.englishWordOverride ||
      c.russianWordOverride ||
      c.moveToCategoryId ||
      c.difficultyOverride ||
      c.orderOverride !== null
    )
  }).length

  // Count words per difficulty for order dropdown range
  const wordCountByDifficulty = useMemo(() => {
    const counts = { simple: 0, medium: 0, complex: 0 }
    for (const w of category.words) {
      counts[w.difficulty]++
    }
    return counts
  }, [category.words])

  return (
    <div className={styles.section}>
      <button type="button" className={styles.header} onClick={handleToggle}>
        <ChevronRight
          size={18}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
        <span className={styles.title}>
          {category.enName}
          <span className={styles.subtitle}>/ {category.ruName}</span>
        </span>
        <span className={`${styles.badge} ${styles.badgeCount}`}>{category.words.length}</span>
        {changeCount > 0 && (
          <span className={`${styles.badge} ${styles.badgeChanges}`}>{changeCount}</span>
        )}
      </button>

      <div className={`${styles.contentWrap} ${isOpen ? styles.contentWrapOpen : ''}`}>
        <div className={styles.contentInner}>
          {isOpen ? (
            <div className={styles.grid}>
              {category.words.map(word => (
                <WordReviewCard
                  key={word.stateKey}
                  word={word}
                  change={state[word.stateKey]}
                  allCategories={allCategories}
                  difficultyWordCount={wordCountByDifficulty[word.difficulty]}
                  onSelectVariant={onSelectVariant}
                  onDeselectVariant={onDeselectVariant}
                  onSetArasaacId={onSetArasaacId}
                  onToggleDeletion={onToggleDeletion}
                  onSetEnglishWord={onSetEnglishWord}
                  onSetRussianWord={onSetRussianWord}
                  onSetMoveCategory={onSetMoveCategory}
                  onSetDifficulty={onSetDifficulty}
                  onSetOrder={onSetOrder}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
