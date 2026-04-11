import type { ReactNode } from 'react'

import type { BreadcrumbItem } from '../Breadcrumbs/Breadcrumbs'
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  breadcrumbs?: BreadcrumbItem[]
}

export function PageLayout({ children, title, breadcrumbs }: PageLayoutProps) {
  return (
    <main className={styles.layout}>
      <header className={styles.header}>
        {breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={breadcrumbs} /> : null}
        {title ? <h1 className={styles.title}>{title}</h1> : null}
      </header>
      <div className={styles.content}>{children}</div>
    </main>
  )
}
