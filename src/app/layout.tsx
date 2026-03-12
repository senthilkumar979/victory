import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import 'goey-toast/styles.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import 'reactflow/dist/style.css'
import { ClarityComponent } from '../Clarity'
import { AppProvider } from './contexts/AppContext'
import './globals.css'
import { Footer } from './modules/Footer/Footer'
import { LoaderProvider } from './modules/Loader/Loader'
import { Navbar } from './modules/Navbar/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Bungee+Tint&family=Fira+Code:wght@300..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <script
            src="https://t.contentsquare.net/uxa/5027a5ad08b17.js"
            async
          ></script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <LoaderProvider>
            <AppProvider>
              <Navbar />
              {children}
              <Footer />
              <ClarityComponent />
              <Analytics />
              <SpeedInsights />
            </AppProvider>
          </LoaderProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
