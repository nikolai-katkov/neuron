export type Theme = 'warm' | 'soft' | 'editorial'

export const THEMES: Theme[] = ['warm', 'soft', 'editorial']

export const DEFAULT_THEME: Theme = 'warm'

export type ColorMode = 'light' | 'dark'

export const COLOR_MODES: ColorMode[] = ['light', 'dark']

export const DEFAULT_COLOR_MODE: ColorMode = 'light'

export interface ThemeMetadata {
  swatch: string
}

export const THEME_METADATA: Record<Theme, ThemeMetadata> = {
  warm: { swatch: '#c2703e' },
  soft: { swatch: '#9b7dd4' },
  editorial: { swatch: '#2d3748' },
}
