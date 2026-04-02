import type { InterviewQuestion } from '../types'

/** Core Java cj-026–cj-050 — Intermediate OOP, collections, generics */
export const CORE_JAVA_BATCH_2: InterviewQuestion[] = [
  {
    id: 'cj-026',
    question:
      'Compare abstract classes and interfaces in modern Java. When would you choose each?',
    answer:
      'Abstract classes can carry state (fields), constructors, and a mix of concrete and abstract methods; a class may extend only one abstract class due to single inheritance. Interfaces define contracts: before Java 8 they were purely abstract; now they may include `default` methods with implementations and `static` helpers while remaining non-instantiable. A class can implement multiple interfaces, which favors composition of behaviors. Choose an abstract class when subclasses truly share substantial implementation and instance data—template method patterns. Choose interfaces for capability labels (`Serializable`, `Comparable`) or when unrelated classes need polymorphic treatment. Default methods allow evolving APIs without breaking implementers, though diamond conflicts must be resolved explicitly. Interviewers often ask how Java mitigates multiple inheritance issues: only interfaces multiply, and state stays in classes. Mention sealed classes/interfaces in Java 17+ for controlled hierarchies as a related design tool.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-027',
    question:
      'Explain checked versus unchecked exceptions and the controversy around checked exceptions.',
    answer:
      'Checked exceptions extend `Exception` but not `RuntimeException`; callers must either catch them or declare `throws`, forcing acknowledgment at compile time—think `IOException` on I/O. Unchecked exceptions extend `RuntimeException` (or `Error` subclasses for serious failures); they propagate without mandatory handling—think `NullPointerException` or `IllegalArgumentException` for programmer mistakes. The intent was to make recoverable conditions explicit, but critics argue checked exceptions break encapsulation, encourage empty catches, and compose poorly with lambdas (functional interfaces do not declare checked exceptions unless generic throws are modeled). Modern APIs often wrap checked exceptions in `RuntimeException` or use `CompletionStage` failures. Interview answer should show you know `Error` is generally not caught (OutOfMemoryError), and that designing library exception types affects ergonomics across millions of call sites.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-028',
    question:
      'What is the try-with-resources statement, and what interface must resources implement?',
    answer:
      'Try-with-resources, introduced in Java 7, declares one or more resources in parentheses after `try`; each must implement `java.lang.AutoCloseable` (or legacy `Closeable` for I/O). The compiler generates `finally` logic that closes resources in reverse declaration order, suppressing exceptions from close if the `try` block already threw—those get added as suppressed exceptions accessible via `Throwable.getSuppressed()`. This eliminates boilerplate and prevents resource leaks when early returns occur. Resources must be effectively final or fresh declarations. For custom types wrapping native handles, implement `close` idempotently. Interviewers contrast this with `Cleaner` for non-deterministic lifecycle objects. Mention that JDBC `Connection`, `Statement`, and `ResultSet` should all be managed—often nested try-with-resources—to avoid connection starvation.',
    codeExample:
      'try (var in = Files.newInputStream(path)) {\n  return in.readAllBytes();\n}',
    codeLanguage: 'java',
  },
  {
    id: 'cj-029',
    question:
      'How do `ArrayList` and `LinkedList` differ in performance characteristics and memory?',
    answer:
      '`ArrayList` wraps a dynamic array: amortized O(1) append at the end, O(1) random access by index, but O(n) insert/delete in the middle because elements shift. Iteration is cache-friendly due to contiguous storage. `LinkedList` is a doubly linked list: O(1) insert/remove at known nodes via iterator, but locating an index is O(n), and each element has pointer overhead—worse memory footprint and cache misses than `ArrayList` for typical workloads. `LinkedList` also implements `Deque` for queue operations but modern alternatives like `ArrayDeque` often outperform it for FIFO use. Interviewers expect you to say “profile first” because myths about LinkedList being always better for inserts are outdated for moderate lists. Choosing `List` interface in APIs preserves flexibility; concrete choice depends on access patterns and size.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-030',
    question:
      'Describe how `HashMap` stores entries and how `hashCode` and `equals` participate in lookups.',
    answer:
      '`HashMap` buckets entries by the hash of the key, reduced to array index via bitwise operations on table length (power of two). Collisions chain entries in the same bucket—historically linked lists; beyond a threshold treeify to balanced trees for worst-case O(log n) per bucket when keys are `Comparable`. On `get`, the map computes hash, finds bucket, then compares candidate keys with `equals`—not `==`—to disambiguate collisions. Thus keys with broken `equals`/`hashCode` contracts vanish or duplicate. Resize rehashes when load factor exceeds threshold, costly but amortized. `null` keys are allowed once (special-cased). Interview follow-ups: iteration order is undefined; for predictable order use `LinkedHashMap`. Thread safety requires `Collections.synchronizedMap` or `ConcurrentHashMap`, not `HashMap` alone.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-031',
    question:
      'Compare `HashMap`, `LinkedHashMap`, and `TreeMap` for ordering and complexity.',
    answer:
      '`HashMap` provides average O(1) operations without ordering guarantees. `LinkedHashMap` maintains insertion order (or optionally access order for LRU caches) with slightly more overhead per entry due to doubly linked pointers between nodes. `TreeMap` is a red-black tree sorted by natural ordering (`Comparable`) or a provided `Comparator`; operations are O(log n) but you gain range queries, `subMap`, and sorted keys. Memory overhead rises from TreeMap’s tree nodes versus HashMap’s arrays. Choosing among them maps to requirements: need sorted keys or custom order → TreeMap; need stable iteration matching insert time → LinkedHashMap; pure speed without order → HashMap. Interviewers may ask about `ConcurrentSkipListMap` as a concurrent sorted alternative.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-032',
    question:
      'What is the difference between fail-fast and fail-safe iterators?',
    answer:
      'Fail-fast iterators (`ArrayList`, `HashMap`) detect concurrent structural modification by tracking a `modCount` and throwing `ConcurrentModificationException` when the collection changes unexpectedly during iteration—unless modification uses the iterator’s own `remove`. This is best-effort and not guaranteed in multi-threaded scenarios without external synchronization. Fail-safe iterators (e.g., `ConcurrentHashMap`’s weakly consistent iterators, copy-on-write collections) clone or traverse snapshots so they do not throw when another thread mutates, but may reflect partial updates. Neither replaces proper concurrency design: fail-fast helps find single-thread bugs; fail-safe trades consistency for availability. Interview answer should note that `java.util.concurrent` collections avoid `ConcurrentModificationException` by design but define weaker consistency guarantees documented per class.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-033',
    question:
      'Contrast `Comparable` and `Comparator`. Where does each live in typical APIs?',
    answer:
      '`Comparable` defines natural ordering inside the class (`compareTo`), used by `TreeSet`, `Collections.sort` overloads without comparator, and streams’ `sorted()` without argument. Implementations must be consistent with `equals` when used in sorted sets/maps that equate elements—otherwise `Set` contracts break. `Comparator` is external strategy: compare two objects without modifying their classes—useful for multiple sort orders or third-party types. Method references like `Comparator.comparing(Person::getName)` compose with `thenComparing`. Null handling differs: `Comparator.nullsFirst` helpers. Interviewers like examples like sorting employees by department then salary. Mention that Java 8+ interfaces allow static and default methods on `Comparator` for fluent composition. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'list.sort(Comparator.comparing(Person::getAge).reversed());',
    codeLanguage: 'java',
  },
  {
    id: 'cj-034',
    question:
      'Explain PECS: Producer Extends, Consumer Super for generic wildcards.',
    answer:
      'Wildcards increase API flexibility while preserving type safety. If a method only reads `T` elements from a collection (producer), accept `List<? extends T>` so callers can pass `List<T>` or subtypes. If the method only writes `T` elements (consumer), accept `List<? super T>` so you can pass `List<T>` or supertypes—useful when copying into a more general list. `Collections.copy(List<? super T> dest, List<? extends T> src)` is the textbook example. Mis-PECS leads to compile errors when trying to add wrong types. Raw types bypass checks and should be avoided. Interviewers may extend to variance in other languages; in Java, type erasure means runtime cannot distinguish `List<String>` from `List<Integer>`—only casts enforce at boundaries.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-035',
    question:
      'What is type erasure in Java generics, and what limitations does it impose at runtime?',
    answer:
      'Generics are a compile-time feature: parameter types are erased to their bounds or `Object`, and casts are inserted by the compiler where needed. This preserves JVM compatibility with pre-generics bytecode and avoids duplicate class files per instantiation. Consequently you cannot `new T()`, query `instanceof List<String>`, or create arrays of parameterized types directly. Bridge methods are synthesized to keep overriding coherent after erasure. Reflection sees raw types unless you use `ParameterizedType`. Type tokens (`Class<T>`) or libraries like Gson’s `TypeToken` capture generic information via anonymous subclasses that retain metadata. Interview answers should mention that erasure prevents some expressiveness but avoids whole-program template bloat seen in C++.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-036',
    question:
      'When should you use `Optional`, and what are common misuse patterns?',
    answer:
      '`Optional<T>` models absence of a value without returning `null`, encouraging callers to handle both cases explicitly via `orElse`, `orElseGet`, `ifPresent`, or `map`/`flatMap`. It is intended as a return type for queries that may lack results—not as a field in JPA entities or as a method parameter, because serializing frameworks and constructors become awkward. Using `get()` without `isPresent` checks throws `NoSuchElementException`—prefer `orElseThrow`. Streams integrate via `Optional` returns from `findFirst`. Performance-sensitive hot paths might avoid allocating `Optional` repeatedly. Interviewers from functional languages compare with Maybe; in Java, `Optional` is mainly documentation and composability, not a panacea for null safety like Kotlin’s system.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-037',
    question:
      'Describe intermediate versus terminal operations in the Streams API.',
    answer:
      'Streams are lazy pipelines: intermediate operations (`map`, `filter`, `sorted`, `distinct`) return another `Stream` and do not process data until a terminal operation runs. Terminal operations (`collect`, `forEach`, `reduce`, `count`, `findFirst`) trigger evaluation and often enforce a specific traversal strategy (sometimes short-circuiting). Because of laziness, side-effectful intermediate ops may not run if a short-circuit terminal stops early—surprising if you relied on side effects. Stateful operations like `sorted` may buffer entire streams. Parallel streams fork work across `ForkJoinPool.commonPool()`, requiring thread-safe operations and often poor performance on small data. Interviewers expect clarity that streams are not collections—they are views with optional parallelization—and that boxing in `Stream<Integer>` can hurt performance.',
    codeExample:
      'long n = lines.stream()\n    .filter(s -> !s.isBlank())\n    .count();',
    codeLanguage: 'java',
  },
  {
    id: 'cj-038',
    question:
      'What are common `Collectors` you use in production code, and what do they do?',
    answer:
      '`Collectors.toList()`, `toSet()`, and `toCollection(Supplier)` materialize streams into standard collections; `toUnmodifiableList()` enforces immutability at creation. `groupingBy` and `partitioningBy` build maps keyed by classifier or boolean predicate—essential for aggregations. `joining` concatenates strings with optional delimiters and prefixes/suffixes. `summarizingInt`/`Long`/`Double` compute min/max/average in one pass. `mapping` and `flatMapping` nest collectors for complex reductions. Choosing concurrent collectors matters for parallel streams. Interview answers should mention `Collectors.teeing` (Java 12) to merge two collectors in one pass. Understanding collector finisher and supplier functions helps when writing custom collectors for domain-specific rollups. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-039',
    question:
      'Explain functional interfaces, lambdas, and method references in Java.',
    answer:
      'A functional interface has exactly one abstract method (SAM), though it may have many default/static methods—`@FunctionalInterface` documents intent and enables compiler checks. Lambdas implement SAMs concisely: `(a, b) -> a + b` for `BinaryOperator<Integer>` after boxing considerations. Method references (`String::length`, `this::save`, `HashMap::new`) are shorthand when a lambda only forwards to an existing method or constructor. Captured variables must be effectively final. Lambdas desugar to `invokedynamic` with generated adapter classes on older JDKs—implementation detail but explains slight startup costs. Type inference uses target typing: the compiler infers from assignment or parameter position. Interviewers probe limitations: checked exceptions, generic functional interfaces like `Function<T,R>`, and debugging stack traces with synthetic method names.',
    codeExample:
      'Predicate<String> empty = String::isEmpty;\nlist.removeIf(empty.negate());',
    codeLanguage: 'java',
  },
  {
    id: 'cj-040',
    question:
      'What kinds of nested classes exist in Java, and how do inner classes access outer state?',
    answer:
      'Static nested classes behave like top-level classes namespaced inside another: they do not hold implicit references to outer instances—useful for builders. Inner (non-static) classes capture the enclosing instance and can access its private fields via compiler-generated bridge accessors. Local classes are declared inside methods; anonymous classes implement interfaces or extend classes inline at instantiation site—common for old Swing listeners. Inner classes compile to separate `Outer$Inner.class` files holding synthetic fields pointing to outer `this`. Memory leak risk: long-lived inner instances keep outer objects alive unintentionally. Lambdas capturing outer variables similarly hold references. Interviewers may ask about serialization of inner classes—often problematic. Modern Java encourages lambdas or static nested types over verbose anonymous classes when possible.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-041',
    question:
      'How do Java enums go beyond named constants, and what are the risks?',
    answer:
      'Enums are full classes extending `java.lang.Enum`: they can have fields, constructors (private), methods, and implement interfaces. Each constant may pass constructor arguments—useful for codes and metadata. Built-in singleton pattern per constant. `EnumSet` and `EnumMap` provide compact, fast specialized collections. Switch statements can cover enums exhaustively with compiler warnings when cases missing—great for state machines. Risks include heavy logic inside enums violating SRP, serialization compatibility when reordering constants, and reflection surprises. Avoid mutable state on enum fields unless synchronized carefully. Interview answers often include strategy pattern replacing `if/else` on strings with enum methods returning behavior objects. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'public enum Status {\n  ACTIVE { @Override void apply() { } },\n  INACTIVE { @Override void apply() { } };\n  abstract void apply();\n}',
    codeLanguage: 'java',
  },
  {
    id: 'cj-042',
    question:
      'What is the difference between `HashSet`, `LinkedHashSet`, and `TreeSet`?',
    answer:
      '`HashSet` is backed by `HashMap` dummy values: average O(1) add/contains, unordered iteration. `LinkedHashSet` subclasses `HashSet` with linked ordering—insertion order iteration with near HashSet performance unless access-order mode. `TreeSet` uses a `TreeMap` internally: sorted iteration, O(log n) operations, implements `NavigableSet` for range views. `EnumSet` is specialized for enums as bit vectors—often the fastest. Choosing depends on whether you need sorting or stable iteration. None are thread-safe concurrently; wrap or use concurrent alternatives. Interview follow-up: `equals`/`hashCode` for elements must be correct; mutable elements that change hash while in set break the structure. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-043',
    question:
      'Explain `equals` and `hashCode` contracts specifically in the context of mutable objects in collections.',
    answer:
      'If an object’s fields participating in `equals`/`hashCode` change while it is an element in a `HashSet` or key in `HashMap`, you cannot locate it again: the bucket index depends on the old hash. This is why immutable keys are recommended. `List` uses `equals` for `contains` but not hashing—mutating list elements does not break list identity, though logical equality to other lists may change. `IdentityHashMap` uses reference identity—different contract. Interviewers want to hear you recommend unmodifiable or immutable value types for keys. For entities with changing state, use stable surrogate keys (IDs) in `equals`/`hashCode` or avoid using them as map keys altogether.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-044',
    question:
      'What are immutable collections from factory methods (`List.of`, `Set.of`, `Map.of`), and what are their constraints?',
    answer:
      'Java 9 added concise factory methods producing unmodifiable collections: duplicate keys/elements throw for `Set.of`/`Map.of` (no silent replacement). Null elements are disallowed—fail-fast at creation. Iterators do not support removal; mutators throw `UnsupportedOperationException`. For maps, `Map.ofEntries` handles more pairs when needed. These implementations often share structural optimizations (compact arrays) unlike defensive copies of modifiable lists. For larger dynamic immutability, Guava’s `ImmutableList` or collectors to unmodifiable collections help. Interview note: immutability simplifies concurrency reasoning because readers need no locks. When you need copy-on-write semantics for evolving snapshots, other patterns apply. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'var xs = List.of("a", "b"); // immutable',
    codeLanguage: 'java',
  },
  {
    id: 'cj-045',
    question:
      'Describe `Deque` and why `ArrayDeque` is often preferred over `Stack` and `LinkedList` for LIFO/FIFO.',
    answer:
      '`Deque` (double-ended queue) supports `addFirst`/`addLast` and efficient removal at both ends. `ArrayDeque` is a resizable circular buffer providing O(1) operations amortized, cache-friendly storage, and no synchronization—ideal for stacks and queues in single-threaded code. The legacy `Stack` class extends `Vector` and is synchronized unnecessarily; its LIFO contract is better modeled by `Deque`’s `push`/`pop`. `LinkedList` implements `Deque` but with higher overhead per node; only choose it if you truly need frequent middle edits—which is rare. Thread-safe concurrent queues live under `java.util.concurrent`. Interviewers may ask about `BlockingQueue` next; keep `ArrayDeque` as default for non-concurrent deque workloads. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-046',
    question:
      'What is the `ServiceLoader` mechanism, and how does it relate to SPI?',
    answer:
      '`ServiceLoader` discovers implementations of an interface listed in `META-INF/services/<fully-qualified-interface-name>` files inside JARs, each line naming an implementation class. At runtime `ServiceLoader.load` instantiates providers lazily, enabling plugin architectures without compile-time coupling—classic Service Provider Interface pattern. JPMS requires `provides ... with` declarations in `module-info` for reliable loading across modules. Pitfalls include classpath ordering affecting which implementation wins, thread-safety of lazy iterators, and needing appropriate class loaders in containers. Interview answers connect to JDBC drivers, logging bindings, and extensible frameworks. Understanding SPI clarifies how libraries swap implementations without changing application code. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-047',
    question:
      'Explain serialization with `Serializable` and why `serialVersionUID` matters.',
    answer:
      'Java serialization converts object graphs to bytes using default reflective machinery or custom `readObject`/`writeObject`. Classes opt in with `Serializable`; all non-transient referenced fields must also be serializable or null. `serialVersionUID` fingerprints the class shape; mismatches between writer and reader cause `InvalidClassException` even if code looks similar—managing compatibility across releases requires explicit UID versioning and careful field evolution rules (`serialPersistentFields`, `optional data`). Performance and security are concerns: deserializing untrusted data can execute attacker code in gadget chains—avoid Java serialization for external input; prefer JSON, protobuf, or signed formats. `transient` skips fields; `Externalizable` offers full control. Interviewers reward awareness of security bulletins around deserialization.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-048',
    question:
      'What are annotations, retention policies, and common built-in annotations you rely on?',
    answer:
      'Annotations attach metadata to declarations; processors at compile-time (`SOURCE` retention, like `@Override`), class files (`CLASS`), or runtime (`RUNTIME`—reflection-visible like `@Entity`). Built-ins include `@Override` (catch signature mistakes), `@Deprecated` (`forRemoval` since Java 9), `@SuppressWarnings` (use narrowly), `@SafeVarargs` on final varargs methods, and `@FunctionalInterface`. Frameworks define many (`@Test`, `@Autowired`). Custom annotations combine with annotation processors to generate code (Lombok, MapStruct). Runtime reflection has cost—frameworks cache metadata. JPMS may require `opens` for reflective access. Interview answer ties annotations to configuration, validation (`@NotNull` Bean Validation), and reducing XML. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-049',
    question:
      'How does the `record` feature (Java 16+) reduce boilerplate, and what are limitations?',
    answer:
      'Records are immutable data carriers with automatically generated `private final` fields, constructor, accessors without `get` prefix, `equals`, `hashCode`, `toString`, and `implements` support. They cannot extend arbitrary classes (only `java.lang.Record` implicitly) but can implement interfaces and have static fields/methods as well as compact constructors for validation. Additional instance methods allowed. Limitations: cannot add extra mutable fields without breaking immutability contract; inheritance not supported; frameworks that expect JavaBeans getters may need adaptation. Pattern matching integrates with records for destructuring in switches. Interviewers compare with Lombok `@Value` and Kotlin data classes; records are native and reflection-friendly. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'record Point(int x, int y) {\n  Point {\n    if (x < 0) throw new IllegalArgumentException();\n  }\n}',
    codeLanguage: 'java',
  },
  {
    id: 'cj-050',
    question:
      'What is `sealed` class hierarchy, and why would you seal classes or interfaces?',
    answer:
      '`sealed` restricts which classes may extend or implement a type—listed `permits` clause enumerates allowed subclasses, enabling exhaustive pattern matching in switches without default branches when combined with compiler analysis. It models domain sums (Result types) and prevents external inheritance breaking invariants. Subclasses must be `final`, `sealed`, or `non-sealed` to opt into further openness. JPMS interacts: same module often required. Compared to package-private constructors, sealing works across modules explicitly. Interview answers should mention compatibility with records and future pattern matching ergonomics. This is a strong modern Java interview topic bridging OOP and algebraic data style. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
]
