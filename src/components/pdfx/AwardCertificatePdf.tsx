import { Document, Image, Link, Page, Text, View } from '@react-pdf/renderer'

import { theme } from '@/lib/pdfx-theme'

import { awardCertificateStyles as styles } from './awardCertificatePdfStyles'

export interface AwardCertificatePdfProps {
  recipientName: string
  awardCategoryName: string
  logoDataUri: string
}

const MOTIVATION =
  'Your dedication and impact inspire our community. MentorBridge celebrates this milestone with you—keep building, learning, and lifting others along the way.'

export const AwardCertificatePdf = ({
  recipientName,
  awardCategoryName,
  logoDataUri,
}: AwardCertificatePdfProps) => (
  <Document>
    <Page size={theme.page.size} style={styles.page}>
      <View style={styles.frame}>
        <View style={styles.logoRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt; PDF is not web a11y tree */}
          <Image src={logoDataUri} style={styles.logo} />
        </View>
        <Text style={styles.kicker}>MENTORBRIDGE</Text>
        <Text style={styles.mainTitle}>Certificate of Appreciation</Text>
        <Text style={styles.subKicker}>
          In recognition of excellence and meaningful contribution
        </Text>
        <View style={styles.rule} />
        <Text style={styles.presented}>
          This certificate is proudly presented to
        </Text>
        <Text style={styles.name}>{recipientName}</Text>
        <Text style={styles.categoryLabel}>Award category</Text>
        <View style={styles.categoryPill} wrap={false}>
          <Text style={styles.category}>{awardCategoryName}</Text>
        </View>
        <Text style={styles.body}>{MOTIVATION}</Text>
        <View style={styles.footer}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt; PDF is not web a11y tree */}
          <Image src={logoDataUri} style={styles.logo} />
          <Text style={styles.footerBrand}>MentorBridge</Text>
          <Text style={styles.footerTag}>
            {new Date().getFullYear()} · Empowering builders through mentorship
          </Text>
          <Link href="https://mentorbridge.in" style={styles.footerLink}>
            https://mentorbridge.in
          </Link>
        </View>
      </View>
    </Page>
  </Document>
)
