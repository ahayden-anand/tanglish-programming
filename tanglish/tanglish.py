import sys
import os
import json
import argparse
from typing import List, Dict, Any

from lexer import Lexer
from parser import Parser
from interpreter import Interpreter
from errors import TanglishError


def run_code(
    source_code: str,
    output_callback=None,
    input_callback=None,
    show_tokens: bool = False,
    show_ast: bool = False,
    is_api_mode: bool = False
) -> Dict[str, Any]:
    logs = []
    
    def default_out(msg):
        logs.append(str(msg))
        if output_callback:
            output_callback(str(msg))
        elif not show_ast and not show_tokens and not is_api_mode:
            print(msg, flush=True)

    try:
        lexer = Lexer(source_code)
        tokens = lexer.tokenize()

        if show_tokens:
            print("--- TOKENS ---")
            for t in tokens:
                print(t)
            print("--------------")

        parser = Parser(tokens)
        ast = parser.parse()

        if show_ast:
            print("--- AST ---")
            print(json.dumps(ast.to_dict(), indent=2))
            print("-----------")

        interpreter = Interpreter(output_fn=default_out, input_fn=input_callback)
        interpreter.interpret(ast)

        return {
            "success": True,
            "logs": logs,
            "output": "\n".join(logs),
            "tokens": [repr(t) for t in tokens],
            "ast": ast.to_dict()
        }

    except TanglishError as e:
        formatted = e.format_error(source_code)
        if not output_callback:
            print(formatted, file=sys.stderr)
        return {
            "success": False,
            "error": formatted,
            "error_type": e.error_type,
            "message": e.message,
            "line": e.line,
            "column": e.column,
            "logs": logs,
            "output": "\n".join(logs)
        }
    except Exception as e:
        err_msg = f"❌ Fatal Error: {str(e)}"
        if not output_callback:
            print(err_msg, file=sys.stderr)
        return {
            "success": False,
            "error": err_msg,
            "logs": logs,
            "output": "\n".join(logs)
        }


def run_repl():
    print("=========================================")
    print(" 🌺 Tanglish Programming Language (v1.0)")
    print(" Type 'mudivu' or 'exit' or Ctrl+C to quit.")
    print("=========================================\n")

    interpreter = Interpreter()

    while True:
        try:
            line = input("tanglish> ")
            if line.strip() in ("exit", "quit", "mudivu"):
                print("Vanakkam! (Goodbye)")
                break
            if not line.strip():
                continue

            lexer = Lexer(line)
            tokens = lexer.tokenize()
            parser = Parser(tokens)
            ast = parser.parse()

            interpreter.interpret(ast)

        except TanglishError as e:
            print(e.format_error(line))
        except KeyboardInterrupt:
            print("\nVanakkam!")
            break
        except Exception as e:
            print(f"Error: {e}")


def main():
    parser = argparse.ArgumentParser(description="Tanglish Language Runner")
    parser.add_argument("filename", nargs="?", help="Path to .tgl Tanglish program file")
    parser.add_argument("--tokens", action="store_true", help="Print token stream")
    parser.add_argument("--ast", action="store_true", help="Print Abstract Syntax Tree")
    parser.add_argument("--api", action="store_true", help="Run code read from stdin or file and return JSON response")
    parser.add_argument("--code", type=str, help="Direct code string execution")
    parser.add_argument("--inputs", type=str, help="Comma-separated or newline-separated pre-provided inputs for REPL/API")

    args = parser.parse_args()

    input_list = []
    if args.inputs:
        input_list = [i.strip() for i in args.inputs.split("\n") if i.strip()]
        if not input_list:
            input_list = [i.strip() for i in args.inputs.split(",") if i.strip()]

    def mock_input(prompt=""):
        if input_list:
            val = input_list.pop(0)
            if prompt:
                print(f"{prompt}{val}")
            return val
        return input(prompt)

    source_code = None

    if args.code:
        source_code = args.code
    elif args.filename:
        if not os.path.exists(args.filename):
            print(f"❌ Error: File '{args.filename}' not found.", file=sys.stderr)
            sys.exit(1)
        with open(args.filename, "r", encoding="utf-8") as f:
            source_code = f.read()
    elif args.api or not sys.stdin.isatty():
        source_code = sys.stdin.read()

    if source_code is not None:
        result = run_code(
            source_code,
            input_callback=mock_input if input_list else None,
            show_tokens=args.tokens,
            show_ast=args.ast,
            is_api_mode=args.api
        )
        if args.api:
            print(json.dumps(result))
        elif not result["success"]:
            sys.exit(1)
    else:
        run_repl()


if __name__ == "__main__":
    main()
