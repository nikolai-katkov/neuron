import type { ReviewState, WordChange } from './types'

/**
 * Retrieve a word's change from state with an explicit undefined-allowing type,
 * so that TypeScript/ESLint does not treat the result as always-defined
 * (Record<string, WordChange> indexing yields WordChange, not WordChange | undefined).
 */
export function getChangeForKey(state: ReviewState, key: string): WordChange | undefined {
  const change: WordChange | undefined = state[key]
  return change
}
