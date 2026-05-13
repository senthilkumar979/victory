import { redirect } from 'next/navigation'

/** Single canonical terms URL for SEO (`/terms-conditions`). */
export default function TermsAndConditionsPage() {
  redirect('/terms-conditions')
}
