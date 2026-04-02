import type { InterviewQuestion } from '../types'

/** Spring Boot sb-026–sb-050 — Web MVC, REST, validation (junior–mid) */
export const SPRING_BOOT_BATCH_2: InterviewQuestion[] = [
  {
    id: 'sb-026',
    question: 'Difference between `@Controller` and `@RestController`?',
    answer:
      '`@RestController` combines `@Controller` with `@ResponseBody` on each handler method, so return values serialize to the HTTP body (typically JSON via Jackson) instead of resolving view names. A classic `@Controller` is used with Thymeleaf or JSP where methods return view names and models. For JSON APIs you almost always pick `@RestController` to avoid forgetting `@ResponseBody` on one method. Interviewers may ask about content negotiation: still applies with `Accept` headers and message converters. Mixing both styles in one class is possible but confusing—split MVC pages and REST endpoints across controllers. Junior developers should know that returning a POJO from `@RestController` triggers HTTP 200 with serialized body unless you wrap with `ResponseEntity` for custom status and headers.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-027',
    question: 'What is `@RequestMapping` and how do HTTP method shortcuts work?',
    answer:
      '`@RequestMapping` maps URLs and HTTP methods to handler methods; shortcuts like `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, and `@PatchMapping` improve readability and prevent specifying wrong verbs accidentally. Class-level `@RequestMapping("/api/orders")` prefixes method-level paths. You can constrain `consumes` and `produces` for content types. In interviews mention that explicit verbs are clearer than a broad `@RequestMapping` with `method=GET` repeated. REST style favors resource nouns in paths and correct status codes. For junior profiles, knowing these annotations covers most day-to-day controller work. Also note that duplicate mappings across controllers cause startup failures—good fail-fast behavior. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeExample:
      '@RestController\n@RequestMapping("/api/users")\npublic class UserController {\n  @GetMapping("/{id}")\n  User get(@PathVariable Long id) { ... }\n}',
    codeLanguage: 'java',
  },
  {
    id: 'sb-028',
    question: 'How do `@PathVariable`, `@RequestParam`, and `@RequestBody` differ?',
    answer:
      '`@PathVariable` binds URI template variables like `/users/{id}` to method parameters. `@RequestParam` binds query parameters or form fields such as `?page=2`. `@RequestBody` deserializes JSON or XML from the request body into an object using `HttpMessageConverter` implementations (Jackson for JSON). For GET requests you normally avoid bodies—use query params. Misuse shows up as 400 errors when required params are missing unless you mark `required=false` or wrap with `Optional`. Interviews: mention validation applies after binding with `@Valid` on the body object. Multipart file uploads use `@RequestParam MultipartFile` with `multipart/form-data`. Understanding binding errors helps debug client mistakes versus server bugs quickly. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-029',
    question: 'What is `ResponseEntity`, and when would you return it instead of a raw object?',
    answer:
      '`ResponseEntity` lets you set HTTP status code, headers, and body together—useful for 201 Created with `Location` header, 204 No Content, or conditional caching headers. Returning a bare POJO always yields 200 OK, which is wrong for many REST semantics. You can still return `ResponseEntity<Void>` for empty bodies with specific statuses. Junior developers learn this when implementing POST endpoints that should not pretend success with 200 for everything. Interviews connect `ResponseEntity` to problem details headers in error responses when using RFC 7807 style payloads. It also helps file downloads with `Content-Disposition`. Prefer `ResponseEntity` in APIs that care about HTTP semantics beyond CRUD demos.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-030',
    question: 'How does Spring MVC handle content negotiation and JSON by default?',
    answer:
      'Spring relies on `HttpMessageConverter` beans; Jackson is auto-configured for JSON when Jackson is on the classpath. The `Accept` header and `produces` attributes select formats; most SPA clients send `Accept: application/json`. `ObjectMapper` beans can be customized for date formats, property naming, or unknown property handling. `@JsonIgnore` and DTOs help avoid serializing lazy Hibernate proxies accidentally—common junior pitfall. Interviews: mention `application/json` is default for `@RestController`, and XML requires additional dependencies and converters. Content negotiation is usually “good enough” defaults until APIs need versioning or CSV exports. Custom serializers solve odd types like `Money` value objects. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-031',
    question: 'What is bean validation (`@Valid`, `@NotNull`, etc.) in a controller?',
    answer:
      'Add Jakarta Bean Validation annotations on DTO fields (`@NotBlank`, `@Size`, `@Email`) and annotate the controller parameter with `@Valid` (or `@Validated` for groups). Spring invokes the validator before the handler; violations produce `MethodArgumentNotValidException` with binding errors unless you handle them globally. This keeps validation declarative and out of business logic. Return consistent 400 responses with field error messages for API consumers. Interviews: distinguish between syntactic validation (DTO) and business rules (service layer) such as “username already taken”. Custom validators implement `ConstraintValidator` for cross-field checks. Remember to add `spring-boot-starter-validation` on classpath—without it, annotations may be ignored silently in some setups. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-032',
    question: 'What is `@ControllerAdvice` / `@RestControllerAdvice` for exception handling?',
    answer:
      'A global advice class centralizes exception mapping to HTTP responses, avoiding try/catch duplication in every controller method. `@RestControllerAdvice` equals `@ControllerAdvice` + `@ResponseBody`, suitable for JSON error payloads. Methods annotated with `@ExceptionHandler(SomeException.class)` convert exceptions to status codes and bodies—map `IllegalArgumentException` to 400, `EntityNotFoundException` to 404, and unknowns to 500 with sanitized messages. Junior teams benefit from consistent error shape for frontends. Interviews mention you can still use `ResponseEntity` inside handlers and optionally log with MDC correlation IDs. Do not leak stack traces to clients in production. Testing advice classes with `@WebMvcTest` and throwing exceptions verifies mappings. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-033',
    question: 'Why use DTOs instead of exposing JPA entities directly from REST controllers?',
    answer:
      'Entities carry persistence concerns: lazy collections, bidirectional relationships, and fields you do not want clients to see or mutate. DTOs (records or POJOs) define a stable API contract independent of database schema changes. They prevent accidental mass assignment vulnerabilities where clients overwrite admin flags. Mapping can be manual, via MapStruct, or ModelMapper—each has trade-offs for performance and explicitness. Interviews: junior answer acknowledges circular JSON and lazy initialization exceptions (`LazyInitializationException`) when serializing entities outside a transaction. DTOs also version APIs more cleanly (`UserV1Dto` vs `UserV2Dto`). For simple internal tools, some teams skip DTOs, but interviews reward knowing the mainstream best practice.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-034',
    question: 'How do you enable CORS for a Spring Boot REST API?',
    answer:
      'Cross-Origin Resource Sharing lets browser JavaScript on another origin call your API. Annotate controllers or methods with `@CrossOrigin` for quick demos, or implement `WebMvcConfigurer.addCorsMappings` for centralized rules specifying allowed origins, methods, headers, and credentials. In production, prefer explicit allowed origins over `*` when cookies or authorization headers are involved. Spring Security must allow CORS before preflight `OPTIONS` requests are rejected. Junior developers often fix CORS in Spring but forget the reverse proxy or API gateway also strips headers. Interviews: explain preflight requests and that CORS is a browser enforcement, not a substitute for authentication. For mobile or server-to-server clients, CORS is irrelevant.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-035',
    question: 'What is `WebMvcConfigurer`, and give one common override?',
    answer:
      'Implement `WebMvcConfigurer` as a `@Configuration` bean to customize Spring MVC without replacing auto-configuration entirely. Common overrides: `addCorsMappings` for CORS, `addInterceptors` for logging or tenant headers, `addFormatters` for custom converters, and `configureMessageConverters` when tuning JSON. This is the mid-level alternative to copying huge `WebMvcConfigurationSupport` classes that disable Boot defaults accidentally. Interviews: mention `addViewControllers` for simple redirects. Prefer Boot’s MVC auto-config plus small configurer beans over `@EnableWebMvc` unless you need complete control—`@EnableWebMvc` opts out of many Boot MVC defaults. Understanding this prevents “why did my static resources stop working” mysteries. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-036',
    question: 'What is `spring-boot-starter-web` vs `spring-boot-starter-webflux`?',
    answer:
      '`spring-boot-starter-web` brings Spring MVC on the Servlet stack with embedded Tomcat by default—blocking I/O model familiar to most teams. `spring-boot-starter-webflux` brings WebFlux on Reactor Netty by default with a reactive, non-blocking pipeline (`Mono`, `Flux`). Do not mix both on the same classpath casually—it can confuse auto-configuration and bloat the app. Choose WebFlux when you need reactive integrations or high concurrency with non-blocking drivers; choose MVC for typical CRUD with JPA blocking calls. Junior interviews: acknowledge most enterprise apps still use MVC. Switching stacks has team skill implications. You can call blocking code from WebFlux with care (`publishOn`) but it is not free.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-037',
    question: 'How does file upload work in Spring MVC?',
    answer:
      'Post `multipart/form-data` and declare `@RequestParam MultipartFile file` or wrap multiple parts in a command object. Configure `spring.servlet.multipart.max-file-size` and `max-request-size` to prevent huge uploads from exhausting disk or memory. `MultipartFile` provides `transferTo`, `getInputStream`, and `getBytes`. Store files in object storage in cloud systems rather than local disk on ephemeral containers. Interviews mention virus scanning and content-type validation for untrusted uploads. For large streaming uploads, lower-level APIs exist but are rarer in junior code. Testing uses `MockMultipartFile` in `MockMvc`. Failure to configure limits leads to 413 errors at reverse proxies—coordinate settings end-to-end. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-038',
    question: 'What is `HttpMessageNotReadableException`, and what usually causes it?',
    answer:
      'It wraps JSON parsing or binding failures when `@RequestBody` cannot be deserialized—malformed JSON, wrong data types, or unknown enum values depending on `ObjectMapper` configuration. Global handlers map this to HTTP 400 with a helpful message for API clients. Logging the cause at debug helps distinguish client bugs from schema drift. Junior developers sometimes return 500 for bad JSON; mapping correctly improves API quality. Interviews: mention date format mismatches (`Instant` vs epoch) as a frequent cause. Custom deserializers fix legacy formats. Contract tests or OpenAPI examples reduce these errors. Always validate after deserialization with Bean Validation for business constraints. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-039',
    question: 'What is `MockMvc`, and how does `@WebMvcTest` use it?',
    answer:
      '`MockMvc` performs servlet-layer tests without starting a real port: it dispatches requests through DispatcherServlet and assertions inspect status, JSON, and headers. `@WebMvcTest` loads only web slice beans (controllers, MVC config) and auto-configures `MockMvc`, keeping tests fast compared to full `@SpringBootTest`. You `@MockBean` service dependencies controllers need. Interviews: clarify this does not hit the database—use `@DataJpaTest` or Testcontainers for persistence. `MockMvc` suits verifying validation, security rules, and JSON mapping. For full HTTP stack including Tomcat wire, `RandomPort` web environment tests exist but are slower. Junior developers learn slice tests reduce flaky integration suites. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-040',
    question: 'What is OpenAPI / Swagger with Spring Boot at a basic level?',
    answer:
      'Libraries like `springdoc-openapi` generate interactive API docs and a UI from your controllers and annotations, helping frontend teams discover endpoints and try requests. Annotations describe parameters, responses, and security schemes. In CI you can export the spec JSON for contract testing. Junior usage is often “add dependency, browse `/swagger-ui.html`”. Interviews: mention you still need authentication configuration in the UI for secured endpoints. Do not expose Swagger UI publicly in production without auth—it maps your attack surface. Alternatives include manual AsyncAPI for events. Basic knowledge suffices for mid-level: docs derive from code and drift less than wikis. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-041',
    question: 'How do you serve static resources in Spring Boot?',
    answer:
      'Place files under `src/main/resources/static` or `public` by default; they are served from the root context unless you change `spring.web.resources.static-locations`. `WebMvcConfigurer.addResourceHandlers` customizes caching headers or additional paths. For SPAs, forward non-API routes to `index.html` with a view controller or servlet filter—careful not to break actuator paths. Interviews: static resource handling differs from `@RestController` responses. Versioned assets benefit from cache busting filenames. In production, many teams offload static assets to CDN and keep Boot for APIs only. Misconfiguration leads to 404s when context path changes—test with real deployment paths. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-042',
    question: 'What is `ForwardedHeaderFilter` / use of `X-Forwarded-*` headers behind a proxy?',
    answer:
      'Reverse proxies terminate TLS and set `X-Forwarded-Proto`, `Host`, and `For` headers so the application generates correct absolute URLs and knows the client scheme. Spring Boot can enable `server.forward-headers-strategy=framework` or native to interpret these securely. Misconfiguration can allow host header attacks if you trust headers from clients directly—proxies should strip untrusted values. Junior engineers debugging redirect loops often encounter this topic. Interviews relate to OAuth callbacks and HATEOAS links. Kubernetes ingress and API gateways typically set these headers. Understanding forwarded headers separates “works on localhost” from “works behind TLS termination”. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-043',
    question: 'What is `@RequestHeader` used for?',
    answer:
      'It binds HTTP headers to method parameters, such as `Authorization`, custom correlation IDs, or `Accept-Language`. You can mark headers optional with defaults. Useful for cross-cutting concerns without servlet API calls in controllers—keeps signatures testable. Interviews: contrast with `HttpServletRequest` manual `getHeader`—more verbose. Security-sensitive parsing still belongs in filters or Spring Security for consistency. Rate limiting keys might read `X-Api-Key`. Validation annotations can apply if using `@Validated` on the controller class. Junior developers should not reinvent tracing—prefer Micrometer tracing with automatic propagation where possible. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-044',
    question: 'How does Spring map HTTP status codes in REST controllers by convention?',
    answer:
      'Return types influence defaults: void or `ResponseEntity` with 201 for create patterns, `Optional` return sometimes yields 404 when empty in newer Spring versions with `ResponseEntity` helpers—check version docs. Using `@ResponseStatus` on exceptions or methods annotates defaults. Many teams standardize on `ResponseEntity` explicit codes to avoid surprises. Interviews list common mappings: GET 200, POST 201, PUT 200/204, DELETE 204, validation errors 400, auth failures 401, forbidden 404/403 depending on policy. Consistency across services matters for API gateways. Junior mistakes include always 200 with error bodies—works but not idiomatic REST. Align with company standards over purist debates when deadlines exist. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-045',
    question: 'What is `spring.mvc.throw-exception-if-no-handler-found` about?',
    answer:
      'By default Spring may send 404 via the resource handler chain in ways that confuse API-only apps. Setting properties so unresolved routes throw `NoHandlerFoundException` lets your `@RestControllerAdvice` return JSON 404 bodies instead of HTML error pages. This improves SPA and mobile clients expecting consistent JSON errors. Related settings include `spring.web.resources.add-mappings` when you disable default static handling. Mid-level candidates tie this to uniform error payloads. Interview depth stays shallow: know that MVC error resolution has multiple paths (error page, whitelabel, advice). Test unknown routes in slice tests. Not every project changes defaults if they serve both static and API from one app.',
    codeLanguage: 'yaml',
  },
  {
    id: 'sb-046',
    question: 'What is `RestTemplate` vs `WebClient` for calling other HTTP services?',
    answer:
      '`RestTemplate` is a synchronous blocking client long used in Spring; it is now in maintenance mode with `WebClient` recommended for new code. `WebClient` is part of WebFlux but usable in MVC apps for non-blocking calls when paired with reactive types—though calling `block()` brings back blocking behavior. Junior teams often still use `RestTemplate` for simplicity in low-traffic jobs. Interviews: mention timeouts and connection pooling—defaults can hang threads under outage. `RestTemplate` built with `RestTemplateBuilder` picks up Boot’s message converters. For mid-level, acknowledge migration trends and that Feign or other clients wrap similar concerns in microservice architectures. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-047',
    question: 'What is HATEOAS in Spring, and is it commonly required?',
    answer:
      'Hypermedia as the Engine of Application State embeds links in JSON responses so clients discover next actions dynamically. Spring HATEOAS provides `EntityModel`, `CollectionModel`, and link builders. Many internal JSON APIs skip hypermedia and use OpenAPI instead for discovery—both are valid trade-offs. Junior interviews only need the definition and when it helps (evolving public APIs with many clients). Overusing links without client support adds noise. Versioning strategies often pick URI versioning or headers rather than hypermedia alone. Mention that HAL JSON is a common media type when HATEOAS is enabled. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-048',
    question: 'How do you internationalize messages in Spring MVC?',
    answer:
      'Define `messages.properties` files with locale suffixes, declare a `MessageSource` bean (Boot auto-configures one), and inject `MessageSource` or use `#{...}` in templates. Controllers resolve user locale via `LocaleResolver` (accept header, cookie, or session). REST APIs sometimes return error codes and let clients translate, while server-side i18n suits HTML views. Interviews at mid-level mention `ValidationMessages` for bean validation text keys. Testing sets `LocaleContextHolder`. This topic is less central for pure JSON microservices but appears in form-based apps. Boot’s defaults cover common cases without XML. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-049',
    question: 'What is `@SessionAttributes` and when is it appropriate?',
    answer:
      '`@SessionAttributes` on a controller stores model keys in the HTTP session across requests—useful for multi-step forms before the final POST. It couples state to server memory and complicates horizontal scaling unless sessions are sticky or externalized in Redis. For junior REST APIs, prefer stateless JWT or server-side IDs stored client-side with database backing. Interviews: mention session fixation and timeout configuration in Spring Security contexts. Overuse of server sessions in microservices is an anti-pattern unless a gateway handles session affinity. Know the alternative Spring Web Flow for complex wizards. Most Boot tutorials focus on stateless APIs, so this question filters candidates with MVC form experience.',
    codeLanguage: 'java',
  },
  {
    id: 'sb-050',
    question: 'What is `spring.main.web-application-type` used for?',
    answer:
      'It forces the kind of application Boot starts: `servlet` for classic MVC, `reactive` for WebFlux, or `none` for command-line jobs without a web server. Auto-configuration picks based on classpath, but sometimes both stacks appear transitively and you need to disambiguate. Batch jobs accidentally starting Tomcat waste resources in Kubernetes. Interviews: relate `none` to `@SpringBootApplication` microservices that only process a queue. Mis-set types cause missing `DispatcherServlet` or unwanted Netty startup. Mid-level engineers set this explicitly in tests too for faster contexts. Document the choice in README so operators know whether to probe HTTP ports. In day-to-day teams, tie the idea back to something you shipped: what you configured, how you verified it in a test, and what broke when assumptions were wrong—that story matters more than reciting APIs from memory.',
    codeExample:
      'spring:\n  main:\n    web-application-type: none',
    codeLanguage: 'yaml',
  },
]
