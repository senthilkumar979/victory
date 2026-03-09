import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY_PREFIX = 'roadmap-completed-nodes'
const LEGACY_KEY = 'roadmap-completed-nodes'

const getStorageKey = (slug: string) =>
  `${STORAGE_KEY_PREFIX}-${slug}`

export const useRoadmapProgress = (roadmapSlug: string) => {
  const [completedNodes, setCompletedNodes] = useState<string[]>([])
  const storageKey = getStorageKey(roadmapSlug)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      let stored = localStorage.getItem(storageKey)
      if (!stored && roadmapSlug === 'typescript') {
        const legacy = localStorage.getItem(LEGACY_KEY)
        if (legacy) {
          stored = legacy
          localStorage.setItem(storageKey, legacy)
          localStorage.removeItem(LEGACY_KEY)
        }
      }

      const parsed = stored ? (JSON.parse(stored) as string[]) : []

      setCompletedNodes((prev) => Array.isArray(parsed) ? parsed : prev)
    } catch {
      setCompletedNodes([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(storageKey, JSON.stringify(completedNodes))
    } catch {
      // Ignore storage errors (e.g. quota, private mode)
    }
  }, [completedNodes, storageKey])

  const markComplete = useCallback((nodeId: string) => {
    setCompletedNodes((prev) =>
      prev.includes(nodeId) ? prev : [...prev, nodeId]
    )
  }, [])

  return { completedNodes, markComplete }
}
