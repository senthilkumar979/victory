import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

const TABLE_NAME = 'roadmap_completions'

interface RoadmapCompletionRow {
  id: string
  completed_nodes: string[]
}

const parseCompletedNodes = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export const useRoadmapProgress = (roadmapId: string) => {
  const [completedNodes, setCompletedNodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompletions = useCallback(async () => {
    if (!roadmapId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('id, completed_nodes')
        .eq('id', roadmapId)
        .maybeSingle()

      if (fetchError) throw fetchError

      const row = data as RoadmapCompletionRow | null
      const nodes = row?.completed_nodes
        ? parseCompletedNodes(row.completed_nodes)
        : []

      setCompletedNodes(nodes)
    } catch (err) {
      console.error('Error fetching roadmap completions:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load roadmap progress',
      )
      setCompletedNodes([])
    } finally {
      setIsLoading(false)
    }
  }, [roadmapId])

  useEffect(() => {
    fetchCompletions()
  }, [fetchCompletions])

  const markComplete = useCallback(
    async (nodeId: string) => {
      if (!roadmapId) return

      setCompletedNodes((prev) =>
        prev.includes(nodeId) ? prev : [...prev, nodeId],
      )

      try {
        const { data: row, error: fetchErr } = await supabase
          .from(TABLE_NAME)
          .select('completed_nodes')
          .eq('id', roadmapId)
          .maybeSingle()

        if (fetchErr) throw fetchErr

        const current = row?.completed_nodes
          ? parseCompletedNodes(row.completed_nodes)
          : []
        const nextNodes = current.includes(nodeId)
          ? current
          : [...current, nodeId]

        if (row === null) {
          const { error: insertErr } = await supabase
            .from(TABLE_NAME)
            .insert({ id: roadmapId, completed_nodes: nextNodes })
          if (insertErr) throw insertErr
        } else {
          const { error: updateErr } = await supabase
            .from(TABLE_NAME)
            .update({ completed_nodes: nextNodes })
            .eq('id', roadmapId)
          if (updateErr) throw updateErr
        }
      } catch (err) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message?: unknown }).message)
            : err instanceof Error
              ? err.message
              : 'Failed to save progress'
        console.error('Error updating roadmap completion:', message, err)
        setCompletedNodes((prev) => prev.filter((id) => id !== nodeId))
        setError(message)
      }
    },
    [roadmapId],
  )

  const unmarkComplete = useCallback(
    async (nodeId: string) => {
      if (!roadmapId) return

      setCompletedNodes((prev) => prev.filter((id) => id !== nodeId))

      try {
        const { data: row, error: fetchErr } = await supabase
          .from(TABLE_NAME)
          .select('completed_nodes')
          .eq('id', roadmapId)
          .maybeSingle()

        if (fetchErr) throw fetchErr

        const current = row?.completed_nodes
          ? parseCompletedNodes(row.completed_nodes)
          : []
        const nextNodes = current.filter((id) => id !== nodeId)

        if (row === null) {
          return
        }
        const { error: updateErr } = await supabase
          .from(TABLE_NAME)
          .update({ completed_nodes: nextNodes })
          .eq('id', roadmapId)
        if (updateErr) throw updateErr
      } catch (err) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message?: unknown }).message)
            : err instanceof Error
              ? err.message
              : 'Failed to save progress'
        console.error('Error unmarking roadmap completion:', message, err)
        setCompletedNodes((prev) =>
          prev.includes(nodeId) ? [...prev, nodeId] : prev,
        )
        setError(message)
      }
    },
    [roadmapId],
  )

  return { completedNodes, markComplete, unmarkComplete, isLoading, error, refetch: fetchCompletions }
}
