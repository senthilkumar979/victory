import { ContactUs } from './modules/Homepage/ContactUs/ContactUs'
import { Hero } from './modules/Homepage/Hero/Hero'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ContactUs />
    </main>
  )
}
