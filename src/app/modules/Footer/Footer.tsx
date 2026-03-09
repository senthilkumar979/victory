'use client'

import { FooterInfo } from './FooterInfo'
import { FooterLogo } from './FooterLogo'
import { Newsletter } from './Newsletter'
import { PartnersCarousel } from './PartnersCarousel'

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-primary/20">
      <div className="absolute inset-0 " />
      <PartnersCarousel />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 items-center ">
          <FooterLogo />
          <p></p>
          <Newsletter />
        </div>

        <FooterInfo />
      </div>
    </footer>
  )
}
