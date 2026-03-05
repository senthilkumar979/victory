import { useMemo } from 'react'

export const StudentBatch = ({ batch }: { batch: number }) => {
  const batchColor = useMemo(() => {
    if (batch === 2025) return 'primary'
    if (batch === 2026) return 'secondary'
    if (batch === 2027) return 'tertiary'
    if (batch === 2028) return 'success'
    if (batch === 2029) return 'warning'
    if (batch === 2030) return 'error'
    return 'text'
  }, [batch])

  return (
    <div className="flex items-center gap-2">
      <span
        className={`block size-1.5 shrink-0 rounded-full shadow-[0_0_0_3px] bg-${batchColor} shadow-${batchColor}`}
      ></span>
      {batch}
    </div>
  )
}
