import type { CodingExercise } from './types'

/** Core Java: five beginner and five mid-level scenarios (10 total). */
export const CORE_JAVA_CODING_EXERCISES: CodingExercise[] = [
  {
    id: 'cj-cart-lines',
    difficulty: 'beginner',
    title: 'Line items with an ArrayList',
    scenario: `Model a shopping cart as a list of line items. Each \`LineItem\` has a non-null \`String id\`, \`String name\`, \`BigDecimal unitPrice\`, and \`int quantity\` (must be positive when added).

Implement a \`CartService\` (or static helpers) with:
• \`addLine(List<LineItem> cart, LineItem newLine)\` — return a **new** \`ArrayList\` copy: if an item with the same \`id\` exists, increase its quantity by \`newLine.getQuantity()\`; otherwise append a new line (copy fields as needed). Do not mutate the input list.
• \`removeLine(List<LineItem> cart, String id)\` — return a new list without that id.
• \`total(List<LineItem> cart)\` — return \`BigDecimal\` sum of \`unitPrice.multiply(BigDecimal.valueOf(qty))\` for each line.

Use \`BigDecimal\` for money, never \`double\`, for the total.`,
    constraints: [
      'Java 17+; you may use records for LineItem.',
      'Treat input lists as immutable from the caller’s perspective.',
    ],
    hints: [
      'Copy the incoming list with new ArrayList<>(cart) before modifying the copy, or build a fresh list in one pass.',
      'Use BigDecimal.ZERO as the starting sum and .add() in a loop.',
      'When merging by id, compare with Objects.equals(a, b) for ids.',
    ],
    answerFiles: [
      {
        path: 'CartService.java',
        language: 'java',
        code: `import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

record LineItem(String id, String name, BigDecimal unitPrice, int quantity) {}

public final class CartService {
  private CartService() {}

  public static List<LineItem> addLine(List<LineItem> cart, LineItem newLine) {
    List<LineItem> out = new ArrayList<>();
    boolean merged = false;
    for (LineItem x : cart) {
      if (Objects.equals(x.id(), newLine.id())) {
        int q = x.quantity() + newLine.quantity();
        out.add(new LineItem(x.id(), x.name(), x.unitPrice(), q));
        merged = true;
      } else {
        out.add(x);
      }
    }
    if (!merged) {
      out.add(new LineItem(
          newLine.id(),
          newLine.name(),
          newLine.unitPrice(),
          newLine.quantity()));
    }
    return out;
  }

  public static List<LineItem> removeLine(List<LineItem> cart, String id) {
    List<LineItem> out = new ArrayList<>();
    for (LineItem x : cart) {
      if (!Objects.equals(x.id(), id)) out.add(x);
    }
    return out;
  }

  public static BigDecimal total(List<LineItem> cart) {
    BigDecimal sum = BigDecimal.ZERO;
    for (LineItem x : cart) {
      sum = sum.add(x.unitPrice().multiply(BigDecimal.valueOf(x.quantity())));
    }
    return sum;
  }
}
`,
      },
    ],
  },
  {
    id: 'cj-bank-account',
    difficulty: 'beginner',
    title: 'Simple bank account',
    scenario: `Implement a class \`BankAccount\` with:
• A constructor \`BankAccount(String accountId, BigDecimal openingBalance)\` — reject null id or negative opening balance by throwing \`IllegalArgumentException\`.
• \`void deposit(BigDecimal amount)\` — add to balance; reject null or non-positive amounts.
• \`boolean withdraw(BigDecimal amount)\` — subtract if balance is sufficient; return \`true\` on success, \`false\` if insufficient funds (do not change balance). Reject null or non-positive amounts.
• \`BigDecimal getBalance()\` — return current balance.

Keep balance non-negative at all times.`,
    constraints: [
      'Use BigDecimal for all monetary values.',
      'Use compareTo for comparisons, not ==.',
    ],
    hints: [
      'Store balance in a private field initialized in the constructor.',
      'For withdraw, if amount.compareTo(balance) > 0 return false.',
      'deposit and withdraw can validate with amount == null || amount.compareTo(BigDecimal.ZERO) <= 0.',
    ],
    answerFiles: [
      {
        path: 'BankAccount.java',
        language: 'java',
        code: `import java.math.BigDecimal;
import java.util.Objects;

public final class BankAccount {
  private final String accountId;
  private BigDecimal balance;

  public BankAccount(String accountId, BigDecimal openingBalance) {
    Objects.requireNonNull(accountId, "accountId");
    Objects.requireNonNull(openingBalance, "openingBalance");
    if (openingBalance.compareTo(BigDecimal.ZERO) < 0) {
      throw new IllegalArgumentException("openingBalance must be >= 0");
    }
    this.accountId = accountId;
    this.balance = openingBalance;
  }

  public void deposit(BigDecimal amount) {
    Objects.requireNonNull(amount, "amount");
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("amount must be positive");
    }
    balance = balance.add(amount);
  }

  public boolean withdraw(BigDecimal amount) {
    Objects.requireNonNull(amount, "amount");
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("amount must be positive");
    }
    if (amount.compareTo(balance) > 0) return false;
    balance = balance.subtract(amount);
    return true;
  }

  public BigDecimal getBalance() {
    return balance;
  }

  public String getAccountId() {
    return accountId;
  }
}
`,
      },
    ],
  },
  {
    id: 'cj-letter-frequency',
    difficulty: 'beginner',
    title: 'Letter frequency map',
    scenario: `Write \`Map<Character, Integer> letterFrequency(String text)\` that counts how often each **letter** appears. Treat input case-insensitively and count only Unicode letters (\`Character.isLetter\`); ignore spaces, digits, and punctuation.

If \`text\` is null, return an empty \`HashMap\`. For an empty string, return an empty map as well.`,
    constraints: [
      'Use java.util.HashMap or LinkedHashMap.',
      'Normalize each letter to lowercase (or uppercase) before using it as the map key.',
    ],
    hints: [
      'Loop with text.charAt(i) or use text.chars() with code points if you prefer.',
      'For each char c, if Character.isLetter(c), convert to Character.toLowerCase(c) and merge counts.',
      'map.merge(ch, 1, Integer::sum) avoids manual get/put.',
    ],
    answerFiles: [
      {
        path: 'LetterFrequency.java',
        language: 'java',
        code: `import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public final class LetterFrequency {
  private LetterFrequency() {}

  public static Map<Character, Integer> letterFrequency(String text) {
    if (text == null) return Collections.emptyMap();
    Map<Character, Integer> map = new HashMap<>();
    for (int i = 0; i < text.length(); i++) {
      char c = text.charAt(i);
      if (!Character.isLetter(c)) continue;
      char k = Character.toLowerCase(c);
      map.merge(k, 1, Integer::sum);
    }
    return map;
  }
}
`,
      },
    ],
  },
  {
    id: 'cj-letter-grade',
    difficulty: 'beginner',
    title: 'Score to letter grade',
    scenario: `Implement \`String toLetterGrade(int scorePercent)\` where \`scorePercent\` is 0–100 inclusive. Use this scale:
• 90–100 → \`"A"\`
• 80–89 → \`"B"\`
• 70–79 → \`"C"\`
• 60–69 → \`"D"\`
• below 60 → \`"F"\`

If \`scorePercent\` is outside 0–100, throw \`IllegalArgumentException\`.`,
    constraints: [
      'Use only one public method for the conversion.',
      'Bounds checks should be explicit (no silent clamping).',
    ],
    hints: [
      'Guard at the top: if (scorePercent < 0 || scorePercent > 100) throw new IllegalArgumentException(...).',
      'A chain of if / else if descending thresholds is readable.',
      'Alternatively switch on scorePercent / 10 for 90+ range—careful with 100.',
    ],
    answerFiles: [
      {
        path: 'Grading.java',
        language: 'java',
        code: `public final class Grading {
  private Grading() {}

  public static String toLetterGrade(int scorePercent) {
    if (scorePercent < 0 || scorePercent > 100) {
      throw new IllegalArgumentException("scorePercent must be 0..100");
    }
    if (scorePercent >= 90) return "A";
    if (scorePercent >= 80) return "B";
    if (scorePercent >= 70) return "C";
    if (scorePercent >= 60) return "D";
    return "F";
  }
}
`,
      },
    ],
  },
  {
    id: 'cj-matrix-sum',
    difficulty: 'beginner',
    title: 'Sum a rectangular matrix',
    scenario: `Implement \`long sumMatrix(int[][] matrix)\` that returns the sum of all elements.

• If \`matrix\` is \`null\` or has zero rows, return \`0\`.
• Rows may be \`null\` or ragged (different lengths); skip \`null\` rows and treat missing rows as empty.

Do not assume the matrix is non-empty or rectangular beyond what is described.`,
    constraints: [
      'Use nested loops or streams; avoid third-party libraries.',
      'Watch for overflow: use \`long\` accumulator.',
    ],
    hints: [
      'Outer loop over matrix.length; if matrix[i] == null continue.',
      'Inner loop over matrix[i].length and add matrix[i][j] to a long sum.',
      'Cast each int to long when adding if you want to be explicit about widening.',
    ],
    answerFiles: [
      {
        path: 'MatrixSum.java',
        language: 'java',
        code: `public final class MatrixSum {
  private MatrixSum() {}

  public static long sumMatrix(int[][] matrix) {
    if (matrix == null || matrix.length == 0) return 0L;
    long sum = 0L;
    for (int[] row : matrix) {
      if (row == null) continue;
      for (int v : row) sum += v;
    }
    return sum;
  }
}
`,
      },
    ],
  },
  {
    id: 'cj-student-comparator',
    difficulty: 'mid',
    title: 'Sort students by GPA then name',
    scenario: `You have \`record Student(String name, double gpa)\`. Sort a \`List<Student>\` **in place** so that:
• Higher GPA comes first (descending).
• If two students have the same GPA, order by \`name\` ascending (lexicographic \`String\` order).

Implement \`void sortStudents(List<Student> students)\` using \`Comparator\` and \`List.sort\` (or \`Collections.sort\`). Do not assume the list is mutable beyond standard \`List\` contract—use \`sort\` on the list reference passed in.`,
    constraints: [
      'Do not create a new list; reorder the given list.',
      'Use Comparator.comparing(...) and .thenComparing(...) or equivalent.',
    ],
    hints: [
      'For descending GPA: Comparator.comparingDouble(Student::gpa).reversed().',
      'Chain .thenComparing(Student::name) for the tie-break.',
      'students.sort(comparator) mutates the list.',
    ],
    answerFiles: [
      {
        path: 'StudentSort.java',
        language: 'java',
        code: `import java.util.Comparator;
import java.util.List;

record Student(String name, double gpa) {}

public final class StudentSort {
  private StudentSort() {}

  public static void sortStudents(List<Student> students) {
    Comparator<Student> byGpaDesc = Comparator.comparingDouble(Student::gpa).reversed();
    Comparator<Student> byGpaThenName = byGpaDesc.thenComparing(Student::name);
    students.sort(byGpaThenName);
  }
}
`,
      },
    ],
  },
  {
    id: 'cj-streams-payroll',
    difficulty: 'mid',
    title: 'Streams: filter and average salary',
    scenario: `Given \`record Employee(String name, String department, long salaryAnnual)\` and a \`List<Employee>\`, implement:

\`double averageSalaryInDepartment(List<Employee> employees, String department)\`

Return the **average** of \`salaryAnnual\` for employees whose \`department\` equals the argument (use \`Objects.equals\`). If there are no employees in that department, return \`0.0\`.

Use the Stream API (\`stream()\`, \`filter\`, \`mapToLong\`, \`average\`, \`OptionalDouble\`).`,
    constraints: [
      'Handle empty result without dividing by zero.',
      'Use primitive streams for salaries to avoid boxing in the average step.',
    ],
    hints: [
      'filter(e -> Objects.equals(e.department(), department)).',
      'mapToLong(Employee::salaryAnnual) then .average() returns OptionalDouble.',
      'ifPresentOrElse or orElse(0.0) on the optional.',
    ],
    answerFiles: [
      {
        path: 'PayrollStats.java',
        language: 'java',
        code: `import java.util.List;
import java.util.Objects;
import java.util.OptionalDouble;

record Employee(String name, String department, long salaryAnnual) {}

public final class PayrollStats {
  private PayrollStats() {}

  public static double averageSalaryInDepartment(
      List<Employee> employees,
      String department) {
    OptionalDouble avg =
        employees.stream()
            .filter(e -> Objects.equals(e.department(), department))
            .mapToLong(Employee::salaryAnnual)
            .average();
    return avg.orElse(0.0);
  }
}
`,
      },
    ],
  },
  {
    id: 'cj-optional-email',
    difficulty: 'mid',
    title: 'Optional chaining for nested email',
    scenario: `Model:
\`record Address(String email)\`
\`record User(String name, Address address)\`

Implement \`Optional<String> findEmail(Optional<User> userOpt)\` that:
• Returns \`Optional.empty()\` if \`userOpt\` is empty or null **or** if the user’s address is \`null\` **or** the address email is \`null\` or blank (after \`String.trim()\`).

Use \`Optional\`’s \`flatMap\` / \`map\` / \`filter\` style—avoid \`if\` ladders if you can.`,
    constraints: [
      'Method signature must use Optional as given.',
      'Blank means string is empty or only whitespace.',
    ],
    hints: [
      'Start from Optional.ofNullable(userOpt).flatMap(u -> ...).',
      'Optional.ofNullable(user.address()).flatMap(a -> Optional.ofNullable(a.email())).',
      'filter(s -> !s.isBlank()) then map(String::trim).',
    ],
    answerFiles: [
      {
        path: 'UserEmail.java',
        language: 'java',
        code: `import java.util.Optional;

record Address(String email) {}

record User(String name, Address address) {}

public final class UserEmail {
  private UserEmail() {}

  public static Optional<String> findEmail(Optional<User> userOpt) {
    if (userOpt == null) return Optional.empty();
    return userOpt
        .flatMap(u -> Optional.ofNullable(u.address()))
        .map(Address::email)
        .map(String::trim)
        .filter(s -> !s.isBlank());
  }
}
`,
      },
    ],
  },
  {
    id: 'cj-generic-max',
    difficulty: 'mid',
    title: 'Generic maximum in a list',
    scenario: `Implement a generic method:

\`public static <T extends Comparable<T>> T max(List<T> values)\`

Return the **largest** element according to natural ordering (\`Comparable\`). If the list is \`null\` or empty, throw \`IllegalArgumentException\`. If any element is \`null\`, throw \`NullPointerException\` (or use \`Objects.requireNonNull\` per element).

Assume the list has at least one non-null element when non-empty.`,
    constraints: [
      'Single pass O(n); do not sort the whole list.',
      'Use compareTo for ordering.',
    ],
    hints: [
      'Initialize best with values.get(0) after a null/empty check.',
      'Loop from index 1; if (next.compareTo(best) > 0) best = next.',
      'Objects.requireNonNull on each element when read.',
    ],
    answerFiles: [
      {
        path: 'GenericMax.java',
        language: 'java',
        code: `import java.util.List;
import java.util.Objects;

public final class GenericMax {
  private GenericMax() {}

  public static <T extends Comparable<T>> T max(List<T> values) {
    if (values == null || values.isEmpty()) {
      throw new IllegalArgumentException("values must be non-null and non-empty");
    }
    T best = Objects.requireNonNull(values.get(0), "element");
    for (int i = 1; i < values.size(); i++) {
      T x = Objects.requireNonNull(values.get(i), "element");
      if (x.compareTo(best) > 0) best = x;
    }
    return best;
  }
}
`,
      },
    ],
  },
  {
    id: 'cj-validation-exception',
    difficulty: 'mid',
    title: 'Custom exception for invalid product code',
    scenario: `Define a **checked** exception \`InvalidProductCodeException extends Exception\` with a constructor taking \`String message\` and \`String code\`, plus getters. You may implement it as a \`public static\` nested class inside your validator type so a single \`.java\` file stays valid.

Implement \`void validateProductCode(String code)\` that throws \`InvalidProductCodeException\` when:
• \`code\` is \`null\` or blank after trim, or
• \`code\` does not match the pattern: exactly three uppercase letters followed by four digits (e.g. \`ABC1234\`).

Use \`String.matches\` with a regex, or \`Pattern\` if you prefer.

Implement \`public static void main\` only if you want a demo—it is optional for the answer file.`,
    constraints: [
      'Use a checked exception (not RuntimeException).',
      'Message should explain why validation failed.',
    ],
    hints: [
      'Regex example: ^[A-Z]{3}\\\\d{4}$ after trim.',
      'if (code == null || code.trim().isEmpty()) throw new InvalidProductCodeException(...).',
      'Super(message) in the exception constructor; store code in a field.',
    ],
    answerFiles: [
      {
        path: 'ProductCode.java',
        language: 'java',
        code: `public final class ProductCode {
  private static final String PATTERN = "^[A-Z]{3}\\\\d{4}$";

  public static final class InvalidProductCodeException extends Exception {
    private final String code;

    public InvalidProductCodeException(String message, String code) {
      super(message);
      this.code = code;
    }

    public String getCode() {
      return code;
    }
  }

  private ProductCode() {}

  public static void validateProductCode(String code) throws InvalidProductCodeException {
    if (code == null || code.trim().isEmpty()) {
      throw new InvalidProductCodeException("Product code is null or blank", code);
    }
    String t = code.trim();
    if (!t.matches(PATTERN)) {
      throw new InvalidProductCodeException(
          "Product code must be 3 uppercase letters and 4 digits", t);
    }
  }
}
`,
      },
    ],
  },
]
