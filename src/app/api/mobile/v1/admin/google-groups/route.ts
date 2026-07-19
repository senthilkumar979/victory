import { createAdminCrudHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudHandlers('google_groups')
export const GET = handlers.GET
export const POST = handlers.POST
