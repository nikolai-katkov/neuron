import { useCallback, useRef, useState } from 'react'

// =============================================================================
// Types
// =============================================================================

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

interface SwipeState {
  offsetX: number
  offsetY: number
  isDragging: boolean
  flyDirection: SwipeDirection | null
}

export interface SwipeGestureResult {
  offsetX: number
  offsetY: number
  isDragging: boolean
  flyDirection: SwipeDirection | null
  animationDurationMs: number
  animationEasing: string
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onPointerCancel: (e: React.PointerEvent) => void
  }
  triggerSwipe: (direction: SwipeDirection) => void
}

// =============================================================================
// Constants
// =============================================================================

/** Minimum displacement (px) to commit a swipe */
const SWIPE_THRESHOLD = 80

/** Minimum velocity (px/ms) to commit a swipe regardless of distance */
const VELOCITY_THRESHOLD = 0.3

/** Horizontal fly-off distance (px) */
const FLY_OFF_X = 600

/** Vertical fly-off distance (px, negative = up, positive = down) */
const FLY_OFF_Y = 800

/** Rolling window size for velocity samples */
const VELOCITY_WINDOW = 5

/** Minimum snap animation duration (ms) */
const MIN_ANIMATION_MS = 150

/** Maximum snap animation duration (ms) */
const MAX_ANIMATION_MS = 400

/** Floor for velocity divisor in duration calc (prevents near-zero division) */
const MIN_VELOCITY_FOR_DURATION = 0.5

/** Default animation duration for button-triggered swipes and snap-backs */
const DEFAULT_ANIMATION_MS = 300

/** Easing for momentum-driven snaps (fast start, gentle deceleration) */
const EASE_MOMENTUM = 'cubic-bezier(0.2, 0, 0, 1)'

/** Easing for position-driven snaps (spring-like settle) */
const EASE_POSITION = 'cubic-bezier(0.32, 0.72, 0, 1)'

/**
 * Vertical-to-horizontal bias multiplier for intent detection.
 * absY must exceed absX * this factor to be considered vertical.
 * Prevents accidental vertical swipes during horizontal swiping.
 */
const VERTICAL_BIAS = 1.2

// =============================================================================
// Helpers
// =============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

interface VelocitySample {
  x: number
  y: number
  t: number
}

/**
 * Compute weighted 2D velocity from the last 2-3 samples.
 * Recent sample weighted 3x, older weighted 1x.
 * Adopted from chords useSheetDrag.
 */
function computeVelocity2D(samples: VelocitySample[]): { vx: number; vy: number } {
  const n = samples.length
  if (n < 2) {
    return { vx: 0, vy: 0 }
  }

  const dt1 = samples[n - 1].t - samples[n - 2].t
  const vx1 = dt1 > 0 ? (samples[n - 1].x - samples[n - 2].x) / dt1 : 0
  const vy1 = dt1 > 0 ? (samples[n - 1].y - samples[n - 2].y) / dt1 : 0

  if (n < 3) {
    return { vx: vx1, vy: vy1 }
  }

  const dt2 = samples[n - 2].t - samples[n - 3].t
  const vx2 = dt2 > 0 ? (samples[n - 2].x - samples[n - 3].x) / dt2 : 0
  const vy2 = dt2 > 0 ? (samples[n - 2].y - samples[n - 3].y) / dt2 : 0

  return {
    vx: (vx1 * 3 + vx2) / 4,
    vy: (vy1 * 3 + vy2) / 4,
  }
}

/** Compute adaptive animation duration based on remaining distance and velocity. */
function computeDuration(distance: number, velocity: number): number {
  if (prefersReducedMotion()) {
    return 1
  }
  const speed = Math.max(Math.abs(velocity), MIN_VELOCITY_FOR_DURATION)
  return clamp(distance / speed, MIN_ANIMATION_MS, MAX_ANIMATION_MS)
}

/**
 * Resolve the fly-off target position for a given direction,
 * preserving the current offset on the non-primary axis for natural trajectory.
 */
function flyOffTarget(
  direction: SwipeDirection,
  currentX: number,
  currentY: number
): { x: number; y: number } {
  switch (direction) {
    case 'right': {
      return { x: FLY_OFF_X, y: currentY }
    }
    case 'left': {
      return { x: -FLY_OFF_X, y: currentY }
    }
    case 'up': {
      return { x: currentX, y: -FLY_OFF_Y }
    }
    case 'down': {
      return { x: currentX, y: FLY_OFF_Y }
    }
  }
}

interface SwipeIntent {
  direction: SwipeDirection | null
  primaryVelocity: number
  primaryDisplacement: number
}

/** Minimum displacement for position to be considered "significant" in cancel detection */
const CANCEL_DISPLACEMENT = 40

/**
 * Axis-dominant intent detection with velocity-first priority.
 *
 * When velocity exceeds threshold, velocity direction wins.
 * If velocity opposes a significant displacement (user dragged far left
 * then flicked right), the gesture is a cancel → snap back.
 *
 * When velocity is low, displacement determines direction (slow release).
 */
function resolveSwipeIntent(dx: number, dy: number, vx: number, vy: number): SwipeIntent {
  const absX = Math.abs(dx)
  const absY = Math.abs(dy)
  const absVx = Math.abs(vx)
  const absVy = Math.abs(vy)

  // Determine primary axis from the stronger signal (velocity or displacement)
  const velocityDominant = Math.max(absVx, absVy) > VELOCITY_THRESHOLD
  const isVertical = velocityDominant ? absVy > absVx * VERTICAL_BIAS : absY > absX * VERTICAL_BIAS

  if (isVertical) {
    return resolveAxisIntent(dy, vy, absY, absVy, 'down', 'up')
  }
  return resolveAxisIntent(dx, vx, absX, absVx, 'right', 'left')
}

function resolveAxisIntent(
  displacement: number,
  velocity: number,
  absDisplacement: number,
  absVelocity: number,
  positiveDir: SwipeDirection,
  negativeDir: SwipeDirection
): SwipeIntent {
  const primaryVelocity = velocity
  const primaryDisplacement = absDisplacement

  // Velocity-based: fast flick determines direction
  if (absVelocity > VELOCITY_THRESHOLD) {
    const velocityDir = velocity > 0 ? positiveDir : negativeDir
    const displacementDir = displacement > 0 ? positiveDir : negativeDir

    // If card is far from center and velocity opposes displacement → cancel (snap back)
    if (absDisplacement > CANCEL_DISPLACEMENT && velocityDir !== displacementDir) {
      return { direction: null, primaryVelocity, primaryDisplacement }
    }

    return { direction: velocityDir, primaryVelocity, primaryDisplacement }
  }

  // Position-based: slow release past threshold
  if (absDisplacement > SWIPE_THRESHOLD) {
    return {
      direction: displacement > 0 ? positiveDir : negativeDir,
      primaryVelocity,
      primaryDisplacement,
    }
  }

  // Below both thresholds: snap back
  return { direction: null, primaryVelocity, primaryDisplacement }
}

// =============================================================================
// Hook
// =============================================================================

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  enabled = true,
}: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  enabled?: boolean
}): SwipeGestureResult {
  const [state, setState] = useState<SwipeState>({
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    flyDirection: null,
  })

  const startX = useRef(0)
  const startY = useRef(0)
  const pointerId = useRef<number | null>(null)
  const samplesRef = useRef<VelocitySample[]>([])
  const durationRef = useRef(DEFAULT_ANIMATION_MS)
  const easingRef = useRef(EASE_POSITION)

  const callHandler = useCallback(
    (direction: SwipeDirection) => {
      switch (direction) {
        case 'right': {
          return onSwipeRight?.()
        }
        case 'left': {
          return onSwipeLeft?.()
        }
        case 'up': {
          return onSwipeUp?.()
        }
        case 'down': {
          return onSwipeDown?.()
        }
      }
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  )

  const commitSwipe = useCallback(
    (direction: SwipeDirection, currentX: number, currentY: number) => {
      const target = flyOffTarget(direction, currentX, currentY)

      setState({
        offsetX: target.x,
        offsetY: target.y,
        isDragging: false,
        flyDirection: direction,
      })

      // Short delay lets the card leave the visible viewport before unmounting.
      // 100ms is enough with momentum easing on mobile (375px wide).
      // flyDirection stays set — card remains off-screen until React unmounts it.
      setTimeout(() => {
        callHandler(direction)
      }, 100)
    },
    [callHandler]
  )

  const triggerSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (state.flyDirection) {
        return
      }
      durationRef.current = DEFAULT_ANIMATION_MS
      easingRef.current = EASE_POSITION
      commitSwipe(direction, 0, 0)
    },
    [state.flyDirection, commitSwipe]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || state.flyDirection) {
        return
      }
      pointerId.current = e.pointerId
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      startX.current = e.clientX
      startY.current = e.clientY
      samplesRef.current = [{ x: e.clientX, y: e.clientY, t: Date.now() }]
      setState(prev => ({ ...prev, isDragging: true, offsetX: 0, offsetY: 0 }))
    },
    [enabled, state.flyDirection]
  )

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) {
      return
    }
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    // Rolling velocity window
    const now = Date.now()
    samplesRef.current.push({ x: e.clientX, y: e.clientY, t: now })
    if (samplesRef.current.length > VELOCITY_WINDOW) {
      samplesRef.current.shift()
    }

    setState(prev => ({ ...prev, offsetX: dx, offsetY: dy }))
  }, [])

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerId.current !== e.pointerId) {
        return
      }
      pointerId.current = null

      const dx = e.clientX - startX.current
      const dy = e.clientY - startY.current
      const { vx, vy } = computeVelocity2D(samplesRef.current)
      const intent = resolveSwipeIntent(dx, dy, vx, vy)

      if (!intent.direction) {
        durationRef.current = DEFAULT_ANIMATION_MS
        easingRef.current = EASE_POSITION
        setState({ offsetX: 0, offsetY: 0, isDragging: false, flyDirection: null })
        return
      }

      const isMomentum = Math.abs(intent.primaryVelocity) > VELOCITY_THRESHOLD
      const target = flyOffTarget(intent.direction, dx, dy)
      const distance =
        intent.direction === 'up' || intent.direction === 'down'
          ? Math.abs(target.y - dy)
          : Math.abs(target.x - dx)

      durationRef.current = computeDuration(
        distance,
        isMomentum ? intent.primaryVelocity : intent.primaryDisplacement / DEFAULT_ANIMATION_MS
      )
      easingRef.current = isMomentum ? EASE_MOMENTUM : EASE_POSITION
      commitSwipe(intent.direction, dx, dy)
    },
    [commitSwipe]
  )

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) {
      return
    }
    pointerId.current = null
    durationRef.current = DEFAULT_ANIMATION_MS
    easingRef.current = EASE_POSITION
    setState({ offsetX: 0, offsetY: 0, isDragging: false, flyDirection: null })
  }, [])

  return {
    offsetX: state.offsetX,
    offsetY: state.offsetY,
    isDragging: state.isDragging,
    flyDirection: state.flyDirection,
    animationDurationMs: durationRef.current,
    animationEasing: easingRef.current,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    triggerSwipe,
  }
}
