import { tokenizeTanglish, KEYWORDS } from "./tanglishTokenizer";

/**
 * Formats Tanglish source code into beautifully indented and spaced code according to standard IDE rules.
 */
export function formatTanglishCode(code: string): string {
  if (!code || !code.trim()) return code;

  const { tokens } = tokenizeTanglish(code);
  if (tokens.length === 0) return code;

  // Group tokens into lines based on newline whitespace tokens
  const linesOfTokens: typeof tokens[] = [[]];

  for (const token of tokens) {
    if (token.type === "whitespace" && token.text.includes("\n")) {
      const parts = token.text.split("\n");
      // Append first part (if any) before first \n
      if (parts[0].length > 0) {
        linesOfTokens[linesOfTokens.length - 1].push({
          ...token,
          text: parts[0]
        });
      }
      // For each remaining newline, start a new line of tokens
      for (let p = 1; p < parts.length; p++) {
        linesOfTokens.push([]);
        if (parts[p].length > 0) {
          linesOfTokens[linesOfTokens.length - 1].push({
            ...token,
            text: parts[p]
          });
        }
      }
    } else {
      linesOfTokens[linesOfTokens.length - 1].push(token);
    }
  }

  let currentIndent = 0;
  const formattedLines: string[] = [];

  for (let lIdx = 0; lIdx < linesOfTokens.length; lIdx++) {
    const rawLineTokens = linesOfTokens[lIdx];

    // Filter out leading/trailing raw spaces to re-indent from scratch, but keep comments/code
    const nonWsTokens = rawLineTokens.filter((t) => t.type !== "whitespace");

    if (nonWsTokens.length === 0) {
      // Empty line
      formattedLines.push("");
      continue;
    }

    const firstToken = nonWsTokens[0];
    const isClosingBraceFirst = firstToken.type === "punctuation" && firstToken.text === "}";

    // Adjust indent for lines starting with closing brace
    if (isClosingBraceFirst && currentIndent > 0) {
      currentIndent--;
    }

    const indentStr = "    ".repeat(Math.max(0, currentIndent));
    let lineResult = indentStr;

    for (let tIdx = 0; tIdx < nonWsTokens.length; tIdx++) {
      const token = nonWsTokens[tIdx];
      const prevToken = tIdx > 0 ? nonWsTokens[tIdx - 1] : null;
      const nextToken = tIdx + 1 < nonWsTokens.length ? nonWsTokens[tIdx + 1] : null;

      // Determine required leading space before `token`
      let needSpaceBefore = false;

      if (prevToken) {
        // Space after comma
        if (prevToken.type === "punctuation" && prevToken.text === ",") {
          needSpaceBefore = true;
        }
        // Space around operators (=, +, -, *, /, %, ==, !=, <=, >=, >, <)
        else if (prevToken.type === "operator" || token.type === "operator") {
          // Special case: minus sign as unary operator e.g., -1 or (-5) or return -1
          const isUnaryMinus =
            token.text === "-" &&
            (prevToken.text === "(" || prevToken.text === "," || prevToken.type === "operator");

          if (!isUnaryMinus) {
            needSpaceBefore = true;
          }
        }
        // Space before opening brace {
        else if (token.type === "punctuation" && token.text === "{") {
          needSpaceBefore = true;
        }
        // Space between two keywords/identifiers/numbers e.g. "vai peyar", "suththu count", "seyal kootu"
        else if (
          (prevToken.type === "keyword" || prevToken.type === "identifier" || prevToken.type === "number") &&
          (token.type === "keyword" || token.type === "identifier" || token.type === "number" || token.type === "boolean")
        ) {
          needSpaceBefore = true;
        }
        // Space between keyword and condition e.g. "enna_na x > 10", "thiruppu a + b"
        else if (prevToken.type === "keyword" && token.type !== "punctuation") {
          needSpaceBefore = true;
        }
        // Space before illena e.g. "} illena {"
        else if (token.type === "keyword" && (token.text === "illena" || token.text === "illena_enna")) {
          needSpaceBefore = true;
        }
        // Space before comment
        else if (token.type === "comment") {
          needSpaceBefore = true;
        }
      }

      if (needSpaceBefore) {
        lineResult += " ";
      }

      lineResult += token.text;

      // Increase indent for next line if opening brace was present
      if (token.type === "punctuation" && token.text === "{") {
        currentIndent++;
      }
    }

    formattedLines.push(lineResult);
  }

  return formattedLines.join("\n");
}
