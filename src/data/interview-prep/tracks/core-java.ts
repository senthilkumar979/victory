import { Coffee } from 'lucide-react'
import type { InterviewTrack } from '../types'

export const coreJavaTrack: InterviewTrack = {
  slug: 'core-java',
  title: 'Core Java',
  description:
    'JVM basics, OOP, collections, concurrency, and language fundamentals common in technical interviews.',
  accent: 'text-orange-400',
  icon: Coffee,
  gradient:
    'from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/30',
  questions: [
    {
      id: 'cj-1',
      question: 'What is the difference between JDK, JRE, and JVM?',
      answer:
        'JVM executes bytecode. JRE bundles JVM plus core libraries to run Java apps. JDK includes JRE plus compilers (javac), debuggers, and tools to develop software.',
      codeExample:
        '// You compile with JDK\n// javac Hello.java → Hello.class (bytecode)\n// java Hello  → JVM runs bytecode',
      codeLanguage: 'java',
    },
    {
      id: 'cj-2',
      question: 'Explain `==` vs `.equals()` for objects in Java.',
      answer:
        '`==` compares references (same object in memory). `equals()` compares logical equality; for `String`, override `equals()` and `hashCode()` when defining value objects.',
      codeExample:
        'String a = new String("hi");\nString b = new String("hi");\nSystem.out.println(a == b);        // false\nSystem.out.println(a.equals(b)); // true',
      codeLanguage: 'java',
    },
    {
      id: 'cj-3',
      question: 'Why should you override `hashCode()` when you override `equals()`?',
      answer:
        'Equal objects must have equal hash codes so they behave correctly in hash-based collections (`HashMap`, `HashSet`). Breaking the contract causes subtle bugs and lost lookups.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-4',
      question: 'What is the difference between `abstract class` and `interface`?',
      answer:
        'Abstract classes can hold state and constructors; single inheritance. Interfaces define behavior contracts; a class can implement multiple interfaces. Since Java 8+, interfaces may have `default` and `static` methods.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-5',
      question: 'What are checked vs unchecked exceptions?',
      answer:
        'Checked exceptions extend `Exception` (not `RuntimeException`) and must be declared or handled. Unchecked exceptions extend `RuntimeException` and are optional to declare—often programming errors or unrecoverable states.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-6',
      question: 'What is the difference between `String`, `StringBuilder`, and `StringBuffer`?',
      answer:
        '`String` is immutable; every concatenation can create new objects. `StringBuilder` is mutable and fast for single-threaded building. `StringBuffer` is synchronized (thread-safe) but slower for appending.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-7',
      question: 'Explain `final` for class, method, and variable.',
      answer:
        'Final class cannot be subclassed. Final method cannot be overridden. Final variable is assigned once (for references, the reference cannot change; the object may still mutate if mutable).',
      codeLanguage: 'java',
    },
    {
      id: 'cj-8',
      question: 'What is autoboxing and unboxing?',
      answer:
        'Autoboxing converts primitives to wrapper types (e.g. `int` → `Integer`). Unboxing is the reverse. Be careful with `null` unboxing (`NullPointerException`) and unnecessary boxing in hot loops.',
      codeExample: 'Integer n = 5;   // autobox\nint x = n;       // unbox',
      codeLanguage: 'java',
    },
    {
      id: 'cj-9',
      question: 'What is the contract of `compareTo()` in `Comparable`?',
      answer:
        'Returns negative if this is less than other, zero if equal, positive if greater. Must be consistent with `equals()` when natural ordering is used in sorted collections that assume equality alignment.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-10',
      question: 'Difference between `ArrayList` and `LinkedList`?',
      answer:
        '`ArrayList` is backed by a dynamic array—fast random access, slower middle insertions. `LinkedList` is a doubly linked list—fast inserts/removals at known nodes, slower random access.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-11',
      question: 'What is the difference between `HashMap` and `Hashtable`?',
      answer:
        '`HashMap` is not synchronized and allows one `null` key and null values. `Hashtable` is legacy, synchronized, and does not allow null keys or values. Prefer `HashMap` or `ConcurrentHashMap` for concurrency.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-12',
      question: 'What does `synchronized` do?',
      answer:
        'Ensures only one thread at a time executes a block or method on the same monitor, providing mutual exclusion. Can reduce throughput; for scalability prefer `java.util.concurrent` primitives.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-13',
      question: 'What is a race condition?',
      answer:
        'When the outcome depends on the interleaving of threads accessing shared mutable state without proper synchronization. Fixes: locks, atomic variables, immutable data, or confining state to one thread.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-14',
      question: 'What is the difference between `ExecutorService.submit` and `execute`?',
      answer:
        '`execute` runs a `Runnable` and returns void; exceptions may go to the handler. `submit` returns a `Future` and can accept `Callable`; checked exceptions are wrapped in `ExecutionException` when you call `get()`.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-15',
      question: 'Explain Java streams: intermediate vs terminal operations.',
      answer:
        'Intermediate operations (`map`, `filter`) return a new stream and are lazy. Terminal operations (`collect`, `forEach`, `count`) trigger processing and produce a result or side effect.',
      codeExample:
        'List<String> u = names.stream()\n    .filter(s -> s.startsWith("A"))\n    .map(String::toUpperCase)\n    .toList();',
      codeLanguage: 'java',
    },
    {
      id: 'cj-16',
      question: 'What is a functional interface?',
      answer:
        'An interface with exactly one abstract method (SAM). Used with lambdas and method references. Examples: `Runnable`, `Comparator`, `Predicate`.',
      codeExample:
        'Predicate<String> p = s -> s.isEmpty();\nRunnable r = () -> System.out.println("run");',
      codeLanguage: 'java',
    },
    {
      id: 'cj-17',
      question: 'What are generics type erasure and why does it exist?',
      answer:
        'Generic type parameters are removed at compile time for JVM compatibility with older bytecode. At runtime, raw types lose parameter info—so you cannot do `new T()` or `instanceof List<String>`.',
      codeLanguage: 'java',
    },
    {
      id: 'cj-18',
      question: 'What is the try-with-resources statement?',
      answer:
        'Declares resources that implement `AutoCloseable` and closes them in reverse order, even if an exception occurs. Prefer over manual `finally` for IO and JDBC code.',
      codeExample:
        'try (var in = Files.newInputStream(path)) {\n  // use in\n}',
      codeLanguage: 'java',
    },
  ],
}
