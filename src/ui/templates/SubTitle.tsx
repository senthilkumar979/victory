import clsx from 'clsx'
import { BaseTitleProps } from './Title.types'

interface SubTitleProps extends BaseTitleProps {
  as?: 'p' | 'h2' | 'h3'
}

export const SubTitle = ({ as = 'p', children, className }: SubTitleProps) => {
  const Component = as

  return (
    <Component className={clsx('mt-1 text-sm text-secondary uppercase letter-spacing-wide', className)}>
      {children}
    </Component>
  )
}
