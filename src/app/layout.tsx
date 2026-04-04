import { Navbar } from '@/components/navbar/Navbar'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import 'goey-toast/styles.css'
import type { Metadata } from 'next'
import { Bungee_Tint, Geist, Geist_Mono, Urbanist } from 'next/font/google'
import { PosthogRoot } from '@/components/analytics/PosthogRoot'
import { SentryUserContext } from '@/components/analytics/SentryUserContext'
import { ClarityComponent } from '../Clarity'
import { AppProvider } from './contexts/AppContext'
import './globals.css'
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd'
import { VisitorChatWidget } from '@/components/visitor-chat/VisitorChatWidget'
import { SITE_URL } from '@/lib/siteUrl'
import { Footer } from './modules/Footer/Footer'
import { LoaderProvider } from './modules/Loader/Loader'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const bungeeTint = Bungee_Tint({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bungee-tint',
  display: 'swap',
  preload: false,
})

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  display: 'swap',
  weight: ['500', '600', '700'],
  preload: false,
})

const defaultDescription =
  'MentorBridge is a Not-For-Profit community helping rural students prepare for the IT industry through hands-on training, mentorship, and real-world project experience since 2019.'

const socialImageUrl =
  'https://91qunajyvl11yxyb.public.blob.vercel-storage.com/favicon.ico'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MentorBridge - Bridging the Gap Between Learning and Industry',
    template: '%s | MentorBridge',
  },
  description: defaultDescription,
  keywords:
    'mentorship, rural students, IT training, software development, career guidance, SSMIET',
  authors: [{ name: 'MentorBridge Team' }],
  creator: 'MentorBridge Team',
  publisher: 'MentorBridge',
  robots: { index: true, follow: true },
  icons: {
    icon: socialImageUrl,
    apple: socialImageUrl,
  },
  openGraph: {
    title: 'MentorBridge - Bridging the Gap Between Learning and Industry',
    description: defaultDescription,
    type: 'website',
    locale: 'en_US',
    siteName: 'MentorBridge',
    url: SITE_URL,
    images: [
      {
        url: socialImageUrl,
        width: 512,
        height: 512,
        alt: 'MentorBridge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mentorbridgein',
    title: 'MentorBridge - Bridging the Gap Between Learning and Industry',
    description: defaultDescription,
    images: [socialImageUrl],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      taskUrls={{ 'reset-password': '/session-tasks/reset-password' }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${bungeeTint.variable} ${urbanist.variable}`}
      >
        <body className="antialiased">
          <OrganizationJsonLd />
          <LoaderProvider>
            <AppProvider>
              <PosthogRoot>
                <SentryUserContext />
                <Navbar />
                {children}
                <Footer />
                <VisitorChatWidget />
                <ClarityComponent />
                <Script
                  src="https://t.contentsquare.net/uxa/5027a5ad08b17.js"
                  strategy="lazyOnload"
                />
                <Analytics />
                <SpeedInsights />
              </PosthogRoot>
            </AppProvider>
          </LoaderProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
