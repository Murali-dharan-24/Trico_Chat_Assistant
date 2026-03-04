import { motion } from 'framer-motion'

function SkeletonBlock({ width = '100%', height = '16px', rounded = 'rounded-lg' }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      className={`${rounded} shrink-0`}
      style={{
        width,
        height,
        background: 'var(--surface)',
      }}
    />
  )
}

// News article skeleton
export function NewsCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl border"
      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--surface-border)' }}
    >
      <SkeletonBlock width="90%" height="16px" />
      <SkeletonBlock width="60%" height="12px" />
    </div>
  )
}

// Weather skeleton
export function WeatherSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SkeletonBlock width="64px" height="64px" rounded="rounded-2xl" />
        <div className="flex flex-col gap-2">
          <SkeletonBlock width="80px" height="40px" rounded="rounded-xl" />
          <SkeletonBlock width="120px" height="14px" />
        </div>
      </div>
      <div
        className="flex flex-col gap-3 p-4 rounded-xl border"
        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--surface-border)' }}
      >
        <SkeletonBlock width="140px" height="14px" />
        <SkeletonBlock width="120px" height="14px" />
        <SkeletonBlock width="130px" height="14px" />
      </div>
    </div>
  )
}

// Note skeleton
export function NoteSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 px-3 py-3 rounded-xl border"
      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--surface-border)' }}
    >
      <SkeletonBlock width="70%" height="14px" />
      <SkeletonBlock width="90%" height="12px" />
      <SkeletonBlock width="40%" height="10px" />
    </div>
  )
}

// History chat skeleton
export function HistorySkeleton() {
  return (
    <div
      className="flex flex-col gap-2 px-3 py-3 rounded-xl border"
      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--surface-border)' }}
    >
      <div className="flex items-center gap-2">
        <SkeletonBlock width="16px" height="16px" rounded="rounded-md" />
        <SkeletonBlock width="75%" height="14px" />
      </div>
      <SkeletonBlock width="50%" height="11px" />
    </div>
  )
}

// Memory skeleton
export function MemorySkeleton() {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl border"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
    >
      <SkeletonBlock width="24px" height="24px" rounded="rounded-lg" />
      <div className="flex flex-col gap-2 flex-1">
        <SkeletonBlock width="85%" height="14px" />
        <SkeletonBlock width="40%" height="10px" />
      </div>
    </div>
  )
}

// Generic list skeleton — n items
export function ListSkeleton({ count = 4, Component }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}

export default SkeletonBlock