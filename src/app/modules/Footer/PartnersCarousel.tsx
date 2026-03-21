import Image from 'next/image'

const partners = [
  'https://cdn.prod.website-files.com/65db81f1b768e5a874a7f796/6823abc6adba15348385c94b_brand-logo.svg',
  'https://cdn.prod.website-files.com/65f2a5372687678051645610%2F674ff9bec4b490efb213e1b8_Black.png',
  'https://91qunajyvl11yxyb.public.blob.vercel-storage.com/Frigate.webp',
  'https://klyonix.com/assets/klyonix/frontend/assets/logo-C2Ly_RjO.png',
  'https://91qunajyvl11yxyb.public.blob.vercel-storage.com/hello-truck.svg',
  'https://91qunajyvl11yxyb.public.blob.vercel-storage.com/sukiran.png',
  'https://cdn.prod.website-files.com/6433e458ab91bb85baa64649/6434fe08ac4abec17562ea4c_Logo%20Full.png',
]

export const PartnersCarousel = () => (
  <div className="border-b border-white/5 py-8">
    <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
      Trusted by our partners
    </p>
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-primary/10 to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-primary/10 to-transparent" />
      <div className="flex animate-partners-scroll gap-16">
        {[...partners, ...partners].map((partner, i) => (
          <div
            key={`${partner}-${i}`}
            className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2 backdrop-blur-sm"
          >
            <Image
              src={partner}
              alt={'partner'}
              width={100}
              height={100}
              className="rounded-md"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)
