import type { InterviewQuestion } from '../types'

/** Spring Boot sb-051–sb-075 — Data, JPA, transactions, integrations (junior–mid) */
export const SPRING_BOOT_BATCH_3: InterviewQuestion[] = [
  {
    id: 'sb-051',
    question: 'What does `spring-boot-starter-data-jpa` provide?',
    answer:
      'It pulls in Hibernate as the JPA provider, Spring Data JPA, JDBC support, and transaction management integration so you can map entities with annotations and use repository interfaces without writing boilerplate DAO classes. Auto-configuration sets up `EntityManagerFactory`, `DataSource`, and `JpaTransactionManager` when properties like `spring.datasource.url` are present. You still define `@Entity` classes and repository interfaces extending `JpaRepository`. Junior developers should know this starter does not include a database driver—you add PostgreSQL, H2, or MySQL drivers separately. Interviews mention that excluding JDBC auto-config is needed for non-database services that accidentally transitively depend on JPA. The starter aligns Hibernate and Spring Data versions with your Boot release.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-052',
    question: 'What is a Spring Data `JpaRepository` interface?',
    answer:
      'You declare an interface extending `JpaRepository<Entity, Id>` and Spring generates the implementation at runtime as a proxy. You get CRUD methods (`save`, `findById`, `delete`, `findAll`) plus pagination and sorting support without SQL strings for simple cases. Derived query methods parse method names like `findByEmailIgnoreCase` into queries. For complex SQL, use `@Query` with JPQL or native queries. This drastically reduces DAO boilerplate compared to hand-written JDBC. Interviews: mention that repositories are Spring beans injected into services. Limitations include avoiding huge derived method names—sometimes `@Query` is clearer. Transaction boundaries usually sit on the service layer calling repositories. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeExample:
      'public interface UserRepository extends JpaRepository<User, Long> {\n  Optional<User> findByEmail(String email);\n}',
    codeLanguage: 'java',
  },
  {
    id: 'sb-053',
    question: 'What is `@Entity` and a few basic JPA mapping annotations?',
    answer:
      '`@Entity` marks a class persisted to a relational table; `@Table` customizes name and indexes. `@Id` marks primary key; `@GeneratedValue` selects identity, sequence, or table strategies depending on database. `@Column` adjusts nullability, length, and precision. Relationships use `@ManyToOne`, `@OneToMany`, `@ManyToMany` with `mappedBy` for bidirectional links—junior developers often get `mappedBy` wrong and create duplicate foreign keys. `@Enumerated` controls enum storage as ordinal or string—prefer `STRING` for readability. Interviews do not require deep Hibernate tuning: know basics and that lazy loading needs an open persistence context or join fetch to avoid `LazyInitializationException` when serializing. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-054',
    question: 'What is the difference between `persist`, `merge`, and `save` in Spring Data JPA?',
    answer:
      '`EntityManager.persist` inserts a new entity and throws if detached; `merge` copies state onto a managed instance and returns the managed reference. Spring Data’s `save` method heuristically picks insert or update based on whether the entity is considered new—often checking ID nullability and versioning fields. This convenience hides some complexity but surprises beginners who expect `save` always to INSERT. For immutable IDs assigned before persist, implement `Persistable` or use explicit `persist` flows. Interviews: mention `saveAll` batching is not always one SQL statement—depends on dialect and settings. Understanding `merge` helps debug duplicate detached instances in long conversations. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-055',
    question: 'What does `@Transactional` do on a service class or method?',
    answer:
      'Spring starts (or joins) a transaction around the method, typically backed by `JpaTransactionManager` for JPA. Defaults: rollback on runtime exceptions, commit on checked exceptions unless you set `rollbackFor`. Read-only transactions can optimize Hibernate flush behavior with `readOnly=true`. The proxy applies only to external calls—self-invocation within the same class bypasses the proxy unless you refactor or use `TransactionTemplate`. Timeouts and isolation levels are configurable for data-heavy operations. Junior interviews expect awareness of rollback rules and read-only hints. Propagation `REQUIRES_NEW` creates nested independent transactions for auditing or logging—use sparingly. Always keep transactions on the service layer, not controllers. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-056',
    question: 'What is HikariCP and why is it the default connection pool?',
    answer:
      'HikariCP is a fast, lightweight JDBC connection pool Boot auto-configures when a `DataSource` is needed. Pools reuse TCP connections to the database instead of opening per request, improving latency and stability. Configure `spring.datasource.hikari.maximum-pool-size`, connection timeouts, and pool name for metrics. Wrong pool sizing causes contention or database connection exhaustion under load. Interviews: relate pool size to container thread counts and database `max_connections`. For reactive stacks, JDBC still blocks—R2DBC is a different story. Junior developers should verify datasource URL and credentials via environment variables in each environment. Pool metrics appear in Actuator and APM tools when enabled. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeExample:
      'spring:\n  datasource:\n    hikari:\n      maximum-pool-size: 10\n      pool-name: orders-pool',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-057',
    question: 'What is Flyway or Liquibase used for in Spring Boot?',
    answer:
      'They manage versioned database schema migrations applied on startup or CI, keeping environments in sync without manual SQL drift. Flyway uses SQL or Java migrations with numeric versions; Liquibase uses XML/YAML changelogs. Boot auto-runs Flyway before Hibernate if both are present—order matters for greenfield vs brownfield. Junior teams benefit from repeatable local setups: new developers run migrations automatically. Interviews: never edit applied migration files in shared environments—add new files instead. Backups before destructive changes. Test migrations against production-like data sizes when possible. Migrations complement JPA `ddl-auto` settings—turn off dangerous `create-drop` outside dev. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-058',
    question: 'What is `spring.jpa.hibernate.ddl-auto`, and what values are safe where?',
    answer:
      'This setting controls whether Hibernate generates or updates schema: common values `none`, `validate`, `update`, `create`, `create-drop`. `validate` checks entities match the schema—good for production with Flyway owning DDL. `update` mutates schema heuristically and is risky in prod. `create-drop` recreates schema on shutdown—dev/test only. Junior mistakes include leaving `update` in production and corrupting indexes. Interviews pair this with migration tools: Hibernate validates, Flyway evolves. Cloud managed databases often forbid broad DDL permissions—plan accordingly. Document chosen settings per profile to avoid accidental promotion of dev defaults. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeExample:
      'spring:\n  jpa:\n    hibernate:\n      ddl-auto: validate',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-059',
    question: 'How does pagination work with `Pageable` in Spring Data JPA?',
    answer:
      'Controller methods accept `Pageable` (page, size, sort) as a parameter; Spring binds query parameters like `?page=0&size=20&sort=name,asc`. Repository methods return `Page<T>` including total elements and total pages for UI pagination. For large tables, offset pagination deep pages become slow—keyset pagination is an advanced alternative not always required in junior answers. Interviews mention default max page size caps to prevent abuse. Sort strings must be validated or whitelisted to avoid SQL injection via sort property names—Spring Data protects somewhat but custom sorts need care. `Slice` returns a chunk without total count when counting queries are expensive. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-060',
    question: 'What is `EntityGraph` or `join fetch` at a beginner level?',
    answer:
      'Lazy-loaded associations cause extra queries (N+1) when you iterate related collections. `join fetch` in JPQL eagerly loads associations in one query. Named entity graphs (`@NamedEntityGraph`) declaratively specify which associations to fetch for a repository query. Junior optimization starts with recognizing N+1 in logs (`hibernate.show_sql` or statistics). Over-fetching large graphs hurts memory—balance eager vs lazy per use case. DTO projections or `interface`/`class` based projections fetch only needed columns for read APIs. Interviews do not require expert Hibernate tuning—awareness of fetch strategies and logging to spot N+1 suffices at mid-level. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-061',
    question: 'What is `JdbcTemplate`, and when might you use it instead of JPA?',
    answer:
      'Spring’s `JdbcTemplate` simplifies JDBC with resource management, exception translation, and concise query/update methods. Use it for complex reporting queries, bulk operations, or tight SQL control where JPA overhead or mapping is awkward. You lose automatic entity state management—map rows manually or use `RowMapper`. Boot auto-configures `JdbcTemplate` when JDBC is on classpath. Interviews: JPA for domain modeling CRUD; JDBC for performance-critical SQL or legacy schemas. Junior teams sometimes default everything to JPA—know there is a pragmatic middle ground. Combine with transactions the same as JPA calls—service-level `@Transactional` still applies. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-062',
    question: 'What is Spring Cache abstraction with `@Cacheable`?',
    answer:
      'Annotate methods to store return values in a cache keyed by parameters, reducing database or remote calls. Enable with `@EnableCaching` and configure a cache manager (Caffeine, Redis, etc.). Evict with `@CacheEvict`, update with `@CachePut`. Junior pitfall: caching entities with lazy associations can cache proxies incorrectly—prefer DTO results or ensure fully initialized data. TTL and eviction policies belong in cache configuration, not scattered logic. Interviews mention cache stampede and that `@Cacheable` self-invocation does not work without proxy—same as transactions. Use for read-heavy stable data, not rapidly changing stock quantities without invalidation strategy. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-063',
    question: 'What is `@Scheduled` and how do you enable scheduling?',
    answer:
      'Add `@EnableScheduling` and annotate methods with `@Scheduled(fixedRate=...)` or cron expressions to run background tasks in the application thread pool. Default single-threaded executor means long tasks block subsequent schedules—configure `TaskScheduler` bean for pools when needed. Cron syntax follows Spring’s six-field variant with zone support. Interviews: scheduled jobs are not durable distributed locks—two replicas run twice unless you add external coordination (ShedLock, Quartz cluster). Junior usage includes nightly cleanups and heartbeat tasks. In Kubernetes, also consider CronJobs for process-level isolation. Document timezone assumptions for cron to avoid daylight saving surprises. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-064',
    question: 'What is `@Async` in Spring Boot?',
    answer:
      'Methods annotated `@Async` run on a task executor thread pool when called through the Spring proxy from another bean. Enable with `@EnableAsync`. Useful for fire-and-forget tasks like sending email after a request returns—return `CompletableFuture` or `void`. Pitfalls: self-invocation skips async; exceptions may be swallowed unless handled; pool sizing must match workload. Interviews: not a replacement for message queues for reliability—if the process dies, in-memory tasks vanish. For mid-level, contrast with `ApplicationEvent` async listeners. Configure `spring.task.execution.pool` properties for core/max queue sizes. Misconfigured pools cause `RejectedExecutionException` under burst traffic. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-065',
    question: 'What is `spring-boot-starter-mail` used for?',
    answer:
      'It adds JavaMail support with auto-configuration of `JavaMailSender` using `spring.mail.*` properties for SMTP host, port, credentials, and TLS. You inject `JavaMailSender` to send `MimeMessage` or `SimpleMailMessage`. In production, use external SMTP providers and secrets management—never hardcode passwords. Interviews mention async sending so users are not blocked on SMTP latency. HTML emails need MIME multipart knowledge at basic level. For high volume, dedicated email platforms with APIs beat SMTP from app servers. Junior implementations should handle failures and retries or delegate to a queue worker. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-066',
    question: 'What is `spring-boot-starter-validation` and when is it required?',
    answer:
      'It brings in Hibernate Validator, the reference implementation of Jakarta Bean Validation, so annotations like `@NotNull` work on DTOs and configuration properties. Some web stacks included validation transitively; explicit starter ensures non-web modules can validate too. Without it, `@Valid` might not trigger as expected depending on classpath. Interviews: validation is split between syntactic constraints (annotations) and business rules in services. Custom constraint annotations encapsulate reusable rules. Message interpolation uses `MessageSource` for i18n. Know that validation on interfaces needs `@Validated` at class level for method-level constraints on Spring beans. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-067',
    question: 'What is `ApplicationEvent` and `ApplicationListener`?',
    answer:
      'Spring’s event system decouples components: publish `ApplicationEvent` subclasses with `ApplicationEventPublisher`, listen with `@EventListener` methods or `ApplicationListener` beans. By default listeners run synchronously in the same transaction unless marked `@Async` with async enabled—ordering via `@Order`. Use for domain events inside a monolith; for cross-service workflows prefer message brokers. Junior usage includes reacting to user registration to send welcome email. Interviews caution against infinite event chains and tangled graphs. Testing uses `ApplicationEvents` capture in Spring Boot tests. Events are not persisted—if you need audit trails, store them explicitly. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-068',
    question: 'What is `spring-boot-starter-actuator`?',
    answer:
      'Actuator exposes production-ready endpoints over HTTP or JMX for health, metrics, environment, loggers, and more—essential for Kubernetes liveness/readiness probes and monitoring. Secure sensitive endpoints in production via Spring Security and network policies—do not leave `/env` public. Configure `management.endpoints.web.exposure.include` minimally. Health indicators aggregate database, disk, and custom checks. Junior developers learn the difference between liveness (process up) and readiness (can serve traffic). Metrics export integrates with Micrometer for Prometheus. Custom health indicators implement `HealthIndicator` interface. Actuator is a standard interview topic for “how do you operate Spring Boot in prod?”. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-069',
    question: 'What is the difference between `/actuator/health/liveness` and `/readiness`?',
    answer:
      'Kubernetes uses separate probes: liveness determines if the container should restart, readiness determines if traffic should route to the pod. Spring Boot exposes grouped health endpoints you can enable for platforms that expect those paths. Misconfigured probes cause restart loops or traffic to unhealthy instances. Readiness should fail when the app cannot reach the database or mandatory dependencies; liveness should stay tolerant of transient blips to avoid flapping. Junior operators copy examples without tuning timeouts—coordinate `initialDelaySeconds` with startup time. Interviews mention Boot 2.3+ proactive health indicators and that custom checks should be fast. Document which dependencies are critical for readiness.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-070',
    question: 'What is Micrometer and how does it relate to metrics?',
    answer:
      'Micrometer provides a facade for timers, counters, gauges, and distribution summaries that bind to backends like Prometheus, Datadog, or CloudWatch via registry implementations. Boot auto-configures metrics for JVM, web requests, and datasource pools. You inject `MeterRegistry` to record custom business metrics such as orders placed. Junior interviews: metrics differ from logs—aggregated time series versus discrete events. Use tags carefully to avoid high cardinality explosions (unique user IDs as tags are bad). `management.metrics.export.*` properties enable exporters. Understanding Micrometer explains Actuator `/actuator/metrics` output and Grafana dashboards. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-071',
    question: 'What is `@SpringBootTest` and when is it appropriate?',
    answer:
      'It loads the full application context (or a subset with properties) for integration tests—slower but realistic. Use `WebEnvironment.RANDOM_PORT` with `TestRestTemplate` or `WebTestClient` for end-to-end HTTP tests, or `MOCK` with `MockMvc`. Pair with Testcontainers to spin real databases in Docker for fidelity. Junior teams sometimes overuse full tests for everything—balance with slice tests. `@Transactional` on tests rolls back database changes per test method when using JPA—convenient but hides integration issues; sometimes commit tests are needed. Interviews mention `@MockBean` to replace collaborators. Context caching speeds suites when configurations reuse the same setup. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-072',
    question: 'What is `@DataJpaTest`?',
    answer:
      'It loads only JPA-related configuration—repositories, entity manager, datasource—using an embedded or test database by default, keeping tests faster than `@SpringBootTest`. You autowire repositories to verify queries against real SQL semantics. Use `@AutoConfigureTestDatabase` to point at Testcontainers Postgres instead of H2 when dialect features differ. Interviews: note `@DataJpaTest` is transactional rollback by default. Controllers are not loaded—use `@WebMvcTest` separately. This slice suits repository query method tests and custom `@Query` verification. Junior developers confuse slice annotations—memorize what each loads to pick the smallest working test. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-073',
    question: 'What is Testcontainers at a high level with Spring Boot?',
    answer:
      'Testcontainers starts disposable Docker containers for databases, Kafka, or other dependencies during JUnit tests, then tears them down afterward. Spring Boot provides `@DynamicPropertySource` to wire random container ports into `spring.datasource.*` before context starts. This yields integration tests closer to production than H2 alone. Requirements: Docker available on CI runners. Interviews acknowledge slower tests and resource usage—run selectively in pipelines or nightly builds. Junior teams on laptops need sufficient RAM for containers. Alternative is shared test environments, but they cause flaky collisions. Testcontainers improves confidence in SQL migrations and vendor-specific features. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-074',
    question: 'What is `spring.test.mock.mockito` `@MockBean`?',
    answer:
      'In Spring tests, `@MockBean` replaces a bean in the context with a Mockito mock, useful in `@WebMvcTest` to stub service dependencies controllers call. It changes the context hash so caching may split—use only where needed. Contrast with plain `@Mock` in unit tests without Spring. `@SpyBean` wraps real beans partially. Interviews: too many `@MockBean` in a `@SpringBootTest` suggests the test is not focused. Verify interactions with `verify` when behavior matters. Junior developers learn to combine slice tests + `@MockBean` for fast controller tests without database startup. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-075',
    question: 'How do you externalize secrets for Spring Boot in production (high level)?',
    answer:
      'Never commit secrets to `application.yml` in git. Use environment variables, Kubernetes Secrets mounted as env or files, cloud secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault), or Spring Cloud Config with encryption for centralized config. Spring resolves `${VAR}` placeholders from the environment with relaxed binding. Local development uses `.env` tools or IDE run configs gitignored. Interviews mention rotating credentials without redeploying when platform supports hot reload—rare for JDBC pools without restart. Actuator `/env` redacts values when configured. Junior engineers should understand 12-factor config principles even if ops owns vault tooling. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'yaml',
  },
]
