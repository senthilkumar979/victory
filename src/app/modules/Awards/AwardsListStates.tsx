interface AwardsListStatesProps {
  isLoading: boolean
  error: string | null
  isEmpty: boolean
}

export const AwardsLoadingState = () => (
  <div className="mb-4 w-full rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
    Loading awards…
  </div>
)

export const AwardsErrorState = ({ message }: { message: string }) => (
  <div className="mb-4 w-full rounded-md border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
    Failed to load awards. {message}
  </div>
)

export const AwardsEmptyState = () => (
  <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/70 text-sm text-slate-400">
    No awards created yet.
  </div>
)

export const AwardsListStates = ({
  isLoading,
  error,
  isEmpty,
}: AwardsListStatesProps) => {
  if (isLoading) return <AwardsLoadingState />
  if (error) return <AwardsErrorState message={error} />
  if (isEmpty) return <AwardsEmptyState />
  return null
}
