import { StyleSheet } from '@react-pdf/renderer'

import { theme } from '@/lib/pdfx-theme'

const ink = '#0f172a'
const slate = '#64748b'
const cream = '#f8f6f3'
const brand = theme.colors.primary

export const awardCertificateStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    backgroundColor: cream,
    paddingTop: 40,
    paddingRight: 40,
    paddingBottom: 40,
    paddingLeft: 40,
  },
  frame: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingTop: 36,
    paddingRight: 40,
    paddingBottom: 32,
    paddingLeft: 40,
    borderLeftWidth: 5,
    borderLeftColor: brand,
  },
  logoRow: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 260, height: 52, objectFit: 'contain' },
  kicker: {
    fontSize: 9,
    letterSpacing: 3.2,
    color: slate,
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  mainTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 26,
    color: ink,
    textAlign: 'center',
    marginBottom: 20,
  },
  subKicker: {
    fontSize: 10,
    color: slate,
    textAlign: 'center',
    marginBottom: 22,
  },
  rule: {
    alignSelf: 'center',
    width: 72,
    height: 2,
    backgroundColor: brand,
    marginBottom: 22,
    opacity: 0.85,
  },
  presented: {
    fontSize: 10,
    color: slate,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 30,
    color: ink,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 1.15,
  },
  categoryLabel: {
    fontSize: 9,
    letterSpacing: 1.6,
    color: slate,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  categoryPill: {
    alignSelf: 'center',
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: '#f9a8d4',
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginBottom: 22,
    maxWidth: '100%',
  },
  category: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: brand,
    textAlign: 'center',
    lineHeight: 1.35,
  },
  body: {
    fontFamily: 'Times-Italic',
    fontSize: 11,
    textAlign: 'center',
    color: slate,
    lineHeight: 1.55,
    paddingHorizontal: 8,
    marginBottom: 26,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 18,
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    marginTop: 20,
    color: theme.colors.primary,
  },
  footerTag: {
    fontSize: 9,
    color: slate,
  },
  footerLink: {
    fontSize: 9,
    textDecoration: 'none',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
    marginTop: 12,
    color: theme.colors.primary,
  },
})
