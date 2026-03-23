'use client'

import Image from 'next/image'
import Link from 'next/link'

export const NavbarBrand = () => {
  return (
    <div className="min-w-0 flex-shrink-0">
      <Link
        href="/"
        className="group relative flex cursor-pointer items-center gap-3 rounded-2xl pr-1 outline-none ring-offset-2 transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
      >
        <Image
          src="https://91qunajyvl11yxyb.public.blob.vercel-storage.com/long-logo"
          alt="MentorBridge"
          width={120}
          height={60}
          className="h-5 w-auto min-w-0 opacity-95 transition-[opacity,filter] duration-300 group-hover:opacity-100 sm:h-7"
          priority
        />
      </Link>
    </div>
  )
}
