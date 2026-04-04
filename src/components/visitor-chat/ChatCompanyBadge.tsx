'use client'

import { COMPANY_LOGOS } from '@/constants/CompanyConstants'
import { cn } from '@/lib/utils'

export interface ChatCompanyBadgeProps {
  /** Display name (matched case-insensitively to COMPANY_LOGOS) */
  companyName: string
  /** Inline sentence: smallest; list / line-start: slightly larger */
  size?: 'inline' | 'list'
}

function resolveLogo(companyName: string) {
  const t = companyName.trim()
  return COMPANY_LOGOS.find((c) => c.name.toLowerCase() === t.toLowerCase())
}

export const ChatCompanyBadge = ({
  companyName,
  size = 'inline',
}: ChatCompanyBadgeProps) => {
  const entry = resolveLogo(companyName)
  const label = entry?.name ?? companyName.trim()
  const imgClass =
    size === 'list'
      ? 'h-15 w-15 max-h-15 max-w-15'
      : 'h-8 w-8 max-h-8 max-w-8'

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 align-middle',
        size === 'list' ? 'gap-1.5' : 'gap-1',
      )}
    >
      {entry?.logo ? (
        // Multiple external CDNs; <Image> would require each domain in next.config
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.logo}
          alt=""
          width={size === 'list' ? 16 : 12}
          height={size === 'list' ? 16 : 12}
          className={cn('shrink-0 object-contain', imgClass)}
        />
      ) : null}
      <span className="font-medium text-slate-700">{label}</span>
    </span>
  )
}
