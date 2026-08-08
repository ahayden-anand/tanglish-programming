# 🌺 Tanglish Programming Language

**Tanglish** is a beginner-friendly programming language whose syntax uses simple Tamil words written in Roman/English script. Its goal is to make programming intuitive, welcoming, and easy to learn for Tamil speakers worldwide.

---

## 🚀 Core Keywords & Mapping

| Tanglish Keyword | Meaning in Tamil | English / CS Concept | Example Usage |
| :--- | :--- | :--- | :--- |
| `vai` | வை (Place / Set) | Variable Declaration | `vai vayasu = 20` |
| `sollu` | சொல் (Tell / Print) | Output / Print | `sollu("Vanakkam!")` |
| `ketu` | கேள் (Ask / Listen) | User Input | `vai name = ketu("Peyar: ")` |
| `enna_na` | என்னவென்றால் (If) | Conditional (If) | `enna_na age >= 18 { ... }` |
| `illena` | இல்லை என்றால் (Else) | Conditional (Else) | `illena { ... }` |
| `suththu` | சுத்து (Spin / Loop) | While Loop | `suththu count <= 5 { ... }` |
| `seyal` | செயல் (Action / Work) | Function Declaration | `seyal kootu(a, b) { ... }` |
| `thiruppu` | திருப்பு (Turn back) | Return Statement | `thiruppu a + b` |
| `unmai` | உண்மை (True) | Boolean True | `vai flag = unmai` |
| `poi` | பொய் (False) | Boolean False | `vai flag = poi` |
| `mudivu` | முடிவு (End) | End Block Keyword | `mudivu` |

---

## 📐 Architecture & Components

Tanglish is built from scratch in **Python** without third-party parser tools:

1. **Lexer (`tanglish/lexer.py`)**: Converts raw string source code into a token stream with precise line and column numbers.
2. **Parser (`tanglish/parser.py`)**: Builds a hierarchical **Abstract Syntax Tree (AST)** adhering to standard expression precedence rules.
3. **AST Nodes (`tanglish/ast_nodes.py`)**: Dataclass representations for language constructs (Variables, Functions, Loops, Operators).
4. **Interpreter (`tanglish/interpreter.py`)**: Tree-walking AST evaluator with lexical scope environment frames and custom exception stack unwinding for `thiruppu` (returns).
5. **Errors (`tanglish/errors.py`)**: Provides beginner-friendly error messages with line indicators (`^`) and bilingual Tamil/English hints.
6. **CLI (`tanglish/tanglish.py`)**: Command line runner and interactive REPL mode.

---

## 💻 Code Examples

### 1. Hello World (`hello.tgl`)
```text
sollu("Vanakkam World!")
sollu("Tanglish programming language ku nalvaravu!")
```

### 2. Variables & Math (`variables.tgl`)
```text
vai peyar = "Arun"
vai vayasu = 20
vai vilai = 99.50
vai active = unmai

sollu("Peyar: " + peyar)
sollu("Vayasu: " + vayasu)
```

### 3. Conditions (`conditions.tgl`)
```text
vai mark = 85

enna_na mark >= 90 {
    sollu("Grade: Distinction")
} illena {
    enna_na mark >= 75 {
        sollu("Grade: First Class")
    } illena {
        sollu("Grade: Pass")
    }
}
```

### 4. Loops (`loops.tgl`)
```text
vai x = 1

suththu x <= 5 {
    sollu("Count: " + x)
    x = x + 1
}
```

### 5. Functions (`functions.tgl`)
```text
seyal kootu(a, b) {
    thiruppu a + b
}

vai sum = kootu(10, 20)
sollu("Sum is: " + sum)
```

---

## ⚙️ Running Tanglish

### Run a `.tgl` script:
```bash
python3 tanglish/tanglish.py tanglish/examples/hello.tgl
```

### Interactive REPL:
```bash
python3 tanglish/tanglish.py
```

### Run Unit Tests:
```bash
python3 tanglish/tests/run_tests.py
```

---

## 🎨 Web IDE & Interactive Playground
This project also includes a full web-based interactive IDE built with React and Express that communicates with the Python interpreter backend to compile, visualize AST tokens, and run Tanglish programs live in the browser!
