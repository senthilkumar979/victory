'use client'

import { useEffect, useRef } from 'react'

import Quill from 'quill'
import 'quill/dist/quill.snow.css'

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

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      modules,
      formats,
      placeholder,
    })

    quillRef.current = quill

    if (value) quill.clipboard.dangerouslyPasteHTML(value)

    const handleTextChange = () => {
      handleChange(quill.root.innerHTML)
    }

    quill.on('text-change', handleTextChange)

    return () => {
      quill.off('text-change', handleTextChange)
      quillRef.current = null
    }
  }, [handleChange, placeholder, value])

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
