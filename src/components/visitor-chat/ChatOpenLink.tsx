import { ExternalLink, Mail } from 'lucide-react'

function trimTrailingPunct(url: string): string {
  return url.replace(/[.,;:!?)]+$/, '')
}

interface ChatOpenLinkProps {
  href: string
  className?: string
}

/** http(s): "Open" + icon; mailto: "Email" + icon */
export const ChatOpenLink = ({ href, className }: ChatOpenLinkProps) => {
  const safe = trimTrailingPunct(href)
  const isMail = safe.startsWith('mailto:')
  const defaultClass =
    'inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

  if (isMail) {
    return (
      <a href={safe} className={className ?? defaultClass}>
        <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Email
      </a>
    )
  }
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? defaultClass}
    >
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Open
    </a>
  )
}
