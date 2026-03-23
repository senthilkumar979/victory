'use client'

import { useEffect, useRef } from 'react'

import type Quill from 'quill'

import { FormLabel } from '../../atoms/form-label/FormLabel'
import { RichTextEditorProps } from './RichTextEditor.types'

export const RichTextEditor = ({
  id,
  label,
  value,
  handleChange,
  placeholder,
  isDarkMode = false,
}: RichTextEditorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<Quill | null>(null)

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return

    let cancelled = false
    let textChangeHandler: (() => void) | null = null

    const setup = async () => {
      if (!containerRef.current) return

      const [quillMod] = await Promise.all([
        import('quill'),
        import('quill/dist/quill.snow.css'),
      ])

      if (cancelled || !containerRef.current) return

      const QuillCtor = quillMod.default

      const modules = {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          ['link'],
          ['clean'],
        ],
      }

      const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
      ]

      const quill = new QuillCtor(containerRef.current, {
        theme: 'snow',
        modules,
        formats,
        placeholder,
      })

      quillRef.current = quill

      if (value) quill.clipboard.dangerouslyPasteHTML(value)

      textChangeHandler = () => {
        handleChange(quill.root.innerHTML)
      }

      quill.on('text-change', textChangeHandler)
    }

    void setup()

    return () => {
      cancelled = true
      const q = quillRef.current
      if (q && textChangeHandler) {
        q.off('text-change', textChangeHandler)
      }
      quillRef.current = null
    }
  }, [handleChange, placeholder])

  useEffect(() => {
    if (!quillRef.current) return
    const root = quillRef.current.root
    if (root.innerHTML === value) return
    quillRef.current.clipboard.dangerouslyPasteHTML(value || '')
  }, [value])

  const baseClasses =
    'min-h-[140px] w-full rounded-md border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'

  const themeClasses = isDarkMode
    ? 'border-slate-700 bg-slate-900/80 text-slate-100 focus-visible:ring-offset-slate-950'
    : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-offset-slate-50'

  return (
    <div className="space-y-1.5">
      <FormLabel isDarkMode={isDarkMode} htmlFor={id}>
        {label}
      </FormLabel>
      <div
        id={id}
        ref={containerRef}
        className={`${baseClasses} ${themeClasses}`}
      />
    </div>
  )
}
