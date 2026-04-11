import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import styles from './Breadcrumbs.module.css'

export interface BreadcrumbItem {
  label: string
  path: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null
  }

  const lastItem = items[items.length - 1]

  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={item.path} className={styles.item}>
            {index > 0 && (
              <ChevronRight size={14} aria-hidden="true" className={styles.separator} />
            )}
            <Link
              to={item.path}
              className={styles.link}
              aria-current={index === items.length - 1 ? 'location' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>

      <Link to={lastItem.path} className={styles.mobileBack} aria-label={lastItem.label}>
        <ArrowLeft size={16} aria-hidden="true" />
        {lastItem.label}
      </Link>
    </nav>
  )
}
