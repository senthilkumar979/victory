import { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../app/contexts/AppContext'

const GITHUB_API_BASE = 'https://api.github.com'

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN

interface GitHubRepoLanguages {
  [language: string]: number
}

export interface GitHubRepository {
  id: number
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  stargazersCount: number
  languages: GitHubRepoLanguages
  updated_at: string
}

function extractUsernameFromProfileUrl(profileUrl: string | null | undefined): string | null {
  if (!profileUrl || typeof profileUrl !== 'string') return null
  const trimmed = profileUrl.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const pathParts = url.pathname.replace(/^\/+|\/+$/g, '').split('/')
    const username = pathParts[0]
    return username && !pathParts[1] ? username : null
  } catch {
    return null
  }
}

function getAuthHeaders() {
  return GITHUB_TOKEN
    ? {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      }
    : {
        Accept: 'application/vnd.github+json',
      }
}

async function fetchRepoLanguages(owner: string, repo: string): Promise<GitHubRepoLanguages> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`,
    {
      headers: getAuthHeaders() as HeadersInit,
    }
  )
  if (!response.ok) return {}
  const data = (await response.json()) as GitHubRepoLanguages
  return data ?? {}
}

export const useGetRepositories = (profileUrl: string | null | undefined) => {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { dispatch } = useContext(AppContext)

  const fetchRepositories = useCallback(async () => {
    const username = extractUsernameFromProfileUrl(profileUrl)
    if (!username) {
      setRepositories([])
      setError(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const reposResponse = await fetch(
        `${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`,
        {
          headers: getAuthHeaders() as HeadersInit,
        }
      )
      if (!reposResponse.ok) {
        const errorData = (await reposResponse.json().catch(() => ({}))) as {
          message?: string
        }
        throw new Error(
          errorData?.message ?? `Failed to fetch repositories: ${reposResponse.statusText}`,
        )
      }

      const reposData = (await reposResponse.json()) as Array<{
        id: number
        name: string
        full_name: string
        description: string | null
        html_url: string
        stargazers_count: number
        updated_at: string
      }>

      const reposWithLanguages = await Promise.all(
        reposData.map(async (repo) => {
          const languages = await fetchRepoLanguages(username, repo.name)
          return {
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            htmlUrl: repo.html_url,
            stargazersCount: repo.stargazers_count,
            updated_at: repo.updated_at,
            languages,
          } satisfies GitHubRepository
        }),
      )
      setRepositories(reposWithLanguages)
      dispatch({ type: 'SET_REPOSITORIES', payload: reposWithLanguages })
    } catch (err) {
      console.error('Error fetching GitHub repositories:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories')
      setRepositories([])
    } finally {
      setIsLoading(false)
    }
  }, [profileUrl])

  useEffect(() => {
    void fetchRepositories()
  }, [fetchRepositories])

  return { repositories, isLoading, error, refetch: fetchRepositories }
}
