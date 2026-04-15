import type { ReactNode } from 'react'
import { forwardRef, useImperativeHandle, useMemo } from 'react'

import styles from './SwipeCard.module.css'
import type { SwipeDirection, SwipeGestureResult } from './useSwipeGesture'
import { useSwipeGesture } from './useSwipeGesture'

// =============================================================================
// Types
// =============================================================================

export interface SwipeCardHandle {
  triggerSwipe: (direction: SwipeDirection) => void
}

interface SwipeCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  isActive: boolean
  stackIndex?: number
  /** Zone overlay labels keyed by direction */
  zoneLabels?: Partial<Record<SwipeDirection, string>>
}

// =============================================================================
// Helpers
// =============================================================================

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

const SWIPE_THRESHOLD = 80

/**
 * Determine which zone the card is currently in based on offset,
 * using the same axis-dominant logic as intent detection.
 */
function detectZone(offsetX: number, offsetY: number): SwipeDirection | null {
  const absX = Math.abs(offsetX)
  const absY = Math.abs(offsetY)
  const minActive = 10 // Minimum displacement to show any zone hint

  if (absX < minActive && absY < minActive) {
    return null
  }

  const isVertical = absY > absX * 1.2

  if (isVertical) {
    return offsetY < 0 ? 'up' : 'down'
  }
  return offsetX > 0 ? 'right' : 'left'
}

/**
 * Compute overlay opacity with a quadratic curve: barely visible at threshold,
 * full color only near the edge. Ramps from 0 → 0.5 over 0–200px range.
 */
function zoneOpacity(offsetX: number, offsetY: number, zone: SwipeDirection): number {
  const displacement = zone === 'up' || zone === 'down' ? Math.abs(offsetY) : Math.abs(offsetX)
  const range = SWIPE_THRESHOLD * 2.5
  const progress = Math.min(displacement / range, 1)
  return progress * progress * 0.5
}

/** CSS variable name for each zone's color token */
const ZONE_COLORS: Record<SwipeDirection, string> = {
  right: 'var(--color-success)',
  left: 'var(--color-danger)',
  up: 'var(--color-warning)',
  down: 'var(--color-text-muted)',
}

// =============================================================================
// Zone Overlay
// =============================================================================

function ZoneOverlay({
  offsetX,
  offsetY,
  zoneLabels,
}: {
  offsetX: number
  offsetY: number
  zoneLabels: Partial<Record<SwipeDirection, string>>
}) {
  const zone = detectZone(offsetX, offsetY)
  if (!zone) {
    return null
  }

  const opacity = zoneOpacity(offsetX, offsetY, zone)
  if (opacity < 0.01) {
    return null
  }

  const label = zoneLabels[zone]

  return (
    <div
      className={styles.zoneOverlay}
      style={{
        backgroundColor: ZONE_COLORS[zone],
        opacity,
      }}
    >
      {label ? <span className={styles.zoneLabel}>{label}</span> : null}
    </div>
  )
}

// =============================================================================
// Component
// =============================================================================

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  (
    {
      children,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      isActive,
      stackIndex = 0,
      zoneLabels = {},
    },
    ref
  ) => {
    const gesture: SwipeGestureResult = useSwipeGesture({
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      enabled: isActive,
    })

    useImperativeHandle(ref, () => ({ triggerSwipe: gesture.triggerSwipe }), [gesture.triggerSwipe])

    const transform = useMemo(() => {
      if (!isActive) {
        return 'translate(0, 0)'
      }

      const rotation = prefersReducedMotion() ? 0 : gesture.offsetX * 0.08
      return `translate(${gesture.offsetX}px, ${gesture.offsetY}px) rotate(${rotation}deg)`
    }, [isActive, gesture.offsetX, gesture.offsetY])

    const style = useMemo(
      () => ({
        transform,
        transition:
          !isActive || gesture.isDragging
            ? 'none'
            : `transform ${gesture.animationDurationMs}ms ${gesture.animationEasing}`,
        zIndex: isActive ? 10 : 10 - stackIndex,
        willChange: isActive ? ('transform' as const) : ('auto' as const),
        touchAction: isActive ? ('none' as const) : ('auto' as const),
      }),
      [
        transform,
        gesture.isDragging,
        gesture.animationDurationMs,
        gesture.animationEasing,
        isActive,
        stackIndex,
      ]
    )

    return (
      <div
        className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
        style={style}
        {...(isActive ? gesture.handlers : {})}
      >
        {children}
        {isActive && (gesture.isDragging || gesture.flyDirection) ? (
          <ZoneOverlay
            offsetX={gesture.offsetX}
            offsetY={gesture.offsetY}
            zoneLabels={zoneLabels}
          />
        ) : null}
      </div>
    )
  }
)

SwipeCard.displayName = 'SwipeCard'
