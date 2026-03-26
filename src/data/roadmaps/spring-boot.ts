import type { RoadmapData, RoadmapNodeMeta } from './types'

function roadmapNode(id: string, title: string): RoadmapNodeMeta {
  const commonDocs: RoadmapNodeMeta['resources'] = [
    {
      title: 'Spring Boot Reference Documentation',
      url: 'https://docs.spring.io/spring-boot/reference/',
      type: 'documentation',
    },
    {
      title: 'Spring Guides (Getting Started)',
      url: 'https://spring.io/guides',
      type: 'documentation',
    },
  ]

  const topicResources: Record<string, RoadmapNodeMeta['resources']> = {
  'Spring Boot Starters': [
    {
      title: 'Spring Boot Starters Docs',
      url: 'https://docs.spring.io/spring-boot/reference/using/auto-configuration.html#using.auto-configuration.custom-starter',
      type: 'documentation',
    },
    {
      title: 'Spring Boot Starters Explained',
      url: 'https://www.youtube.com/watch?v=vtPkZShrvXQ&t=900s',
      type: 'video',
    },
  ],

  Autoconfiguration: [
    {
      title: 'Spring Boot Auto Configuration Docs',
      url: 'https://docs.spring.io/spring-boot/reference/features/auto-configuration.html',
      type: 'documentation',
    },
    {
      title: 'Auto Configuration Deep Dive',
      url: 'https://www.youtube.com/watch?v=vtPkZShrvXQ&t=1500s',
      type: 'video',
    },
  ],

  Actuators: [
    {
      title: 'Spring Boot Actuator Docs',
      url: 'https://docs.spring.io/spring-boot/reference/actuator/index.html',
      type: 'documentation',
    },
    {
      title: 'Spring Boot Actuator Tutorial',
      url: 'https://www.youtube.com/watch?v=pbF8wF6n8bY',
      type: 'video',
    },
    {
      title: 'Actuator Demo Project',
      url: 'https://github.com/spring-guides/gs-actuator-service',
      type: 'code',
    },
  ],

  'Embedded Server': [
    {
      title: 'Embedded Servlet Containers',
      url: 'https://docs.spring.io/spring-boot/reference/web/servlet.html',
      type: 'documentation',
    },
    {
      title: 'Embedded Tomcat Explained',
      url: 'https://www.youtube.com/watch?v=9SGDpanrc8U&t=1800s',
      type: 'video',
    },
  ],

  'Spring Data': [
    {
      title: 'Spring Data Overview',
      url: 'https://spring.io/projects/spring-data',
      type: 'documentation',
    },
    {
      title: 'Spring Data Explained',
      url: 'https://www.youtube.com/watch?v=8SGI_XS5OPw',
      type: 'video',
    },
  ],

  'Spring Data MongoDB': [
    {
      title: 'Spring Data MongoDB Docs',
      url: 'https://docs.spring.io/spring-data/mongodb/reference/',
      type: 'documentation',
    },
    {
      title: 'Spring Boot MongoDB Tutorial',
      url: 'https://www.youtube.com/watch?v=8SGI_XS5OPw&t=1200s',
      type: 'video',
    },
    {
      title: 'MongoDB Example Project',
      url: 'https://github.com/spring-projects/spring-data-examples/tree/main/mongodb',
      type: 'code',
    },
  ],

  'Spring Data JDBC': [
    {
      title: 'Spring Data JDBC Docs',
      url: 'https://docs.spring.io/spring-data/jdbc/reference/',
      type: 'documentation',
    },
    {
      title: 'Spring Data JDBC Explained',
      url: 'https://www.youtube.com/watch?v=6F8i6U5fK9k',
      type: 'video',
    },
  ],

  'Spring Cloud Gateway': [
    {
      title: 'Spring Cloud Gateway Docs',
      url: 'https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/',
      type: 'documentation',
    },
    {
      title: 'API Gateway with Spring Cloud',
      url: 'https://www.youtube.com/watch?v=Qp5cC6C8Ngs',
      type: 'video',
    },
    {
      title: 'Gateway Example',
      url: 'https://github.com/spring-cloud-samples/spring-cloud-gateway-sample',
      type: 'code',
    },
  ],

  'Cloud Config': [
    {
      title: 'Spring Cloud Config Docs',
      url: 'https://docs.spring.io/spring-cloud-config/docs/current/reference/html/',
      type: 'documentation',
    },
    {
      title: 'Spring Cloud Config Tutorial',
      url: 'https://www.youtube.com/watch?v=2g0r2t4ZlCw',
      type: 'video',
    },
    {
      title: 'Config Server Example',
      url: 'https://github.com/spring-cloud-samples/config-repo',
      type: 'code',
    },
  ],

  'Spring Cloud Circuit Breaker': [
    {
      title: 'Circuit Breaker Docs',
      url: 'https://docs.spring.io/spring-cloud-circuitbreaker/docs/current/reference/html/',
      type: 'documentation',
    },
    {
      title: 'Resilience4j with Spring Boot',
      url: 'https://www.youtube.com/watch?v=8j5y6w8iR0k',
      type: 'video',
    },
    {
      title: 'Circuit Breaker Example',
      url: 'https://github.com/resilience4j/resilience4j-spring-boot2-demo',
      type: 'code',
    },
  ],

  'Spring Cloud Open Feign': [
    {
      title: 'OpenFeign Docs',
      url: 'https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/',
      type: 'documentation',
    },
    {
      title: 'Feign Client Tutorial',
      url: 'https://www.youtube.com/watch?v=FH8fUBfHARY',
      type: 'video',
    },
    {
      title: 'Feign Example',
      url: 'https://github.com/spring-cloud-samples/feign-eureka',
      type: 'code',
    },
  ],

  Micrometer: [
    {
      title: 'Micrometer Docs',
      url: 'https://micrometer.io/docs',
      type: 'documentation',
    },
    {
      title: 'Micrometer Metrics Explained',
      url: 'https://www.youtube.com/watch?v=kcUYneEVtEI&t=434s',
      type: 'video',
    },
  ],

  Servlet: [
    {
      title: 'Servlet with Spring Boot',
      url: 'https://docs.spring.io/spring-boot/reference/web/servlet.html',
      type: 'documentation',
    },
    {
      title: 'Servlet Basics',
      url: 'https://www.youtube.com/watch?v=7AIjcZMo-V4',
      type: 'video',
    },
  ],

  'JSP Files': [
    {
      title: 'JSP with Spring Boot',
      url: 'https://docs.spring.io/spring-boot/how-to.html#howto.spring-mvc.jsp',
      type: 'documentation',
    },
    {
      title: 'JSP Tutorial',
      url: 'https://www.youtube.com/watch?v=7AIjcZMo-V4',
      type: 'video',
    },
  ],

  Components: [
    {
      title: 'Spring Components Docs',
      url: 'https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html',
      type: 'documentation',
    },
    {
      title: '@Component vs @Service vs @Repository',
      url: 'https://www.youtube.com/watch?v=Yb1bW9KkY7c',
      type: 'video',
    },
  ],

  'JPA Test': [
    {
      title: 'JPA Test Docs',
      url: 'https://docs.spring.io/spring-boot/reference/testing/test-slices.html',
      type: 'documentation',
    },
    {
      title: 'Testing JPA Repositories',
      url: 'https://www.youtube.com/watch?v=Geq60OVyBPg&t=600s',
      type: 'video',
    },
  ],
  'Spring Boot': [
    {
      title: 'Spring Boot Official',
      url: 'https://spring.io/projects/spring-boot',
      type: 'documentation',
    },
    {
      title: 'Spring Boot Full Course',
      url: 'https://www.youtube.com/watch?v=9SGDpanrc8U',
      type: 'video',
    },
    {
      title: 'Spring Boot Example',
      url: 'https://github.com/spring-guides/gs-spring-boot',
      type: 'code',
    },
  ],

  Introduction: [
    {
      title: 'Spring Framework Overview',
      url: 'https://docs.spring.io/spring-framework/reference/overview.html',
      type: 'documentation',
    },
    {
      title: 'Spring Boot Basics',
      url: 'https://www.youtube.com/watch?v=vtPkZShrvXQ',
      type: 'video',
    },
  ],

  Configuration: [
    {
      title: 'External Configuration',
      url: 'https://docs.spring.io/spring-boot/reference/features/external-config.html',
      type: 'documentation',
    },
    {
      title: 'Spring Boot Configuration Explained',
      url: 'https://www.youtube.com/watch?v=9SGDpanrc8U&t=1200s',
      type: 'video',
    },
  ],

  'Dependency Injection': [
    {
      title: 'IoC Container Docs',
      url: 'https://docs.spring.io/spring-framework/reference/core/beans.html',
      type: 'documentation',
    },
    {
      title: 'Dependency Injection Explained',
      url: 'https://www.youtube.com/watch?v=gbQ3o8n4h6A',
      type: 'video',
    },
    {
      title: 'DI Example',
      url: 'https://github.com/eugenp/tutorials/tree/master/spring-di',
      type: 'code',
    },
  ],

  'Spring IOC': [
    {
      title: 'IoC Docs',
      url: 'https://docs.spring.io/spring-framework/reference/core/beans/introduction.html',
      type: 'documentation',
    },
    {
      title: 'Spring IoC Tutorial',
      url: 'https://www.youtube.com/watch?v=gbQ3o8n4h6A',
      type: 'video',
    },
  ],

  'Spring AOP': [
    {
      title: 'Spring AOP Docs',
      url: 'https://docs.spring.io/spring-framework/reference/core/aop.html',
      type: 'documentation',
    },
    {
      title: 'Spring AOP Tutorial',
      url: 'https://www.youtube.com/watch?v=3jXKJ2j7k2E',
      type: 'video',
    },
  ],

  'Spring MVC': [
    {
      title: 'Spring MVC Docs',
      url: 'https://docs.spring.io/spring-framework/reference/web/webmvc.html',
      type: 'documentation',
    },
    {
      title: 'Spring MVC Crash Course',
      url: 'https://www.youtube.com/watch?v=If1Lw4pLLEo',
      type: 'video',
    },
    {
      title: 'REST API Example',
      url: 'https://github.com/spring-guides/gs-rest-service',
      type: 'code',
    },
  ],

  Annotations: [
    {
      title: 'Spring Annotations',
      url: 'https://docs.spring.io/spring-framework/reference/core/beans/annotation-config.html',
      type: 'documentation',
    },
    {
      title: 'Annotations Explained',
      url: 'https://www.youtube.com/watch?v=Yb1bW9KkY7c',
      type: 'video',
    },
  ],

  'Spring Bean Scope': [
    {
      title: 'Bean Scope Docs',
      url: 'https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html',
      type: 'documentation',
    },
    {
      title: 'Bean Scope Explained',
      url: 'https://www.youtube.com/watch?v=3jXKJ2j7k2E',
      type: 'video',
    },
  ],

  Terminology: [
    {
      title: 'Spring Core Concepts',
      url: 'https://docs.spring.io/spring-framework/reference/overview.html',
      type: 'documentation',
    },
  ],

  Architecture: [
    {
      title: 'Spring Boot Architecture',
      url: 'https://docs.spring.io/spring-boot/reference/features.html',
      type: 'documentation',
    },
    {
      title: 'Spring Architecture Explained',
      url: 'https://www.youtube.com/watch?v=vtPkZShrvXQ',
      type: 'video',
    },
  ],

  'Why use Spring?': [
    {
      title: 'Why Spring',
      url: 'https://spring.io/why-spring',
      type: 'article',
    },
    {
      title: 'Spring Overview',
      url: 'https://www.youtube.com/watch?v=vtPkZShrvXQ',
      type: 'video',
    },
  ],

  'Spring Security': [
    {
      title: 'Spring Security Docs',
      url: 'https://docs.spring.io/spring-security/reference/',
      type: 'documentation',
    },
    {
      title: 'Spring Security Course',
      url: 'https://www.youtube.com/watch?v=her_7pa0vrg',
      type: 'video',
    },
    {
      title: 'Security Example',
      url: 'https://github.com/bezkoder/spring-boot-spring-security-jwt-authentication',
      type: 'code',
    },
  ],

  Authentication: [
    {
      title: 'Authentication Docs',
      url: 'https://docs.spring.io/spring-security/reference/servlet/authentication/index.html',
      type: 'documentation',
    },
    {
      title: 'Auth Explained',
      url: 'https://www.youtube.com/watch?v=2PPSXonhIck',
      type: 'video',
    },
  ],

  Authorization: [
    {
      title: 'Authorization Docs',
      url: 'https://docs.spring.io/spring-security/reference/servlet/authorization/index.html',
      type: 'documentation',
    },
    {
      title: 'Authorization Explained',
      url: 'https://www.youtube.com/watch?v=2PPSXonhIck',
      type: 'video',
    },
  ],

  OAuth2: [
    {
      title: 'OAuth2 Docs',
      url: 'https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html',
      type: 'documentation',
    },
    {
      title: 'OAuth2 Explained',
      url: 'https://www.youtube.com/watch?v=CPbvxxslDTU',
      type: 'video',
    },
  ],

  'JWT Authentication': [
    {
      title: 'JWT Docs',
      url: 'https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html',
      type: 'documentation',
    },
    {
      title: 'JWT Explained',
      url: 'https://www.youtube.com/watch?v=7Q17ubqLfaM',
      type: 'video',
    },
    {
      title: 'JWT Example',
      url: 'https://github.com/callicoder/spring-boot-spring-security-jwt-demo',
      type: 'code',
    },
  ],

  // -------- DATA LAYER --------

  Hibernate: [
    {
      title: 'Hibernate Docs',
      url: 'https://hibernate.org/orm/documentation/',
      type: 'documentation',
    },
    {
      title: 'Hibernate Tutorial',
      url: 'https://www.youtube.com/watch?v=EvKbOz2qQe8',
      type: 'video',
    },
  ],

  Transactions: [
    {
      title: 'Transactions Docs',
      url: 'https://docs.spring.io/spring-framework/reference/data-access/transaction.html',
      type: 'documentation',
    },
  ],

  Relationships: [
    {
      title: 'JPA Relationships',
      url: 'https://docs.jboss.org/hibernate/stable/annotations/reference/en/html_single/',
      type: 'documentation',
    },
  ],

  'Entity Lifecycle': [
    {
      title: 'JPA Lifecycle',
      url: 'https://jakarta.ee/specifications/persistence/',
      type: 'documentation',
    },
  ],

  'Spring Data JPA': [
    {
      title: 'Spring Data JPA Docs',
      url: 'https://docs.spring.io/spring-data/jpa/reference/',
      type: 'documentation',
    },
    {
      title: 'JPA Tutorial',
      url: 'https://www.youtube.com/watch?v=8SGI_XS5OPw',
      type: 'video',
    },
    {
      title: 'JPA Repo',
      url: 'https://github.com/spring-projects/spring-data-examples',
      type: 'code',
    },
  ],

  // -------- MICROSERVICES --------

  Microservices: [
    {
      title: 'Spring Microservices',
      url: 'https://spring.io/microservices',
      type: 'documentation',
    },
    {
      title: 'Microservices Course',
      url: 'https://www.youtube.com/watch?v=mPPhcU7oWDU',
      type: 'video',
    },
  ],

  'Spring Cloud': [
    {
      title: 'Spring Cloud Docs',
      url: 'https://docs.spring.io/spring-cloud/docs/current/reference/html/',
      type: 'documentation',
    },
  ],

  Eureka: [
    {
      title: 'Eureka Docs',
      url: 'https://docs.spring.io/spring-cloud-netflix/',
      type: 'documentation',
    },
  ],

  // -------- TESTING --------

  Testing: [
    {
      title: 'Testing Docs',
      url: 'https://docs.spring.io/spring-boot/reference/testing/index.html',
      type: 'documentation',
    },
    {
      title: 'Testing Tutorial',
      url: 'https://www.youtube.com/watch?v=Geq60OVyBPg',
      type: 'video',
    },
  ],

  'Mock MVC': [
    {
      title: 'MockMvc Docs',
      url: 'https://docs.spring.io/spring-framework/reference/testing/',
      type: 'documentation',
    },
  ],

  '@SpringBootTest Annotation': [
    {
      title: '@SpringBootTest Docs',
      url: 'https://docs.spring.io/spring-boot/reference/testing/',
      type: 'documentation',
    },
  ],
} as const

  return {
    id,
    title,
    description: 'Spring Boot is a framework for building Java applications. It is a part of the Spring Framework and is used to create stand-alone, production-grade Spring applications.',
    resources: [...commonDocs, ...topicResources[title] ?? []],
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
