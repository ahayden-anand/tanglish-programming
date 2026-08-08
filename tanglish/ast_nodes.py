from dataclasses import dataclass, field
from typing import List, Optional, Any

class ASTNode:
    def to_dict(self) -> dict:
        """Convert AST node to dictionary representation for debugging & visual AST inspection."""
        res = {"type": self.__class__.__name__}
        for k, v in self.__dict__.items():
            if isinstance(v, ASTNode):
                res[k] = v.to_dict()
            elif isinstance(v, list):
                res[k] = [item.to_dict() if isinstance(item, ASTNode) else item for item in v]
            else:
                res[k] = v
        return res


@dataclass
class ProgramNode(ASTNode):
    statements: List[ASTNode]


@dataclass
class VarDeclNode(ASTNode):
    name: str
    value_expr: ASTNode
    line: int
    column: int


@dataclass
class AssignNode(ASTNode):
    name: str
    value_expr: ASTNode
    line: int
    column: int


@dataclass
class PrintNode(ASTNode):
    expression: ASTNode
    line: int
    column: int


@dataclass
class InputNode(ASTNode):
    prompt_expr: Optional[ASTNode]
    line: int
    column: int


@dataclass
class BlockNode(ASTNode):
    statements: List[ASTNode]
    line: int
    column: int


@dataclass
class IfNode(ASTNode):
    condition: ASTNode
    then_branch: ASTNode
    else_branch: Optional[ASTNode]
    line: int
    column: int


@dataclass
class WhileNode(ASTNode):
    condition: ASTNode
    body: ASTNode
    line: int
    column: int


@dataclass
class FuncDeclNode(ASTNode):
    name: str
    params: List[str]
    body: ASTNode
    line: int
    column: int


@dataclass
class FuncCallNode(ASTNode):
    name: str
    args: List[ASTNode]
    line: int
    column: int


@dataclass
class ReturnNode(ASTNode):
    value_expr: Optional[ASTNode]
    line: int
    column: int


@dataclass
class BinaryOpNode(ASTNode):
    left: ASTNode
    op: str
    right: ASTNode
    line: int
    column: int


@dataclass
class UnaryOpNode(ASTNode):
    op: str
    operand: ASTNode
    line: int
    column: int


@dataclass
class NumberNode(ASTNode):
    value: Any  # int or float
    line: int
    column: int


@dataclass
class StringNode(ASTNode):
    value: str
    line: int
    column: int


@dataclass
class BooleanNode(ASTNode):
    value: bool
    line: int
    column: int


@dataclass
class VarAccessNode(ASTNode):
    name: str
    line: int
    column: int
