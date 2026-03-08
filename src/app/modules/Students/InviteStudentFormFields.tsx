import { FormLabel } from '@/atoms/form-label/FormLabel'
import { FormInput } from '@/molecules/form-input/FormInput'
import { parseEmails } from '@/utils/emailUtils'
import { joinClassNames } from '@/utils/tailwindUtils'

type InviteMode = 'single' | 'bulk'

interface InviteStudentFormFieldsProps {
  mode: InviteMode
  setMode: (m: InviteMode) => void
  email: string
  setEmail: (v: string) => void
  bulkText: string
  setBulkText: (v: string) => void
}

const textareaClass = joinClassNames(
  'mt-1.5 block w-full resize-y min-h-[120px] rounded-md border px-3 py-2 text-sm',
  'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0.25',
)

export const InviteStudentFormFields = ({
  mode,
  setMode,
  email,
  setEmail,
  bulkText,
  setBulkText,
}: InviteStudentFormFieldsProps) => {
  const emails = mode === 'bulk' ? parseEmails(bulkText) : []

  return (
    <>
      <div className="mb-3 flex gap-1 rounded-lg bg-slate-800/60 p-1">
        {(['single', 'bulk'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={joinClassNames(
              'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              mode === m ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {m === 'single' ? 'Single' : 'Bulk'}
          </button>
        ))}
      </div>
      {mode === 'single' ? (
        <FormInput
          id="invite-email"
          label="Email address"
          type="email"
          isDarkMode
          placeholder="e.g. student@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      ) : (
        <div>
          <FormLabel htmlFor="invite-bulk" isDarkMode className="mb-0.5 block">
            Email list
          </FormLabel>
          <p className="mb-1 text-xs text-slate-500">
            Paste emails from Excel or a list. One per line, or comma/semicolon-separated.
          </p>
          <textarea
            id="invite-bulk"
            placeholder={'student1@example.com\nstudent2@example.com'}
            className={textareaClass}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          {emails.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              {emails.length} valid email{emails.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      )}
    </>
  )
}
