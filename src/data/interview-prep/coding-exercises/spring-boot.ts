import type { CodingExercise } from './types'

/** Spring Boot 3.x (Java 17+): five beginner and five mid-level scenarios (10 total). */
export const SPRING_BOOT_CODING_EXERCISES: CodingExercise[] = [
  {
    id: 'sb-hello-rest',
    difficulty: 'beginner',
    title: 'Minimal REST controller',
    scenario: `Create a \`@RestController\` mapped under \`/api\` with a GET endpoint \`/api/hello\` that returns plain text \`"Hello, Spring"\` and HTTP 200.

Use \`@GetMapping\` (or \`@RequestMapping(method = GET)\`). Assume the class lives in your application’s primary package so component scanning picks it up.`,
    constraints: [
      'Spring Boot 3.x with `jakarta.*` APIs.',
      'Return type can be `String`; Spring writes the body as text/plain.',
    ],
    hints: [
      'Annotate the class with @RestController and @RequestMapping("/api") or put full path on @GetMapping("/api/hello").',
      'Method: @GetMapping("/hello") return "Hello, Spring";',
    ],
    answerFiles: [
      {
        path: 'HelloController.java',
        language: 'java',
        code: `package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HelloController {

  @GetMapping("/hello")
  public String hello() {
    return "Hello, Spring";
  }
}
`,
      },
    ],
  },
  {
    id: 'sb-request-param',
    difficulty: 'beginner',
    title: 'Query parameter with a default',
    scenario: `Expose GET \`/api/greet?name=...\` that returns a JSON object (or plain string—reference uses a \`record\`) containing a greeting like \`"Hello, Ada"\`.

If \`name\` is omitted, default to \`"World"\`. Use \`@RequestParam\` with \`defaultValue\`.

Return type can be \`record Greeting(String message)\` for automatic JSON serialization.`,
    constraints: [
      'Use @RequestParam(name = "name", defaultValue = "World") String name.',
    ],
    hints: [
      '@GetMapping("/greet") on a method in a @RestController under /api.',
      'return new Greeting("Hello, " + name); with record Greeting(String message) in the same compilation unit (package-private record is fine).',
    ],
    answerFiles: [
      {
        path: 'GreetingController.java',
        language: 'java',
        code: `package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class GreetingController {

  @GetMapping("/greet")
  public Greeting greet(
      @RequestParam(name = "name", defaultValue = "World") String name) {
    return new Greeting("Hello, " + name);
  }

  record Greeting(String message) {}
}
`,
      },
    ],
  },
  {
    id: 'sb-valid-post',
    difficulty: 'beginner',
    title: 'POST JSON with validation',
    scenario: `Add POST \`/api/books\` accepting JSON \`{ "title": "...", "pages": 200 }\`.

• Use a request DTO with \`jakarta.validation.constraints.NotBlank\` on \`title\` and \`@Min(1)\` on \`pages\`.
• Annotate the body parameter with \`@Valid\` so validation runs automatically.
• Return \`201 Created\` with the same data echoed back (or an id)—reference echoes a \`BookResponse\` record.

Validation failures should return **400** with Spring’s default error body (no need for custom handler in this exercise).`,
    constraints: [
      'Include spring-boot-starter-validation on the classpath.',
      'Use records or POJOs with getters for the DTO.',
    ],
    hints: [
      '@PostMapping + @RequestBody @Valid BookRequest request',
      'BookRequest(@NotBlank String title, @Min(1) int pages)',
      'return ResponseEntity.status(HttpStatus.CREATED).body(new BookResponse(...));',
    ],
    answerFiles: [
      {
        path: 'BookController.java',
        language: 'java',
        code: `package com.example.demo;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class BookController {

  @PostMapping("/books")
  public ResponseEntity<BookResponse> create(@RequestBody @Valid BookRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(new BookResponse(request.title(), request.pages()));
  }

  record BookRequest(@NotBlank String title, @Min(1) int pages) {}

  record BookResponse(String title, int pages) {}
}
`,
      },
    ],
  },
  {
    id: 'sb-path-variable',
    difficulty: 'beginner',
    title: 'Path variable and 404',
    scenario: `Implement GET \`/api/users/{id}\` where \`id\` is a positive long. If \`id\` is less than 1, return **404 Not Found** with an empty body or a small error object.

If \`id\` is valid, return **200** with JSON \`{ "id": <id>, "name": "User " + id }\` (mock data is fine—no database).

Use \`ResponseEntity\` to control status codes.`,
    constraints: [
      'Use @PathVariable Long id.',
      '404 via ResponseEntity.notFound().build() or .status(HttpStatus.NOT_FOUND).',
    ],
    hints: [
      'if (id == null || id < 1) return ResponseEntity.notFound().build();',
      'Else return ResponseEntity.ok(new UserResponse(id, "User " + id));',
    ],
    answerFiles: [
      {
        path: 'UserController.java',
        language: 'java',
        code: `package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {

  @GetMapping("/users/{id}")
  public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
    if (id == null || id < 1) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(new UserResponse(id, "User " + id));
  }

  record UserResponse(long id, String name) {}
}
`,
      },
    ],
  },
  {
    id: 'sb-config-properties',
    difficulty: 'beginner',
    title: 'Type-safe configuration properties',
    scenario: `Bind settings from \`application.properties\` (or YAML) using \`@ConfigurationProperties\`.

Prefix: \`app\`. Properties: \`app.name\` and \`app.version\`.

Create a \`record AppInfo(String name, String version)\` annotated with \`@ConfigurationProperties(prefix = "app")\`.

Add a small \`@Configuration\` class that is **not** public (package-private) enabling the record: \`@EnableConfigurationProperties(AppInfo.class)\`. Put the **public** \`AppInfo\` record in the same file so the filename is \`AppInfo.java\` (the public type).

Expose a read-only GET \`/api/app-info\` that returns the bound \`AppInfo\` as JSON (inject \`AppInfo\` into a \`@RestController\`).`,
    constraints: [
      'Use constructor binding compatible with records (Spring Boot 3).',
      'Register EnableConfigurationProperties so the record is a bean.',
    ],
    hints: [
      '@ConfigurationProperties(prefix = "app") public record AppInfo(String name, String version) {}',
      '@Configuration @EnableConfigurationProperties(AppInfo.class) class AppInfoConfiguration {}',
      'Constructor injection: public AppInfoController(AppInfo appInfo) { ... }',
    ],
    answerFiles: [
      {
        path: 'AppInfo.java',
        language: 'java',
        code: `package com.example.demo;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@ConfigurationProperties(prefix = "app")
public record AppInfo(String name, String version) {}

@Configuration
@EnableConfigurationProperties(AppInfo.class)
class AppInfoConfiguration {}

@RestController
@RequestMapping("/api")
class AppInfoController {
  private final AppInfo appInfo;

  AppInfoController(AppInfo appInfo) {
    this.appInfo = appInfo;
  }

  @GetMapping("/app-info")
  public AppInfo appInfo() {
    return appInfo;
  }
}
`,
      },
    ],
  },
  {
    id: 'sb-exception-advice',
    difficulty: 'mid',
    title: 'Global exception handling',
    scenario: `Create a custom runtime exception \`ResourceNotFoundException\` with a \`String resourceId\` field and getter.

Add a \`@RestControllerAdvice\` class with:
• \`@ExceptionHandler(ResourceNotFoundException.class)\` returning **404** and a small JSON body like \`{ "error": "NOT_FOUND", "id": "..." }\`.
• \`@ExceptionHandler(MethodArgumentNotValidException.class)\` returning **400** and a map of field → default message for the first error (or all errors—reference returns first field error only).

Use \`ResponseEntity\` + \`ProblemDetail\` **or** a simple \`Map\` body—reference uses a \`record ErrorBody\` for consistency.`,
    constraints: [
      'Use org.springframework.web.bind.MethodArgumentNotValidException.',
      'Keep handler methods in one advice class.',
    ],
    hints: [
      'ResourceNotFoundException extends RuntimeException, store resourceId, super(message).',
      'ex.getBindingResult().getFieldErrors().get(0) for first invalid field.',
    ],
    answerFiles: [
      {
        path: 'GlobalExceptionHandler.java',
        language: 'java',
        code: `package com.example.demo;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorBody> notFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorBody("NOT_FOUND", ex.getResourceId()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> badRequest(
      MethodArgumentNotValidException ex) {
    var fe = ex.getBindingResult().getFieldErrors().get(0);
    return ResponseEntity.badRequest()
        .body(Map.of(fe.getField(), fe.getDefaultMessage() == null ? "invalid" : fe.getDefaultMessage()));
  }

  public record ErrorBody(String error, String id) {}
}

class ResourceNotFoundException extends RuntimeException {
  private final String resourceId;

  ResourceNotFoundException(String resourceId) {
    super("Not found: " + resourceId);
    this.resourceId = resourceId;
  }

  String getResourceId() {
    return resourceId;
  }
}
`,
      },
    ],
  },
  {
    id: 'sb-transactional-service',
    difficulty: 'mid',
    title: 'Service layer with @Transactional',
    scenario: `Write an \`OrderService\` bean with a method \`Optional<OrderView> findOrder(Long id)\` that loads an order from an \`OrderRepository\` (Spring Data JPA).

• Annotate the service class with \`@Service\` and the read method with \`@Transactional(readOnly = true)\`.
• Define \`Order\` as a JPA \`@Entity\` with \`Long id\` (generated) and \`String orderNumber\`.
• Define \`OrderRepository extends JpaRepository<Order, Long>\`.
• Map the entity to \`OrderView\` record in the service.

Use **package-private** entity and repository in the same file as **public** \`OrderService\`, or split files—reference keeps one file with one \`public\` class \`OrderService\` and package-private types (valid Java). Actually **only one public top-level class per file**—so \`OrderService\` is public; \`Order\`, \`OrderRepository\`, \`OrderView\` are package-private in \`OrderService.java\`—but \`OrderRepository\` must be an interface for Spring Data—in same file package-private interface works.

**Note:** In real projects split packages; for the exercise a single snippet is enough.`,
    constraints: [
      'Enable JPA and a datasource (H2 in-memory is typical for demos).',
      'Use jakarta.persistence.* imports.',
    ],
    hints: [
      '@Entity @Table(name = "orders") class Order { @Id @GeneratedValue ... }',
      'interface OrderRepository extends JpaRepository<Order, Long> {}',
      'repository.findById(id).map(o -> new OrderView(o.getId(), o.getOrderNumber()));',
    ],
    answerFiles: [
      {
        path: 'OrderService.java',
        language: 'java',
        code: `package com.example.demo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
  private final OrderRepository orderRepository;

  public OrderService(OrderRepository orderRepository) {
    this.orderRepository = orderRepository;
  }

  @Transactional(readOnly = true)
  public Optional<OrderView> findOrder(Long id) {
    return orderRepository.findById(id).map(this::toView);
  }

  private OrderView toView(Order o) {
    return new OrderView(o.getId(), o.getOrderNumber());
  }

  public record OrderView(Long id, String orderNumber) {}
}

interface OrderRepository extends JpaRepository<Order, Long> {}

@Entity
@Table(name = "orders")
class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String orderNumber;

  protected Order() {}

  Order(String orderNumber) {
    this.orderNumber = orderNumber;
  }

  Long getId() {
    return id;
  }

  String getOrderNumber() {
    return orderNumber;
  }
}
`,
      },
    ],
  },
  {
    id: 'sb-jpa-repository',
    difficulty: 'mid',
    title: 'Entity + derived query method',
    scenario: `Model a \`Product\` entity with:
• \`Long id\` (generated identity)
• \`String sku\` (unique, not null)
• \`String name\`

Create \`ProductRepository extends JpaRepository<Product, Long>\` with a **derived** query method: \`Optional<Product> findBySku(String sku)\`.

No service layer required—reference solution is two files: \`Product.java\` and \`ProductRepository.java\` so package layout matches typical Spring Boot structure.`,
    constraints: [
      'Use @Column(nullable = false, unique = true) on sku.',
      'Constructors/getters as needed for JPA.',
    ],
    hints: [
      'Default constructor protected for JPA; optional business constructor for sku + name.',
      'Method name findBySku matches property sku—Spring Data implements it.',
    ],
    answerFiles: [
      {
        path: 'Product.java',
        language: 'java',
        code: `package com.example.demo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String sku;

  @Column(nullable = false)
  private String name;

  protected Product() {}

  public Product(String sku, String name) {
    this.sku = sku;
    this.name = name;
  }

  public Long getId() {
    return id;
  }

  public String getSku() {
    return sku;
  }

  public String getName() {
    return name;
  }
}
`,
      },
      {
        path: 'ProductRepository.java',
        language: 'java',
        code: `package com.example.demo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
  Optional<Product> findBySku(String sku);
}
`,
      },
    ],
  },
  {
    id: 'sb-rest-client',
    difficulty: 'mid',
    title: 'RestClient call to a remote API',
    scenario: `Spring Boot 3.2+ provides \`RestClient\` (and \`RestClient.Builder\` bean). Create a \`@Service\` \`PostTitleClient\` with a method \`String fetchFirstPostTitle()\` that GETs \`https://jsonplaceholder.typicode.com/posts/1\` and returns the \`title\` field from the JSON response.

Use a \`record Post(String title)\` for deserialization with \`RestClient\` and \`.retrieve().body(Post.class)\`, or \`Map\` if you prefer.

Inject \`RestClient.Builder\` in the constructor and \`builder.baseUrl("https://jsonplaceholder.typicode.com").build()\`, or use the full URL in \`.get().uri("/posts/1")\`.`,
    constraints: [
      'Add spring-boot-starter-web (includes RestClient support in Boot 3.2+).',
      'Handle only the happy path; exceptions can propagate for this drill.',
    ],
    hints: [
      'RestClient.create("https://jsonplaceholder.typicode.com") is simplest.',
      '.get().uri("/posts/1").retrieve().body(Post.class) with record Post(String title, ...) other fields optional with @JsonIgnoreProperties(ignoreUnknown = true) if using Jackson.',
      'Or use Map.class and cast title from map.get("title").',
    ],
    answerFiles: [
      {
        path: 'PostTitleClient.java',
        language: 'java',
        code: `package com.example.demo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PostTitleClient {
  private final RestClient client =
      RestClient.create("https://jsonplaceholder.typicode.com");

  public String fetchFirstPostTitle() {
    Post post =
        client
            .get()
            .uri("/posts/1")
            .retrieve()
            .body(Post.class);
    return post != null ? post.title() : "";
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  record Post(String title) {}
}
`,
      },
    ],
  },
  {
    id: 'sb-scheduled',
    difficulty: 'mid',
    title: 'Scheduled task + @EnableScheduling',
    scenario: `Add a \`@Component\` bean with a method annotated \`@Scheduled(fixedRateString = "60000")\` (every 60 seconds) that increments an \`AtomicLong\` counter and optionally logs the value (logging statement is enough to show intent).

Enable scheduling on the main application class with \`@EnableScheduling\`.

Expose the current counter value via GET \`/api/metrics/tasks\` returning JSON \`{ "tickCount": <n> }\` from a small \`@RestController\` that uses the same component bean.

**Note:** Combine **public** types carefully: use **one** public top-level class per file—reference uses \`ScheduledHeartbeat.java\` with a public \`@Component\` class and a **package-private** \`@RestController\` in the same file (valid), or split into two files in your repo.`,
    constraints: [
      'Use java.util.concurrent.atomic.AtomicLong.',
      'Do not block the scheduler thread for long periods.',
    ],
    hints: [
      '@EnableScheduling on @SpringBootApplication class.',
      'AtomicLong incrementAndGet() inside @Scheduled method.',
      'Inject the component into a controller to read the counter.',
    ],
    answerFiles: [
      {
        path: 'ScheduledHeartbeat.java',
        language: 'java',
        code: `package com.example.demo;

import java.util.concurrent.atomic.AtomicLong;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Component
public class ScheduledHeartbeat {
  private final AtomicLong tickCount = new AtomicLong();

  @Scheduled(fixedRate = 60_000)
  public void tick() {
    tickCount.incrementAndGet();
  }

  public long getTickCount() {
    return tickCount.get();
  }
}

@RestController
@RequestMapping("/api/metrics")
class MetricsController {
  private final ScheduledHeartbeat heartbeat;

  MetricsController(ScheduledHeartbeat heartbeat) {
    this.heartbeat = heartbeat;
  }

  @GetMapping("/tasks")
  public TickResponse tasks() {
    return new TickResponse(heartbeat.getTickCount());
  }

  record TickResponse(long tickCount) {}
}
`,
      },
    ],
  },
]
