'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { joinClassNames } from '@/utils/tailwindUtils'

interface MarkdownContentProps {
  content: string
  className?: string
}

export const MarkdownContent = ({ content, className }: MarkdownContentProps) => (
  <div
    className={joinClassNames(
      'prose prose-invert prose-sm max-w-none',
      'prose-headings:text-slate-100 prose-p:text-slate-300 prose-a:text-primary',
      className,
    )}
  >
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
)
