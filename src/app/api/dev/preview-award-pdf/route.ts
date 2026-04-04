import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { renderAwardWinnerPdfBuffer } from '@/lib/renderAwardWinnerPdf'

/**
 * Local PDF preview only — not available in production.
 * Open in browser: /api/dev/preview-award-pdf?recipientName=Jane%20Doe&awardCategoryName=Outstanding%20Contributor
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Award PDF preview is only enabled in development' },
      { status: 404 },
    )
  }

  const { searchParams } = new URL(request.url)
  const recipientName =
    searchParams.get('recipientName')?.trim() || 'Preview Winner'
  const awardCategoryName =
    searchParams.get('awardCategoryName')?.trim() || 'Sample Award Category'

  try {
    const buffer = await renderAwardWinnerPdfBuffer({
      recipientName,
      awardCategoryName,
    })

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="award-certificate-preview.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Award PDF preview failed', error)
    return NextResponse.json(
      { error: 'Failed to render PDF' },
      { status: 500 },
    )
  }
}
