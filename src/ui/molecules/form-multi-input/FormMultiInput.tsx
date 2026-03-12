'use client'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { joinClassNames } from '@/utils/tailwindUtils'
import type { ReactNode } from 'react'
import { useCallback, useRef, useState } from 'react'
import { FormMultiInputTag } from './FormMultiInputTag'

type ValidationStatus = 'default' | 'valid' | 'invalid'

interface FormMultiInputProps {
  id?: string
  label: ReactNode
  value: string[]
  onChange: (value: string[]) => void
  onBlur?: () => void
  placeholder?: string
  helperText?: ReactNode
  errorMessage?: ReactNode
  validationStatus?: ValidationStatus
  isRequired?: boolean
  className?: string
  disabled?: boolean
  maxTags?: number
}

const INPUT_DELIMITERS = [',', 'Enter']
const baseInputClass =
  'min-w-[120px] flex-1 rounded-md border-0 bg-transparent px-1 py-1 text-sm text-secondary ' +
  'placeholder:text-slate-600 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50'
const containerClass =
  'flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border border-slate-300 px-2 py-1 ' +
  'shadow-sm transition-colors focus-within:ring-2 focus-within:ring-offset-0.25 disabled:cursor-not-allowed disabled:bg-muted'

const getValidationClasses = (status: ValidationStatus): string =>
  status === 'valid'
    ? 'border-success focus-within:ring-success'
    : status === 'invalid'
    ? 'border-error focus-within:ring-error'
    : 'border-input focus-within:ring-primary'

export const FormMultiInput = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder = 'Type and press comma to add',
  helperText,
  errorMessage,
  validationStatus = 'default',
  isRequired = false,
  className,
  disabled = false,
  maxTags,
}: FormMultiInputProps) => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const inputId =
    id ??
    (typeof label === 'string'
      ? label.replace(/\s+/g, '-').toLowerCase()
      : undefined)

  const isAtMaxTags = maxTags != null && value.length >= maxTags

  const addTags = useCallback(
    (raw: string) => {
      if (isAtMaxTags) return
      const existing = new Set(value)
      const added: string[] = []
      const remaining = maxTags != null ? maxTags - value.length : Infinity
      for (const s of raw
        .split(/[,]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)) {
        if (added.length >= remaining) break
        if (!existing.has(s)) {
          existing.add(s)
          added.push(s)
        }
      }
      if (added.length === 0) return
      onChange([...value, ...added])
      setInputValue('')
    },
    [value, onChange, maxTags, isAtMaxTags],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (INPUT_DELIMITERS.includes(e.key)) {
        e.preventDefault()
        if (isAtMaxTags) return
        const trimmed = inputValue.trim()
        if (trimmed) addTags(trimmed)
        return
      }
      if (e.key === 'Backspace' && !inputValue && value.length > 0) {
        e.preventDefault()
        onChange(value.slice(0, -1))
      }
    },
    [inputValue, value, onChange, addTags, isAtMaxTags],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (isAtMaxTags) return
      const pasted = e.clipboardData.getData('text')
      if (!pasted.includes(',')) return
      e.preventDefault()
      addTags(inputValue + pasted)
      setInputValue('')
    },
    [inputValue, addTags, isAtMaxTags],
  )

  const removeTag = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index))
    },
    [value, onChange],
  )

  const hasError = validationStatus === 'invalid' && Boolean(errorMessage)
  const validationClass = getValidationClasses(validationStatus)

  return (
    <div className="flex w-full flex-col gap-1.5">
      <FormLabel htmlFor={inputId} isRequired={isRequired}>
        {label}
      </FormLabel>
      <div
        className={joinClassNames(
          containerClass,
          validationClass,
          disabled && 'bg-muted',
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <FormMultiInputTag
            key={`${tag}-${index}`}
            text={tag}
            onRemove={() => removeTag(index)}
            disabled={disabled}
          />
        ))}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={onBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled || isAtMaxTags}
          aria-invalid={validationStatus === 'invalid' || undefined}
          className={baseInputClass}
        />
      </div>
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
      {hasError ? <p className="text-xs text-error">{errorMessage}</p> : null}
    </div>
  )
}
