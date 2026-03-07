import type { HTMLAttributes, ReactNode } from 'react'

const cardRoot =
  'rounded-xl border border-slate-200/80 bg-white text-slate-950 shadow-sm'

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[cardRoot, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['flex flex-col space-y-1.5 p-6', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={['font-semibold leading-none tracking-tight', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={['p-6 pt-0', className].filter(Boolean).join(' ')} {...props} />
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['flex items-center p-6 pt-0', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
