import { useLanguage } from '../../../hooks'
import { tProps } from '../../../i18n'
import styles from './VideoPlaceholder.module.css'

interface VideoPlaceholderProps {
  label?: string
  src?: string
}

export function VideoPlaceholder({ label, src }: VideoPlaceholderProps) {
  const { t } = useLanguage()
  const resolvedLabel = label ?? t('videoComingSoon')

  if (src) {
    return (
      <div className={styles.videoWrapper}>
        <video className={styles.video} src={src} controls preload="metadata" playsInline />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <span className={styles.label} {...tProps('videoComingSoon')}>
        {resolvedLabel}
      </span>
    </div>
  )
}
