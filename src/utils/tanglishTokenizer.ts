export type TokenType =
  | "keyword"
  | "boolean"
  | "functionDecl"
  | "functionCall"
  | "identifier"
  | "number"
  | "string"
  | "comment"
  | "operator"
  | "punctuation"
  | "whitespace"
  | "error";

export interface Token {
  type: TokenType;
  text: string;
  start: number;
  end: number;
  line: number;
  col: number;
}

export interface SyntaxErrorItem {
  line: number;
  col: number;
  message: string;
  start: number;
  end: number;
}

export const KEYWORDS = new Set([
  "vai",
  "sollu",
  "ketu",
  "enna_na",
  "illena_enna",
  "illena",
  "suththu",
  "seyal",
  "thiruppu",
  "mudivu",
  "matrum",
  "alladhu",
  "illai"
]);

export const BOOLEANS = new Set(["unmai", "poi", "poiya"]);

/**
 * Tokenizes Tanglish source code losslessly.
 * Concatenating token.text for all tokens reproduces source code 100% accurately.
 */
export function tokenizeTanglish(code: string): {
  tokens: Token[];
  syntaxErrors: SyntaxErrorItem[];
  symbols: Set<string>;
} {
  const tokens: Token[] = [];
  const syntaxErrors: SyntaxErrorItem[] = [];
  const symbols = new Set<string>();

  let i = 0;
  let line = 1;
  let col = 1;
  const len = code.length;

  while (i < len) {
    const start = i;
    const startLine = line;
    const startCol = col;
    const char = code[i];

    // 1. Whitespace
    if (char === " " || char === "\t" || char === "\r" || char === "\n") {
      let wsText = "";
      while (i < len && (code[i] === " " || code[i] === "\t" || code[i] === "\r" || code[i] === "\n")) {
        const c = code[i];
        wsText += c;
        if (c === "\n") {
          line++;
          col = 1;
        } else {
          col++;
        }
        i++;
      }
      tokens.push({
        type: "whitespace",
        text: wsText,
        start,
        end: i,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // 2. Comments (# or //)
    if (char === "#" || (char === "/" && i + 1 < len && code[i + 1] === "/")) {
      let commentText = "";
      while (i < len && code[i] !== "\n") {
        commentText += code[i];
        i++;
        col++;
      }
      tokens.push({
        type: "comment",
        text: commentText,
        start,
        end: i,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // 3. Strings ("..." or '...')
    if (char === '"' || char === "'") {
      const quote = char;
      let strText = quote;
      i++;
      col++;
      let closed = false;
      let escaped = false;

      while (i < len) {
        const c = code[i];
        strText += c;

        if (c === "\n") {
          line++;
          col = 1;
        } else {
          col++;
        }
        i++;

        if (!escaped && c === quote) {
          closed = true;
          break;
        }

        if (c === "\\" && !escaped) {
          escaped = true;
        } else {
          escaped = false;
        }
      }

      if (!closed) {
        syntaxErrors.push({
          line: startLine,
          col: startCol,
          message: "Unterminated string literal",
          start,
          end: i
        });
        tokens.push({
          type: "error",
          text: strText,
          start,
          end: i,
          line: startLine,
          col: startCol
        });
      } else {
        tokens.push({
          type: "string",
          text: strText,
          start,
          end: i,
          line: startLine,
          col: startCol
        });
      }
      continue;
    }

    // 4. Numbers (e.g. 10, 3.14)
    if (/\d/.test(char)) {
      let numText = "";
      let hasDot = false;
      while (i < len && (/\d/.test(code[i]) || (code[i] === "." && !hasDot))) {
        if (code[i] === ".") hasDot = true;
        numText += code[i];
        i++;
        col++;
      }
      tokens.push({
        type: "number",
        text: numText,
        start,
        end: i,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // 5. Identifiers / Keywords / Booleans
    if (/[a-zA-Z_]/.test(char)) {
      let ident = "";
      while (i < len && /[a-zA-Z0-9_]/.test(code[i])) {
        ident += code[i];
        i++;
        col++;
      }

      // Check what follows this identifier (to distinguish function calls/declarations)
      let nextCharIndex = i;
      while (nextCharIndex < len && (code[nextCharIndex] === " " || code[nextCharIndex] === "\t")) {
        nextCharIndex++;
      }
      const isFollowedByLParen = nextCharIndex < len && code[nextCharIndex] === "(";

      // Check preceding token (to distinguish function declarations)
      let prevNonWsToken: Token | null = null;
      for (let tIdx = tokens.length - 1; tIdx >= 0; tIdx--) {
        if (tokens[tIdx].type !== "whitespace" && tokens[tIdx].type !== "comment") {
          prevNonWsToken = tokens[tIdx];
          break;
        }
      }
      const isFuncDecl = prevNonWsToken?.type === "keyword" && prevNonWsToken.text === "seyal";

      if (KEYWORDS.has(ident)) {
        tokens.push({
          type: "keyword",
          text: ident,
          start,
          end: i,
          line: startLine,
          col: startCol
        });
      } else if (BOOLEANS.has(ident)) {
        tokens.push({
          type: "boolean",
          text: ident,
          start,
          end: i,
          line: startLine,
          col: startCol
        });
      } else if (isFuncDecl) {
        symbols.add(ident);
        tokens.push({
          type: "functionDecl",
          text: ident,
          start,
          end: i,
          line: startLine,
          col: startCol
        });
      } else if (isFollowedByLParen) {
        symbols.add(ident);
        tokens.push({
          type: "functionCall",
          text: ident,
          start,
          end: i,
          line: startLine,
          col: startCol
        });
      } else {
        symbols.add(ident);
        tokens.push({
          type: "identifier",
          text: ident,
          start,
          end: i,
          line: startLine,
          col: startCol
        });
      }
      continue;
    }

    // 6. Two-character Operators (==, !=, <=, >=, &&, ||)
    if (i + 1 < len) {
      const pair = char + code[i + 1];
      if (
        pair === "==" ||
        pair === "!=" ||
        pair === "<=" ||
        pair === ">=" ||
        pair === "&&" ||
        pair === "||"
      ) {
        tokens.push({
          type: "operator",
          text: pair,
          start,
          end: i + 2,
          line: startLine,
          col: startCol
        });
        i += 2;
        col += 2;
        continue;
      }
    }

    // 7. Single-character Operators (=, +, -, *, /, %, >, <, !)
    if (/[=+\-*/%><!]/.test(char)) {
      tokens.push({
        type: "operator",
        text: char,
        start,
        end: i + 1,
        line: startLine,
        col: startCol
      });
      i++;
      col++;
      continue;
    }

    // 8. Punctuation ((, ), {, }, [, ], ,, ;)
    if (/[(){}[\];,]/.test(char)) {
      tokens.push({
        type: "punctuation",
        text: char,
        start,
        end: i + 1,
        line: startLine,
        col: startCol
      });
      i++;
      col++;
      continue;
    }

    // Unknown character
    tokens.push({
      type: "error",
      text: char,
      start,
      end: i + 1,
      line: startLine,
      col: startCol
    });
    i++;
    col++;
  }

  // Secondary syntax pass for unmatched brackets
  const bracketStack: { char: string; line: number; col: number; pos: number }[] = [];
  const matchMap: Record<string, string> = { ")": "(", "}": "{", "]": "[" };

  for (const t of tokens) {
    if (t.type === "punctuation") {
      if (t.text === "(" || t.text === "{" || t.text === "[") {
        bracketStack.push({ char: t.text, line: t.line, col: t.col, pos: t.start });
      } else if (t.text === ")" || t.text === "}" || t.text === "]") {
        const expected = matchMap[t.text];
        if (bracketStack.length === 0 || bracketStack[bracketStack.length - 1].char !== expected) {
          syntaxErrors.push({
            line: t.line,
            col: t.col,
            message: `Unmatched closing bracket '${t.text}'`,
            start: t.start,
            end: t.end
          });
        } else {
          bracketStack.pop();
        }
      }
    }
  }

  for (const unclosed of bracketStack) {
    syntaxErrors.push({
      line: unclosed.line,
      col: unclosed.col,
      message: `Unclosed bracket '${unclosed.char}'`,
      start: unclosed.pos,
      end: unclosed.pos + 1
    });
  }

  return { tokens, syntaxErrors, symbols };
}
