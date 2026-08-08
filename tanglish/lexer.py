from enum import Enum, auto
from dataclasses import dataclass
from typing import List, Optional
from errors import TanglishSyntaxError

class TokenType(Enum):
    # Keywords
    VAI = "vai"            # variable
    SOLLU = "sollu"        # print
    KETU = "ketu"          # input
    ENNA_NA = "enna_na"    # if
    ILLENA = "illena"      # else
    SUTHTHU = "suththu"    # while
    SEYAL = "seyal"        # function
    THIRUPPU = "thiruppu"  # return
    UNMAI = "unmai"        # true
    POI = "poi"            # false
    MUDIVU = "mudivu"      # end

    # Literals
    NUMBER = auto()
    STRING = auto()
    IDENTIFIER = auto()

    # Operators
    PLUS = "+"
    MINUS = "-"
    STAR = "*"
    SLASH = "/"
    PERCENT = "%"
    ASSIGN = "="
    
    # Comparison
    EQ = "=="
    NEQ = "!="
    LT = "<"
    GT = ">"
    LTE = "<="
    GTE = ">="

    # Logical
    AND = "matrum"
    OR = "alladhu"
    NOT = "illai"

    # Delimiters
    LPAREN = "("
    RPAREN = ")"
    LBRACE = "{"
    RBRACE = "}"
    COMMA = ","
    SEMICOLON = ";"

    # Special
    EOF = auto()


KEYWORDS = {
    "vai": TokenType.VAI,
    "sollu": TokenType.SOLLU,
    "ketu": TokenType.KETU,
    "enna_na": TokenType.ENNA_NA,
    "illena": TokenType.ILLENA,
    "suththu": TokenType.SUTHTHU,
    "seyal": TokenType.SEYAL,
    "thiruppu": TokenType.THIRUPPU,
    "unmai": TokenType.UNMAI,
    "poi": TokenType.POI,
    "mudivu": TokenType.MUDIVU,
    "matrum": TokenType.AND,
    "alladhu": TokenType.OR,
    "illai": TokenType.NOT,
}


@dataclass
class Token:
    type: TokenType
    value: any
    line: int
    column: int

    def __repr__(self):
        return f"Token({self.type.name}, {repr(self.value)}, L{self.line}:C{self.column})"


class Lexer:
    def __init__(self, source_code: str):
        self.source = source_code
        self.position = 0
        self.line = 1
        self.column = 1
        self.length = len(source_code)

    def _peek(self, offset: int = 0) -> str:
        pos = self.position + offset
        if pos >= self.length:
            return ""
        return self.source[pos]

    def _advance(self) -> str:
        if self.position >= self.length:
            return ""
        char = self.source[self.position]
        self.position += 1
        if char == "\n":
            self.line += 1
            self.column = 1
        else:
            self.column += 1
        return char

    def tokenize(self) -> List[Token]:
        tokens = []

        while self.position < self.length:
            char = self._peek()

            # Skip whitespace (except tracked line/col in _advance)
            if char in " \t\r\n":
                self._advance()
                continue

            # Comments (# or //)
            if char == "#" or (char == "/" and self._peek(1) == "/"):
                while self.position < self.length and self._peek() != "\n":
                    self._advance()
                continue

            start_line = self.line
            start_col = self.column

            # Numbers (integers or floats)
            if char.isdigit():
                num_str = ""
                has_dot = False
                while self.position < self.length and (self._peek().isdigit() or self._peek() == "."):
                    if self._peek() == ".":
                        if has_dot:
                            break
                        has_dot = True
                    num_str += self._advance()
                val = float(num_str) if has_dot else int(num_str)
                tokens.append(Token(TokenType.NUMBER, val, start_line, start_col))
                continue

            # Strings ("..." or '...')
            if char in '"\'':
                quote = self._advance()
                string_val = ""
                escaped = False

                while self.position < self.length:
                    curr = self._peek()
                    if not escaped and curr == quote:
                        self._advance()
                        break
                    if curr == "\n" and not escaped:
                        raise TanglishSyntaxError("Unterminated string literal across newlines", start_line, start_col)
                    
                    c = self._advance()
                    if escaped:
                        if c == "n":
                            string_val += "\n"
                        elif c == "t":
                            string_val += "\t"
                        elif c == "r":
                            string_val += "\r"
                        else:
                            string_val += c
                        escaped = False
                    elif c == "\\":
                        escaped = True
                    else:
                        string_val += c
                else:
                    raise TanglishSyntaxError("Unterminated string literal", start_line, start_col)

                tokens.append(Token(TokenType.STRING, string_val, start_line, start_col))
                continue

            # Identifiers and Keywords
            if char.isalpha() or char == "_":
                ident_str = ""
                while self.position < self.length and (self._peek().isalnum() or self._peek() == "_"):
                    ident_str += self._advance()

                if ident_str in KEYWORDS:
                    tokens.append(Token(KEYWORDS[ident_str], ident_str, start_line, start_col))
                else:
                    tokens.append(Token(TokenType.IDENTIFIER, ident_str, start_line, start_col))
                continue

            # Two-character operators
            next_two = char + self._peek(1)
            if next_two == "==":
                self._advance()
                self._advance()
                tokens.append(Token(TokenType.EQ, "==", start_line, start_col))
                continue
            if next_two == "!=":
                self._advance()
                self._advance()
                tokens.append(Token(TokenType.NEQ, "!=", start_line, start_col))
                continue
            if next_two == "<=":
                self._advance()
                self._advance()
                tokens.append(Token(TokenType.LTE, "<=", start_line, start_col))
                continue
            if next_two == ">=":
                self._advance()
                self._advance()
                tokens.append(Token(TokenType.GTE, ">=", start_line, start_col))
                continue
            if next_two == "&&":
                self._advance()
                self._advance()
                tokens.append(Token(TokenType.AND, "&&", start_line, start_col))
                continue
            if next_two == "||":
                self._advance()
                self._advance()
                tokens.append(Token(TokenType.OR, "||", start_line, start_col))
                continue

            # Single-character operators and delimiters
            self._advance()
            if char == "+":
                tokens.append(Token(TokenType.PLUS, "+", start_line, start_col))
            elif char == "-":
                tokens.append(Token(TokenType.MINUS, "-", start_line, start_col))
            elif char == "*":
                tokens.append(Token(TokenType.STAR, "*", start_line, start_col))
            elif char == "/":
                tokens.append(Token(TokenType.SLASH, "/", start_line, start_col))
            elif char == "%":
                tokens.append(Token(TokenType.PERCENT, "%", start_line, start_col))
            elif char == "=":
                tokens.append(Token(TokenType.ASSIGN, "=", start_line, start_col))
            elif char == "<":
                tokens.append(Token(TokenType.LT, "<", start_line, start_col))
            elif char == ">":
                tokens.append(Token(TokenType.GT, ">", start_line, start_col))
            elif char == "!":
                tokens.append(Token(TokenType.NOT, "!", start_line, start_col))
            elif char == "(":
                tokens.append(Token(TokenType.LPAREN, "(", start_line, start_col))
            elif char == ")":
                tokens.append(Token(TokenType.RPAREN, ")", start_line, start_col))
            elif char == "{":
                tokens.append(Token(TokenType.LBRACE, "{", start_line, start_col))
            elif char == "}":
                tokens.append(Token(TokenType.RBRACE, "}", start_line, start_col))
            elif char == ",":
                tokens.append(Token(TokenType.COMMA, ",", start_line, start_col))
            elif char == ";":
                tokens.append(Token(TokenType.SEMICOLON, ";", start_line, start_col))
            else:
                raise TanglishSyntaxError(f"Unexpected character: '{char}'", start_line, start_col)

        tokens.append(Token(TokenType.EOF, "EOF", self.line, self.column))
        return tokens
