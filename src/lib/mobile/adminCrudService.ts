import 'server-only'

import {
  getMobileDb,
  MobileServiceError,
  paginationMeta,
} from '@/lib/mobile/mobileApiUtils'

type TableName =
  | 'partners'
  | 'presenters'
  | 'hall_of_fame'
  | 'google_groups'
  | 'awards'
  | 'award_categories'
  | 'blogs'

export async function listTableRows(
  table: TableName,
  select = '*',
  page = 1,
  limit = 50,
  orderBy = 'id',
  ascending = false,
) {
  const db = getMobileDb()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await db
    .from(table)
    .select(select, { count: 'exact' })
    .order(orderBy, { ascending })
    .range(from, to)

  if (error) {
    console.error(`[mobile/adminCrud.${table}.list]`, error)
    throw new MobileServiceError(
      `Could not load ${table}.`,
      500,
      'INTERNAL_ERROR',
    )
  }

  return {
    data: data ?? [],
    pagination: paginationMeta(page, limit, count ?? data?.length ?? 0),
  }
}

export async function insertTableRow(table: TableName, payload: Record<string, unknown>) {
  const db = getMobileDb()
  const { data, error } = await db.from(table).insert(payload).select('*').single()
  if (error) {
    console.error(`[mobile/adminCrud.${table}.create]`, error)
    throw new MobileServiceError(
      `Could not create ${table} row.`,
      500,
      'INTERNAL_ERROR',
    )
  }
  return data
}

export async function updateTableRow(
  table: TableName,
  id: string,
  payload: Record<string, unknown>,
) {
  const db = getMobileDb()
  const { data, error } = await db
    .from(table)
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error(`[mobile/adminCrud.${table}.update]`, error)
    throw new MobileServiceError(
      `Could not update ${table} row.`,
      500,
      'INTERNAL_ERROR',
    )
  }
  if (!data) {
    throw new MobileServiceError('Not found', 404, 'NOT_FOUND')
  }
  return data
}

export async function deleteTableRow(table: TableName, id: string) {
  const db = getMobileDb()
  const { error } = await db.from(table).delete().eq('id', id)
  if (error) {
    console.error(`[mobile/adminCrud.${table}.delete]`, error)
    throw new MobileServiceError(
      `Could not delete ${table} row.`,
      500,
      'INTERNAL_ERROR',
    )
  }
}
