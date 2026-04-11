import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLanguage } from '../../../hooks'
import { tProps } from '../../../i18n'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  hasBackButton?: boolean
  backPath?: string
}

export function PageLayout({ children, title, hasBackButton = false, backPath }: PageLayoutProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleBack = useCallback(() => {
    if (backPath) {
      navigate(backPath)
    } else {
      navigate(-1)
    }
  }, [navigate, backPath])

  return (
    <main className={styles.layout}>
      <header className={styles.header}>
        {hasBackButton ? (
          <button
            className={styles.backButton}
            onClick={handleBack}
            type="button"
            aria-label={t('goBack')}
            {...tProps('back')}
          >
            <ArrowLeft size={16} aria-hidden="true" /> {t('back')}
          </button>
        ) : null}
        {title ? <h1 className={styles.title}>{title}</h1> : null}
      </header>
      <div className={styles.content}>{children}</div>
    </main>
  )
}
