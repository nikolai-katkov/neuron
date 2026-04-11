export type WordDifficulty = 'simple' | 'medium' | 'complex'

export interface VocabularyCategory {
  id: string
  sectionId: string
  name: string
  words: Record<WordDifficulty, string[]>
}
