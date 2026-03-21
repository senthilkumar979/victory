export const FrameworkBackground = () => {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-indigo-50/80 to-purple-50/90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl opacity-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl opacity-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/3 top-0 h-px w-[120%] -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-200/40 to-transparent"
        aria-hidden
      />
    </>
  )
}
