'use client'

import { GitHubRepository } from '@/hooks/useGetRepositores'
import { createContext, ReactNode, useReducer } from 'react'
import { StudentAwardWithCategory } from '../../hooks/useStudentAwards'
import { Blog } from '../../types/blog.types'

interface AppContextType {
  repositories: GitHubRepository[]
  blogs: Blog[]
  awards: StudentAwardWithCategory[]
}

const initialValue: AppContextType = {
  repositories: [],
  blogs: [],
  awards: [],
}

const reducer = (
  state: AppContextType,
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: { type: string; payload: any },
) => {
  switch (action.type) {
    case 'SET_REPOSITORIES':
      return { ...state, repositories: action.payload }
    case 'SET_BLOGS':
      return { ...state, blogs: action.payload }
    case 'SET_AWARDS':
      return { ...state, awards: action.payload }
    default:
      return state
  }
}

interface AppContextTypeWithDispatch extends AppContextType {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: React.Dispatch<{ type: string; payload: any }>
}

const AppContextWithDispatch = createContext<
  AppContextType & AppContextTypeWithDispatch
>({
  repositories: [],
  blogs: [],
  awards: [],
  dispatch: () => {},
})

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialValue)

  return (
    <AppContextWithDispatch.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContextWithDispatch.Provider>
  )
}

export { AppContextWithDispatch as AppContext }
