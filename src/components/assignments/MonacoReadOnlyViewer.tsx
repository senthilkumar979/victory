'use client'

import dynamic from 'next/dynamic'

import { joinClassNames } from '@/utils/tailwindUtils'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center text-sm text-slate-400">
      Loading editor...
    </div>
  ),
})

interface MonacoReadOnlyViewerProps {
  path: string
  content: string
  language: string
  className?: string
}

export const MonacoReadOnlyViewer = ({
  path,
  content,
  language,
  className,
}: MonacoReadOnlyViewerProps) => (
  <div
    className={joinClassNames(
      'overflow-hidden rounded-lg border border-slate-700',
      className,
    )}
  >
    <div className="border-b border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
      {path}
    </div>
    <MonacoEditor
      height="360px"
      language={language}
      value={content}
      theme="vs-dark"
      options={{
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        wordWrap: 'on',
      }}
    />
  </div>
)
