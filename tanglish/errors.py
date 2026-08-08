class TanglishError(Exception):
    """Base exception class for all Tanglish language errors."""
    def __init__(self, message: str, line: int = 1, column: int = 1, error_type: str = "TanglishError"):
        super().__init__(message)
        self.message = message
        self.line = line
        self.column = column
        self.error_type = error_type

    def format_error(self, source_code: str = "") -> str:
        lines = source_code.splitlines() if source_code else []
        line_str = f"Line {self.line}, Column {self.column}"
        
        output = [f"❌ [{self.error_type}] {self.message}"]
        output.append(f"   📍 Location: {line_str}")

        if 1 <= self.line <= len(lines):
            code_line = lines[self.line - 1]
            output.append(f"   |")
            output.append(f" {self.line:3d} | {code_line}")
            pointer = " " * max(0, self.column - 1) + "^"
            output.append(f"   | {pointer}")

        return "\n".join(output)


class TanglishSyntaxError(TanglishError):
    def __init__(self, message: str, line: int = 1, column: int = 1):
        super().__init__(message, line, column, "Sollamai Pizhai (Syntax Error)")


class TanglishRuntimeError(TanglishError):
    def __init__(self, message: str, line: int = 1, column: int = 1):
        super().__init__(message, line, column, "Iyakkam Pizhai (Runtime Error)")


class TanglishNameError(TanglishError):
    def __init__(self, message: str, line: int = 1, column: int = 1):
        super().__init__(message, line, column, "Peyar Pizhai (Name Error)")


class TanglishTypeError(TanglishError):
    def __init__(self, message: str, line: int = 1, column: int = 1):
        super().__init__(message, line, column, "Vagai Pizhai (Type Error)")
