import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

const RESUME_EXT = '.pdf'
const PICTURE_EXTS = ['.jpg', '.jpeg', '.png'] as const
const PROFILE_PREFIX = 'profiles/'

const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png']
const PDF_CONTENT_TYPE = ['application/pdf']

function getConfigForPathname(pathname: string): {
  allowedContentTypes: string[]
  addRandomSuffix: boolean
  allowOverwrite: boolean
} | null {
  if (!pathname.startsWith(PROFILE_PREFIX)) return null
  const rest = pathname.slice(PROFILE_PREFIX.length)
  const slashIdx = rest.indexOf('/')
  const filename = slashIdx >= 0 ? rest.slice(slashIdx + 1) : rest
  const extIdx = filename.lastIndexOf('.')
  if (extIdx <= 0) return null
  const ext = filename.slice(extIdx).toLowerCase()

  if (ext === RESUME_EXT) {
    return {
      allowedContentTypes: PDF_CONTENT_TYPE,
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  }
  if ((PICTURE_EXTS as readonly string[]).includes(ext)) {
    return {
      allowedContentTypes: IMAGE_CONTENT_TYPES,
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  }
  return null
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody
  try {
    body = (await request.json()) as HandleUploadBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const config = getConfigForPathname(pathname)
        if (!config) {
          throw new Error(
            'Invalid pathname. Use profiles/[id].pdf or profiles/[id].(jpg|jpeg|png)',
          )
        }
        return config
      },
    })
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 400 },
    )
  }
}
