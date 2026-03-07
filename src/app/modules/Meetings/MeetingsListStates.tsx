interface MeetingsListStatesProps {
  isLoading: boolean
  error: string | null
  isEmpty: boolean
}

export const MeetingsLoadingState = () => (
  <div className="mb-4 w-full rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
    Loading meetings…
  </div>
)

export const MeetingsErrorState = ({ message }: { message: string }) => (
  <div className="mb-4 w-full rounded-md border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
    Failed to load meetings. {message}
  </div>
)

export const MeetingsEmptyState = () => (
  <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/70 text-sm text-slate-400">
    No meetings created yet.
  </div>
)

export const MeetingsListStates = ({
  isLoading,
  error,
  isEmpty,
}: MeetingsListStatesProps) => {
  if (isLoading) return <MeetingsLoadingState />
  if (error) return <MeetingsErrorState message={error} />
  if (isEmpty) return <MeetingsEmptyState />
  return null
}
