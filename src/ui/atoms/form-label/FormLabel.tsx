import type { LabelHTMLAttributes, ReactNode } from 'react'

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
  isRequired?: boolean
}

export const FormLabel = ({
  children,
  isRequired = false,
  className,
  ...rest
}: FormLabelProps) => {
  const baseClass =
    'text-sm text-muted font-medium uppercase letter-spacing-wide font-sm'

  return (
    <label className={`${baseClass} ${className ?? ''}`} {...rest}>
      {children}
      {isRequired ? <span className="ml-0.5 text-red-500">*</span> : null}
    </label>
  )
}

