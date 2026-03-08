interface PartnersListStatesProps {
  isLoading: boolean
  error: string | null
  isEmpty: boolean
}

export const PartnersLoadingState = () => (
  <div className="mb-4 w-full rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
    Loading partners…
  </div>
)

export const PartnersErrorState = ({ message }: { message: string }) => (
  <div className="mb-4 w-full rounded-md border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
    Failed to load partners. {message}
  </div>
)

export const PartnersEmptyState = () => (
  <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/70 text-sm text-slate-400">
    No partners yet.
  </div>
)

export const PartnersListStates = ({
  isLoading,
  error,
  isEmpty,
}: PartnersListStatesProps) => {
  if (isLoading) return <PartnersLoadingState />
  if (error) return <PartnersErrorState message={error} />
  if (isEmpty) return <PartnersEmptyState />
  return null
}
