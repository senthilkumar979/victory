import type { InterviewQuestion } from '../types'

/** Spring Boot sb-001–sb-025 — fundamentals & configuration (junior) */
export const SPRING_BOOT_BATCH_1: InterviewQuestion[] = [
  {
    id: 'sb-001',
    question: 'What problem does Spring Boot solve compared to plain Spring Framework?',
    answer:
      'Plain Spring gives you a powerful programming model but leaves a lot of assembly work: choosing compatible library versions, wiring XML or Java configuration for common infrastructure, and wiring a servlet container. Spring Boot is an opinionated layer on top that favors sensible defaults and convention over configuration. It provides starters that bundle dependencies with tested versions, auto-configuration that activates beans when certain libraries are on the classpath, and an embedded server so you can run `java -jar` without deploying a separate WAR to Tomcat. For junior engineers the payoff is speed: you scaffold a service, add a starter, and get a working REST stack or database access with minimal XML. You still learn Spring concepts like beans and dependency injection underneath; Boot does not replace them. In interviews you should say Boot reduces boilerplate and operational friction while remaining customizable through properties, exclude rules, and your own `@Configuration` classes when defaults are wrong.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-002',
    question: 'What is Spring Boot auto-configuration at a high level?',
    answer:
      'Auto-configuration is a set of `@Configuration` classes, usually conditional, that register beans when the framework detects relevant classes and properties on the classpath. For example, if JDBC drivers and a datasource URL are present, Boot may configure a `DataSource` and a `JdbcTemplate` without you writing that wiring by hand. Conditions use annotations such as `@ConditionalOnClass`, `@ConditionalOnMissingBean`, and `@ConditionalOnProperty` so your own beans take precedence. This is why adding `spring-boot-starter-web` suddenly gives you an embedded Tomcat and Spring MVC: the conditions match. Candidates should mention that auto-config can be disabled or narrowed with `spring.autoconfigure.exclude` and that understanding conditions helps debug “why did Boot create this bean?”. It is not magic—just ordered configuration loaded after your application context starts, guided by `spring.factories` / `AutoConfiguration.imports` depending on Boot version.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-003',
    question: 'What does `@SpringBootApplication` include, and why use one annotation?',
    answer:
      '`@SpringBootApplication` is a composed annotation that bundles `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan` (by default scanning the package of the annotated class and sub-packages). That makes your main class the anchor for both component discovery and Boot’s auto-configuration entry point. Using one stereotype reduces noise in the main class and matches what tutorials and IDEs generate. In interviews you should be able to split it mentally: configuration class + scanning + auto-config enablement. If you need to scan other packages, you add `@ComponentScan` attributes or place configuration carefully. Some teams disable auto-configuration selectively for tests or microservices with unusual classpath layouts, but the default is appropriate for most REST services.',
    codeExample:
      '@SpringBootApplication\npublic class DemoApplication {\n  public static void main(String[] args) {\n    SpringApplication.run(DemoApplication.class, args);\n  }\n}',
    codeLanguage: 'java',
  },
  {
    id: 'sb-004',
    question: 'What are Spring Boot starters, and how do they relate to Maven or Gradle?',
    answer:
      'Starters are dependency descriptors like `spring-boot-starter-web` or `spring-boot-starter-data-jpa` that pull in a curated set of libraries through transitive dependencies. The Boot team manages version alignment via the Spring Boot BOM so you avoid mixing incompatible Spring Framework, Jackson, and Tomcat versions manually. In Maven you typically import `spring-boot-dependencies` as `dependencyManagement`; in Gradle you use the Boot plugin’s BOM. Starters are not JARs full of business code—they are POMs that group dependencies. Junior candidates should explain that starters speed onboarding: add one line, refresh dependencies, and you have Tomcat plus MVC or Hibernate plus JDBC. For interviews mention that you can still override a version with care when a CVE fix requires it, but random overrides can break compatibility.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-005',
    question: 'What is dependency injection in Spring, and why prefer constructor injection?',
    answer:
      'Dependency injection means the Spring container creates objects and supplies their collaborators instead of each class calling `new` for everything. That improves testability because you can inject mocks, and it clarifies required dependencies in one place. Constructor injection is recommended for mandatory dependencies: the object is fully usable after construction, fields can be `final`, and circular dependencies fail early rather than hiding half-initialized beans. Field injection with `@Autowired` is common in older samples but makes testing and immutability harder. Setter injection suits optional dependencies. In Spring Boot interviews you should connect DI to interfaces: program to `PaymentService` and swap implementations via profiles or tests. Mention that the container manages singleton lifecycle by default, so injected beans are shared unless scoped otherwise.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-006',
    question: 'Difference between `@Component`, `@Service`, and `@Repository` in practice?',
    answer:
      'All three are specialization stereotypes of `@Component` that tell Spring to class-scan and register a bean. Functionally they behave the same for creation: you get a singleton bean in the application context unless another scope applies. The extra annotations communicate intent in layered architectures: `@Repository` for persistence adapters, `@Service` for application services, `@Controller` / `@RestController` for web endpoints. Historically `@Repository` also enabled exception translation to Spring’s `DataAccessException` hierarchy via AOP, which still matters for classic JDBC and JPA setups. Interviewers like hearing that naming improves readability in code reviews and that packages can mirror layers (`com.example.order.service`). None of these annotations replace interface-based design—they are organizational sugar on top of Spring’s component model.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-007',
    question: 'What are Spring bean scopes, and which one do you use most often?',
    answer:
      'The default scope is singleton: one bean instance per Spring container, shared by all injectees—ideal for stateless services. Prototype scope creates a new instance every time the bean is requested, useful for objects that carry per-use state but must be managed carefully with singleton consumers. In a web application you also have request, session, and application scopes tied to the servlet container; these require a proxy when injected into longer-lived singletons. For junior REST services you almost always stay singleton and keep HTTP-specific data in method parameters rather than in beans. Wrong scope choices cause subtle bugs such as leaking user data between requests. Interview answer: know the default, know prototype exists, and know request scope is for rare cases like per-request audit context with proxies.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-008',
    question: 'What does `@Qualifier` do, and when do you need it alongside `@Autowired`?',
    answer:
      'When multiple beans implement the same type, Spring cannot choose which one to inject by type alone and throws `NoUniqueBeanDefinitionException`. `@Qualifier("beanName")` disambiguates by the bean’s default name (usually the decapitalized class name unless overridden) or a custom qualifier value. You can also mark one implementation with `@Primary` to make it the default while still allowing qualifiers for alternates. In configuration classes, `@Bean` method names define bean names. For interviews mention that constructor injection plus explicit qualifiers is clearer than field injection. Qualifiers also appear in multi-tenant or feature-flagged implementations where two `NotificationSender` beans coexist—one for email, one for SMS. Understanding this prevents “works on my machine” issues when someone adds a second implementation.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-009',
    question: 'How do `application.properties` and `application.yml` externalize configuration?',
    answer:
      'Spring Boot loads configuration from files on the classpath and from external locations, binding keys to beans and to the `Environment`. `application.properties` is line-oriented `key=value`; YAML is hierarchical and can reduce repetition for nested settings. Profile-specific files such as `application-dev.yml` layer on top when `spring.profiles.active` includes `dev`. External overrides from environment variables (with relaxed binding) and command-line arguments win for twelve-factor style deployments. Junior developers should know never to commit secrets into YAML checked into git—use env vars or a secret manager in production. Interviews often ask how to change the server port (`server.port`) or log levels without recompiling. Mention `spring.config.import` for optional config trees in newer Boot versions when relevant.',
    codeExample:
      'server:\n  port: 8081\nspring:\n  application:\n    name: order-service',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-010',
    question: 'What are Spring profiles, and how would you use `dev` vs `prod`?',
    answer:
      'Profiles label a set of beans or property files that should be active together, for example `dev`, `staging`, or `prod`. You activate them with `spring.profiles.active` or environment variables in deployment. Typical usage is separate datasource URLs, logging verbosity, and feature toggles. `@Profile("dev")` on a `@Configuration` or `@Bean` registers beans only when that profile is on, which is handy for in-memory databases or stub payment clients. In production you keep profiles minimal and rely on environment-specific secrets rather than baking credentials into JARs. Interview pitfall: forgetting that a bean missing its profile leaves the context without a required dependency—errors at startup are actually good here. Explain that profiles are not a security boundary by themselves; they are an organization tool.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-011',
    question: 'Compare `@Value` with `@ConfigurationProperties` for binding configuration.',
    answer:
      '`@Value("${app.feature}")` injects individual properties, supports SpEL, and is fine for one-off flags or URLs. `@ConfigurationProperties` binds a structured prefix to a type-safe POJO with validation, which scales better for dozens of related keys like `app.mail.host`, `app.mail.port`. The properties class can use `@Validated` with JSR-303 annotations for early failure on bad config. Boot generates metadata for IDE autocomplete when you add the configuration processor dependency. Interviews: say `@Value` is quick but scatters magic strings; `@ConfigurationProperties` groups settings and documents them in one class. Enable the POJO with `@EnableConfigurationProperties` or register it as a `@Component`. This distinction is common in mid-level code review discussions.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-012',
    question: 'What is `SpringApplication.run`, and what does it return?',
    answer:
      '`SpringApplication.run(Main.class, args)` bootstraps the Spring context, registers listeners, applies environment processing, runs `ApplicationRunner` and `CommandLineRunner` beans, and starts the embedded web server if the web starter is present. It returns a `ConfigurableApplicationContext` you can hold for programmatic shutdown or bean lookups in non-web tools—most apps ignore the return value. The method also sets up failure analyzers that print helpful messages for common misconfigurations like missing datasource URL. Junior candidates should connect `main` to the lifecycle: context refresh, bean creation, and server start. In tests you often use `@SpringBootTest` which builds a similar context. Mention that `SpringApplicationBuilder` exists for parent/child contexts in advanced setups but is rare in simple microservices.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-013',
    question: 'What is the difference between `CommandLineRunner` and `ApplicationRunner`?',
    answer:
      'Both run after the Spring context is up and are useful for one-time startup tasks such as seeding reference data or printing diagnostics. `CommandLineRunner` receives raw `String[]` args similar to `main`. `ApplicationRunner` wraps arguments in `ApplicationArguments`, exposing option and non-option arguments in a structured way. If order matters among multiple runners, implement `Ordered` or use `@Order`. They run on the main thread by default, so long blocking work delays readiness—prefer async jobs or defer heavy work for production services. Interviewers use this question to see if you understand startup sequencing versus request handling. Do not misuse runners for request-time logic; that belongs in controllers or scheduled jobs.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-014',
    question: 'How does Spring Boot configure logging out of the box?',
    answer:
      'Boot ships with default Logback configuration (`spring-boot-starter-logging`) and maps `logging.level.*` properties to logger levels without writing XML unless you need custom appenders. You can drop `logback-spring.xml` for advanced routing and use Spring profiles inside it with `<springProfile>`. Console output is JSON-friendly in cloud deployments via community or custom encoders. Junior developers should prefer structured logging fields (MDC) over string concatenation for trace IDs. Interviews: mention that `logging.file.name` or Logback rolling policies handle file output on VMs, while containers often log only to stdout and let the platform aggregate. Changing levels at runtime may use Actuator loggers endpoint when exposed safely. Understanding default logging avoids shipping println debugging to production.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-015',
    question: 'What is the Spring Boot parent POM or BOM used for?',
    answer:
      'In Maven, `spring-boot-starter-parent` provides default plugin configuration (compiler, surefire, repackage), resource filtering, and property placeholders like `${java.version}`. Alternatively, teams import `spring-boot-dependencies` as `dependencyManagement` to keep BOM alignment without inheriting the parent—common in corporate parents. Gradle uses the Spring Boot plugin’s dependency management block similarly. The goal is consistent versions: if Boot 3.2 pins Jackson X, your app picks that unless you override. Interview answer: parent/BOM is about maintainability and security patching across hundreds of transitive libraries. Junior devs should not hand-pick Spring Framework versions beside Boot unless they understand compatibility matrices. Mention that the repackage goal builds the executable fat JAR with `Main-Class` and `Start-Class` manifest entries.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-016',
    question: 'What is an executable fat JAR, and why does Spring Boot build one?',
    answer:
      'A fat JAR (also called uber JAR) bundles your application classes plus third-party dependencies and the embedded container into a single file you can run with `java -jar`. Spring Boot’s loader allows nested JARs without exploding everything on disk, preserving classpath isolation. This simplifies deployment to containers and PaaS: copy one artifact and set environment variables. Trade-offs include larger images and slower layer caching if you rebuild the whole JAR for every code change—some teams use layered JARs or buildpacks to optimize Docker layers. Interviews: contrast with traditional WAR deployment to external Tomcat. Mention `spring-boot-maven-plugin` `repackage` goal or Gradle `bootJar` task. Know that `java -jar` requires the main manifest from Boot’s build plugin, not a plain `jar` task alone.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-017',
    question: 'What is `@Configuration` and how does it differ from stereotype components?',
    answer:
      '`@Configuration` marks a class as a source of `@Bean` definitions processed by Spring’s configuration model. In full mode, `@Configuration` classes are subclassed with CGLIB proxies so that `@Bean` method calls respect singleton semantics when one `@Bean` method calls another within the same class. LITE mode (`@Configuration(proxyBeanMethods = false)`) skips those proxies for faster startup when beans do not cross-call. Stereotype components (`@Service`, etc.) are discovered by scanning and typically use constructor injection rather than declaring `@Bean` methods. Interviews: explain that Java-based config replaced most XML, and that `@Bean` is how you integrate third-party libraries you cannot annotate. Knowing `proxyBeanMethods` shows mid-level familiarity with Boot 2.2+ startup optimizations.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-018',
    question: 'What does `@ConditionalOnProperty` do in custom auto-configuration?',
    answer:
      'It registers a `@Configuration` or `@Bean` only when a given property matches an expected value, enabling feature toggles without if-statements scattered through code. For example, enable a mock payment client when `app.payments.mock=true`. This pattern appears in shared libraries and internal starters. Combined with `@ConditionalOnMissingBean`, teams ship defaults that applications can override cleanly. Junior developers should not overuse dozens of toggles—clear profiles are often simpler. Interview talking point: conditions make beans explicit in the condition report (`--debug` or Actuator) which helps answer “why is this bean missing?”. Understand that misspelled property names silently skip configuration, so tests should cover both on and off states.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-019',
    question: 'How can you disable a specific auto-configuration class?',
    answer:
      'Use `@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)` or list classes in `spring.autoconfigure.exclude` as a property for environments without databases. This is common for batch jobs or messaging-only services that accidentally pulled JDBC transitively. Alternatively provide your own bean of the same type so `@ConditionalOnMissingBean` suppresses the auto-config path—prefer that when you only replace one piece. Interviewers want to hear that excludes should be intentional and documented, not copied from Stack Overflow without understanding classpath contents. The condition evaluation report lists what matched. For modular tests, `@EnableAutoConfiguration` with excludes on slice tests keeps contexts fast. Know that excluding too much can remove health indicators you expected.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-020',
    question: 'What is lazy initialization in Spring Boot, and what are trade-offs?',
    answer:
      '`spring.main.lazy-initialization=true` delays bean creation until first use, which can speed initial startup time and memory footprint for large contexts where many beans are unused in a given process. Downsides include deferring configuration errors until first request, complicating troubleshooting, and potentially causing latency spikes when rarely used code paths finally initialize. Most production REST services keep lazy off unless profiling proves benefit. Interviews connect this to cloud cost (faster scale-to-zero) versus operational predictability. `@Lazy` on a specific injection point can narrow the effect without global flag. Junior candidates should not enable lazy everywhere “because it sounds faster” without measuring. Pair with good integration tests that touch critical paths at startup in CI.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-021',
    question: 'What is the Spring `Environment` abstraction?',
    answer:
      'The `Environment` aggregates property sources (files, system properties, env vars, command line) and exposes profiles. You inject `Environment` or use `@Value` to read resolved properties. `Environment` resolves placeholders and applies precedence rules so later sources override earlier ones in defined order. This abstraction keeps application code decoupled from where a setting came from—Kubernetes secret, `.env`, or IDE run configuration. Mid-level interviews may ask how to test with `@TestPropertySource` or dynamic properties in `@SpringBootTest`. Understanding relaxed binding (`server.port` vs `SERVER_PORT`) helps debug container deployments. The `Environment` is also the hook for custom `PropertySource` implementations in advanced scenarios. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-022',
    question: 'What is Spring Boot DevTools, and should you use it in production?',
    answer:
      'DevTools is an optional dependency that speeds local development with automatic restart on classpath changes, LiveReload for static resources in browsers, and developer-friendly defaults like disabling template caches. It must never be packaged into production artifacts—mark it `optional` or `developmentOnly` scope so it does not leak onto the runtime classpath. Restart uses two classloaders to reload user code faster than full JVM restart. Interview answer: DevTools improves DX but changes behavior (property defaults), so CI production builds should exclude it. Teams using IDEs with hot swap or container-based dev may skip DevTools. Knowing the boundary between dev and prod dependencies is a basic professionalism signal.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-023',
    question: 'How do you change the default embedded server port and context path?',
    answer:
      'Set `server.port` to bind a different TCP port (common when running multiple services locally). Set `server.servlet.context-path` to mount the app under a prefix like `/api` so controllers live under that root. These properties work across embedded Tomcat, Jetty, and Undertow with the servlet stack. Behind reverse proxies you may terminate TLS at the proxy and still run HTTP inside the container. Interviewers check that you know configuration beats hardcoding ports in code. For Kubernetes, port `8080` is conventional and probes hit actuator health paths. Context path affects generated links and cookie paths, so coordinate with API gateways. Misconfigured context paths break frontend calls if base URLs assume `/`.',
    codeExample:
      'server:\n  port: 9090\n  servlet:\n    context-path: /api',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-024',
    question: 'What is `spring.main.banner-mode`, and why might you change it?',
    answer:
      'Spring Boot prints an ASCII banner at startup by default; `banner-mode` can be `console`, `log`, or `off`. Turning it off reduces noise in centralized logging systems where banner art clutters log aggregation. Some teams replace `banner.txt` with version and git commit info for supportability. This is a small detail but shows awareness of operational log hygiene. Interviews rarely go deep here—mention it alongside logging configuration. Custom banners can include `${application.version}` placeholders resolved from the manifest. For junior engineers, knowing this exists prevents surprise when logs look different in Docker versus IDE. It is not a performance concern either way on modern hardware.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-025',
    question: 'What is graceful shutdown in Spring Boot, and why does it matter for Kubernetes?',
    answer:
      'Graceful shutdown allows the embedded server to stop accepting new requests while finishing in-flight work after a SIGTERM, then closes the context. Kubernetes sends SIGTERM before killing a pod; without graceful handling, clients see abrupt connection resets. Configure `server.shutdown=graceful` and a timeout that fits your longest request plus drain period. Mid-level candidates relate this to readiness probes: mark not ready before shutdown to stop new traffic earlier. Not every workload needs long drains—batch workers differ from HTTP APIs. Interview answer shows you understand platform lifecycle beyond “it runs locally”. Pair with Actuator shutdown endpoint only if secured—usually prefer platform signals over HTTP shutdown in public clouds.',
    codeExample:
      'server:\n  shutdown: graceful\nspring:\n  lifecycle:\n    timeout-per-shutdown-phase: 30s',
    codeLanguage: 'yaml',
  },
]
