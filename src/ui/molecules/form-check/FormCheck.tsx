import type { InputHTMLAttributes, ReactNode } from 'react'

type FormCheckType = 'checkbox' | 'radio'

interface FormCheckProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  type: FormCheckType
  label: ReactNode
  helperText?: ReactNode
  errorMessage?: ReactNode
}

const mergeClasses = (...classes: Array<string | undefined>): string =>
  classes.filter(Boolean).join(' ')

export const FormCheck = ({
  id,
  type,
  label,
  helperText,
  errorMessage,
  className,
  ...inputProps
}: FormCheckProps) => {
  const inputId =
    id ??
    (typeof label === 'string'
      ? label.replace(/\s+/g, '-').toLowerCase()
      : undefined)

  const hasError = Boolean(errorMessage)

  const helperTextId = helperText ? `${inputId}-helper` : undefined
  const errorTextId = hasError ? `${inputId}-error` : undefined

  const describedByIds =
    [errorTextId, helperTextId].filter(Boolean).join(' ') || undefined

  const baseControlClass =
    'h-4 w-4 border rounded-sm border-input bg-background ' +
    'data-[state=checked]:bg-primary data-[state=checked]:border-primary ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary ' +
    'disabled:cursor-not-allowed disabled:opacity-60'

  const radioExtraClass = 'rounded-full'

  const controlClass = mergeClasses(
    baseControlClass,
    type === 'radio' ? radioExtraClass : undefined,
    className,
  )

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-start gap-2">
        <input
          id={inputId}
          type={type}
          className={controlClass}
          aria-describedby={describedByIds}
          aria-invalid={hasError || undefined}
          {...inputProps}
        />

        <label
          htmlFor={inputId}
          className="text-sm text-background leading-snug"
        >
          <span className="font-medium">{label}</span>
        </label>
      </div>

      {helperText ? (
        <p id={helperTextId} className="ml-6 text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}

      {hasError ? (
        <p id={errorTextId} className="ml-6 text-xs text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
