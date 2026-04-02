import { cn } from '@/lib/utils'

interface InterviewPrepCodePanelProps {
  code: string
  language?: string
  /** Optional path shown in the title bar (e.g. `utils/cart.js`) */
  filePath?: string
  className?: string
}

export const InterviewPrepCodePanel = ({
  code,
  language,
  filePath,
  className,
}: InterviewPrepCodePanelProps) => (
  <div
    className={cn(
      'overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-950 shadow-inner',
      className,
    )}
  >
    <div className="flex min-h-9 w-full items-center gap-2 border-b border-zinc-800/80 bg-zinc-900/90 px-3 py-2">
      <span className="size-2.5 shrink-0 rounded-full bg-[#ff5f57]" aria-hidden />
      <span className="size-2.5 shrink-0 rounded-full bg-[#febc2e]" aria-hidden />
      <span className="size-2.5 shrink-0 rounded-full bg-[#28c840]" aria-hidden />
      {filePath && (
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-400">
          {filePath}
        </span>
      )}
      {language && (
        <span className="ml-auto shrink-0 font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          {language}
        </span>
      )}
    </div>
    <pre className="overflow-x-auto p-4 text-left font-mono text-[13px] leading-relaxed text-zinc-100 [tab-size:2]">
      <code>{code}</code>
    </pre>
  </div>
)
