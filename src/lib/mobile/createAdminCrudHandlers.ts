import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import {
  deleteTableRow,
  insertTableRow,
  listTableRows,
  updateTableRow,
} from '@/lib/mobile/adminCrudService'
import {
  mobileErrorResponse,
  parsePagination,
} from '@/lib/mobile/mobileApiUtils'

type CrudTable =
  | 'partners'
  | 'presenters'
  | 'hall_of_fame'
  | 'google_groups'
  | 'awards'
  | 'award_categories'

export function createAdminCrudHandlers(table: CrudTable) {
  return {
    async GET(request: Request) {
      const auth = await authenticateMobileAdmin()
      if ('error' in auth) return auth.error
      try {
        const { page, limit } = parsePagination(new URL(request.url))
        const result = await listTableRows(table, '*', page, limit)
        return NextResponse.json(result)
      } catch (err) {
        return mobileErrorResponse(err)
      }
    },

    async POST(request: Request) {
      const auth = await authenticateMobileAdmin()
      if ('error' in auth) return auth.error
      try {
        const body = (await request.json()) as Record<string, unknown>
        const row = await insertTableRow(table, body)
        return NextResponse.json({ data: row }, { status: 201 })
      } catch (err) {
        return mobileErrorResponse(err)
      }
    },
  }
}

export function createAdminCrudIdHandlers(table: CrudTable) {
  return {
    async PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
      const auth = await authenticateMobileAdmin()
      if ('error' in auth) return auth.error
      try {
        const { id } = await context.params
        const body = (await request.json()) as Record<string, unknown>
        const row = await updateTableRow(table, id, body)
        return NextResponse.json({ data: row })
      } catch (err) {
        return mobileErrorResponse(err)
      }
    },

    async DELETE(
      _request: Request,
      context: { params: Promise<{ id: string }> },
    ) {
      const auth = await authenticateMobileAdmin()
      if ('error' in auth) return auth.error
      try {
        const { id } = await context.params
        await deleteTableRow(table, id)
        return NextResponse.json({ success: true })
      } catch (err) {
        return mobileErrorResponse(err)
      }
    },
  }
}
