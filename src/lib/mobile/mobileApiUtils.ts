import 'server-only'

import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

export function getMobileDb() {
  const db = supabaseAdmin
  if (!db) {
    throw new MobileServiceError(
      'Server database is not configured.',
      503,
      'SERVICE_UNAVAILABLE',
    )
  }
  return db
}

export class MobileServiceError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'MobileServiceError'
  }
}

export function mobileErrorResponse(err: unknown) {
  if (err instanceof MobileServiceError) {
    return NextResponse.json(
      { error: err.message, code: err.code, details: err.details ?? {} },
      { status: err.status },
    )
  }
  console.error('[mobile BFF]', err)
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 },
  )
}

export interface PaginationParams {
  page: number
  limit: number
}

export function parsePagination(url: URL): PaginationParams {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('limit') ?? '20') || 20),
  )
  return { page, limit }
}

export function paginationMeta(
  page: number,
  limit: number,
  totalCount: number,
) {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))
  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}
