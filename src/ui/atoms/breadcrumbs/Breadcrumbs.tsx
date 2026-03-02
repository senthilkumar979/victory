import type { HTMLAttributes, ReactNode } from 'react'

interface BreadcrumbItem {
  label: ReactNode
  href?: string
}

interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  ariaLabel?: string
  separator?: ReactNode
  variant?: 'primary' | 'secondary'
}

const mergeClasses = (...classes: Array<string | undefined>): string =>
  classes.filter(Boolean).join(' ')

const baseNavClass = 'flex items-center text-sm text-muted-foreground'

const listClass = 'inline-flex flex-wrap items-center gap-1'

const itemClass = 'inline-flex items-center gap-1'

const linkClass =
  'hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm'

const currentItemClass = 'font-medium text-foreground'

export const Breadcrumbs = ({
  items,
  ariaLabel,
  separator = '/',
  className,
  variant = 'secondary',
  ...props
}: BreadcrumbsProps) => {
  if (!items || items.length === 0) return null

  return (
    <div
      className={`rounded-md w-fit-content p-3 ${
        variant === 'primary'
          ? 'bg-primary'
          : variant === 'secondary'
          ? 'bg-secondary'
          : 'bg-muted'
      }`}
    >
      <nav
        aria-label={ariaLabel ?? 'Breadcrumb'}
        className={mergeClasses(baseNavClass, className)}
        {...props}
      >
        <ol className={listClass}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <li key={index} className={itemClass}>
                {item.href && !isLast ? (
                  <a href={item.href} className={linkClass}>
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={isLast ? currentItemClass : undefined}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast ? <span aria-hidden="true">{separator}</span> : null}
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
