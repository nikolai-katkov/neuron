import { Check, ChevronDown, ClipboardCopy, RotateCcw, Terminal } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import type { WordDifficulty } from '../../types'
import styles from './ExportPanel.module.css'
import type { ReviewCategory, ReviewState, ReviewWord, WordChange } from './types'
import { getChangeForKey } from './utils'

const VARIANT_ID_RE = /_(\d+)\.png$/u
const DIFFICULTIES: WordDifficulty[] = ['simple', 'medium', 'complex']

interface ExportPanelProps {
  categories: ReviewCategory[]
  state: ReviewState
  changeCount: number
  onReset: () => void
}

function extractArasaacIdFromUrl(url: string): string {
  const match = VARIANT_ID_RE.exec(url)
  return match ? match[1] : ''
}

// --- Vocabulary file generation ---

interface WordEntry {
  en: string
  ru: string
  difficulty: WordDifficulty
  order: number
}

function resolveWordFields(word: ReviewWord, change: WordChange | undefined) {
  if (!change) {
    return {
      en: word.englishWord,
      ru: word.russianWord,
      targetCat: word.categoryId,
      diff: word.difficulty,
      order: word.wordIndex,
    }
  }
  return {
    en: change.englishWordOverride || word.englishWord,
    ru: change.russianWordOverride || word.russianWord,
    targetCat: change.moveToCategoryId || word.categoryId,
    diff: (change.difficultyOverride || word.difficulty) as WordDifficulty,
    order: change.orderOverride ?? word.wordIndex,
  }
}

function sortByDifficultyThenOrder(words: WordEntry[]): void {
  words.sort((a, b) => {
    const di = DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty)
    return di === 0 ? a.order - b.order : di
  })
}

function buildModifiedWords(
  categories: ReviewCategory[],
  state: ReviewState
): Map<string, WordEntry[]> {
  const result = new Map<string, WordEntry[]>()
  for (const cat of categories) {
    result.set(cat.id, [])
  }

  for (const cat of categories) {
    for (const word of cat.words) {
      const change = getChangeForKey(state, word.stateKey)
      if (change?.markedForDeletion) {
        continue
      }

      const resolved = resolveWordFields(word, change)
      const bucket = result.get(resolved.targetCat)
      if (bucket) {
        bucket.push({
          en: resolved.en,
          ru: resolved.ru,
          difficulty: resolved.diff,
          order: resolved.order,
        })
      }
    }
  }

  for (const words of result.values()) {
    sortByDifficultyThenOrder(words)
  }

  return result
}

function formatWordArray(words: string[], indent: string): string {
  if (words.length === 0) {
    return `${indent}[]`
  }
  if (words.length <= 8 && words.every(w => w.length <= 12)) {
    const inner = words.map(w => `'${w}'`).join(', ')
    return `${indent}[${inner}]`
  }
  const lines = words.map(w => `${indent}  '${w}',`)
  return `${indent}[\n${lines.join('\n')}\n${indent}]`
}

function generateCategoryBlock(
  cat: ReviewCategory,
  words: WordEntry[],
  lang: 'en' | 'ru',
  nameGetter: (c: ReviewCategory) => string
): string[] {
  const lines: string[] = []
  lines.push('  {')
  lines.push(`    id: '${cat.id}',`)
  lines.push(`    sectionId: 'tact',`)
  lines.push(`    name: '${nameGetter(cat)}',`)
  lines.push('    words: {')
  for (const diff of DIFFICULTIES) {
    const diffWords = words.filter(w => w.difficulty === diff).map(w => w[lang])
    lines.push(`      ${diff}: ${formatWordArray(diffWords, '      ').trimStart()},`)
  }
  lines.push('    },')
  lines.push('  },')
  return lines
}

function generateVocabularyFile(categories: ReviewCategory[], state: ReviewState): string {
  const wordsByCat = buildModifiedWords(categories, state)
  const lines: string[] = []

  lines.push("import type { VocabularyCategory } from '../../types'")
  lines.push("import type { Language } from '../types'")
  lines.push('')

  lines.push('const VOCABULARY_EN: VocabularyCategory[] = [')
  for (const cat of categories) {
    const words = wordsByCat.get(cat.id) ?? []
    lines.push(...generateCategoryBlock(cat, words, 'en', c => c.enName))
  }
  lines.push(']')
  lines.push('')

  lines.push('const VOCABULARY_RU: VocabularyCategory[] = [')
  for (const cat of categories) {
    const words = wordsByCat.get(cat.id) ?? []
    lines.push(...generateCategoryBlock(cat, words, 'ru', c => c.ruName))
  }
  lines.push(']')
  lines.push('')

  lines.push('export const VOCABULARY_BY_LANGUAGE: Record<Language, VocabularyCategory[]> = {')
  lines.push('  en: VOCABULARY_EN,')
  lines.push('  ru: VOCABULARY_RU,')
  lines.push('}')
  lines.push('')

  return lines.join('\n')
}

// --- Command generation ---

function generateDeletionOps(word: ReviewWord, base: string): string[] {
  return [`# Delete "${word.englishWord}" images`, `rm -f ${base}/${word.slug}*.png`, '']
}

function generateSwapOps(word: ReviewWord, base: string, variantUrl: string): string[] {
  const variantId = extractArasaacIdFromUrl(variantUrl)
  return [
    `# Set ${word.englishWord} canonical to ARASAAC #${variantId}`,
    `cp ${base}/${word.slug}_${variantId}.png ${base}/${word.slug}.png`,
    '',
  ]
}

function generateFetchOps(word: ReviewWord, arasaacId: string): string[] {
  return [
    `# Fetch ARASAAC #${arasaacId} for ${word.englishWord}`,
    `node scripts/fetch-vocabulary-images.mjs --word=${word.slug} ${arasaacId}`,
    '',
  ]
}

function generateMoveOps(word: ReviewWord, base: string, targetCategoryId: string): string[] {
  const dest = `src/public/images/vocabulary/${targetCategoryId}`
  return [
    `# Move "${word.englishWord}" images: ${word.categoryId} -> ${targetCategoryId}`,
    `mkdir -p ${dest}`,
    `mv ${base}/${word.slug}*.png ${dest}/`,
    '',
  ]
}

function generateWordOps(word: ReviewWord, change: WordChange): string[] {
  const ops: string[] = []
  const base = `src/public/images/vocabulary/${word.categoryId}`

  if (change.markedForDeletion) {
    return generateDeletionOps(word, base)
  }

  if (change.selectedVariantUrl) {
    ops.push(...generateSwapOps(word, base, change.selectedVariantUrl))
  }
  if (change.arasaacId) {
    ops.push(...generateFetchOps(word, change.arasaacId))
  }
  if (change.moveToCategoryId) {
    ops.push(...generateMoveOps(word, base, change.moveToCategoryId))
  }

  return ops
}

function generateImageOps(categories: ReviewCategory[], state: ReviewState): string[] {
  const imageOps: string[] = []

  for (const cat of categories) {
    for (const word of cat.words) {
      const change = getChangeForKey(state, word.stateKey)
      if (!change) {
        continue
      }
      imageOps.push(...generateWordOps(word, change))
    }
  }

  return imageOps
}

function hasVocabChanges(categories: ReviewCategory[], state: ReviewState): boolean {
  for (const cat of categories) {
    for (const word of cat.words) {
      const change = getChangeForKey(state, word.stateKey)
      if (!change) {
        continue
      }
      if (change.markedForDeletion || change.moveToCategoryId) {
        return true
      }
      if (
        change.englishWordOverride ||
        change.russianWordOverride ||
        change.difficultyOverride ||
        change.orderOverride !== null
      ) {
        return true
      }
    }
  }
  return false
}

function generateCommands(categories: ReviewCategory[], state: ReviewState): string {
  const imageOps = generateImageOps(categories, state)
  const hasVocab = hasVocabChanges(categories, state)

  const sections: string[] = []

  if (imageOps.length > 0) {
    sections.push('# =======================================')
    sections.push('# IMAGE OPERATIONS')
    sections.push('# =======================================')
    sections.push('')
    sections.push(...imageOps)
  }

  if (hasVocab) {
    const vocabContent = generateVocabularyFile(categories, state)
    sections.push('# =======================================')
    sections.push('# VOCABULARY DATA')
    sections.push('# =======================================')
    sections.push('')
    sections.push(`cat > src/i18n/translations/vocabulary.ts << 'VOCAB_EOF'`)
    sections.push(vocabContent.trimEnd())
    sections.push('VOCAB_EOF')
    sections.push('')
  }

  if (sections.length === 0) {
    return '# No changes to export'
  }

  const dateStr = new Date().toISOString().slice(0, 10)
  return ['#!/bin/bash', `# Image Review Export — ${dateStr}`, '', ...sections].join('\n')
}

function countByPredicate(state: ReviewState, predicate: (c: WordChange) => boolean): number {
  return Object.values(state).filter(predicate).length
}

function computeChangeSummary(state: ReviewState) {
  const swapCount = countByPredicate(state, c =>
    Boolean(c.selectedVariantUrl && !c.markedForDeletion)
  )
  const fetchCount = countByPredicate(state, c => Boolean(c.arasaacId && !c.markedForDeletion))
  const deleteCount = countByPredicate(state, c => c.markedForDeletion)
  const editCount = countByPredicate(state, c =>
    Boolean(
      (c.englishWordOverride ||
        c.russianWordOverride ||
        c.moveToCategoryId ||
        c.difficultyOverride ||
        c.orderOverride !== null) &&
      !c.markedForDeletion
    )
  )
  return { swapCount, fetchCount, deleteCount, editCount }
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

interface ChangeSummaryDisplayProps {
  changeCount: number
  swapCount: number
  fetchCount: number
  editCount: number
  deleteCount: number
}

function ChangeSummaryDisplay({
  changeCount,
  swapCount,
  fetchCount,
  editCount,
  deleteCount,
}: ChangeSummaryDisplayProps) {
  return (
    <span className={styles.changeSummary}>
      <strong>{changeCount}</strong> change{pluralize(changeCount, '', 's')}
      {swapCount > 0 && ` · ${swapCount} swap${pluralize(swapCount, '', 's')}`}
      {fetchCount > 0 && ` · ${fetchCount} fetch${pluralize(fetchCount, '', 'es')}`}
      {editCount > 0 && ` · ${editCount} edit${pluralize(editCount, '', 's')}`}
      {deleteCount > 0 && ` · ${deleteCount} deletion${pluralize(deleteCount, '', 's')}`}
    </span>
  )
}

export function ExportPanel({ categories, state, changeCount, onReset }: ExportPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const commands = useMemo(() => generateCommands(categories, state), [categories, state])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(commands).then(
      () => {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      },
      () => {
        // Clipboard write failed silently
      }
    )
  }, [commands])

  const handleToggle = useCallback(() => {
    setIsOpen(o => !o)
  }, [])

  const { swapCount, fetchCount, deleteCount, editCount } = computeChangeSummary(state)

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.exportButton}
          onClick={handleToggle}
          disabled={changeCount === 0}
        >
          <Terminal size={18} />
          Export Commands
          <ChevronDown
            size={16}
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
        </button>

        {changeCount > 0 && (
          <ChangeSummaryDisplay
            changeCount={changeCount}
            swapCount={swapCount}
            fetchCount={fetchCount}
            editCount={editCount}
            deleteCount={deleteCount}
          />
        )}

        {changeCount > 0 && (
          <button type="button" className={styles.resetButton} onClick={onReset}>
            <RotateCcw size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} />
            Reset
          </button>
        )}
      </div>

      {isOpen && changeCount > 0 ? (
        <div className={styles.codeWrap}>
          <button type="button" className={styles.copyButton} onClick={handleCopy}>
            {copied ? (
              <>
                <Check size={12} className={styles.copied} />
                <span className={styles.copied}>Copied</span>
              </>
            ) : (
              <>
                <ClipboardCopy size={12} />
                Copy
              </>
            )}
          </button>
          <pre className={styles.codeBlock}>{commands}</pre>
        </div>
      ) : null}
    </div>
  )
}
