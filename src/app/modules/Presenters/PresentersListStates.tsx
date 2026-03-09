interface PresentersListStatesProps {
  isLoading: boolean
  error: string | null
  isEmpty: boolean
}

export const PresentersLoadingState = () => (
  <div className="mb-4 w-full rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
    Loading presenters…
  </div>
)

export const PresentersErrorState = ({ message }: { message: string }) => (
  <div className="mb-4 w-full rounded-md border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
    Failed to load presenters. {message}
  </div>
)

export const PresentersEmptyState = () => (
  <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/70 text-sm text-slate-400">
    No presenters created yet.
  </div>
)

export const PresentersListStates = ({
  isLoading,
  error,
  isEmpty,
}: PresentersListStatesProps) => {
  if (isLoading) return <PresentersLoadingState />
  if (error) return <PresentersErrorState message={error} />
  if (isEmpty) return <PresentersEmptyState />
  return null
}
