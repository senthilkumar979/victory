import { Star } from 'lucide-react'

export const ProfileAppreciations = () => {
  return (
    <div>
      <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        <Star className="size-4" /> Appreciations
      </h2>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Star className="size-12 text-slate-200" />
        <p className="mt-2 text-sm text-slate-500">No appreciations yet</p>
      </div>
    </div>
  )
}
