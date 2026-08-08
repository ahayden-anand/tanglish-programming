import { TanglishKeywordInfo } from "../types";

export const TANGLISH_KEYWORDS: TanglishKeywordInfo[] = [
  {
    keyword: "vai",
    tamil: "வை",
    english: "Variable Declaration",
    description: "Declares a new variable in scope.",
    example: "vai peyar = \"Arun\"\nvai vayasu = 25"
  },
  {
    keyword: "sollu",
    tamil: "சொல்",
    english: "Print / Output",
    description: "Prints text, numbers, or expressions to the console.",
    example: "sollu(\"Vanakkam World!\")"
  },
  {
    keyword: "ketu",
    tamil: "கேள்",
    english: "User Input",
    description: "Prompts the user for input and returns the typed value.",
    example: "vai peyar = ketu(\"Un peyar enna? \")"
  },
  {
    keyword: "enna_na",
    tamil: "என்னவென்றால்",
    english: "If Condition",
    description: "Executes block if condition expression evaluates to unmai (true).",
    example: "enna_na vayasu >= 18 {\n    sollu(\"Adult\")\n}"
  },
  {
    keyword: "illena",
    tamil: "இல்லை என்றால்",
    english: "Else Condition",
    description: "Executes fallback block if the preceding condition was false.",
    example: "illena {\n    sollu(\"Minor\")\n}"
  },
  {
    keyword: "suththu",
    tamil: "சுத்து",
    english: "While Loop",
    description: "Repeats execution of block as long as condition remains true.",
    example: "vai x = 1\nsuththu x <= 5 {\n    sollu(x)\n    x = x + 1\n}"
  },
  {
    keyword: "seyal",
    tamil: "செயல்",
    english: "Function Declaration",
    description: "Defines a reusable function taking optional parameters.",
    example: "seyal kootu(a, b) {\n    thiruppu a + b\n}"
  },
  {
    keyword: "thiruppu",
    tamil: "திருப்பு",
    english: "Return Statement",
    description: "Returns a value from a function and exits function body.",
    example: "thiruppu a + b"
  },
  {
    keyword: "unmai",
    tamil: "உண்மை",
    english: "Boolean True",
    description: "Literal representing boolean true.",
    example: "vai flag = unmai"
  },
  {
    keyword: "poi",
    tamil: "பொய்",
    english: "Boolean False",
    description: "Literal representing boolean false.",
    example: "vai flag = poi"
  },
  {
    keyword: "mudivu",
    tamil: "முடிவு",
    english: "Block End / Terminate",
    description: "Keyword used to terminate blocks or statements.",
    example: "enna_na x > 5\n    sollu(\"Perusu\")\nmudivu"
  }
];

export const PRESET_TEMPLATES = [
  {
    id: "hello",
    title: "1. Hello World",
    code: `sollu("Vanakkam World!")
sollu("Tanglish programming language ku nalvaravu!")`
  },
  {
    id: "variables",
    title: "2. Variables & Math",
    code: `vai peyar = "Arun"
vai vayasu = 20
vai mark1 = 85
vai mark2 = 92

sollu("Peyar: " + peyar)
sollu("Vayasu: " + vayasu)

vai motham = mark1 + mark2
sollu("Motham Marks: " + motham)`
  },
  {
    id: "conditions",
    title: "3. If / Else Conditions",
    code: `vai mark = 88

sollu("Student Mark: " + mark)

enna_na mark >= 90 {
    sollu("Result: Distinction!")
} illena {
    enna_na mark >= 75 {
        sollu("Result: First Class!")
    } illena {
        sollu("Result: Pass")
    }
}`
  },
  {
    id: "loops",
    title: "4. While Loop Counter",
    code: `sollu("--- Counting 1 to 5 ---")
vai count = 1

suththu count <= 5 {
    sollu("Step: " + count)
    count = count + 1
}

sollu("Loop Mudindhadhu!")`
  },
  {
    id: "functions",
    title: "5. Custom Functions",
    code: `seyal kootu(a, b) {
    thiruppu a + b
}

seyal perukku(a, b) {
    thiruppu a * b
}

vai x = 12
vai y = 8

sollu("Sum: " + kootu(x, y))
sollu("Product: " + perukku(x, y))`
  },
  {
    id: "factorial",
    title: "6. Recursive Factorial",
    code: `seyal factorial(n) {
    enna_na n <= 1 {
        thiruppu 1
    }
    thiruppu n * factorial(n - 1)
}

vai num = 5
sollu("Factorial of " + num + " = " + factorial(num))`
  },
  {
    id: "interactive",
    title: "7. User Input (ketu)",
    code: `sollu("Welcome to Age Checker!")
vai peyar = ketu("Un peyar enna: ")
vai vayasu = ketu("Un vayasu enna: ")

sollu("Vanakkam " + peyar + "!")

enna_na vayasu >= 18 {
    sollu("Nee vote podalaam (You are an adult)")
} illena {
    sollu("Nee innum minor (You are a minor)")
}`
  }
];
