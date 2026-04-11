import { Moon, Palette, Sun, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useLanguage, useTheme } from '../../../hooks'
import type { Language } from '../../../i18n'
import type { Theme } from '../../../types'
import { THEME_METADATA, THEMES } from '../../../types'
import styles from './ControlsPill.module.css'

const LANGUAGES: Language[] = ['ru', 'en']

const LANGUAGE_LABELS: Record<Language, string> = {
  ru: 'RU',
  en: 'EN',
}

const THEME_I18N_KEYS: Record<Theme, 'themeWarm' | 'themeSoft' | 'themeEditorial'> = {
  warm: 'themeWarm',
  soft: 'themeSoft',
  editorial: 'themeEditorial',
}

const THEME_DESC_KEYS: Record<Theme, 'themeWarmDesc' | 'themeSoftDesc' | 'themeEditorialDesc'> = {
  warm: 'themeWarmDesc',
  soft: 'themeSoftDesc',
  editorial: 'themeEditorialDesc',
}

const MOBILE_QUERY = '(max-width: 640px)'

function useRadioGroupKeyDown(
  items: ReadonlyArray<string>,
  onSelect: (item: string) => void,
  groupRef: React.RefObject<HTMLDivElement | null>
) {
  return useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex = currentIndex

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        nextIndex = (currentIndex + 1) % items.length
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        nextIndex = (currentIndex - 1 + items.length) % items.length
      } else {
        return
      }

      onSelect(items[nextIndex])
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      buttons?.[nextIndex]?.focus()
    },
    [items, onSelect, groupRef]
  )
}

function LanguageButton({
  lang,
  isActive,
  onSelect,
  onKeyDown,
}: {
  lang: Language
  isActive: boolean
  onSelect: (lang: Language) => void
  onKeyDown: (event: React.KeyboardEvent, index: number) => void
}) {
  const index = LANGUAGES.indexOf(lang)

  const handleClick = useCallback(() => {
    onSelect(lang)
  }, [onSelect, lang])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      onKeyDown(event, index)
    },
    [onKeyDown, index]
  )

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      className={`${styles.langButton} ${isActive ? styles.langActive : ''}`}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {LANGUAGE_LABELS[lang]}
    </button>
  )
}

function ThemeSwatch({
  themeOption,
  isActive,
  label,
  description,
  onSelect,
  onKeyDown,
}: {
  themeOption: Theme
  isActive: boolean
  label: string
  description: string
  onSelect: (theme: Theme) => void
  onKeyDown: (event: React.KeyboardEvent, index: number) => void
}) {
  const index = THEMES.indexOf(themeOption)

  const handleClick = useCallback(() => {
    onSelect(themeOption)
  }, [onSelect, themeOption])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      onKeyDown(event, index)
    },
    [onKeyDown, index]
  )

  const style = useMemo(
    () => ({ '--swatch-color': THEME_METADATA[themeOption].swatch }) as React.CSSProperties,
    [themeOption]
  )

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-label={label}
      title={description}
      className={`${styles.swatch} ${isActive ? styles.swatchActive : ''}`}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={style}
    />
  )
}

export function ControlsPill() {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme, colorMode, toggleColorMode } = useTheme()
  const langGroupRef = useRef<HTMLDivElement>(null)
  const themeGroupRef = useRef<HTMLDivElement>(null)
  const expandTriggerRef = useRef<HTMLButtonElement>(null)

  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    return !window.matchMedia(MOBILE_QUERY).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const handler = (event: MediaQueryListEvent) => {
      setIsExpanded(!event.matches)
    }
    mql.addEventListener('change', handler)
    return () => {
      mql.removeEventListener('change', handler)
    }
  }, [])

  const handleExpand = useCallback(() => {
    setIsExpanded(true)
  }, [])

  const handleCollapse = useCallback(() => {
    setIsExpanded(false)
    requestAnimationFrame(() => {
      expandTriggerRef.current?.focus()
    })
  }, [])

  const handleSetLang = useCallback(
    (item: string) => {
      setLanguage(item as Language)
    },
    [setLanguage]
  )

  const handleSetTheme = useCallback(
    (item: string) => {
      setTheme(item as Theme)
    },
    [setTheme]
  )

  const handleLangKeyDown = useRadioGroupKeyDown(LANGUAGES, handleSetLang, langGroupRef)
  const handleThemeKeyDown = useRadioGroupKeyDown(THEMES, handleSetTheme, themeGroupRef)

  const isDark = colorMode === 'dark'
  const modeLabel = isDark ? t('lightMode') : t('darkMode')

  return (
    <div
      className={`${styles.pill} ${isExpanded ? '' : styles.collapsed}`}
      role="toolbar"
      aria-label={t('appControls')}
    >
      <button
        ref={expandTriggerRef}
        className={styles.expandTrigger}
        onClick={handleExpand}
        type="button"
        aria-label={t('expandControls')}
      >
        <Palette size={18} aria-hidden="true" />
      </button>

      <div className={styles.expandable}>
        <div
          ref={langGroupRef}
          className={styles.group}
          role="radiogroup"
          aria-label={t('selectLanguage')}
        >
          {LANGUAGES.map(lang => (
            <LanguageButton
              key={lang}
              lang={lang}
              isActive={lang === language}
              onSelect={setLanguage}
              onKeyDown={handleLangKeyDown}
            />
          ))}
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <button
          type="button"
          className={styles.modeToggle}
          onClick={toggleColorMode}
          aria-pressed={isDark}
          aria-label={modeLabel}
          title={modeLabel}
        >
          {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        </button>

        <div className={styles.divider} aria-hidden="true" />

        <div
          ref={themeGroupRef}
          className={styles.group}
          role="radiogroup"
          aria-label={t('selectTheme')}
        >
          {THEMES.map(themeOption => (
            <ThemeSwatch
              key={themeOption}
              themeOption={themeOption}
              isActive={themeOption === theme}
              label={t(THEME_I18N_KEYS[themeOption])}
              description={t(THEME_DESC_KEYS[themeOption])}
              onSelect={setTheme}
              onKeyDown={handleThemeKeyDown}
            />
          ))}
        </div>

        <button
          className={styles.collapseButton}
          onClick={handleCollapse}
          type="button"
          aria-label={t('collapseControls')}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
