export const FrameworkDiagramBackdrop = () => (
  <div
    className="pointer-events-none absolute inset-0 overflow-hidden"
    aria-hidden
  >
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(213,63,140,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(213,63,140,0.22),transparent_55%)]" />
    <div className="absolute -left-1/4 top-0 h-[min(42rem,80vw)] w-[min(42rem,80vw)] rounded-full bg-[#d53f8c]/25 blur-3xl dark:bg-[#d53f8c]/20" />
    <div className="absolute -right-1/4 top-1/4 h-[min(36rem,70vw)] w-[min(36rem,70vw)] rounded-full bg-[#be185d]/20 blur-3xl dark:bg-[#f472b6]/12" />
    <div className="absolute bottom-0 left-1/3 h-[min(28rem,60vw)] w-[min(28rem,60vw)] -translate-x-1/2 rounded-full bg-[#fbcfe8]/40 blur-3xl dark:bg-[#9d174d]/15" />
    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.85)_100%)] dark:bg-[linear-gradient(to_bottom,transparent,rgb(3,7,18)_100%)]" />
  </div>
)
