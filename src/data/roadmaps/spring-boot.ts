import type { RoadmapData } from './types'

const defaultResources = [
  {
    title: 'Spring Boot Reference Documentation',
    url: 'https://docs.spring.io/spring-boot/reference/index.html',
    type: 'documentation' as const,
  },
  {
    title: 'Spring Guides',
    url: 'https://spring.io/guides',
    type: 'course' as const,
  },
]

function roadmapNode(id: string, title: string) {
  return {
    id,
    title,
    description: `Explore "${title}" in the Spring Boot ecosystem. Official Spring documentation and guides help you go deeper.`,
    resources: [...defaultResources],
  }
}

/** Pairs [nodeId, label] — must match data-node-id / data-title in SpringBootRoadmap.tsx */
const NODE_PAIRS: [string, string][] = [
  ['HU7wZWiES3m3xl1-NYP6F', 'Spring Boot'],
  ['jy2heDVZuM6ASCXlI1TDn', 'Introduction'],
  ['OB--nMudscm0p6RqqfA7T', 'Configuration'],
  ['C2EQ5J1aJYF9e9Rr2KysT', 'Dependency Injection'],
  ['PlUU_vzFQ3Xx6Z5XREIYP', 'Spring IOC'],
  ['wV1_I_4czMIxpBionvLs4', 'Spring AOP'],
  ['QiNWE4sMTao3cVzjt3yPp', 'Spring MVC'],
  ['HdCpfGMrMaXxk5QrtYn3X', 'Annotations'],
  ['KdN62IpNgPFMndXfLaYa1', 'Spring Bean Scope'],
  ['WrUCyVfFNUpHB8jyjjKna', 'Terminology'],
  ['yuXN-rD4AyyPYUYOR50L_', 'Architecture'],
  ['WGf3W6bdWL0rK0o6O28G2', 'Why use Spring?'],
  ['KaUdyVWEiZa6lUDRBlOKt', 'Spring Security'],
  ['ssdk2iAt4avhc8B5tnIzQ', 'Authentication'],
  ['c7w7Z3Coa81FKa_yAKTse', 'Authorization'],
  ['p7t3RlIIm9U08GFC6azff', 'OAuth2'],
  ['1My7mbdwAbRcJoiA50pWW', 'JWT Authentication'],
  ['JrH2hiu27PhIO1VtrArMa', 'Spring Boot Starters'],
  ['88-h3d7kb-VmUBsnUUXW_', 'Autoconfiguration'],
  ['N7hd3d_XQtvOgnCqdCFt3', 'Actuators'],
  ['ONb0VnSUMY8JBeW3G2mTp', 'Embedded Server'],
  ['h5-HnycxfbJgwalSdXTAz', 'Hibernate'],
  ['H9Z0EvKT_148vD0mR-dUf', 'Transactions'],
  ['D4ybyh0ydvl9W2_xUcvZ_', 'Relationships'],
  ['Ijmy0J3VyaeTGXtu2VkkQ', 'Entity Lifecycle'],
  ['pvVLbFQoT50vz_VRK4VbJ', 'Spring Data'],
  ['6u08QN-pUeFm3o0h5Scfm', 'Spring Data JPA'],
  ['fy-TphbqkLpR1zvFcr7dg', 'Spring Data MongoDB'],
  ['dd1A-MyzBs_kNOtVG7f1D', 'Spring Data JDBC'],
  ['jU_KHoPUSU_HoIKk0ZpRF', 'Microservices'],
  ['VWNDYSw83Vzi2UPQprJ5z', 'Spring Cloud'],
  ['f-i0NX2KOzCh3JwkaSPFo', 'Spring Cloud Gateway'],
  ['9hG3CB8r41bUb_s8-0u73', 'Cloud Config'],
  ['kqpSlO--X9-xYxfq1KFVe', 'Spring Cloud Circuit Breaker'],
  ['EKSXTMSN2xdaleJ4wOV1A', 'Spring Cloud Open Feign'],
  ['GsmBGRohWbJ6XOaALFZ8o', 'Micrometer'],
  ['6sLE6gb5Y477SmO2GhQIG', 'Eureka'],
  ['S-BbOoRD7anvoJrprjoKF', 'Spring MVC'],
  ['35NTx2eO1j02sjy4m6DPq', 'Servlet'],
  ['Lz0GPMiYzb30iFJdv1dL6', 'JSP Files'],
  ['_vS_zdJZegZS6MIKAFyg8', 'Architecture'],
  ['sgA06Tu9Y4cEHtfI8CyLL', 'Components'],
  ['7Qqrh_Rz_7uAD49g9sDzi', 'Testing'],
  ['Nhx2QiSD_4pVWD17lsCbu', 'JPA Test'],
  ['5d1BERqTKNJMKiBcqa8Ie', 'Mock MVC'],
  ['p91CaVPh5GMzFU0yEU_hl', '@SpringBootTest Annotation'],
  ['i77NTa0hpGGBjmql9u_CT', '@MockBean Annotation'],
]

export const springBootRoadmap: RoadmapData = {
  title: 'Spring Boot',
  description:
    'Convention-over-configuration, starters, security, data access, cloud-native patterns, and testing on the JVM.',
  nodes: NODE_PAIRS.map(([id, title]) => roadmapNode(id, title)),
}
