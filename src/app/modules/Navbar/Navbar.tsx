'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { GooeyToaster } from 'goey-toast'
import 'goey-toast/styles.css'
import {
  BookOpen,
  CalendarIcon,
  HomeIcon,
  MapIcon,
  Shield,
  UserIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const Navbar = () => {
  const { user, isLoaded } = useUser()

  const linkClass =
    'text-sm font-medium text-slate-700 flex items-center gap-2 hover:underline-offset-10 hover:underline hover:text-primary'

  if (!isLoaded || !user) {
    return null
  }

  const userName = user.fullName

  return (
    <>
      <nav className="w-full bg-white/90 shadow-sm border-b border-slate-100 backdrop-blur z-50">
        <div className="mx-auto px-6 flex items-center justify-between py-3">
          <div className="font-bold text-lg text-slate-900 tracking-wide uppercase">
            <div className="flex-shrink-0">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault()
                }}
                className="flex items-center space-x-2"
              >
                <Image
                  src="https://91qunajyvl11yxyb.public.blob.vercel-storage.com/long-logo"
                  alt="MentorBridge"
                  width={120}
                  height={60}
                  className="h-8 sm:h-10 w-auto"
                />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className={linkClass}>
              <HomeIcon className="w-4 h-4" /> Home
            </Link>
            <Link href="/blogs" className={linkClass}>
              <BookOpen className="w-4 h-4" />
              Blogs
            </Link>
            <Link href="/events" className={linkClass}>
              <CalendarIcon className="w-4 h-4" />
              Events
            </Link>
            <Link href="/roadmap" className={linkClass}>
              <MapIcon className="w-4 h-4" />
              Roadmaps
            </Link>
            <Link href="/secured/profile" className={linkClass}>
              <UserIcon className="w-4 h-4" /> Profile
            </Link>
            <Link href="/secured/admin" className={linkClass}>
              <Shield className="w-4 h-4" /> Adminstration
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              {userName}
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'size-10',
                  userButtonPopoverCard: 'w-64',
                  userButtonPopoverFooter: 'flex items-center justify-between',
                },
              }}
            />
          </div>
        </div>
      </nav>
      <GooeyToaster position="bottom-left" />
    </>
  )
}
