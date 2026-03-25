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

export const metadata: Metadata = {
  title: 'MentorBridge - Bridging the Gap Between Learning and Industry',
  description:
    'MentorBridge is a Not-For-Profit community helping rural students prepare for the IT industry through hands-on training, mentorship, and real-world project experience.',
  keywords:
    'mentorship, rural students, IT training, software development, career guidance, SSMIET',
  authors: [{ name: 'MentorBridge Team' }],
  creator: 'MentorBridge Team',
  publisher: 'MentorBridge',
  robots: 'index, follow',
  icons: {
    icon: 'https://91qunajyvl11yxyb.public.blob.vercel-storage.com/favicon.ico',
  },
  openGraph: {
    title: 'MentorBridge',
    description: 'Bridging the Gap Between Learning and Industry',
    type: 'website',
    locale: 'en_US',
    siteName: 'MentorBridge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MentorBridge - Bridging the Gap Between Learning and Industry',
    description:
      'MentorBridge is a Not-For-Profit community helping rural students prepare for the IT industry through hands-on training, mentorship, and real-world project experience.',
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
          <LoaderProvider>
            <AppProvider>
              <PosthogRoot>
                <SentryUserContext />
                <Navbar />
                {children}
                <Footer />
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
