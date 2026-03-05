import { useEffect, useRef } from 'react'

interface RichTextEditorProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isDarkMode?: boolean
}

export const RichTextEditor = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  isDarkMode = false,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!editorRef.current) return
    if (editorRef.current.innerHTML === value) return
    editorRef.current.innerHTML = value || ''
  }, [value])

  const handleInput = () => {
    if (!editorRef.current) return
    onChange(editorRef.current.innerHTML)
  }

  const baseClasses =
    'min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'

  const themeClasses = isDarkMode
    ? 'border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-offset-slate-950'
    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-offset-slate-50'

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-500 sm:text-[13px]"
      >
        {label}
      </label>
      <div
        id={id}
        ref={editorRef}
        className={`${baseClasses} ${themeClasses}`}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
      />
    </div>
  )
}

