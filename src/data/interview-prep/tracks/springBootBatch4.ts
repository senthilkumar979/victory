import type { InterviewQuestion } from '../types'

/** Spring Boot sb-076–sb-100 — Security, ops, testing, delivery (junior–mid) */
export const SPRING_BOOT_BATCH_4: InterviewQuestion[] = [
  {
    id: 'sb-076',
    question: 'What is Spring Security’s `SecurityFilterChain` in Spring Boot 3 style configuration?',
    answer:
      'Modern Spring Security uses a `SecurityFilterChain` bean built with `HttpSecurity` DSL: you declare which endpoints are public, how login works, CSRF rules, and which filters apply. Boot auto-configures a default chain you replace with a `@Bean` of type `SecurityFilterChain`. This replaces much of the old `WebSecurityConfigurerAdapter` inheritance style. Junior developers learn `authorizeHttpRequests`, `requestMatchers`, and `permitAll` vs `authenticated`. Order matters when defining multiple chains. Interviews at mid-level expect a verbal sketch of securing `/actuator/**` differently from `/api/**`. CSRF defaults protect browser forms but are often disabled for stateless JWT APIs—understand trade-offs. OAuth2 resource server configuration is another chain variant using JWT decoders.',
    codeExample:
      '@Bean\nSecurityFilterChain chain(HttpSecurity http) throws Exception {\n  http.authorizeHttpRequests(a -> a.anyRequest().authenticated())\n     .httpBasic();\n  return http.build();\n}',
    codeLanguage: 'java',
  },
  {
    id: 'sb-077',
    question: 'What is the default password user Spring Security creates in development?',
    answer:
      'When Spring Security is on the classpath and no user is configured, Boot generates a random password for a default user `user` printed once in logs at startup, along with a generated security password property you can override with `spring.security.user.name/password` for local dev. This prevents accidentally running an open server. In production you replace this with database users, LDAP, or OAuth2. Junior engineers should recognize the log line and know how to set fixed credentials locally without committing them. Interviews: never ship default `user` password to prod. Combine with profiles so `user` exists only in `dev`. Document how teammates obtain credentials through secret stores rather than Slack screenshots.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-078',
    question: 'What is CSRF protection, and when is it disabled in APIs?',
    answer:
      'Cross-Site Request Forgery protections ensure state-changing browser requests include a token tied to the session, blocking malicious sites from submitting forms as a logged-in user. Spring Security enables CSRF by default for cookie-based sessions. Stateless APIs using JWT in `Authorization` headers often disable CSRF because browsers do not attach custom headers in simple cross-site requests without CORS cooperation. Disabling CSRF without understanding session usage is dangerous. Junior interviews: know CSRF matters for form login + cookies; less for pure token APIs. If you use cookies to hold tokens, revisit CSRF strategy. SameSite cookie attributes also mitigate some CSRF vectors. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-079',
    question: 'What is `UserDetailsService`?',
    answer:
      'It is an interface Spring Security calls to load users by username into a `UserDetails` object containing password hash, authorities, and account flags. You implement it to load from your database or LDAP. Boot can auto-configure an in-memory user if none provided—development only. Passwords must be stored with strong hashing like BCrypt (`{bcrypt}` prefix in delegating password encoder). Junior candidates connect this to login forms or HTTP basic. Interviews mention caching user lookups carefully to avoid database hits every request and to avoid N+1 when loading roles. For OAuth2, user mapping differs—resource servers validate tokens instead. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-080',
    question: 'What does `@PreAuthorize` do?',
    answer:
      'Method security annotation that checks SpEL expressions before method execution, such as `hasRole("ADMIN")` or `hasAuthority("order:write")`. Enable with `@EnableMethodSecurity` (Spring Security 6) replacing older `@EnableGlobalMethodSecurity`. Useful for fine-grained authorization beyond URL rules—service-layer checks. Pitfalls: proxies again—self-invocation bypasses unless using AspectJ mode rarely configured. Junior usage is moderate; URL security covers many apps. Interviews: combine URL-level coarse security with method-level for sensitive operations. Testing uses `@WithMockUser` in Spring Security test support. Expressions must stay simple for readability—complex SpEL belongs in dedicated services. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-081',
    question: 'What is Spring Boot’s OAuth2 resource server support at a basic level?',
    answer:
      'Add `spring-boot-starter-oauth2-resource-server` and configure `spring.security.oauth2.resourceserver.jwt.issuer-uri` or JWK set URI so Boot validates JWT signatures and exposes authorities as `Jwt` authentication tokens. Controllers stay mostly unchanged; security maps scopes or claims to roles. Junior interviews stop at “JWT validated centrally; no session cookies needed”. Custom converters map claims to `GrantedAuthority`. Know that token expiration and clock skew errors surface as 401. This is not a deep OAuth2 server implementation—that is separate. Many microservices act only as resource servers while an identity provider issues tokens. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeExample:
      'spring:\n  security:\n    oauth2:\n      resourceserver:\n        jwt:\n          issuer-uri: https://idp.example.com/',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-082',
    question: 'What is `spring-security-test` used for?',
    answer:
      'It provides `mockMvc` request post-processors like `SecurityMockMvcRequestPostProcessors.jwt()` and annotations like `@WithMockUser` to simulate authentication in MVC tests without a real IdP. You verify that secured endpoints return 401/403 appropriately. Junior developers learn security tests alongside `@WebMvcTest`. For OAuth2 JWT, custom `jwt()` builders set scopes. Integration tests may use real tokens against a test issuer when needed—heavier. Interviews: security regressions are common—automate them. Remember to test both happy path authorized and forbidden roles. Combine with `@Import` of security configuration in slice tests. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-083',
    question: 'What is the `spring-boot-maven-plugin` `repackage` goal?',
    answer:
      'It builds the executable JAR layout with `BOOT-INF/classes` and `BOOT-INF/lib` so `java -jar` works, setting `Main-Class` to Spring Boot’s loader and `Start-Class` to your application. Without it, `java -jar` fails missing dependencies on classpath. Other goals include `build-info` for actuator and `run` for dev. Gradle’s `bootJar` is analogous. Junior build issues often stem from skipping the plugin in parent POM merges. Interviews mention layered jars for Docker efficiency. The plugin also provides `spring-boot:build-image` integration with Cloud Native Buildpacks for OCI images without writing Dockerfiles—handy for mid-level DevOps awareness. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-084',
    question: 'What environment variables commonly override Spring Boot properties in containers?',
    answer:
      'Relaxed binding maps `SERVER_PORT` to `server.port`, `SPRING_PROFILES_ACTIVE` to `spring.profiles.active`, and `SPRING_DATASOURCE_URL` to `spring.datasource.url`. Kubernetes manifests set these in deployment specs. This pattern keeps images immutable while configuration varies per environment. Junior developers troubleshoot typos—wrong env var names silently fall back to defaults. Interviews mention Spring Boot’s documentation appendix listing binding rules. Secrets often arrive as env vars from sealed secrets operators. Prefer env for simple keys; mounted files for multi-line PEM certificates. Understanding binding reduces “works in YAML but not in K8s” confusion. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-085',
    question: 'What is Spring Boot’s `build-info` / `git.properties` for Actuator `/info`?',
    answer:
      'The Maven or Gradle plugin can generate `build-info.properties` with version and time, while `git-commit-id-plugin` adds git commit metadata. Actuator `/info` exposes these when configured, helping operators verify deployed artifacts during incidents. Junior teams surface version mismatches between pods quickly. Sanitize sensitive git properties if any. Not every org enables `/info` publicly—often behind auth. Interviews connect this to traceability between CI build numbers and running services. It complements container image labels. Knowing this exists shows operational maturity beyond coding endpoints. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-086',
    question: 'What is `management.server.port` used for?',
    answer:
      'It binds Actuator endpoints to a separate management port and optionally a different network interface—separating health/metrics traffic from the public API port. Kubernetes can probe management port without exposing metrics paths on the main service. Security policies can firewall management differently. Junior configuration often ignores this until compliance asks to isolate admin endpoints. Trade-off: more ports to expose correctly in service meshes. Interviews mention dual ports complicate local dev unless documented. Default is same port as application. Use when operational separation clearly outweighs complexity for your platform team. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeExample:
      'management:\n  server:\n    port: 9091',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-087',
    question: 'What is `spring.jackson.serialization.write-dates-as-timestamps` about?',
    answer:
      'By default older Jackson settings wrote dates as epoch numbers; disabling writes ISO-8601 strings which are easier for JavaScript clients to parse consistently. Boot exposes multiple Jackson properties under `spring.jackson.*` to tune serialization without code. Time zone and `JavaTimeModule` registration matter for `Instant` and `LocalDateTime`. Junior bugs appear as off-by-one-day errors around UTC versus local zones. Interviews: agree API date format in team standards—usually UTC ISO strings. Custom `@JsonFormat` on fields overrides global defaults for exceptions. Document choices in OpenAPI schemas so clients code generators stay aligned. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-088',
    question: 'What is `server.error.include-message` / `include-binding-errors`?',
    answer:
      'These control how much detail Spring Boot’s default error JSON includes for clients—helpful in dev (`always`) but often minimized in prod (`never`) to avoid leaking validation messages that reveal internals. You still log full details server-side. Junior security reviews flag verbose error pages. Custom `ErrorController` or `@ControllerAdvice` replaces defaults in mature APIs. Interviews pair with RFC 7807 `ProblemDetail` support in newer Spring versions for consistent problem responses. Operators tune this alongside Actuator exposure. Never include stack traces to browsers in production unless intentionally behind authenticated admin tools. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-089',
    question: 'What is `spring.sql.init` for schema/data scripts?',
    answer:
      'Spring Boot can run `schema.sql` and `data.sql` from classpath on startup for embedded or always-init modes—convenient demos but often replaced by Flyway in real projects. Properties control mode `always`, `embedded`, or `never` and platform detection. Junior mistakes run destructive scripts against shared databases—treat with care. Interviews: prefer Flyway for teams; SQL init for quick prototypes. Order relative to JPA `ddl-auto` matters—document startup sequence. Custom scripts naming and `continue-on-error` flags appear in edge migrations. Knowing this explains older tutorials still using `data.sql` for seed users. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-090',
    question: 'What is `SpringApplicationBuilder` parent/child context used for?',
    answer:
      'It constructs hierarchical application contexts where a parent shares beans with children—occasionally used in modular apps or to run admin and user interfaces separately. Rare in typical microservices. Junior interviews rarely need hands-on experience; awareness suffices. Misuse increases complexity and bean visibility bugs. Most teams prefer single context or separate processes instead of parent/child within one JVM. If you see it in legacy code, reason about which beans inherit and which `@PropertySource` applies. Modern modular monoliths often choose Spring Modulith or package boundaries instead. Answer briefly unless interviewer digs into legacy maintenance. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-091',
    question: 'What is `spring-boot-starter-aop`?',
    answer:
      'Aspect-Oriented Programming with Spring uses proxies to intercept methods for cross-cutting concerns: logging, metrics, retries, transactions. `@Aspect` beans with pointcuts advise join points. Enable with `@EnableAspectJAutoProxy` or rely on Boot auto-config when starter present. Junior usage includes `@Timed` custom aspects or auditing. Pitfalls: self-invocation bypasses aspects like transactions; only public methods on Spring beans are advised by default proxy mode. Interviews: know difference between JDK dynamic proxies (interfaces) and CGLIB (classes). Too many aspects obscure control flow—balance with explicit code for core business rules. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-092',
    question: 'What is `RetryTemplate` or Spring Retry at a glance?',
    answer:
      'Spring Retry adds declarative or imperative retries for transient failures (network blips) with backoff policies. Spring Boot integrates via `spring-retry` and `@Retryable` on methods—requires enabling retry processing. Use wisely: retries can amplify outages if misapplied to non-idempotent operations without deduplication. Junior interviews mention idempotency keys for payments. Combine with circuit breakers (Resilience4j) in more advanced setups—mid-level awareness only. Logging retry attempts helps diagnostics. Default unlimited retries are dangerous—cap attempts and respect timeouts. Cloud SDK clients often have their own retry policies—avoid double retry stacks. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-093',
    question: 'What is `spring-boot-properties-migrator`?',
    answer:
      'A temporary dependency that flags renamed or removed configuration keys when upgrading Spring Boot major versions, printing hints at runtime. Remove it after fixing properties—do not leave in production long term. Junior upgrades benefit from reading release notes plus migrator output. Interviews show you know upgrade paths involve property renames, not only code. Example changes happen in security, actuator, and datasource keys across Boot 2 to 3. Combine with `spring-boot-starter-parent` release notes. Automated migration tools in IDEs also help. Document property changes in team upgrade runbooks for repeatable major bumps. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-094',
    question: 'How would you describe Spring Boot to a non-technical stakeholder in one paragraph?',
    answer:
      'Spring Boot is a toolkit that helps Java teams ship web services and batch jobs quickly by bundling common parts—web server, database access, security, monitoring hooks—into a ready-to-run package with sensible defaults. Developers focus on business features instead of wiring hundreds of library versions manually. Operators get standard health checks and metrics that plug into Kubernetes and cloud dashboards. When requirements change, teams adjust configuration files rather than rewriting infrastructure code. It is widely used in enterprises because it balances speed with the ability to customize when products mature. This explanation avoids jargon while conveying why companies standardize on Boot for microservices and internal APIs.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-095',
    question: 'What is the `spring.application.name` property used for?',
    answer:
      'It sets a logical service name appearing in logs, metrics tags, Spring Cloud discovery registrations, and trace correlation. Consistent naming helps operators filter dashboards and alerts. In monorepos with multiple deployables, each gets a distinct name. Junior mistakes leave default `application` everywhere—hard to diagnose in centralized logging. Interviews: pair with Micrometer `service.name` tags where applicable. Some platforms inject name from deployment metadata—ensure alignment. Documentation should list canonical service names for on-call routing. It is a small property with outsized operational impact in large estates. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeExample:
      'spring:\n  application:\n    name: order-service',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-096',
    question: 'What is `logging.pattern.correlation` or MDC for request tracing?',
    answer:
      'Mapped Diagnostic Context stores per-request values like trace ID in `ThreadLocal`, and logging patterns include them so log lines correlate across services. Spring Cloud Sleuth or Micrometer Tracing auto-populates IDs with propagators. Junior developers learn to avoid leaking PII into MDC. Clear MDC after requests in filters to prevent leakage in thread pools. Interviews: tracing complements metrics—use both. In reactive code MDC propagation requires Reactor context hooks—mid complexity. At minimum, know trace IDs improve incident response. Operators search logs by single ID across nginx, app, and database audit trails when instrumented end-to-end. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-097',
    question: 'What is `springdoc` / `springfox` confusion beginners should understand?',
    answer:
      'Springfox was a popular Swagger generator for older Spring versions; many teams migrating to Spring Boot 3 and Spring Framework 6 moved to `springdoc-openapi`, which aligns with Jakarta EE package renames and current WebMvc APIs. Using outdated generators yields broken docs or startup errors. Junior candidates should verify tutorial dates match their Boot version. Interviews: library choice is part of upgrade planning, not just dependency bump. OpenAPI 3 is the modern spec version. Keep documentation dependencies updated with Boot BOM. Broken Swagger in prod is often a classpath or security config issue—check permit rules for `/v3/api-docs`. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-098',
    question: 'What is `EntityManager` briefly, and how does it relate to repositories?',
    answer:
      'JPA `EntityManager` is the persistence context API for `persist`, `merge`, `find`, `createQuery`, and `flush`. Spring Data repositories hide most direct usage but you can inject `EntityManager` for custom JPQL or bulk operations when repositories feel awkward. `EntityManager` participates in the same transaction as repository calls. Junior interviews: know it exists under the hood when debugging Hibernate session issues. `getReference` returns lazy proxies—surprise NPEs if misused. Prefer repositories for readability; drop to `EntityManager` for targeted cases. Understanding flush timing clarifies when constraints hit the database relative to method exit. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-099',
    question: 'What checklist items would you verify before deploying a new Spring Boot service to staging?',
    answer:
      'Confirm datasource URL and credentials via environment, profiles active (`prod`/`staging`), actuator health and metrics exposed appropriately with security, graceful shutdown timeouts aligned with load balancer drains, logging JSON format if required by platform, JVM memory limits matching container cgroup, database migrations applied, and smoke tests for critical endpoints. Review CORS and security rules—not just happy-path 200s. Junior engineers use checklists to avoid repeating “works locally” failures. Interviews reward mentioning rollback strategy and feature flags. Document dependencies on other services for readiness probes. This question tests operational thinking, not deep tuning. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-100',
    question: 'How do you approach learning a new Spring Boot major version upgrade on a team project?',
    answer:
      'Read the official release notes and migration guide for breaking changes in your jump (for example Boot 2.x to 3.x involves Jakarta namespace, security DSL changes, and baseline Java version). Create a spike branch, enable migrator dependency, run the full test suite, and fix deprecations before flipping versions in CI. Upgrade Spring Framework and third-party starters together using the BOM. Schedule time for security filter rewrites and Hibernate dialect changes. Communicate with infrastructure about new Java LTS requirements. Junior engineers pair with seniors on the first upgrade to learn systematic steps. Record lessons in an internal wiki so the next service upgrades faster. Pace yourself—major upgrades are team efforts, not silent Friday merges.',
    codeLanguage: 'java',
  },
]
