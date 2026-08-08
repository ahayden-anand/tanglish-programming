import sys
from typing import Dict, Any, Optional, List, Callable
from ast_nodes import (
    ProgramNode, VarDeclNode, AssignNode, PrintNode, InputNode, BlockNode,
    IfNode, WhileNode, FuncDeclNode, FuncCallNode, ReturnNode, BinaryOpNode,
    UnaryOpNode, NumberNode, StringNode, BooleanNode, VarAccessNode, ASTNode
)
from errors import TanglishError, TanglishRuntimeError, TanglishNameError, TanglishTypeError

class ReturnValue(Exception):
    def __init__(self, value: Any):
        self.value = value


class Environment:
    def __init__(self, enclosing: Optional['Environment'] = None):
        self.values: Dict[str, Any] = {}
        self.enclosing = enclosing

    def define(self, name: str, value: Any):
        self.values[name] = value

    def get(self, name: str, line: int = 1, column: int = 1) -> Any:
        if name in self.values:
            return self.values[name]
        if self.enclosing is not None:
            return self.enclosing.get(name, line, column)
        raise TanglishNameError(f"Variable or function '{name}' is not defined. (Peyar '{name}' kandupidikka mudiyala)", line, column)

    def assign(self, name: str, value: Any, line: int = 1, column: int = 1):
        if name in self.values:
            self.values[name] = value
            return
        if self.enclosing is not None:
            self.enclosing.assign(name, value, line, column)
            return
        raise TanglishNameError(f"Cannot assign to undefined variable '{name}'. Declare it first using 'vai {name} = ...'", line, column)


class Function:
    def __init__(self, name: str, params: List[str], body: BlockNode, closure: Environment):
        self.name = name
        self.params = params
        self.body = body
        self.closure = closure

    def __repr__(self):
        return f"<seyal {self.name}({', '.join(self.params)})>"


class Interpreter:
    def __init__(
        self,
        output_fn: Optional[Callable[[str], None]] = None,
        input_fn: Optional[Callable[[str], str]] = None
    ):
        self.global_env = Environment()
        self.environment = self.global_env
        self.output_fn = output_fn or (lambda msg: print(msg, flush=True))
        def _default_input(prompt: str = "") -> str:
            if prompt:
                print(prompt, end="", flush=True)
            return input()
        self.input_fn = input_fn or _default_input
        self._setup_builtins()

    def _setup_builtins(self):
        # Built-in Tanglish helper functions
        # neelam: string length
        self.global_env.define("neelam", lambda val: len(str(val)))
        # maathu_number: parse int/float
        def _maathu_num(val):
            try:
                if "." in str(val):
                    return float(val)
                return int(val)
            except ValueError:
                return 0
        self.global_env.define("maathu_number", _maathu_num)
        # vagai: type name
        def _vagai(val):
            if isinstance(val, bool):
                return "booleangai"
            if isinstance(val, (int, float)):
                return "enn"
            if isinstance(val, str):
                return "soll"
            return "theriyathu"
        self.global_env.define("vagai", _vagai)

    def interpret(self, program: ProgramNode):
        try:
            for stmt in program.statements:
                self.execute(stmt)
        except TanglishError as e:
            raise e
        except Exception as e:
            raise TanglishRuntimeError(f"Unexpected execution error: {str(e)}", 1, 1)

    def execute(self, node: ASTNode) -> Any:
        if node is None:
            return None

        method_name = f"visit_{node.__class__.__name__}"
        visitor = getattr(self, method_name, None)
        if visitor is None:
            raise TanglishRuntimeError(f"No visitor defined for AST node {node.__class__.__name__}", getattr(node, 'line', 1), getattr(node, 'column', 1))
        return visitor(node)

    def visit_ProgramNode(self, node: ProgramNode):
        for stmt in node.statements:
            self.execute(stmt)

    def visit_VarDeclNode(self, node: VarDeclNode):
        val = self.execute(node.value_expr)
        self.environment.define(node.name, val)

    def visit_AssignNode(self, node: AssignNode):
        val = self.execute(node.value_expr)
        self.environment.assign(node.name, val, node.line, node.column)

    def visit_PrintNode(self, node: PrintNode):
        val = self.execute(node.expression)
        output_str = self._stringify(val)
        self.output_fn(output_str)

    def visit_InputNode(self, node: InputNode):
        prompt_str = ""
        if node.prompt_expr:
            prompt_str = self._stringify(self.execute(node.prompt_expr))
        raw_val = self.input_fn(prompt_str)
        # Try auto converting numeric input if possible, or leave as string
        raw_val = raw_val.strip()
        if raw_val.isdigit():
            return int(raw_val)
        try:
            return float(raw_val)
        except ValueError:
            return raw_val

    def visit_BlockNode(self, node: BlockNode):
        previous_env = self.environment
        try:
            self.environment = Environment(previous_env)
            for stmt in node.statements:
                self.execute(stmt)
        finally:
            self.environment = previous_env

    def visit_IfNode(self, node: IfNode):
        condition_val = self.execute(node.condition)
        if self._is_truthy(condition_val):
            self.execute(node.then_branch)
        elif node.else_branch:
            self.execute(node.else_branch)

    def visit_WhileNode(self, node: WhileNode):
        while self._is_truthy(self.execute(node.condition)):
            self.execute(node.body)

    def visit_FuncDeclNode(self, node: FuncDeclNode):
        func = Function(node.name, node.params, node.body, self.environment)
        self.environment.define(node.name, func)

    def visit_FuncCallNode(self, node: FuncCallNode):
        callee = self.environment.get(node.name, node.line, node.column)

        args = [self.execute(arg) for arg in node.args]

        if callable(callee):
            # Python built-in function call
            try:
                return callee(*args)
            except Exception as e:
                raise TanglishRuntimeError(f"Error in builtin function call '{node.name}': {str(e)}", node.line, node.column)

        if isinstance(callee, Function):
            if len(args) != len(callee.params):
                raise TanglishRuntimeError(
                    f"Function '{node.name}' expects {len(callee.params)} arguments, but got {len(args)}.",
                    node.line, node.column
                )

            # Create new execution environment for function frame
            fn_env = Environment(callee.closure)
            for param_name, arg_val in zip(callee.params, args):
                fn_env.define(param_name, arg_val)

            previous_env = self.environment
            try:
                self.environment = fn_env
                for stmt in callee.body.statements:
                    self.execute(stmt)
            except ReturnValue as ret:
                return ret.value
            finally:
                self.environment = previous_env

            return None

        raise TanglishTypeError(f"'{node.name}' is not a function.", node.line, node.column)

    def visit_ReturnNode(self, node: ReturnNode):
        val = None
        if node.value_expr:
            val = self.execute(node.value_expr)
        raise ReturnValue(val)

    def visit_BinaryOpNode(self, node: BinaryOpNode):
        left = self.execute(node.left)
        right = self.execute(node.right)
        op = node.op

        if op == "+":
            if isinstance(left, str) or isinstance(right, str):
                return self._stringify(left) + self._stringify(right)
            return left + right
        elif op == "-":
            return left - right
        elif op == "*":
            if isinstance(left, str) and isinstance(right, int):
                return left * right
            return left * right
        elif op == "/":
            if right == 0:
                raise TanglishRuntimeError("Pizhai: Zero-al vagukka mudiyadhu (Division by zero)", node.line, node.column)
            return left / right
        elif op == "%":
            return left % right
        elif op == "==":
            return left == right
        elif op == "!=":
            return left != right
        elif op == "<":
            return left < right
        elif op == ">":
            return left > right
        elif op == "<=":
            return left <= right
        elif op == ">=":
            return left >= right
        elif op in ("matrum", "&&"):
            return self._is_truthy(left) and self._is_truthy(right)
        elif op in ("alladhu", "||"):
            return self._is_truthy(left) or self._is_truthy(right)

        raise TanglishRuntimeError(f"Unknown binary operator '{op}'", node.line, node.column)

    def visit_UnaryOpNode(self, node: UnaryOpNode):
        operand = self.execute(node.operand)
        op = node.op

        if op == "-":
            return -operand
        elif op in ("!", "illai"):
            return not self._is_truthy(operand)

        raise TanglishRuntimeError(f"Unknown unary operator '{op}'", node.line, node.column)

    def visit_NumberNode(self, node: NumberNode):
        return node.value

    def visit_StringNode(self, node: StringNode):
        return node.value

    def visit_BooleanNode(self, node: BooleanNode):
        return node.value

    def visit_VarAccessNode(self, node: VarAccessNode):
        return self.environment.get(node.name, node.line, node.column)

    def _is_truthy(self, val: Any) -> bool:
        if val is None or val is False or val == 0 or val == "":
            return False
        return True

    def _stringify(self, val: Any) -> str:
        if val is True:
            return "unmai"
        if val is False:
            return "poi"
        if val is None:
            return "nothing"
        if isinstance(val, float) and val.is_integer():
            return str(int(val))
        return str(val)
