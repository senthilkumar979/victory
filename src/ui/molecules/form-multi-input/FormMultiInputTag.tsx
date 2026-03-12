import { joinClassNames } from '@/utils/tailwindUtils'
import { X } from 'lucide-react'

interface FormMultiInputTagProps {
  text: string
  onRemove: () => void
  disabled?: boolean
}

export const FormMultiInputTag = ({
  text,
  onRemove,
  disabled,
}: FormMultiInputTagProps) => (
  <span
    className={joinClassNames(
      'inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-sm text-primary',
      !disabled &&
        'hover:border-primary/30 hover:bg-primary/20 hover:text-primary',
    )}
  >
    {text}
    <button
      type="button"
      onClick={onRemove}
      disabled={disabled}
      aria-label={`Remove ${text}`}
      className={joinClassNames(
        'ml-0.5 rounded p-0.5 transition-colors',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:bg-primary/20 hover:text-primary',
      )}
    >
      <X className="size-3.5" />
    </button>
  </span>
)
