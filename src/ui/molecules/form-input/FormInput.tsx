import { FormLabel } from '@/atoms/form-label/FormLabel'
import { joinClassNames } from '@/utils/tailwindUtils'
import type { InputHTMLAttributes, ReactNode } from 'react'

type ValidationStatus = 'default' | 'valid' | 'invalid'

interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: ReactNode
  helperText?: ReactNode
  errorMessage?: ReactNode
  validationStatus?: ValidationStatus
  isRequired?: boolean
  isDarkMode?: boolean
}

const baseInputClass =
  'block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0.25 ' +
  'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground'

const getValidationClasses = (
  validationStatus: ValidationStatus,
): string | undefined => {
  if (validationStatus === 'valid') {
    return 'border-success focus-visible:ring-success pr-9'
  }

  if (validationStatus === 'invalid') {
    return 'border-error focus-visible:ring-error pr-9'
  }

  return 'border-input focus-visible:ring-primary'
}

export const FormInput = ({
  id,
  label,
  helperText,
  errorMessage,
  validationStatus = 'default',
  className,
  isRequired = false,
  isDarkMode = false,
  ...inputProps
}: FormInputProps) => {
  const inputId =
    id ??
    (typeof label === 'string'
      ? label.replace(/\s+/g, '-').toLowerCase()
      : undefined)

  const hasError = validationStatus === 'invalid' && Boolean(errorMessage)
  const validationClass = getValidationClasses(validationStatus)

  const helperTextId = helperText ? `${inputId}-helper` : undefined
  const errorTextId = hasError ? `${inputId}-error` : undefined

  const describedByIds =
    [errorTextId, helperTextId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex w-full flex-col gap-1.5">
      <FormLabel isRequired={isRequired} isDarkMode={isDarkMode}>
        {label}
      </FormLabel>

      <div className="relative px-1 py-1">
        <input
          id={inputId}
          className={joinClassNames(
            baseInputClass,
            validationClass,
            className,
            inputProps.readOnly ? 'bg-muted/20 cursor-not-allowed pointer-events-none user-select-none' : '',
          )}
          aria-invalid={validationStatus === 'invalid' || undefined}
          aria-describedby={describedByIds}
          {...inputProps}
        />

        {validationStatus === 'valid' ? (
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-success">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.333 4.66667L6.5 11.5L3 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : null}

        {validationStatus === 'invalid' ? (
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-error">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.66699 4.66667L11.3337 11.3333M11.3337 4.66667L4.66699 11.3333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : null}
      </div>

      {helperText ? (
        <p id={helperTextId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}

      {hasError ? (
        <p id={errorTextId} className="text-xs text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
