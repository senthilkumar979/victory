import clsx from 'clsx'
import { BaseTitleProps } from './Title.types'

interface TitleProps extends BaseTitleProps {
  as?: 'h1' | 'h2' | 'h3'
}

export const Title = ({ as = 'h1', children, className }: TitleProps) => {
  const Component = as

  return (
    <Component
      className={clsx(
        'text-2xl font-semibold tracking-tight text-primary uppercase letter-spacing-wide orbitron',
        className,
      )}
    >
      {children}
    </Component>
  )
}
