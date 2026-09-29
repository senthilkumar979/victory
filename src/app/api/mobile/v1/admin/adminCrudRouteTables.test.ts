import { describe, expect, it, vi } from 'vitest'

const { createAdminCrudHandlers, createAdminCrudIdHandlers } = vi.hoisted(() => ({
  createAdminCrudHandlers: vi.fn((table: string) => ({
    GET: vi.fn().mockName(`${table}-GET`),
    POST: vi.fn().mockName(`${table}-POST`),
  })),
  createAdminCrudIdHandlers: vi.fn((table: string) => ({
    PATCH: vi.fn().mockName(`${table}-PATCH`),
    DELETE: vi.fn().mockName(`${table}-DELETE`),
  })),
}))

vi.mock('@/lib/mobile/createAdminCrudHandlers', () => ({
  createAdminCrudHandlers,
  createAdminCrudIdHandlers,
}))

import * as awardCategories from '@/app/api/mobile/v1/admin/award-categories/route'
import * as awardCategoriesId from '@/app/api/mobile/v1/admin/award-categories/[id]/route'
import * as awards from '@/app/api/mobile/v1/admin/awards/route'
import * as awardsId from '@/app/api/mobile/v1/admin/awards/[id]/route'
import * as googleGroups from '@/app/api/mobile/v1/admin/google-groups/route'
import * as googleGroupsId from '@/app/api/mobile/v1/admin/google-groups/[id]/route'
import * as hallOfFame from '@/app/api/mobile/v1/admin/hall-of-fame/route'
import * as hallOfFameId from '@/app/api/mobile/v1/admin/hall-of-fame/[id]/route'
import * as partners from '@/app/api/mobile/v1/admin/partners/route'
import * as partnersId from '@/app/api/mobile/v1/admin/partners/[id]/route'
import * as presenters from '@/app/api/mobile/v1/admin/presenters/route'
import * as presentersId from '@/app/api/mobile/v1/admin/presenters/[id]/route'

const routes = [
  { table: 'award_categories', collection: awardCategories, item: awardCategoriesId },
  { table: 'awards', collection: awards, item: awardsId },
  { table: 'google_groups', collection: googleGroups, item: googleGroupsId },
  { table: 'hall_of_fame', collection: hallOfFame, item: hallOfFameId },
  { table: 'partners', collection: partners, item: partnersId },
  { table: 'presenters', collection: presenters, item: presentersId },
]

function handlerFor(
  mock: ReturnType<typeof vi.fn>,
  table: string,
  method: string,
) {
  const index = mock.mock.calls.findIndex((call) => call[0] === table)
  return mock.mock.results[index]?.value[method]
}

describe('mobile admin CRUD route tables', () => {
  it('binds each collection and id route to its own table handlers', () => {
    for (const route of routes) {
      expect(createAdminCrudHandlers).toHaveBeenCalledWith(route.table)
      expect(createAdminCrudIdHandlers).toHaveBeenCalledWith(route.table)
      expect(route.collection.GET).toBe(
        handlerFor(createAdminCrudHandlers, route.table, 'GET'),
      )
      expect(route.collection.POST).toBe(
        handlerFor(createAdminCrudHandlers, route.table, 'POST'),
      )
      expect(route.item.PATCH).toBe(
        handlerFor(createAdminCrudIdHandlers, route.table, 'PATCH'),
      )
      expect(route.item.DELETE).toBe(
        handlerFor(createAdminCrudIdHandlers, route.table, 'DELETE'),
      )
    }
  })
})
