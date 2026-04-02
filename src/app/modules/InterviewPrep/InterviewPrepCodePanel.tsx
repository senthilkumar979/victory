import { cn } from '@/lib/utils'

interface InterviewPrepCodePanelProps {
  code: string
  language?: string
  className?: string
}

export const InterviewPrepCodePanel = ({
  code,
  language,
  className,
}: InterviewPrepCodePanelProps) => (
  <div
    className={cn(
      'overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-950 shadow-inner',
      className,
    )}
  >
    <div className="flex items-center gap-2 border-b border-zinc-800/80 bg-zinc-900/90 px-3 py-2">
      <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
      <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden />
      <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden />
      {language && (
        <span className="ml-auto font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          {language}
        </span>
      )}
    </div>
    <pre className="overflow-x-auto p-4 text-left font-mono text-[13px] leading-relaxed text-zinc-100 [tab-size:2]">
      <code>{code}</code>
    </pre>
  </div>
)
