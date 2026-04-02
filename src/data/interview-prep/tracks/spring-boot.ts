import { Leaf } from 'lucide-react'
import type { InterviewTrack } from '../types'

export const springBootTrack: InterviewTrack = {
  slug: 'spring-boot',
  title: 'Spring Boot',
  description:
    'Auto-configuration, starters, REST, security, data access, and production-ready Java services.',
  accent: 'text-emerald-400',
  icon: Leaf,
  gradient:
    'from-emerald-500/20 via-green-500/10 to-transparent border border-emerald-500/30',
  questions: [
    {
      id: 'sb-1',
      question: 'What is Spring Boot auto-configuration?',
      answer:
        'Convention-over-configuration: Spring Boot inspects the classpath and existing beans, then registers sensible defaults (e.g. `DataSource` when JDBC is on the classpath). You override via properties or custom beans.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-2',
      question: 'What is the purpose of `@SpringBootApplication`?',
      answer:
        'A composite of `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`. It marks the main class and bootstraps the application context for a Boot app.',
      codeExample:
        '@SpringBootApplication\npublic class App {\n  public static void main(String[] args) {\n    SpringApplication.run(App.class, args);\n  }\n}',
      codeLanguage: 'java',
    },
    {
      id: 'sb-3',
      question: 'How do Spring starters help?',
      answer:
        'Starters are curated dependency bundles (e.g. `spring-boot-starter-web`) that pull compatible versions transitively, reducing boilerplate Gradle/Maven configuration.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-4',
      question: 'Difference between `@Controller` and `@RestController`?',
      answer:
        '`@RestController` is `@Controller` + `@ResponseBody` on all handler methods—ideal for REST JSON. Plain `@Controller` often returns view names for MVC templates unless annotated per method.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-5',
      question: 'What are the Spring bean scopes?',
      answer:
        'Singleton (default, one per container), prototype (new instance per lookup), and web scopes like request/session in servlet environments. Choose based on lifecycle and thread safety.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-6',
      question: 'Explain `@Transactional` and common pitfalls.',
      answer:
        'Declares transactional boundaries (typically on services). Self-invocation on the same class bypasses the proxy unless refactored. Rollback defaults to runtime exceptions; checked exceptions may not roll back unless configured.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-7',
      question: 'What is Spring Security’s filter chain?',
      answer:
        'A servlet filter chain that authenticates and authorizes requests before they reach controllers. Configuration defines which endpoints are public, login mechanisms, CSRF rules, etc.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-8',
      question: 'How does Spring Data JPA reduce boilerplate?',
      answer:
        'Repository interfaces extend `JpaRepository` and get CRUD and query methods for free. Custom queries via method naming, `@Query`, or Specifications.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-9',
      question: 'What is the Actuator used for?',
      answer:
        'Production endpoints for health, metrics, info, and environment—useful for Kubernetes probes and monitoring. Secure exposed endpoints in production.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-10',
      question: 'How do you externalize configuration?',
      answer:
        'Use `application.properties` / `application.yml`, profiles (`application-prod.yml`), environment variables, and `@ConfigurationProperties` for typed binding.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-11',
      question: 'What is dependency injection and why use it?',
      answer:
        'Objects receive collaborators from the container instead of constructing them. Improves testability (mocks), flexibility, and separation of concerns.',
      codeLanguage: 'java',
    },
    {
      id: 'sb-12',
      question: 'Difference between `@Component`, `@Service`, and `@Repository`?',
      answer:
        'All are stereotypes that register beans. `@Service` and `@Repository` carry semantic meaning for layers and (for repositories) may enable exception translation. Behavior is similar for component scanning.',
      codeLanguage: 'java',
    },
  ],
}
