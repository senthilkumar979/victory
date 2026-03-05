import { joinClassNames } from '@/utils/tailwindUtils'
import type { LabelHTMLAttributes, ReactNode } from 'react'

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
  isRequired?: boolean
  isDarkMode?: boolean
}

export const FormLabel = ({
  children,
  isRequired = false,
  className,
  isDarkMode = false,
  ...rest
}: FormLabelProps) => {
  const baseClass =
    'text-sm text-muted font-medium uppercase letter-spacing-wide font-sm'

  return (
    <label
      className={joinClassNames(
        baseClass,
        className,
        isDarkMode ? 'text-white' : 'text-muted',
      )}
      {...rest}
    >
      {children}
      {isRequired ? <span className="ml-0.5 text-red-500">*</span> : null}
    </label>
  )
}
