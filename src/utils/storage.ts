import type { Language } from '../i18n'
import type { AssessmentState, ColorMode, Theme } from '../types'
import { COLOR_MODES, DEFAULT_COLOR_MODE, DEFAULT_THEME, THEMES } from '../types'

const STORAGE_KEY = 'neuron-assessment-state'
const LANGUAGE_KEY = 'neuron-language'
const THEME_KEY = 'neuron-theme'
const COLOR_MODE_KEY = 'neuron-color-mode'
const DEFAULT_LANGUAGE: Language = 'ru'

export function loadLanguage(): Language {
  try {
    const raw = localStorage.getItem(LANGUAGE_KEY)
    if (raw === 'en' || raw === 'ru') {
      return raw
    }
    return DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function saveLanguage(language: Language): void {
  localStorage.setItem(LANGUAGE_KEY, language)
}

export function createInitialState(): AssessmentState {
  return { criterionStates: {} }
}

export function loadAssessmentState(): AssessmentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return createInitialState()
    }

    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'criterionStates' in parsed &&
      typeof (parsed as AssessmentState).criterionStates === 'object'
    ) {
      return parsed as AssessmentState
    }
    return createInitialState()
  } catch {
    return createInitialState()
  }
}

export function saveAssessmentState(state: AssessmentState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    if (raw && (THEMES as string[]).includes(raw)) {
      return raw as Theme
    }
    return DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme)
}

export function loadColorMode(): ColorMode {
  try {
    const raw = localStorage.getItem(COLOR_MODE_KEY)
    if (raw && (COLOR_MODES as string[]).includes(raw)) {
      return raw as ColorMode
    }
    return DEFAULT_COLOR_MODE
  } catch {
    return DEFAULT_COLOR_MODE
  }
}

export function saveColorMode(mode: ColorMode): void {
  localStorage.setItem(COLOR_MODE_KEY, mode)
}
