'use client'

import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface VisitorQueryRow {
  id: string
  created_at: string
  query_text: string
  thread_message_count: number | null
}

export const VisitorQueries = () => {
  const [rows, setRows] = useState<VisitorQueryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/visitor-chat-queries', {
        credentials: 'same-origin',
      })
      const data = (await res.json()) as {
        queries?: VisitorQueryRow[]
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? 'Failed to load queries')
        setRows([])
        return
      }
      setRows(data.queries ?? [])
    } catch {
      setError('Network error while loading queries.')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="relative">
      <div className="min-h-[420px] px-2 py-2">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              Visitor chat queries
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Every question sent to the public site assistant (newest first, up
              to 500 rows).
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
            onClick={() => void load()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            )}
            Refresh
          </Button>
        </div>

        {error ? (
          <p className="mx-3 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {isLoading && rows.length === 0 && !error ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            <span>Loading…</span>
          </div>
        ) : null}

        {!isLoading && rows.length === 0 && !error ? (
          <p className="px-3 text-sm text-slate-400">
            No queries recorded yet, or the table is empty.
          </p>
        ) : null}

        {rows.length > 0 ? (
          <div className="mx-3 max-h-[min(60vh,520px)] overflow-auto rounded-xl border border-slate-800/90">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="whitespace-nowrap px-3 py-2 font-medium">
                    Time
                  </th>
                  <th className="w-16 px-2 py-2 text-center font-medium">
                    Msgs
                  </th>
                  <th className="px-3 py-2 font-medium">Query</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-800/80 align-top text-slate-200"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-2 py-2.5 text-center text-xs tabular-nums text-slate-500">
                      {r.thread_message_count ?? '—'}
                    </td>
                    <td className="max-w-0 px-3 py-2.5 text-slate-100">
                      <div className="whitespace-pre-wrap break-words">
                        {r.query_text}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
