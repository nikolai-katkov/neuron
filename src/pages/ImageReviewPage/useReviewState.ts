import { useCallback, useEffect, useReducer } from 'react'

import type { ReviewAction, ReviewState, WordChange } from './types'

const STORAGE_KEY = 'mom-aba-image-review'

const DEFAULT_CHANGE: WordChange = {
  selectedVariantUrl: null,
  arasaacId: '',
  markedForDeletion: false,
  englishWordOverride: '',
  russianWordOverride: '',
  moveToCategoryId: '',
  difficultyOverride: '',
  orderOverride: null,
}

function loadState(): ReviewState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as ReviewState
    // Normalize old entries that may be missing newer fields
    for (const key of Object.keys(parsed)) {
      parsed[key] = { ...DEFAULT_CHANGE, ...parsed[key] }
    }
    return parsed
  } catch {
    return {}
  }
}

function saveState(state: ReviewState) {
  // Only persist entries that have actual changes
  const filtered: ReviewState = {}
  for (const [key, change] of Object.entries(state)) {
    if (hasChange(change)) {
      filtered[key] = change
    }
  }
  if (Object.keys(filtered).length === 0) {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }
}

function hasChange(c: WordChange): boolean {
  return Boolean(
    c.selectedVariantUrl ||
    c.arasaacId ||
    c.markedForDeletion ||
    c.englishWordOverride ||
    c.russianWordOverride ||
    c.moveToCategoryId ||
    c.difficultyOverride ||
    c.orderOverride !== null
  )
}

function applyFieldChange(
  state: ReviewState,
  key: string,
  fields: Partial<WordChange>
): ReviewState {
  return {
    ...state,
    [key]: {
      ...(state[key] ?? DEFAULT_CHANGE),
      ...fields,
    },
  }
}

function resolveSimpleFields(
  action: Exclude<ReviewAction, { type: 'RESET' }>
): Partial<WordChange> | null {
  switch (action.type) {
    case 'SELECT_VARIANT': {
      return { selectedVariantUrl: action.variantUrl }
    }
    case 'DESELECT_VARIANT': {
      return { selectedVariantUrl: null }
    }
    case 'SET_ARASAAC_ID': {
      return { arasaacId: action.id }
    }
    case 'SET_ENGLISH_WORD': {
      return { englishWordOverride: action.value }
    }
    case 'SET_RUSSIAN_WORD': {
      return { russianWordOverride: action.value }
    }
    case 'SET_ORDER': {
      return { orderOverride: action.order }
    }
    case 'SET_MOVE_CATEGORY': {
      return { moveToCategoryId: action.categoryId, orderOverride: null }
    }
    case 'SET_DIFFICULTY': {
      return { difficultyOverride: action.difficulty, orderOverride: null }
    }
    case 'TOGGLE_DELETION': {
      return null
    }
  }
}

function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  if (action.type === 'RESET') {
    return {}
  }
  const simple = resolveSimpleFields(action)
  if (simple) {
    return applyFieldChange(state, action.key, simple)
  }
  // TOGGLE_DELETION needs current state
  const current = state[action.key] ?? DEFAULT_CHANGE
  return applyFieldChange(state, action.key, { markedForDeletion: !current.markedForDeletion })
}

export function makeWordKey(categoryId: string, slug: string): string {
  return `${categoryId}/${slug}`
}

export function useReviewState() {
  const [state, dispatch] = useReducer(reviewReducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const selectVariant = useCallback((key: string, variantUrl: string) => {
    dispatch({ type: 'SELECT_VARIANT', key, variantUrl })
  }, [])

  const deselectVariant = useCallback((key: string) => {
    dispatch({ type: 'DESELECT_VARIANT', key })
  }, [])

  const setArasaacId = useCallback((key: string, id: string) => {
    dispatch({ type: 'SET_ARASAAC_ID', key, id })
  }, [])

  const toggleDeletion = useCallback((key: string) => {
    dispatch({ type: 'TOGGLE_DELETION', key })
  }, [])

  const setEnglishWord = useCallback((key: string, value: string) => {
    dispatch({ type: 'SET_ENGLISH_WORD', key, value })
  }, [])

  const setRussianWord = useCallback((key: string, value: string) => {
    dispatch({ type: 'SET_RUSSIAN_WORD', key, value })
  }, [])

  const setMoveCategory = useCallback((key: string, categoryId: string) => {
    dispatch({ type: 'SET_MOVE_CATEGORY', key, categoryId })
  }, [])

  const setDifficulty = useCallback((key: string, difficulty: string) => {
    dispatch({ type: 'SET_DIFFICULTY', key, difficulty })
  }, [])

  const setOrder = useCallback((key: string, order: number | null) => {
    dispatch({ type: 'SET_ORDER', key, order })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const changeCount = Object.values(state).filter(hasChange).length

  return {
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
  }
}
