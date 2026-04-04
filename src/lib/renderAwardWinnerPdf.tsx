import 'server-only'

import { renderToBuffer } from '@react-pdf/renderer'

import { AwardCertificatePdf } from '@/components/pdfx/AwardCertificatePdf'
import { MENTORBRIDGE_LONG_LOGO_URL } from '@/constants/CompanyConstants'

async function fetchImageDataUri(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Logo fetch failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const mime =
    res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/png'
  return `data:${mime};base64,${buf.toString('base64')}`
}

export async function renderAwardWinnerPdfBuffer(params: {
  recipientName: string
  awardCategoryName: string
}): Promise<Buffer> {
  const logoDataUri = await fetchImageDataUri(MENTORBRIDGE_LONG_LOGO_URL)
  const doc = (
    <AwardCertificatePdf
      recipientName={params.recipientName}
      awardCategoryName={params.awardCategoryName}
      logoDataUri={logoDataUri}
    />
  )
  return renderToBuffer(doc)
}
