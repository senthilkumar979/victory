import type { InterviewQuestion } from '../types'

/** Core Java cj-051–cj-075 — Advanced concurrency, IO, JVM concepts */
export const CORE_JAVA_BATCH_3: InterviewQuestion[] = [
  {
    id: 'cj-051',
    question:
      'Describe the lifecycle states of a Java thread and key transitions.',
    answer:
      'A thread begins `NEW` after construction before `start()`. Calling `start()` moves it to `RUNNABLE`—eligible to run (JVM maps to OS runnable/blocked states). It may enter `WAITING` via `Object.wait`, `Thread.join` without timeout, or `LockSupport.park`—released by `notify`/`notifyAll` or unpark. `TIMED_WAITING` adds timeouts (`sleep`, `wait(ms)`, `join(ms)`). `BLOCKED` means waiting to enter a `synchronized` monitor. `TERMINATED` when `run` completes or uncaught exception ends thread. Deprecated methods `suspend`/`resume`/`stop` are unsafe. `Thread.getState()` exposes JMX-visible states. Interviewers connect lifecycle to debugging thread dumps: BLOCKED shows lock contention; WAITING shows coordination issues. Understanding this is prerequisite for `jstack` analysis and fixing deadlocks. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-052',
    question:
      'What does the `synchronized` keyword guarantee, and what does it not fix?',
    answer:
      '`synchronized` provides mutual exclusion and visibility: entering a monitor flushes working memory to main memory; exiting publishes updates—establishing a happens-before edge with other synchronized accesses on the same lock. Static synchronized methods lock on the `Class` object; instance methods lock on `this`. Blocks allow finer-grained locking on other objects. It does not prevent deadlocks if lock acquisition order is inconsistent across threads. It does not make compound operations atomic unless both read-modify-write sequences sit inside the same critical section. Nor does it help unrelated data races on variables accessed without synchronization or `volatile`. Performance: uncontended locks are cheap due to biased locking and adaptive spinning in modern JVMs, but contention still serializes throughput. Interview follow-ups: prefer `java.util.concurrent` abstractions for timeouts and interruptibility.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-053',
    question:
      'Explain the `volatile` keyword and the happens-before relationship it establishes.',
    answer:
      '`volatile` fields are read and written through main memory, not cached per-thread registers indefinitely, ensuring visibility across threads without locking for single-field updates. Writes to volatile happen-before subsequent reads of that field—ordering guarantees for dependent reads/writes around volatile accesses per JLS memory model rules. It does **not** make `i++` atomic—that is read-modify-write requiring `AtomicInteger` or synchronization. Use cases: status flags, one-time publication of immutable references (with care). Misusing volatile for compound invariants leads to races. Interviewers contrast with `synchronized` which provides mutual exclusion plus visibility. Understanding volatile is essential for lock-free algorithm discussions and for reading open-source concurrency utilities. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'private volatile boolean shutdown;\n// writer thread sets true; readers observe without lock',
    codeLanguage: 'java',
  },
  {
    id: 'cj-054',
    question:
      'Compare `Runnable` and `Callable`. How do exceptions propagate from each when using an `ExecutorService`?',
    answer:
      '`Runnable.run` returns void and cannot throw checked exceptions through the interface contract—errors must be handled inside. `Callable.call` returns a value and may throw checked exceptions; `ExecutorService.submit` wraps them in `Future.get()` as `ExecutionException` with the cause accessible via `getCause()`. Uncaught runtime exceptions from `Runnable` may go to the thread’s `UncaughtExceptionHandler` depending on executor configuration. For async pipelines, `CompletableFuture` offers richer composition. Choosing Callable suits tasks that produce results or need checked exception propagation in a typed way. Interview answers should mention `invokeAll`/`invokeAny` batch behaviors and timeout APIs on `Future` to avoid blocking forever. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-055',
    question:
      'What is `ExecutorService`, and how do you shut it down correctly?',
    answer:
      '`ExecutorService` abstracts thread pooling and task submission, decoupling task submission from execution policy. Implementations like `ThreadPoolExecutor` let you tune core/max pool sizes, queues, and rejection policies (`AbortPolicy`, `CallerRunsPolicy`, etc.). After use, call `shutdown()` to stop accepting new tasks and allow queued work to finish; `shutdownNow()` attempts interrupting workers and returns pending tasks—use when you must stop quickly. `awaitTermination` with timeout combines graceful and forced shutdown patterns. Failing to shutdown thread pools leaks threads in application servers or tests. `Executors` factory methods are convenient but hide queue sizing—production code often constructs `ThreadPoolExecutor` explicitly for visibility. Virtual threads (Project Loom) change scaling assumptions but executors remain relevant for integration.',
    codeExample:
      'try (var pool = Executors.newFixedThreadPool(4)) {\n  pool.submit(task);\n} // Java 19+ AutoCloseable on some factories',
    codeLanguage: 'java',
  },
  {
    id: 'cj-056',
    question:
      'What are `CountDownLatch` and `CyclicBarrier`, and when do you use each?',
    answer:
      '`CountDownLatch` is a one-shot synchronization point: one or more threads await until a counter decrements to zero across events—useful for startup coordination (“wait until all services ready”) or fan-in completion signals. The count cannot reset; reuse requires new instance. `CyclicBarrier` lets a fixed party of threads rendezvous at a barrier point and optionally run a barrier action; after release, it can be reused—good for parallel phases of computation. `Phaser` offers more flexible dynamic party counts. Interview traps: `await` without timeout can hang forever if counts wrong. Understanding these primitives clarifies fork/join style workflows before jumping to higher-level frameworks. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-057',
    question:
      'How does `ReentrantLock` differ from intrinsic `synchronized` monitors?',
    answer:
      '`ReentrantLock` is an explicit mutual exclusion lock with API-level try-lock, timed lock, interruptible lock acquisition, and fairness option—fair locks reduce starvation at throughput cost. It supports multiple wait/notify via `Condition` objects for complex coordination compared to single `wait` set per intrinsic lock. Must unlock in `finally` to avoid deadlocks on exceptions—unlike synchronized blocks which release automatically. Performance is competitive; choose based on features needed. `ReadWriteLock` splits read-heavy workloads when writes are rare. Interviewers may ask about `StampedLock` for optimistic reads. Mention `java.util.concurrent.locks` integrates with memory model same as synchronized when used correctly. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'Lock lock = new ReentrantLock();\nlock.lock();\ntry { /* critical */ } finally { lock.unlock(); }',
    codeLanguage: 'java',
  },
  {
    id: 'cj-058',
    question:
      'What are atomic classes like `AtomicInteger`, and how do they achieve lock-free updates?',
    answer:
      'Classes in java.util.concurrent.atomic wrap volatile semantics with compare-and-swap (CAS) loops: hardware primitives like Unsafe.compareAndSwapInt attempt to update only if the current value matches expectation, retrying on contention. This avoids blocking but can spin under heavy contention—LongAdder mitigates by striping counters. Methods like getAndIncrement are atomic for single operations; compound invariants still need careful design (AtomicReference with immutable snapshots). CAS limitations include the ABA problem in complex lock-free structures (mitigated by AtomicStampedReference). Interview answers should contrast atomic variables with synchronized blocks for simple counters and metrics. Understanding CAS is a prerequisite for reading concurrent collections internals. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-059',
    question:
      'Explain `ThreadLocal`. What is a common memory leak scenario in application servers?',
    answer:
      '`ThreadLocal` provides per-thread variables keyed by thread—useful for request contexts, transactions, or SimpleDateFormat instances that are not thread-safe (though `DateTimeFormatter` is immutable and preferred). Each thread holds a map of thread locals cleared when the thread exits. In pooled thread environments (servlets), if you forget `remove()` after a request, references to large objects may survive until the worker thread is replaced—leaking class loaders in redeploy scenarios. Best practice: `try/finally` with `remove()` around request scope. Virtual threads encourage revisiting ThreadLocal usage because carrier threads multiplex many virtual threads—frameworks adapt scoping. Interviewers want awareness of cleanup, not just API syntax. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-060',
    question:
      'Describe deadlock, livelock, and starvation with examples of mitigation.',
    answer:
      'Deadlock: threads circularly wait for locks each holds—classic dining philosophers. Mitigation: global lock ordering, try-lock with backoff, or using a single lock hierarchy. Livelock: threads keep responding to each other’s conditions without progress—mitigate with randomness or exponential backoff. Starvation: unfair schedulers or priority inversion delay some threads—fair locks or monitoring queue lengths help. JVM cannot always detect deadlocks automatically in all custom synchronizers, but `ThreadMXBean.findDeadlockedThreads` helps. Interview answers should include jstack identification of "Found one Java-level deadlock". Designing timeouts (`tryLock`) converts indefinite waits into recoverable failures at the cost of complexity. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-061',
    question:
      'What is `ConcurrentHashMap`, and how does it differ from wrapping `HashMap` with `Collections.synchronizedMap`?',
    answer:
      '`ConcurrentHashMap` uses fine-grained locking or CAS techniques (varies by JDK version) to allow concurrent reads and limited concurrent writes without locking the entire table—higher throughput under contention. It does not allow `null` keys or values to avoid ambiguity. Iterators are weakly consistent. `Collections.synchronizedMap` wraps with a single mutex serializing all operations—simpler but poor scalability. Neither replaces transactional compound operations: `putIfAbsent` helps but patterns like "check then act" may still need extra synchronization. Interview follow-ups: size() is approximate during concurrency; computing methods must be used carefully to avoid recursive computation issues. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-062',
    question:
      'Give an overview of `CompletableFuture` and common pitfalls.',
    answer:
      '`CompletableFuture` composes asynchronous pipelines with `thenApply`, `thenCompose`, `allOf`, `anyOf`, and explicit executor parameters to avoid common-pool overload. Pitfalls: blocking on `get()` in async callbacks negates benefits; swallowing exceptions without `exceptionally` or `whenComplete` hides failures; default async stages run on `ForkJoinPool.commonPool()` which may starve other work; implicit thread hopping complicates tracing. Timeouts via `orTimeout`/`completeOnTimeout` (Java 9+) prevent indefinite waits. For I/O-bound work, custom executors sized to connection pools are important. Interviewers like discussing backpressure—`CompletableFuture` does not inherently provide it; reactive streams do. Still, for service orchestration it is widely used. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-063',
    question:
      'When are parallel streams appropriate, and what can go wrong?',
    answer:
      'Parallel streams split work across `ForkJoinPool.commonPool()` threads, beneficial for CPU-bound bulk operations on large in-memory datasets when operations are side-effect free and spliterator splitting is efficient (`ArrayList` good; `LinkedList` poor). Problems arise when tasks block on I/O, mutate shared state, or rely on thread-local assumptions—pool threads starve other parallel streams and CompletableFuture stages. Wrong source structures cause uneven splits. Debugging parallel bugs is harder due to nondeterminism. Always benchmark: small lists parallelize slower due to overhead. Interview answer should show awareness of `Spliterator` characteristics and the `parallelism` system property. Prefer explicit executors for mixed workloads. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-064',
    question:
      'Explain NIO.2 (`java.nio.file`) capabilities: `Path`, `Files`, and `WatchService`.',
    answer:
      '`Path` models hierarchical paths with platform-neutral operations; `Paths.get` constructs instances. `Files` provides high-level utilities: copy/move/delete with options (`REPLACE_EXISTING`, `ATOMIC_MOVE`), directory streams, walking trees with depth controls, reading/writing strings and lines with charset awareness, and creating temporary files/directories securely. `WatchService` monitors directories for `ENTRY_CREATE`, `ENTRY_MODIFY`, `ENTRY_DELETE` events—useful for config reload pipelines though platform differences exist (macOS polling vs native watchers). Symlink handling via `LinkOption.NOFOLLOW_LINKS` avoids surprises. Interviewers may contrast with legacy `java.io.File` which had fewer guarantees and poorer error reporting. NIO.2 integrates with `FileSystem` providers for ZIP/JAR file systems. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'var text = Files.readString(path, StandardCharsets.UTF_8);',
    codeLanguage: 'java',
  },
  {
    id: 'cj-065',
    question:
      'What are `ByteBuffer`, direct buffers, and why do networking libraries use them?',
    answer:
      '`ByteBuffer` abstracts a chunk of memory with position/limit/capacity semantics for encoding/decoding primitives and bulk transfers. Direct buffers allocate off-heap memory via `allocateDirect`, reducing copying between OS sockets and Java heap during I/O—critical for high-throughput servers. Trade-off: slower allocation and GC interaction via `Cleaner`/`PhantomReference`—must size carefully. Non-direct buffers live on heap and may incur an extra copy into native space for JNI calls. Byte order via `ByteOrder.BIG_ENDIAN` matters for protocols. Interview follow-ups include `MappedByteBuffer` for memory-mapped files—fast random access but OS paging behavior complexities. Understanding buffers clarifies Netty and NIO channel code. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-066',
    question:
      'Describe class loading: bootstrap, platform, application loaders, and delegation.',
    answer:
      'The JVM uses hierarchical class loaders: bootstrap loads core `java.*` classes from modules in the runtime image (not a `ClassLoader` instance in older descriptions); platform (extension) loader handles upgraded modules; application/system loader loads classpath/module path application classes. Delegation means before a loader attempts to define a class, it asks its parent—preventing shadowing core classes by malicious jars (unless broken by custom loaders). Custom loaders in app servers isolate WARs, enabling hot deploy. `Class.forName` vs `ClassLoader.loadClass` differ in initialization timing. Interviewers probe `NoClassDefFoundError` vs `ClassNotFoundException`—loading vs linkage. JPMS adds layer boundaries and readability constraints beyond traditional classpath scanning. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-067',
    question:
      'What is reflection, and what are performance and security trade-offs?',
    answer:
      'Reflection (`Class`, `Method`, `Field`, `Constructor`) inspects and invokes types at runtime unknown at compile time—powering frameworks (Spring, Hibernate), serialization, and tests. Costs: method lookup caches help but invocation still slower than direct calls; security checks apply unless `setAccessible(true)` bypasses with `opens` in JPMS. Breaking encapsulation risks brittle code across versions. Method handles (`java.lang.invoke`) and bytecode generation (Byte Buddy) optimize hot paths. SecurityManager historically restricted reflective access; modern JDKs move toward strong encapsulation with warnings for illegal reflective access. Interview answer balances: indispensable for frameworks, but application domain logic should prefer normal APIs for clarity and type safety. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-068',
    question:
      'Outline the Java Platform Module System goals and how `module-info.java` enforces boundaries.',
    answer:
      'JPMS (Java 9+) packages the JDK as modules, replaces the monolithic `rt.jar`, and lets libraries declare explicit dependencies with `requires`, `exports`, `opens` for reflection, `provides`/`uses` for services, and `transitive` requires. Strong encapsulation hides internal packages unless exported—reducing accidental coupling. Tools like `jdeps` analyze migration. Running on classpath still works with automatic modules from JAR names. Challenges: split packages, reflective frameworks needing `opens`, and build tool support. Interviewers on enterprise migration ask about `--illegal-access` history and Spring/OpenJPA adjustments. Modules clarify deployment boundaries beyond Maven coordinates. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-069',
    question:
      'What are common garbage collection algorithms at a high level (G1, ZGC, Shenandoah)?',
    answer:
      'Serial/Parallel collectors pause the world for young/old generations—simple but higher pauses. CMS was concurrent with fragmentation issues—deprecated. G1 partitions heap into regions, targets predictable pause times by collecting regions with most garbage first—default for many server workloads on large heaps. ZGC and Shenandoah aim for sub-millisecond pauses on huge heaps using concurrent compaction and colored pointers or Brooks barriers—trade CPU overhead for latency. Choosing collectors depends on SLA, heap size, and JDK version availability. Tuning flags (`-XX:MaxGCPauseMillis`, region sizing) interact non-linearly. Interview answers should admit empirical profiling beats theory—`GC logs` and `jstat` guide decisions. Misconfiguring heap causes more outages than algorithm choice.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-070',
    question:
      'What does the JIT compiler do, and what is tiered compilation?',
    answer:
      'The JVM starts interpreting bytecode quickly, then profiles hot methods and compiles them to native code with optimizations like inlining, escape analysis, loop unrolling, and devirtualization of monomorphic calls. Tiered compilation uses multiple levels (C1 client compiler for fast startup, C2 server compiler for aggressive opts) balancing startup vs peak performance. Deoptimization occurs when assumptions break (e.g., class loading invalidates inlined targets). `-XX:+PrintCompilation` and JIT logs help diagnose. Understanding JIT explains microbenchmark pitfalls (JMH warms up). Interviewers connect JIT to performance cliffs: small code changes may enable inlining that dramatically speeds loops. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-071',
    question:
      'Explain escape analysis and scalar replacement in the JVM.',
    answer:
      'Escape analysis determines whether an object’s reference leaks outside a method or thread. If an object does not escape, the JVM may stack-allocate its fields or elide allocation entirely (scalar replacement)—reducing GC pressure. This is automatic and not guaranteed—depends on optimization tiers and code shape. Objects stored into fields or returned escape and must be heap allocated. Understanding this clarifies why naive microbenchmarks allocating short-lived objects sometimes show unexpectedly good performance. It also shows limits: synchronization on escaped objects still needed. Interview mention pairs with lock elision for synchronized blocks on non-escaping locks—another JVM optimization. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-072',
    question:
      'What are weak, soft, and phantom references, and how do they interact with GC?',
    answer:
      '`WeakReference` is collected eagerly when no strong references remain—ideal for caches keyed by metadata without preventing collection. `SoftReference` survives until memory pressure demands reclamation—good for memory-sensitive caches (`SoftReference` to large images). `PhantomReference` enqueues after finalization when object memory is about to be reclaimed—used with `ReferenceQueue` for cleanup actions more safely than `finalize`. Each interacts with `ReferenceQueue` for notification. Strong references dominate: weak maps (`WeakHashMap`) entries disappear when keys are only weakly reachable. Interviewers warn about accidental strong references in cache values defeating weak keys. These APIs matter for advanced libraries, not everyday business code. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-073',
    question:
      'How does `invokedynamic` relate to lambdas and dynamic language support on the JVM?',
    answer:
      '`invokedynamic` bytecode instruction defers method selection to bootstrap methods at linkage time, enabling flexible call sites—foundation for lambda metafactory (`LambdaMetafactory`) generating adapter classes lazily instead of many anonymous class files. It also powers `MethodHandle` invocation patterns and languages like Groovy/JRuby targeting the JVM. Compared to reflection, method handles + invokedynamic can be optimized by JIT similarly to direct calls after linkage. Interview answers should mention runtime code generation strategy changes across JDK versions. Understanding invokedynamic demystifies stack traces with `$$Lambda` classes. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-074',
    question:
      'What is `MethodHandles.Lookup` and why does framework code care about it?',
    answer:
      '`Lookup` objects encapsulate the privileges to resolve and invoke members with boundary enforcement: you can `findVirtual`, `findStatic`, `unreflect` methods with checks that the caller module can legally access targets—aligning with JPMS strong encapsulation. Illegal reflective access on JDK internals now fails by default across releases. Frameworks obtain lookups via `MethodHandles.privateLookupIn` when bridging modules. This replaces some `setAccessible` patterns with supported APIs. Interviewers targeting modular libraries expect awareness of lookup propagation in serialization and dependency injection. It ties into security hardening roadmaps for the JDK. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-075',
    question:
      'Describe pattern matching for `instanceof` and `switch` (modern Java) and benefits for domain modeling.',
    answer:
      'Pattern matching for `instanceof` binds typed variables in one step: `if (obj instanceof String s) { return s.length(); }` avoiding redundant casts. `switch` on types with guards reduces verbose `if/else` chains and integrates with sealed hierarchies for exhaustiveness checking—compiler warns when cases missing. Records destructure components in patterns (preview features evolving by release). Benefits: safer refactors when new subtypes appear, clearer business rules, less boilerplate. Migration path requires JDK upgrades and possible Gradle `--release` alignment. Interview answers should note preview vs final status per version. This represents Java’s incremental move toward algebraic data handling without abandoning OOP roots. Senior panels also like short stories: one production incident, one design trade-off, and how you validated assumptions with metrics or tests—not only textbook definitions.',
    codeExample:
      'if (shape instanceof Circle c) {\n  return Math.PI * c.radius() * c.radius();\n}',
    codeLanguage: 'java',
  },
]
