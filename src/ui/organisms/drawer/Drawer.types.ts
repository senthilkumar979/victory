import type { JSX, ReactNode } from 'react'

export type DrawerSide = 'left' | 'right'

export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'

export interface DrawerRootProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  side?: DrawerSide
  size?: DrawerSize
  showCloseButton?: boolean
}

export interface DrawerTitleProps {
  children: ReactNode
  description?: ReactNode
}

export interface DrawerBodyProps {
  children: ReactNode
}

export interface DrawerFooterProps {
  children: ReactNode
}

export interface DrawerComposition {
  (props: DrawerRootProps): JSX.Element | null
  Title: (props: DrawerTitleProps) => JSX.Element | null
  Body: (props: DrawerBodyProps) => JSX.Element | null
  Footer: (props: DrawerFooterProps) => JSX.Element | null
}

