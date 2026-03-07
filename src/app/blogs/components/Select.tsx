import type { SelectHTMLAttributes } from 'react'

const selectClass =
  'flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm transition-colors' +
  ' focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2' +
  ' disabled:pointer-events-none disabled:opacity-50'

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={[selectClass, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
