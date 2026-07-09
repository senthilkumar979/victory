import { NextResponse } from 'next/server'

import { getRepoFileContent } from '@/lib/github/githubService'
import { requireAuth } from '@/lib/auth/requireAuth'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const path = searchParams.get('path')
  if (!url || !path) {
    return NextResponse.json(
      { error: 'url and path are required' },
      { status: 400 },
    )
  }

  try {
    const file = await getRepoFileContent(url, path)
    return NextResponse.json({ file })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load file' },
      { status: 400 },
    )
  }
}
