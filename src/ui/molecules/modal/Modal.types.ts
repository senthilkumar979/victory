import type { JSX, ReactNode } from 'react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalRootProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize
  showCloseButton?: boolean
}

export interface ModalTitleProps {
  children: ReactNode
}

export interface ModalBodyProps {
  children: ReactNode
}

export interface ModalFooterProps {
  children: ReactNode
}

export interface ModalComposition {
  (props: ModalRootProps): JSX.Element | null
  Title: (props: ModalTitleProps) => JSX.Element | null
  Body: (props: ModalBodyProps) => JSX.Element | null
  Footer: (props: ModalFooterProps) => JSX.Element | null
}

