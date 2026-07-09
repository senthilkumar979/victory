import { NextResponse } from 'next/server'

import { getRepoReadme } from '@/lib/github/githubService'
import { requireAuth } from '@/lib/auth/requireAuth'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  try {
    const readme = await getRepoReadme(url)
    return NextResponse.json(readme)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load README' },
      { status: 400 },
    )
  }
}
