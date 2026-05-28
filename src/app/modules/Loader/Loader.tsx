'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Loader as LoaderUI } from '@/ui/atoms/loader/Loader'

import { shouldShowLoaderForUrl } from './loaderFetchHeuristics'

interface LoaderContextValue {
  isShow: boolean
  show: () => void
  hide: () => void
}

const LoaderContext = createContext<LoaderContextValue | undefined>(undefined)

interface LoaderProviderProps {
  children: React.ReactNode
}

export const LoaderProvider = ({ children }: LoaderProviderProps) => {
  const [isShow, setIsShow] = useState(false)
  const countRef = useRef(0)
  const originalFetchRef = useRef<typeof fetch | null>(null)

  const show = useCallback(() => {
    countRef.current += 1
    setIsShow(true)
  }, [])

  const hide = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1)
    if (countRef.current === 0) setIsShow(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const originalFetch = window.fetch
    if (originalFetchRef.current) return
    originalFetchRef.current = originalFetch

    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.href
          : input.url
      const shouldShow = shouldShowLoaderForUrl(url)

      if (shouldShow) show()

      try {
        const response = await originalFetch(input, init)
        return response
      } finally {
        if (shouldShow) hide()
      }
    }

    return () => {
      window.fetch = originalFetch
      originalFetchRef.current = null
      countRef.current = 0
      setIsShow(false)
    }
  }, [show, hide])

  const value: LoaderContextValue = {
    isShow,
    show,
    hide,
  }

  return (
    <LoaderContext.Provider value={value}>
      {children}
      <LoaderUI isShow={isShow} />
    </LoaderContext.Provider>
  )
}

const noop = () => {}
const defaultValue: LoaderContextValue = {
  isShow: false,
  show: noop,
  hide: noop,
}

LoaderContext.displayName = 'LoaderContext'

export const useLoader = (): LoaderContextValue =>
  useContext(LoaderContext) ?? defaultValue
