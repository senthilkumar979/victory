import type { InterviewQuestion } from '../types'

/** Core Java cj-076–cj-100 — Expert JVM, memory model, performance, architecture */
export const CORE_JAVA_BATCH_4: InterviewQuestion[] = [
  {
    id: 'cj-076',
    question:
      'Explain the Java Memory Model happens-before rules relevant to everyday concurrent programming.',
    answer:
      'The JMM defines which writes are visible to reads across threads without data races. Key happens-before edges: unlocking a monitor happens-before subsequent lock of the same monitor; volatile write happens-before volatile read of that field; thread start happens-before code in the started thread; completion of `Thread.join` happens-before code after join returns; submitting a task to an executor happens-before its execution; default initialization of static fields happens-before any thread accesses the class. Without such edges, compilers and CPUs may reorder or cache values unpredictably. `synchronized` and `volatile` establish ordering; `final` field safe publication has special rules after constructor completion. Interview experts connect JMM to debugging heisenbugs and to why double-checked locking needed volatile before Java 5 memory model fixes.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-077',
    question:
      'What is `StampedLock` and when would you choose it over `ReentrantReadWriteLock`?',
    answer:
      '`StampedLock` (Java 8) offers optimistic reading: `tryOptimisticRead` returns a stamp and proceeds without locking if no write occurred—validate with `validate(stamp)` or upgrade to read lock. Under low write contention this avoids blocking readers entirely. It also provides write locks and conversion APIs. It is not reentrant—recursive locking fails—unlike `ReentrantReadWriteLock`. API complexity and lack of `Condition` support limit adoption. Use when profiling shows reader dominance and you can handle optimistic failure paths. Misuse leads to subtle bugs if validation is skipped. Interview answer acknowledges it is advanced; most teams start with simpler locks unless benchmarks demand it. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-078',
    question:
      'Describe `ForkJoinPool` and the work-stealing algorithm at a high level.',
    answer:
      'ForkJoinPool schedules tasks that can split recursively (`ForkJoinTask`): each worker thread maintains a deque of tasks; when idle, workers steal tasks from others’ tails to balance load—reducing contention on the head. Ideal for divide-and-conquer CPU-bound problems on arrays (`Arrays.parallelSort` internals). Common pool backs parallel streams—understanding steal helps explain uneven scaling. Oversubmission of blocking tasks starves the pool; use managed blocking APIs (`ForkJoinPool.managedBlock`) or separate executors for blocking I/O. Tuning parallelism defaults to `Runtime.getRuntime().availableProcessors()` but container-aware adjustments may differ. Interviewers may ask about `CompletableFuture` interaction and starvation when tasks block. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-079',
    question:
      'How do you approach JVM heap sizing (`-Xms`, `-Xmx`) and container awareness in cloud deployments?',
    answer:
      'Set `-Xmx` below container memory limits to leave headroom for metaspace, thread stacks, native buffers, and OS page cache—otherwise Linux OOM killer may terminate the process without `OutOfMemoryError`. Matching `-Xms` to `-Xmx` avoids runtime heap expansion pauses but commits memory upfront. JDK 10+ `UseContainerSupport` reads cgroup limits to align defaults—verify with `-XX:+PrintFlagsFinal`. GC choice interacts: large heaps favor G1/ZGC tuning. Interview answers should mention observing real metrics (heap after GC, allocation rate) rather than guessing. Misconfigured heaps are a top production incident category for Java services. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-080',
    question:
      'What are `jcmd`, `jhsdb`, and `jfr` (Java Flight Recorder) used for in production diagnostics?',
    answer:
      '`jcmd <pid> <command>` issues diagnostic commands: GC heap dump, thread dump, VM.native_memory summary, Flight Recorder start/stop without extra agents. `jhsdb` attaches to core files or live processes for low-level debugging (SA). Java Flight Recorder records detailed events (allocation, I/O, method profiling) with low overhead—now available in OpenJDK builds subject to license terms historically. These tools replace ad-hoc `kill -3` reliance with structured data. Security: restricted attach in containers may need flags. Interview experts tie observability to SLOs: correlate GC logs with latency spikes using JFR timelines. Knowing tooling differentiates senior engineers from those who only printf-debug. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-081',
    question:
      'Explain class data sharing (CDS) and AppCDS benefits for startup time.',
    answer:
      'CDS maps pre-parsed class metadata into memory shared across JVM processes, reducing startup I/O and parsing cost—especially for serverless cold starts and CLI tools. AppCDS extends sharing to application classes by generating an archive from a training run (`-XX:ArchiveClassesAtExit`). JDK improvements increasingly automate this workflow. Benefits vary by workload; microservices with thousands of classes see notable wins. Limitations: class updates require archive regeneration. Container images may bake archives into layers. Interview mention shows JVM operational depth beyond syntax—relevant for FinTech and cloud cost optimization where every second of startup matters. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-082',
    question:
      'What are common sources of memory leaks in Java applications despite garbage collection?',
    answer:
      'GC only reclaims unreachable objects; leaks occur when references accidentally keep objects alive: static collections growing unbounded, listeners registered but never removed, ThreadLocal without remove in pools, caches without eviction, JDBC/IO streams not closed (native buffers), class loader retention via reflective caches, and strong references from long-lived singletons to request-scoped graphs. Native memory leaks (malloc via JNI) escape heap profilers—use NMT (`NativeMemoryTracking`). Diagnosis: heap dumps (`jmap`, `jcmd`), dominator trees in Eclipse MAT, comparing retained sizes across versions. Interview answers emphasize understanding reference paths, not blaming GC. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-083',
    question:
      'Discuss Project Loom virtual threads: how they differ from platform threads and common pitfalls.',
    answer:
      'Virtual threads are lightweight M:N scheduled onto a small pool of carrier platform threads; blocking I/O in JDK libraries unparks virtual threads instead of consuming an OS thread—enabling millions of concurrent tasks for I/O-heavy workloads. They are cheap to create—avoid pooling them like platform threads. Pitfalls: pinning occurs when virtual thread blocks on synchronized native or some JNI inside carrier—reducing scalability; use reentrant locks or j.u.c locks instead in hot paths where documented. CPU-bound work should not flood virtual threads without limiting semantically—use parallel streams or dedicated pools. ThreadLocal propagation semantics evolve—libraries must audit. Interviewers expect awareness of preview/final status per JDK version.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-084',
    question:
      'What is the Foreign Function & Memory API replacing JNI, and why does it matter?',
    answer:
      'Panama’s FFM API (finalized in recent JDKs) offers typed access to native memory (`MemorySegment`), function descriptors, and `Linker` to bind native symbols without JNI boilerplate and with safer lifetime management (Arena scoping). It reduces crashes from manual pointer arithmetic and improves performance for interop-heavy libraries. Gradual migration from JNI matters for databases, crypto, and GPU bridges. Security: restricted methods require explicit enablement. Interview experts mention this when discussing high-performance Java—not everyday CRUD—but it signals cutting-edge JDK adoption. Tooling like `jextract` generates Java bindings from C headers. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-085',
    question:
      'Explain generic bridge methods synthesized by the compiler and why they appear in stack traces.',
    answer:
      'After type erasure, subclass overrides may not match superclass parameter types on the JVM signature level—bridge methods are generated to delegate to the real override while satisfying the erased super contract. Example: `Comparable<Integer>` implementation bridges compareTo(Object) to compareTo(Integer). Reflection may expose these synthetic methods. Stack traces sometimes show `access$000` or bridge entries confusing developers. Understanding bridges clarifies why certain reflective calls must target the correct method and why verification errors occur when bytecode manipulation goes wrong. Advanced bytecode tools (ASM, Byte Buddy) account for bridges when generating subclasses. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-086',
    question:
      'How do you benchmark Java code reliably, and why is JMH the standard tool?',
    answer:
      'Microbenchmarks are deceptive: JIT warmup, dead code elimination, constant folding, and GC interference distort naive loops. JMH (Java Microbenchmark Harness) manages forks, warmup iterations, blackholes for consuming results, and avoids DCE pitfalls. Always measure on hardware representative of production and with realistic data distributions. Macro benchmarks and A/B in staging matter more for business features. Interview answers criticize `System.nanoTime` loops without JMH as amateur. Mention `-prof` async profiler integration for allocation and CPU flame graphs. Scientific skepticism separates senior performance work from cargo-cult tuning. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-087',
    question:
      'Describe the Strategy, Template Method, and Decorator patterns with Java-specific notes.',
    answer:
      'Strategy encapsulates interchangeable algorithms via interfaces—`Comparator` is built-in strategy. Template Method defines skeleton in abstract class with hooks—`AbstractList`, servlet `service` flows. Decorator wraps objects to add behavior—`Collections.synchronizedList`, Java I/O `BufferedInputStream` chains. Pitfalls: decorator explosion for many combinations; Lombok `@Delegate` sometimes helps. Interviewers ask how patterns interact with DI frameworks (Spring proxies decorating beans). Modern Java favors composition with functional interfaces over deep inheritance hierarchies—partially replacing classic template methods with lambdas. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions. Citing concrete JDK examples for each pattern usually beats abstract definitions alone.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-088',
    question:
      'What is the difference between an object monitor and `java.util.concurrent` locks at the JVM level?',
    answer:
      'Intrinsic monitors map to object headers’ mark word locking: biased locking, lightweight spin, then heavyweight OS mutex escalation under contention—optimized for uncontended cases. `ReentrantLock` uses `AbstractQueuedSynchronizer` with CLH-style queues and park/unpark—more predictable APIs for timeouts and interrupts. JDK improvements may bias differently; biased locking toggled across versions. Understanding monitor inflation explains some pause spikes. Advanced interviews reference `JVM TI` and `-XX:+PrintAssembly` for lock primitives—rare in day-to-day but signals depth. Choosing between intrinsic and explicit locks is API and feature-driven more than raw speed. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-089',
    question:
      'How does `Stream` short-circuiting interact with infinite streams, and what are correctness concerns?',
    answer:
      'Short-circuit operations (`findFirst`, `anyMatch`, `limit`) stop processing once a result is determined—crucial for infinite streams produced via `Stream.iterate` or `generate`. However, some upstream stages may still execute eagerly if misconstructed—pipeline fusion is not infinite-magic; unordered parallel streams may split unpredictably. `iterate` with side effects is discouraged; use `forEach` for effects or restructure. Interview traps: infinite stream without short-circuit hangs. Understanding takeWhile/dropWhile (Java 9) improves expressiveness for ordered finite-prefix searches. Document ordering requirements when using `findFirst` vs `findAny` in parallel. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'boolean has = Stream.iterate(1, i -> i + 1)\n    .anyMatch(n -> n > 1_000_000);',
    codeLanguage: 'java',
  },
  {
    id: 'cj-090',
    question:
      'Explain the contract of `Object.wait`, `notify`, and `notifyAll` and why spurious wakeups require loops.',
    answer:
      'A thread must own the monitor (`synchronized`) before calling `wait`, which releases the lock and sleeps until notified or interrupted. `notify` wakes one waiter; `notifyAll` wakes all—necessary when wait conditions differ per thread. Spurious wakeups (documented in JLS) mean `wait` can return without notification—always re-check condition in a loop (`while (!condition) wait()`). Prefer `java.util.concurrent` condition queues for clearer APIs with multiple predicates. Interviewers test whether candidates understand lost notifications if condition checks are wrong. Legacy code still uses wait/notify in older libraries—maintenance scenarios matter. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-091',
    question:
      'What is reactive programming in the Java ecosystem, and how does it relate to Project Reactor or RxJava?',
    answer:
      'Reactive libraries model asynchronous streams with backpressure—slow consumers signal producers to avoid unbounded queues exploding memory (`Publisher`/`Subscriber` in Reactive Streams spec). Project Reactor (`Mono`, `Flux`) powers Spring WebFlux; RxJava offers similar operators with historical differences. Virtual threads reduce the need for reactive style in some I/O workloads by making blocking cheaper—architectural trade-offs evolve. Debugging stack traces becomes harder due to operator fusion and async boundaries. Interview experts compare imperative CompletableFuture chains vs declarative reactive pipelines for service composition. Choose reactive when streaming large datasets with explicit flow control; avoid cargo-cult adoption for simple CRUD. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-092',
    question:
      'Discuss `SecurityManager` deprecation/removal direction and what replaces policy enforcement?',
    answer:
      'The SecurityManager sandbox model (applets-era) is deprecated for removal because it was brittle and inconsistently applied; modern JDKs steer toward operating-system isolation, containers, module encapsulation, and explicit permission models outside the JVM. Libraries relying on `checkPermission` need migration. For untrusted code execution, external sandboxing (Wasm, separate processes) is preferred. Interview answers show awareness of JDK roadmap changes affecting enterprise middleware still toggling `SecurityManager`. This is evolving—check current JDK release notes. Security architecture now emphasizes least privilege at deployment boundaries rather than in-process policy files alone. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-093',
    question:
      'How do you design thread-safe lazy initialization of singletons, and what is the initialization-on-demand holder idiom?',
    answer:
      'Naive DCL without volatile was broken pre-JMM fix; now `volatile` instance plus double-checked locking works but is verbose. Initialization-on-demand holder leverages class initialization lock: a nested static class holds the singleton instance—`SingletonHolder.INSTANCE` triggers JVM class init exactly once thread-safely without explicit synchronization in user code. Enum singletons (`INSTANCE`) are serialization-safe and recommended by Effective Java. For dependency injection frameworks, singletons are often unnecessary—container scopes manage lifecycles. Interview traps: static blocks with circular dependencies cause `ExceptionInInitializerError`. Understanding class init order matters in modular class loaders. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'static class Holder {\n  static final Resource INSTANCE = new Resource();\n}',
    codeLanguage: 'java',
  },
  {
    id: 'cj-094',
    question:
      'What are `VarHandle` and `MethodHandle` compared to reflection for high-performance libraries?',
    answer:
      '`MethodHandle` offers typed invocation that JIT can inline similarly to direct calls after linkage—used by invokedynamic bootstraps. `VarHandle` provides coordinated access to fields and array elements with memory ordering modes (plain, volatile, acquire/release) for lock-free algorithms replacing some `sun.misc.Unsafe` uses. Reflection remains flexible but slower and wider in access checks unless `setAccessible` bypasses. Libraries generating bytecode (Byte Buddy) achieve near-native speeds. Interview mention signals experience with low-level concurrent data structures or RPC frameworks. Most application developers rarely touch these directly. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-095',
    question:
      'Explain the dangers of `finalize`, `Cleaner`, and `PhantomReference` for native resource management.',
    answer:
      '`finalize` is deprecated for removal—unpredictable latency, resurrection bugs, and GC overhead—do not rely on it to close handles. `Cleaner` (Java 9+) runs actions when phantomly reachable, better but still non-deterministic timing—use only as safety net alongside explicit `close`. Prefer try-with-resources for AutoCloseable resources. Native memory leaks occur if neither explicit close nor cleaner runs promptly under memory pressure. `PhantomReference` queues enable pre-mortem cleanup patterns in advanced frameworks. Interview answers emphasize explicit lifecycle management in APIs (`close`, `shutdown`) as primary. Operating systems running out of file descriptors is a classic production failure mode. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-096',
    question:
      'How does the `record` + `sealed` combination support modeling algebraic data in enterprise services?',
    answer:
      'Sealed interfaces with permitted record implementations model closed sets of outcomes (`sealed interface Result permits Ok, Err`). Pattern matching switches can exhaustively decompose cases—compiler enforces coverage when hierarchy changes, reducing default fallthrough bugs in payment or state machine code. Serialization frameworks must support records (constructor properties). Mapping to JSON may require annotations on compact components. Migration from Lombok or POJOs needs team agreement. Interview experts tie this to domain-driven design: make illegal states unrepresentable with sealed unions. Combined with validation in compact constructors, records tighten service boundaries. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-097',
    question:
      'What is the `Unsafe` class controversy, and how are APIs migrating to supported replacements?',
    answer:
      '`sun.misc.Unsafe` provided direct memory access and CAS primitives before standard APIs existed—widely abused despite package name. JDK maintainers introduced `VarHandle`, `MemorySegment`, standard atomic classes, and Foreign API to replace various Unsafe uses. Libraries like Netty or Cassandra historically relied on Unsafe for performance—migration is ongoing across releases with `--illegal-access` warnings becoming errors. Interview answers acknowledge technical debt in ecosystem dependencies during JDK upgrades. Understanding this clarifies why major version bumps require dependency compatibility matrices. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions. Budget regression time whenever the JDK tightens encapsulation or removes obsolete `sun.*` entry points your stack still touches.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-098',
    question:
      'Describe how you would diagnose a production `OutOfMemoryError: Java heap space` incident end-to-end.',
    answer:
      'Capture heap dump automatically with `-XX:+HeapDumpOnOutOfMemoryError` and analyze dominators: identify largest retained objects (cache entries, sessions, duplicate strings). Correlate with deployment time, traffic spike, or config change. Check for memory leaks vs legitimate capacity—maybe `-Xmx` simply too low for dataset. Review GC logs for thrashing before OOM: if full GC loops, allocation rate exceeds reclamation. Thread dumps ensure no thread explosion exhausting memory via stacks. Off-heap NMT if native OOM suspected. Communicate remediation: fix leak, tune cache TTL, scale horizontally, or increase heap with GC tuning. Post-incident: add metrics for heap after GC and allocation rate. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-099',
    question:
      'What role does `equals`/`hashCode` play in Hibernate/JPA entities, and what mistakes break collections?',
    answer:
      'JPA entities often use database identifiers for equality once assigned—transient entities may break `Set` membership if `hashCode` changes after persist (`merge` surprises). Some teams use business keys only; others use stable UUIDs assigned pre-persist. Using mutable fields in `equals` while object sits in managed collections causes inconsistency. Lazy proxies complicate reference equality—`instanceof` checks and Hibernate `Hibernate.getClass` patterns appear. Interview answers recommend clear team conventions documented in architecture guidelines. Testing equals/hashCode with persistence round-trips catches issues early. This question bridges Core Java and persistence interviews. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-100',
    question:
      'As a closing expert question: how do you keep Java skills current given six-month JDK cadence and ecosystem churn?',
    answer:
      'Adopt a layered learning strategy: follow JDK release notes for language features you can adopt incrementally (`--release` targeting), subscribe to Inside Java podcasts or OpenJDK mailing lists for rationale, and run pet projects on latest LTS in CI to surface deprecation warnings early. Differentiate library churn (Spring major versions) from platform changes (JPMS, strong encapsulation). Participate in code reviews emphasizing modern idioms (records, pattern matching, text blocks) with compatibility gates. Contribute upstream or file issues when frameworks lag—deepens understanding. Balance hype (every new reactive framework) with fundamentals: concurrency, performance methodology, and JVM diagnostics remain evergreen interview differentiators even as syntax evolves.',
    codeLanguage: 'java',
  },
]
