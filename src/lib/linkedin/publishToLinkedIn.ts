import 'server-only'

import type { PublishLinkedInPostInput } from '@/lib/linkedin/types'

const DEFAULT_LINKEDIN_VERSION = '202503'

function restHeaders(accessToken: string): HeadersInit {
  const v =
    process.env.LINKEDIN_REST_VERSION?.trim() || DEFAULT_LINKEDIN_VERSION
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
    'Linkedin-Version': v,
  }
}

function resolveOrganizationAuthorUrn(): string {
  const raw = process.env.LINKEDIN_ORGANIZATION_URN?.trim()
  if (raw) return raw
  const id = process.env.LINKEDIN_ORGANIZATION_ID?.trim()
  if (!id) {
    throw new Error(
      'Set LINKEDIN_ORGANIZATION_URN or LINKEDIN_ORGANIZATION_ID for the company Page',
    )
  }
  return `urn:li:organization:${id}`
}

async function fetchImageBytes(
  imageUrl: string,
): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
  const res = await fetch(imageUrl)
  if (!res.ok) {
    throw new Error(`Could not download image (${res.status})`)
  }
  const mimeType =
    res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg'
  if (!/^image\/(jpeg|jpg|png|gif)$/i.test(mimeType)) {
    throw new Error(
      `Unsupported image type: ${mimeType}. Use JPG, PNG, or GIF.`,
    )
  }
  const buffer = await res.arrayBuffer()
  return { buffer, mimeType }
}

async function initializeImageUpload(
  accessToken: string,
  ownerUrn: string,
): Promise<{ uploadUrl: string; imageUrn: string }> {
  const res = await fetch(
    'https://api.linkedin.com/rest/images?action=initializeUpload',
    {
      method: 'POST',
      headers: restHeaders(accessToken),
      body: JSON.stringify({
        initializeUploadRequest: { owner: ownerUrn },
      }),
    },
  )
  const data = (await res.json()) as {
    value?: { uploadUrl?: string; image?: string }
    message?: string
  }
  if (!res.ok) {
    throw new Error(
      data?.message ?? `LinkedIn initializeUpload failed (${res.status})`,
    )
  }
  const uploadUrl = data.value?.uploadUrl
  const imageUrn = data.value?.image
  if (!uploadUrl || !imageUrn) {
    throw new Error('LinkedIn initializeUpload returned incomplete data')
  }
  return { uploadUrl, imageUrn }
}

async function putImage(
  uploadUrl: string,
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: buffer,
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(
      `LinkedIn image upload failed (${res.status}) ${t.slice(0, 200)}`,
    )
  }
}

async function waitImageReady(
  accessToken: string,
  imageUrn: string,
): Promise<void> {
  const encoded = encodeURIComponent(imageUrn)
  for (let i = 0; i < 40; i += 1) {
    const res = await fetch(`https://api.linkedin.com/rest/images/${encoded}`, {
      headers: restHeaders(accessToken),
    })
    const data = (await res.json()) as { status?: string; message?: string }
    if (!res.ok) {
      throw new Error(
        data?.message ?? `LinkedIn GET image failed (${res.status})`,
      )
    }
    if (data.status === 'AVAILABLE') return
    if (data.status === 'PROCESSING_FAILED') {
      throw new Error('LinkedIn image processing failed')
    }
    await new Promise((r) => setTimeout(r, 800))
  }
  throw new Error('LinkedIn image did not become ready in time')
}

function truncateCommentary(text: string, max = 2900): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

export async function publishImagePostToLinkedIn(
  input: PublishLinkedInPostInput,
): Promise<{ postUrn: string }> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN?.trim()
  if (!accessToken) {
    throw new Error(
      'LINKEDIN_ACCESS_TOKEN is not set (OAuth token with w_organization_social)',
    )
  }

  const author = resolveOrganizationAuthorUrn()
  const { buffer, mimeType } = await fetchImageBytes(input.imageUrl)
  const { uploadUrl, imageUrn } = await initializeImageUpload(
    accessToken,
    author,
  )
  await putImage(uploadUrl, buffer, mimeType)
  await waitImageReady(accessToken, imageUrn)

  const commentary = truncateCommentary(input.commentary)
  const body = {
    author,
    commentary,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    content: {
      media: {
        id: imageUrn,
        ...(input.imageAltText
          ? { altText: input.imageAltText.slice(0, 4000) }
          : {}),
      },
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: restHeaders(accessToken),
    body: JSON.stringify(body),
  })

  const postUrn = res.headers.get('x-restli-id')?.trim()
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      message?: string
    }
    throw new Error(
      errBody?.message ?? `LinkedIn create post failed (${res.status})`,
    )
  }
  if (!postUrn) {
    throw new Error('LinkedIn did not return post id header')
  }
  return { postUrn }
}
