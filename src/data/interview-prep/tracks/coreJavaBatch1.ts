import type { InterviewQuestion } from '../types'

/** Core Java cj-001–cj-025 — Beginner fundamentals */
export const CORE_JAVA_BATCH_1: InterviewQuestion[] = [
  {
    id: 'cj-001',
    question:
      'Explain the relationship between the JDK, JRE, and JVM. What do you actually install on a developer machine versus a production server that only runs bytecode?',
    answer:
      'The Java Virtual Machine is the engine that executes compiled `.class` files (bytecode). It abstracts the operating system so the same bytecode can run on Linux, Windows, or macOS as long as a compatible JVM exists for that platform. The Java Runtime Environment bundles the JVM plus the standard libraries (`java.base`, I/O, collections, concurrency utilities, and more) that most programs need at runtime—essentially everything required to launch `java MyApp` without a compiler. The Java Development Kit adds development tools on top of the JRE: the `javac` compiler, `javadoc`, `jar`, `jlink`, diagnostic tools like `jcmd`, and often a language server for IDEs. On a developer laptop you typically install a full JDK so you can compile and debug. On a minimal production image you might ship only a JRE—or nowadays a custom runtime produced with `jlink`—if you build artifacts elsewhere; you never need `javac` on the server unless you compile there. Interviewers expect you to say clearly that bytecode targets the JVM, not the CPU directly, and that choosing the right JDK distribution (Temurin, Corretto, etc.) matters for support and security updates.',
    codeExample:
      '// Compile on a machine with JDK:\n// javac Hello.java\n// java Hello   // JVM interprets/JIT-compiles bytecode',
    codeLanguage: 'java',
  },
  {
    id: 'cj-002',
    question:
      'What is the purpose of `public static void main(String[] args)` and what happens if you change its signature?',
    answer:
      'The JVM looks for a very specific entry method so it can start your program deterministically. `public` lets the launcher invoke it from outside the class; `static` means the method belongs to the type, so the runtime can call it without constructing an instance first—critical because execution must begin before any objects exist. `void` signals no return value to the caller (the process exit code is separate). `String[] args` carries command-line arguments. If you rename the method, change parameter types, drop `static`, or tweak visibility, the JVM will throw `NoSuchMethodError: main` or similar at startup because the bootstrap contract is broken. Variations like `main(String... args)` are accepted because varargs desugar to an array. In modular Java you must also ensure the class is exported and readable to the launcher. Understanding this shows you know the difference between language syntax and platform conventions that tooling depends on.',
    codeExample:
      'public class App {\n  public static void main(String[] args) {\n    System.out.println(args.length);\n  }\n}',
    codeLanguage: 'java',
  },
  {
    id: 'cj-003',
    question:
      'List Java primitive types, their approximate sizes, and why wrapper classes exist.',
    answer:
      'Java has eight primitives: `byte` (8 bits), `short` (16), `char` (16-bit Unicode code unit), `int` (32), `long` (64), `float` (32 IEEE-754), `double` (64), and `boolean` (JVM-defined, typically 1 byte in arrays but not directly sized like others). Primitives live on the stack when they are local variables and are cheap to operate on because they avoid object overhead. Wrapper classes (`Integer`, `Double`, etc.) exist so you can use primitives where objects are required: generics (`List<Integer>` cannot be `List<int>` in classic Java), nullable numeric databases, reflection, and APIs like `Collections` that were designed around `Object`. Wrappers also provide static helpers such as `Integer.parseInt` and bit-twiddling utilities. Autoboxing hides the conversion but can allocate unexpectedly in hot loops, which is a common performance interview talking point. Mentioning `boolean` has no exact size in the spec shows attention to detail.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-004',
    question:
      'Compare `==` and `.equals()` for reference types. Why can two strings behave differently with each operator?',
    answer:
      'For object references, `==` compares identity: do both variables point to the exact same instance in the heap? The `equals` method, unless overridden, defaults to `Object`’s identity behavior, but classes like `String`, `Integer` (within cache range), and properly written value types override `equals` to compare meaningful fields. Two `String` objects constructed with `new String("hi")` are not `==` equal because they are distinct instances, yet `equals` returns true because it compares character content. Literals and interned strings may share one instance, so `==` can accidentally appear to work for strings—this is a classic trap. In interviews always recommend `equals` for value semantics and `Objects.equals(a,b)` for null-safe comparisons. For primitives you must use `==` because they are not objects. Mixing up these rules leads to subtle bugs in `HashMap` keys and collection membership tests.',
    codeExample:
      'String a = new String("x");\nString b = new String("x");\nSystem.out.println(a == b);        // false\nSystem.out.println(a.equals(b));   // true',
    codeLanguage: 'java',
  },
  {
    id: 'cj-005',
    question: 'What is the string pool, and how does `String.intern()` interact with it?',
    answer:
      'The JVM maintains a pool of interned string literals and manually interned strings for deduplication. Literal constants in source code (`"hello"`) are automatically interned, so identical literals typically reference one shared `char[]` backing sequence in modern JDKs. `intern()` returns the canonical pool instance for a given sequence: if an equal string already exists in the pool, that reference is returned; otherwise the current instance may be added. This can reduce memory when many duplicate strings exist, but interning huge dynamic sets can blow the perm-gen/metaspace pressure and slow down GC because the pool is a global structure. In modern applications, intern is rarely used compared to deduplicating at the domain layer. Interviewers want you to connect literals to the pool, explain why `==` sometimes works between literals, and caution that `new String("a")` creates a heap object outside the pool until interned. Understanding this clarifies performance and debugging of string-heavy workloads.',
    codeExample:
      'String a = "hi";\nString b = new String("hi").intern();\nSystem.out.println(a == b); // true after intern',
    codeLanguage: 'java',
  },
  {
    id: 'cj-006',
    question:
      'Why are `String` objects immutable in Java, and what are the practical consequences?',
    answer:
      'Immutability means internal state cannot change after construction: `String` methods like `substring` or `concat` return new instances rather than mutating buffers. This design simplifies reasoning in multithreaded code because shared strings need no locks, enables safe reuse as `HashMap` keys, and allows aggressive JVM optimizations such as string deduplication in some GCs. The trade-off is that repeated concatenation in loops using `+` creates many intermediate objects; that is why `StringBuilder` exists for mutable assembly. Immutability also enables the string pool and compiler optimizations for constant folding. In interviews mention security: sensitive strings can be cleared from mutable `char[]` in niche APIs, whereas `String` cannot be wiped from memory by user code. Candidates should contrast reference immutability with the fact that a `String` variable can still be reassigned to point to another instance.',
    codeExample:
      'String s = "a";\ns = s + "b"; // new String produced; original "a" unchanged',
    codeLanguage: 'java',
  },
  {
    id: 'cj-007',
    question:
      'Explain `final` when applied to a class, a method, and a variable.',
    answer:
      'A `final` class cannot be subclassed, which is useful for security-sensitive types (`String`) or when you want to forbid extension that could violate invariants. A `final` method cannot be overridden in subclasses, preserving behavior in inheritance hierarchies—often used when a template method should not be altered. A `final` variable must be assigned exactly once (blank final fields must be set in every constructor path); for object references, the reference cannot change but the object’s internal state may still mutate if the class is mutable. `final` parameters prevent reassignment inside the method body, aiding readability. The Java Memory Model also gives special visibility guarantees for final fields after construction completes, which matters in concurrency interviews at higher levels. Confusing `final` with immutability of entire object graphs is a common mistake to call out.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-008',
    question:
      'What is the difference between a compile-time constant and a `static final` field that is not a constant expression?',
    answer:
      'Compile-time constants of type `String` or primitive are literals or expressions determinable at compile time (e.g., `static final int MAX = 10 * 60`). They may be inlined across compilation units, meaning changing the value later without recompiling dependents can cause inconsistent behavior. A `static final` reference initialized with runtime computation—`static final Instant START = Instant.now()`—is not inlined and is evaluated when the class initializes. Constants participate in `switch` cases as labels only when truly constant. Understanding this distinction matters for binary compatibility when shipping libraries: changing a constant may require clients to recompile. Interviewers appreciate mentioning `static final` Loggers or Patterns compiled once. This topic bridges language rules with build hygiene.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-009',
    question:
      'Describe Java’s pass-by-value semantics for both primitives and object references.',
    answer:
      'Java always passes arguments by value: a copy is placed on the stack for the callee. For primitives, the copy is the numeric or boolean bits, so mutating a parameter never affects the caller’s local variable. For object references, the value copied is the pointer to the object; the callee can mutate the object’s fields through that reference but cannot replace the caller’s reference binding by assigning a new object to the parameter variable. This trips beginners who write swap methods expecting references to exchange in the caller. Clarifying this distinction is a standard interview filter. C++ programmers sometimes expect pass-by-reference semantics with explicit `&`; Java achieves out-parameters via holder objects, arrays, or returning new values. Mention that `this` is not passed as a hidden parameter in the same way C++ references work—instance methods receive the receiver explicitly in bytecode as the first argument.',
    codeExample:
      'void bump(int x) { x++; } // caller unchanged\nvoid append(StringBuilder sb) { sb.append("x"); } // mutates object',
    codeLanguage: 'java',
  },
  {
    id: 'cj-010',
    question:
      'What are the four categories of access modifiers in Java, and how do they apply across packages?',
    answer:
      '`private` limits visibility to the declaring top-level class; nested types can access each other’s private members within the same outer class. `package-private` (default, no keyword) allows access from any class in the same package—handy for cohesive package internals without exposing public API surface. `protected` exposes members to subclasses even in other packages, and also to same-package classes, which surprises some candidates. `public` opens access everywhere. Modular Java adds module `exports` constraints: a type can be public yet inaccessible if its package is not exported to the calling module. Interview answers should mention that tests in other packages sometimes use `protected` hooks or reflection when design is imperfect. Choosing modifiers affects API evolution: widening access is easy; narrowing breaks clients.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-011',
    question:
      'Contrast method overloading with overriding. Can you overload based only on return type?',
    answer:
      'Overloading defines multiple methods in the same class with the same name but different parameter lists (number or types); resolution happens at compile time using static overload resolution, including autoboxing, varargs, and widening conversions following strict rules. Overriding replaces a superclass instance method implementation in a subclass with the same signature and compatible return type (covariant returns allowed). `@Override` catches mistakes early. You cannot overload solely by return type because the call site would be ambiguous—javac rejects it. You also cannot override `static` or `private` methods in the polymorphic sense; hiding applies to static methods. Dynamic method dispatch applies only to non-static, non-private instance methods. Interviewers often follow up with overload resolution order: exact match, widening, boxing, varargs as last resort.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-012',
    question:
      'What is the difference between `static` and instance members of a class?',
    answer:
      'Static fields and methods belong to the class object loaded by the class loader: there is exactly one storage slot per field regardless of instance count. Instance members are allocated per object on the heap and receive `this` implicitly. Static methods cannot access instance fields directly because there is no instance context unless one is passed in. Instance methods can read static state, but overusing static for mutable state creates hidden global variables and harms testability. Static initializers run when the class is first initialized, following a defined order with superclass initialization. Thread safety for lazy static initialization is handled by the JVM’s class initialization lock, but mutable static singletons still need careful design in concurrent programs. Mentioning that interfaces may have `static` methods since Java 8 rounds out a modern answer.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-013',
    question:
      'Explain constructors, default constructors, and constructor chaining with `this()` and `super()`.',
    answer:
      'Constructors initialize new instances. If you declare no constructors, the compiler injects a public no-arg default unless another constructor exists—then you must supply your own no-arg if needed. The first statement of a constructor must be either an explicit `this(...)` delegation to another overload in the same class or `super(...)` to pick a superclass constructor; if omitted, `super()` is inserted automatically. That is why abstract parent classes can still have constructors called by concrete subclasses. Order matters: superclass fields initialize before subclass fields. Failure to match accessible superclass constructors causes compile errors. Copy constructors and builder patterns often centralize validation in one private constructor invoked via static factories. Interviewers may probe exception handling: if a superclass constructor throws checked exceptions, subclass signatures must align with the rules for `throws` clauses.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-014',
    question:
      'What methods does `java.lang.Object` define, and why do `equals` and `hashCode` matter beyond `String`?',
    answer:
      '`Object` provides `equals`, `hashCode`, `toString`, `getClass`, `clone`, `finalize` (deprecated), `notify`, `notifyAll`, and `wait`. Default `equals` compares references; default `hashCode` is native and typically identity-based. Any type used as a key in `HashMap`/`HashSet` must honor the contract: equal objects must have equal hash codes, and unequal objects should distribute hashes to avoid collisions. `toString` aids debugging; many IDEs generate implementations. `getClass` returns the runtime class token used in reflection-aware code. Correct `equals` implementations must be reflexive, symmetric, transitive, consistent, and handle null by returning false. Breaking the contract causes lost keys, duplicate entries, or infinite loops in certain collections. Mention `Objects.hash` and `Arrays` helpers for field-wise composition in value objects.',
    codeExample:
      '@Override public boolean equals(Object o) {\n  return o instanceof Point p && x == p.x && y == p.y;\n}',
    codeLanguage: 'java',
  },
  {
    id: 'cj-015',
    question:
      'How do arrays work in Java, and what is the difference between `int[]` and `Integer[]`?',
    answer:
      'Arrays are fixed-size, indexed collections with `length` field and covariant typing for reference arrays (which is unsound at runtime and leads to `ArrayStoreException`). `int[]` is a primitive array: elements are laid out contiguously without boxing. `Integer[]` is an array of references, each element can be null or point to boxed values, consuming more memory and requiring autoboxing on access. Generics do not support primitive type parameters, so `List<int>` is invalid—use `IntStream` boxes or third-party collections for specialized cases. Arrays implement `Cloneable` and `Serializable` but not `List`; `Arrays.asList` provides a fixed-size list view. Multidimensional arrays are arrays of arrays, allowing ragged shapes. Interviewers often ask about time complexity: random access is O(1), insert/delete in the middle requires shifting elements unless using other structures.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-016',
    question:
      'Describe the enhanced for-loop (`for-each`) and what types it accepts.',
    answer:
      'The enhanced for-loop iterates over arrays or any `Iterable` implementation without manual index management, reducing off-by-one errors. Under the hood it uses an iterator for collections, so modifying the collection structurally during iteration (except via the iterator’s `remove`) causes `ConcurrentModificationException` for fail-fast collections. You cannot access the index unless you maintain a separate counter. The loop variable is effectively final per iteration for primitives and references; reassigning the variable does not mutate the underlying collection element for object references unless you call mutators on the object. For primitive arrays, the element is a copy. This construct is preferred for readability when indices are unnecessary. Interview follow-ups may compare with `Stream` pipelines for lazy filtering and parallelization trade-offs.',
    codeExample:
      'for (String s : list) {\n  System.out.println(s);\n}',
    codeLanguage: 'java',
  },
  {
    id: 'cj-017',
    question:
      'What are labeled `break` and `continue`, and when are they appropriate?',
    answer:
      'Labels allow you to break or continue an outer loop rather than the innermost one, which is occasionally clearer than boolean flag variables or extracting methods—though many teams prefer smaller methods over deep nesting. A label precedes a loop statement; `break label` exits that labeled loop entirely, while `continue label` jumps to the next iteration of the labeled loop. Misuse can harm readability, so linters sometimes warn. Related constructs include `try`-with-resources and switch fall-through, which beginners confuse. In interviews, mention that exceptions should not be used for control flow in normal cases. Showing you know labels exist demonstrates thorough language knowledge even if you recommend refactoring to streams or helper methods for maintainability.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-018',
    question:
      'Compare traditional `switch` statements with modern `switch` expressions (Java 14+).',
    answer:
      'Classic `switch` falls through case labels unless `break` is used, which historically caused many bugs. Modern `switch` expressions yield a value, require exhaustive handling of enums or sealed coverage (with compiler help), and use arrow syntax `case L ->` to avoid fall-through by default. Pattern matching for `switch` (preview/standard in newer releases) allows type patterns and guards, reducing `instanceof` chains. Expressions must either return a value in every branch or throw, maintaining clarity. Exhaustiveness checking improves safety when enums add constants—you get compile errors until new cases are handled. Interviewers on modern Java expect awareness of these features because they reduce boilerplate and bugs in business logic like routing and parsers.',
    codeExample:
      'int n = switch (day) {\n  case MONDAY, FRIDAY -> 1;\n  default -> 0;\n};',
    codeLanguage: 'java',
  },
  {
    id: 'cj-019',
    question:
      'What does the `var` keyword (local variable type inference) do, and where is it not allowed?',
    answer:
      '`var` tells the compiler to infer the type of a local variable from its initializer’s static type. It reduces repetition for generic-heavy declarations (`var list = new ArrayList<String>()`), but the inferred type is not dynamic—Java remains statically typed. You cannot use `var` without an initializer, on parameters, fields, or lambda parameters unless mixed with explicit types in some parallel constructs per language version rules. Readability suffers if the initializer does not make the type obvious, so many style guides limit `var` to obvious right-hand sides. `var` is not a keyword in the sense of `int`; it is a reserved type name. Interview traps include trying `var` for `null` initializers—illegal because no type can be inferred. Mention that `var` improves alignment with `val`-style ergonomics while preserving Java’s type system.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-020',
    question:
      'How do packages and the directory structure relate, and what is the purpose of `package-info.java`?',
    answer:
      'Package names map to directories on the source path (`com.example.app` → `com/example/app`). Types are uniquely identified by fully qualified names, preventing collisions. `import` is a compile-time convenience; it does not embed files at runtime like C includes. Static imports pulls static members into scope sparingly to reduce verbosity for constants. `package-info.java` holds package-level Javadoc and package annotations such as `@Deprecated` or framework hints—there is no `package` class file separate from metadata. JPMS modules add `module-info.java` at the root to declare exports and dependencies. Interviewers may ask about naming conventions (reverse DNS) and avoiding default packages for production code. Understanding classpath vs module path is the next step for senior roles.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-021',
    question:
      'Give a beginner-friendly overview of the stack and the heap in the JVM.',
    answer:
      'Each thread has a private stack storing frames for active method calls: local primitives, partial operand stacks for bytecode execution, and reference variables pointing into the heap. When a method returns, its frame pops, reclaiming stack memory automatically—no GC involved for those bits. The heap is shared among threads and holds object instances and arrays; it is managed by the garbage collector when objects become unreachable. References from stack frames or other heap objects keep instances alive. StackOverflowError occurs when recursion is too deep or infinite. OutOfMemoryError for heap means live or leaked objects exhaust `-Xmx`. Understanding this separation explains why local variables are thread-safe by default while instance fields may need synchronization. Escape analysis may still allocate some objects on the stack as an optimization, but logically you reason about objects on the heap.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-022',
    question:
      'What is garbage collection at a high level, and can you force immediate collection in Java?',
    answer:
      'Garbage collectors reclaim unreachable heap objects so programmers rarely `free` memory manually. Reachability starts from GC roots: stack references, static fields, JNI roots, and JVM internals. Cyclic references among otherwise unreachable objects are collected because no root path exists. You cannot predict precisely when an object will be collected; `finalize` is deprecated because it was unreliable for cleanup. `System.gc()` is a hint that may be ignored by modern collectors tuned for throughput or low latency. Production code should use try-with-resources or `Cleaner` for native resource management rather than depending on GC timing. Interviewers want realistic expectations: GC pauses depend on collector choice (G1, ZGC, Shenandoah) and tuning flags. Misunderstanding GC is a common source of performance myths.',
    codeLanguage: 'java',
  },
  {
    id: 'cj-023',
    question:
      'Explain autoboxing and unboxing. What failure mode involves `null`?',
    answer:
      'Autoboxing silently converts primitives to wrappers when assigning or passing to generic APIs; unboxing extracts primitives from wrappers. This convenience hides allocations and potential `NullPointerException`: if an `Integer` variable is `null` and you assign it to `int`, unboxing calls `intValue` on null and crashes. Similarly, `map.get` returning null followed by arithmetic can NPE. In performance-sensitive loops, repeated boxing of indices or tallies creates garbage. Equality also gets tricky: `new Integer(127)` vs cached values—`Integer` caches -128 to 127 by default for `valueOf`. Interview answers should recommend `Objects.equals` for `Integer` comparisons and avoiding unnecessary wrapper types in hot paths. Knowing this prevents production incidents in seemingly simple arithmetic on `Integer` fields loaded from JPA entities.',
    codeExample:
      'Integer n = null;\nint x = n; // throws NullPointerException on unbox',
    codeLanguage: 'java',
  },
  {
    id: 'cj-024',
    question:
      'What is the difference between `StringBuilder` and `StringBuffer`, and when would you pick each?',
    answer:
      '`StringBuilder` and `StringBuffer` are mutable character sequences for efficient string assembly. `StringBuffer` methods are synchronized, providing thread-safety for shared mutation at the cost of locking overhead. `StringBuilder` is preferred in single-threaded contexts—most local string building—because it is faster. Neither should usually be shared across threads without external synchronization; often each thread constructs its own builder. For concurrent logging or shared buffers, `StringBuffer` or external locks might appear in legacy code, but modern designs prefer immutable messages or per-thread builders. Capacity grows automatically but resizing copies arrays, so setting initial capacity when known reduces churn. Interviewers contrast this with `String` concatenation which compiles to `StringBuilder` in simple cases but not always optimally in loops written naively.',
    codeExample:
      'StringBuilder sb = new StringBuilder(64);\nfor (var s : parts) sb.append(s);\nreturn sb.toString();',
    codeLanguage: 'java',
  },
  {
    id: 'cj-025',
    question:
      'How do bitwise operators `&`, `|`, `^`, `~`, `<<`, `>>`, and `>>>` work on `int` values?',
    answer:
      'Bitwise operators manipulate individual bits. `&` is AND, `|` is OR, `^` is XOR, `~` is complement. Shift left `<<` fills with zeros on the right; arithmetic right shift `>>` sign-extends for negative numbers; unsigned right `>>>` always fills with zero on the left, useful when treating `int` as unsigned. These appear in low-level flags, hashing, cryptography homework, and optimized math (`x << 1` equals multiply by two with overflow caveats). Boolean `&` and `|` also exist for `boolean` operands with non-short-circuit evaluation unlike `&&` `||`. Interviewers may connect masks to `EnumSet` internals or `BitSet`. Mistaking signed shift for unsigned behavior is a classic bug when porting C code. For most business logic you rarely hand-roll bitwise ops, but knowing they exist demonstrates CS fundamentals.',
    codeExample:
      'int flags = READ | WRITE;\nboolean on = (flags & READ) != 0;',
    codeLanguage: 'java',
  },
]
