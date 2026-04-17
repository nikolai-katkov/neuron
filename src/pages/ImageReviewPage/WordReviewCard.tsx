import { ImageOff, Search, Trash2 } from 'lucide-react'
import { useCallback, useMemo } from 'react'

import { PLACEHOLDER_IMAGE_URL } from '../../utils/getWordImageUrl'
import type { ReviewCategory, ReviewWord, WordChange } from './types'
import styles from './WordReviewCard.module.css'

const ARASAAC_SEARCH_BASE = 'https://arasaac.org/pictograms/search'
const NON_DIGIT_RE = /\D/gu

interface WordReviewCardProps {
  word: ReviewWord
  change: WordChange | undefined
  allCategories: ReviewCategory[]
  difficultyWordCount: number
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

function computeThumbClass(baseClass: string, isActive: boolean, activeClass: string): string {
  return [baseClass, isActive ? activeClass : ''].filter(Boolean).join(' ')
}

interface ChangeFlags {
  isDeleted: boolean
  selectedUrl: string | null
  arasaacId: string
  enOverride: string
  ruOverride: string
  moveTarget: string
  diffOverride: string
  orderIdx: number | null
}

const EMPTY_FLAGS: ChangeFlags = {
  isDeleted: false,
  selectedUrl: null,
  arasaacId: '',
  enOverride: '',
  ruOverride: '',
  moveTarget: '',
  diffOverride: '',
  orderIdx: null,
}

function extractChangeFlags(change: WordChange | undefined): ChangeFlags {
  if (!change) {
    return EMPTY_FLAGS
  }
  return {
    isDeleted: change.markedForDeletion,
    selectedUrl: change.selectedVariantUrl,
    arasaacId: change.arasaacId,
    enOverride: change.englishWordOverride,
    ruOverride: change.russianWordOverride,
    moveTarget: change.moveToCategoryId,
    diffOverride: change.difficultyOverride,
    orderIdx: change.orderOverride,
  }
}

function hasAnyChange(flags: ChangeFlags): boolean {
  return (
    flags.isDeleted ||
    flags.selectedUrl !== null ||
    flags.arasaacId !== '' ||
    flags.enOverride !== '' ||
    flags.ruOverride !== '' ||
    flags.moveTarget !== '' ||
    flags.diffOverride !== '' ||
    flags.orderIdx !== null
  )
}

function computeCardClass(isDeleted: boolean, changed: boolean): string {
  return [
    styles.card,
    isDeleted ? styles.cardDeleted : '',
    !isDeleted && changed ? styles.cardChanged : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function computeLabelClass(isDeleted: boolean): string {
  return [styles.wordLabel, isDeleted ? styles.wordLabelDeleted : ''].filter(Boolean).join(' ')
}

// --- Sub-components ---

interface CardHeaderProps {
  displayEnglish: string
  displayRussian: string
  enOverride: string
  ruOverride: string
  isDeleted: boolean
  onEnglishChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRussianChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function CardHeader({
  displayEnglish,
  displayRussian,
  enOverride,
  ruOverride,
  isDeleted,
  onEnglishChange,
  onRussianChange,
}: CardHeaderProps) {
  const labelClass = computeLabelClass(isDeleted)
  return (
    <div className={styles.header}>
      <div className={labelClass}>
        <input
          className={`${styles.wordInput} ${styles.wordInputEn} ${enOverride ? styles.wordInputChanged : ''}`}
          value={displayEnglish}
          onChange={onEnglishChange}
          title="English word"
        />
        <span className={styles.wordSeparator}>/</span>
        <input
          className={`${styles.wordInput} ${styles.wordInputRu} ${ruOverride ? styles.wordInputChanged : ''}`}
          value={displayRussian}
          onChange={onRussianChange}
          title="Russian word"
        />
      </div>
    </div>
  )
}

interface MainImageProps {
  displayUrl: string | null
  englishWord: string
}

function MainImage({ displayUrl, englishWord }: MainImageProps) {
  return (
    <div className={styles.mainImageWrap}>
      {displayUrl ? (
        <img
          className={styles.mainImage}
          src={displayUrl}
          alt={englishWord}
          loading="lazy"
          width={140}
          height={140}
        />
      ) : (
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>
            <ImageOff size={24} />
          </div>
          <span>No image</span>
        </div>
      )}
    </div>
  )
}

// --- Main component ---

export function WordReviewCard({
  word,
  change,
  allCategories,
  difficultyWordCount,
  onSelectVariant,
  onDeselectVariant,
  onSetArasaacId,
  onToggleDeletion,
  onSetEnglishWord,
  onSetRussianWord,
  onSetMoveCategory,
  onSetDifficulty,
  onSetOrder,
}: WordReviewCardProps) {
  const flags = extractChangeFlags(change)
  const displayEnglish = flags.enOverride || word.englishWord
  const displayRussian = flags.ruOverride || word.russianWord
  const displayUrl = flags.selectedUrl ?? word.canonicalUrl
  const cardClass = computeCardClass(flags.isDeleted, hasAnyChange(flags))
  const searchUrl = `${ARASAAC_SEARCH_BASE}/${encodeURIComponent(displayEnglish)}`

  const orderOptions = useMemo(
    () => Array.from({ length: difficultyWordCount }, (_, i) => i),
    [difficultyWordCount]
  )

  const handleDeselectVariant = useCallback(() => {
    onDeselectVariant(word.stateKey)
  }, [onDeselectVariant, word.stateKey])

  const handleToggleDeletion = useCallback(() => {
    onToggleDeletion(word.stateKey)
  }, [onToggleDeletion, word.stateKey])

  const handleThumbClick = useCallback(
    (variantUrl: string) => {
      if (flags.selectedUrl === variantUrl) {
        onDeselectVariant(word.stateKey)
      } else {
        onSelectVariant(word.stateKey, variantUrl)
      }
    },
    [flags.selectedUrl, onDeselectVariant, onSelectVariant, word.stateKey]
  )

  const handleEnglishChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      onSetEnglishWord(word.stateKey, val === word.englishWord ? '' : val)
    },
    [onSetEnglishWord, word.stateKey, word.englishWord]
  )

  const handleRussianChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      onSetRussianWord(word.stateKey, val === word.russianWord ? '' : val)
    },
    [onSetRussianWord, word.stateKey, word.russianWord]
  )

  const handleArasaacIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSetArasaacId(word.stateKey, e.target.value.replace(NON_DIGIT_RE, ''))
    },
    [onSetArasaacId, word.stateKey]
  )

  const handleOrderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = Number(e.target.value)
      onSetOrder(word.stateKey, v === word.wordIndex ? null : v)
    },
    [onSetOrder, word.stateKey, word.wordIndex]
  )

  const handleDifficultyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value
      onSetDifficulty(word.stateKey, v === word.difficulty && !flags.diffOverride ? '' : v)
    },
    [onSetDifficulty, word.stateKey, word.difficulty, flags.diffOverride]
  )

  const handleMoveCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSetMoveCategory(
        word.stateKey,
        e.target.value === word.categoryId && !flags.moveTarget ? '' : e.target.value
      )
    },
    [onSetMoveCategory, word.stateKey, word.categoryId, flags.moveTarget]
  )

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL
  }, [])

  return (
    <div className={cardClass}>
      <CardHeader
        displayEnglish={displayEnglish}
        displayRussian={displayRussian}
        enOverride={flags.enOverride}
        ruOverride={flags.ruOverride}
        isDeleted={flags.isDeleted}
        onEnglishChange={handleEnglishChange}
        onRussianChange={handleRussianChange}
      />

      <MainImage displayUrl={displayUrl} englishWord={word.englishWord} />

      <GalleryStrip
        word={word}
        selectedUrl={flags.selectedUrl}
        arasaacId={flags.arasaacId}
        orderIdx={flags.orderIdx}
        diffOverride={flags.diffOverride}
        moveTarget={flags.moveTarget}
        isDeleted={flags.isDeleted}
        searchUrl={searchUrl}
        orderOptions={orderOptions}
        allCategories={allCategories}
        onDeselectVariant={handleDeselectVariant}
        onThumbClick={handleThumbClick}
        onImageError={handleImageError}
        onArasaacIdChange={handleArasaacIdChange}
        onOrderChange={handleOrderChange}
        onDifficultyChange={handleDifficultyChange}
        onMoveCategoryChange={handleMoveCategoryChange}
        onToggleDeletion={handleToggleDeletion}
      />
    </div>
  )
}

// --- Gallery sub-components ---

interface GalleryStripProps {
  word: ReviewWord
  selectedUrl: string | null
  arasaacId: string
  orderIdx: number | null
  diffOverride: string
  moveTarget: string
  isDeleted: boolean
  searchUrl: string
  orderOptions: number[]
  allCategories: ReviewCategory[]
  onDeselectVariant: () => void
  onThumbClick: (variantUrl: string) => void
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onArasaacIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onOrderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onDifficultyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onMoveCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onToggleDeletion: () => void
}

function GalleryStrip({
  word,
  selectedUrl,
  arasaacId,
  orderIdx,
  diffOverride,
  moveTarget,
  isDeleted,
  searchUrl,
  orderOptions,
  allCategories,
  onDeselectVariant,
  onThumbClick,
  onImageError,
  onArasaacIdChange,
  onOrderChange,
  onDifficultyChange,
  onMoveCategoryChange,
  onToggleDeletion,
}: GalleryStripProps) {
  return (
    <div className={styles.gallery}>
      <GalleryThumbnails
        word={word}
        selectedUrl={selectedUrl}
        onDeselectVariant={onDeselectVariant}
        onThumbClick={onThumbClick}
        onImageError={onImageError}
      />

      <GalleryControls
        word={word}
        arasaacId={arasaacId}
        orderIdx={orderIdx}
        diffOverride={diffOverride}
        moveTarget={moveTarget}
        isDeleted={isDeleted}
        searchUrl={searchUrl}
        orderOptions={orderOptions}
        allCategories={allCategories}
        onArasaacIdChange={onArasaacIdChange}
        onOrderChange={onOrderChange}
        onDifficultyChange={onDifficultyChange}
        onMoveCategoryChange={onMoveCategoryChange}
        onToggleDeletion={onToggleDeletion}
      />
    </div>
  )
}

interface GalleryThumbnailsProps {
  word: ReviewWord
  selectedUrl: string | null
  onDeselectVariant: () => void
  onThumbClick: (variantUrl: string) => void
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

function GalleryThumbnails({
  word,
  selectedUrl,
  onDeselectVariant,
  onThumbClick,
  onImageError,
}: GalleryThumbnailsProps) {
  return (
    <>
      {word.canonicalUrl ? (
        <button
          type="button"
          className={computeThumbClass(
            styles.thumbButton,
            selectedUrl === null,
            styles.thumbCanonical
          )}
          onClick={onDeselectVariant}
          title="Current canonical image"
        >
          <img
            className={styles.thumbImage}
            src={word.canonicalUrl}
            alt="canonical"
            loading="lazy"
            width={52}
            height={52}
          />
          <div className={styles.thumbLabel}>current</div>
        </button>
      ) : null}

      {word.variants.map(variant => (
        <VariantThumb
          key={variant.arasaacId}
          variant={variant}
          isSelected={selectedUrl === variant.url}
          onThumbClick={onThumbClick}
          onImageError={onImageError}
        />
      ))}

      {word.canonicalUrl || word.variants.length > 0 ? (
        <div className={styles.galleryDivider} />
      ) : null}
    </>
  )
}

interface GalleryControlsProps {
  word: ReviewWord
  arasaacId: string
  orderIdx: number | null
  diffOverride: string
  moveTarget: string
  isDeleted: boolean
  searchUrl: string
  orderOptions: number[]
  allCategories: ReviewCategory[]
  onArasaacIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onOrderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onDifficultyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onMoveCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onToggleDeletion: () => void
}

function GalleryControls({
  word,
  arasaacId,
  orderIdx,
  diffOverride,
  moveTarget,
  isDeleted,
  searchUrl,
  orderOptions,
  allCategories,
  onArasaacIdChange,
  onOrderChange,
  onDifficultyChange,
  onMoveCategoryChange,
  onToggleDeletion,
}: GalleryControlsProps) {
  return (
    <>
      <a
        className={styles.searchCell}
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`Search ARASAAC for "${word.englishWord}"`}
      >
        <Search size={18} />
      </a>

      <div className={`${styles.idCell} ${arasaacId ? styles.idInputFilled : ''}`}>
        <input
          className={styles.idInput}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="ID"
          value={arasaacId}
          onChange={onArasaacIdChange}
          title="Enter ARASAAC pictogram ID"
        />
      </div>

      <select
        className={`${styles.metaSelect} ${orderIdx === null ? '' : styles.metaSelectActive}`}
        value={orderIdx ?? word.wordIndex}
        onChange={onOrderChange}
        title="Position within difficulty"
      >
        {orderOptions.map(i => (
          <option key={i} value={i}>
            #{i + 1}
          </option>
        ))}
      </select>

      <select
        className={`${styles.metaSelect} ${diffOverride ? styles.metaSelectActive : ''}`}
        value={word.difficulty}
        onChange={onDifficultyChange}
        title="Difficulty level"
      >
        <option value="simple">S</option>
        <option value="medium">M</option>
        <option value="complex">C</option>
      </select>

      <select
        className={`${styles.metaSelect} ${moveTarget ? styles.metaSelectActive : ''}`}
        value={word.categoryId}
        onChange={onMoveCategoryChange}
        title="Move to category"
      >
        {allCategories.map(c => (
          <option key={c.id} value={c.id}>
            {c.enName}
          </option>
        ))}
      </select>

      <button
        type="button"
        className={`${styles.deleteCell} ${isDeleted ? styles.deleteCellActive : ''}`}
        onClick={onToggleDeletion}
        title={isDeleted ? 'Undo deletion' : 'Mark for deletion'}
      >
        <Trash2 size={18} />
      </button>
    </>
  )
}

interface VariantThumbProps {
  variant: { url: string; arasaacId: string }
  isSelected: boolean
  onThumbClick: (variantUrl: string) => void
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

function VariantThumb({ variant, isSelected, onThumbClick, onImageError }: VariantThumbProps) {
  const handleClick = useCallback(() => {
    onThumbClick(variant.url)
  }, [onThumbClick, variant.url])

  return (
    <button
      type="button"
      className={computeThumbClass(styles.thumbButton, isSelected, styles.thumbSelected)}
      onClick={handleClick}
      title={`ARASAAC #${variant.arasaacId}`}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- onError is a resource error handler, not a user interaction */}
      <img
        className={styles.thumbImage}
        src={variant.url}
        alt={`variant ${variant.arasaacId}`}
        loading="lazy"
        width={52}
        height={52}
        onError={onImageError}
      />
      <div className={styles.thumbLabel}>#{variant.arasaacId}</div>
    </button>
  )
}
