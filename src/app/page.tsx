import { ContactUs } from './modules/Homepage/ContactUs/ContactUs'
import { Framework } from './modules/Homepage/Framework/Framework'
import { Hero } from './modules/Homepage/Hero/Hero'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Framework />
      <ContactUs />
    </main>
  )
}
