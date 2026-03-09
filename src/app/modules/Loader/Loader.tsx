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

interface LoaderContextValue {
  isShow: boolean
  show: () => void
  hide: () => void
}

const LoaderContext = createContext<LoaderContextValue | undefined>(undefined)

const STATIC_ASSET_REGEX = /\.(png|jpe?g|gif|svg|ico|css|js|woff2?|ttf|eot)(\?.*)?$/i

function shouldShowLoaderForUrl(url: string): boolean {
  try {
    const parsed = typeof url === 'string' ? url : ''
    if (!parsed) return false
    if (STATIC_ASSET_REGEX.test(parsed)) return false
    if (parsed.includes('_next') || parsed.includes('next-data')) return false
    if (parsed.includes('/__nextjs')) return false
    if (parsed.startsWith('/api/')) return true
    if (parsed.includes('supabase')) return true
  } catch {
    return false
  }
  return false
}

interface LoaderProviderProps {
  children: React.ReactNode
}

const LOADER_MAX_MS = 15_000

export const LoaderProvider = ({ children }: LoaderProviderProps) => {
  const [isShow, setIsShow] = useState(false)
  const countRef = useRef(0)
  const originalFetchRef = useRef<typeof fetch | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    countRef.current += 1
    setIsShow(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      countRef.current = 0
      setIsShow(false)
      timeoutRef.current = null
    }, LOADER_MAX_MS)
  }, [])

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    countRef.current = Math.max(0, countRef.current - 1)
    if (countRef.current === 0) setIsShow(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      countRef.current = 0
      setIsShow(false)
    }
  }, [])

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
