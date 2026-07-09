'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronRight, File, Folder } from 'lucide-react'

import { MarkdownContent } from '@/components/assignments/MarkdownContent'
import { MonacoReadOnlyViewer } from '@/components/assignments/MonacoReadOnlyViewer'
import { isSupportedMonacoPath } from '@/lib/github/githubUtils'

interface TreeItem {
  name: string
  path: string
  type: 'file' | 'dir'
}

interface GitHubRepoPreviewProps {
  repoUrl: string
}

export const GitHubRepoPreview = ({ repoUrl }: GitHubRepoPreviewProps) => {
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null)
  const [readme, setReadme] = useState('')
  const [tree, setTree] = useState<TreeItem[]>([])
  const [expanded, setExpanded] = useState<Record<string, TreeItem[]>>({})
  const [selectedFile, setSelectedFile] = useState<{
    path: string
    content: string
    language: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!repoUrl) return
    setLoading(true)
    setError(null)
    setSelectedFile(null)

    Promise.all([
      fetch(`/api/github/repo?url=${encodeURIComponent(repoUrl)}`).then((r) =>
        r.json(),
      ),
      fetch(`/api/github/readme?url=${encodeURIComponent(repoUrl)}`).then((r) =>
        r.json(),
      ),
      fetch(`/api/github/tree?url=${encodeURIComponent(repoUrl)}`).then((r) =>
        r.json(),
      ),
    ])
      .then(([metaRes, readmeRes, treeRes]) => {
        if (metaRes.error) throw new Error(metaRes.error)
        setMeta(metaRes.meta)
        setReadme(readmeRes.content ?? '')
        setTree(treeRes.tree ?? [])
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load repository'),
      )
      .finally(() => setLoading(false))
  }, [repoUrl])

  const loadDir = useCallback(
    async (path: string) => {
      if (expanded[path]) return
      const res = await fetch(
        `/api/github/tree?url=${encodeURIComponent(repoUrl)}&path=${encodeURIComponent(path)}`,
      )
      const body = await res.json()
      if (res.ok) setExpanded((prev) => ({ ...prev, [path]: body.tree ?? [] }))
    },
    [expanded, repoUrl],
  )

  const loadFile = useCallback(
    async (path: string) => {
      if (!isSupportedMonacoPath(path)) return
      const res = await fetch(
        `/api/github/file?url=${encodeURIComponent(repoUrl)}&path=${encodeURIComponent(path)}`,
      )
      const body = await res.json()
      if (res.ok && body.file) setSelectedFile(body.file)
    },
    [repoUrl],
  )

  if (loading) {
    return <p className="text-sm text-slate-400">Loading repository...</p>
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>
  }

  const renderTree = (items: TreeItem[], depth = 0) =>
    items.map((item) => (
      <div key={item.path} style={{ paddingLeft: depth * 12 }}>
        {item.type === 'dir' ? (
          <button
            type="button"
            onClick={() => loadDir(item.path)}
            className="flex w-full items-center gap-1 py-1 text-left text-xs text-slate-300 hover:text-primary"
          >
            <ChevronRight className="h-3 w-3" />
            <Folder className="h-3 w-3" />
            {item.name}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => loadFile(item.path)}
            className="flex w-full items-center gap-1 py-1 text-left text-xs text-slate-400 hover:text-primary"
          >
            <File className="h-3 w-3" />
            {item.name}
          </button>
        )}
        {item.type === 'dir' && expanded[item.path]
          ? renderTree(expanded[item.path], depth + 1)
          : null}
      </div>
    ))

  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      {meta && (
        <div>
          <h4 className="font-medium text-slate-100">
            {(meta.name as string) ?? 'Repository'}
          </h4>
          <p className="text-xs text-slate-400">
            Branch: {(meta.defaultBranch as string) ?? 'main'} · ⭐{' '}
            {(meta.stars as number) ?? 0}
          </p>
          {(meta.description as string) && (
            <p className="mt-1 text-sm text-slate-300">{meta.description as string}</p>
          )}
        </div>
      )}
      {readme && (
        <div>
          <h5 className="mb-2 text-xs font-semibold uppercase text-slate-500">
            README
          </h5>
          <MarkdownContent content={readme} />
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="max-h-64 overflow-y-auto rounded border border-slate-700 p-2">
          {renderTree(tree)}
        </div>
        {selectedFile && (
          <MonacoReadOnlyViewer
            path={selectedFile.path}
            content={selectedFile.content}
            language={selectedFile.language}
          />
        )}
      </div>
    </div>
  )
}
