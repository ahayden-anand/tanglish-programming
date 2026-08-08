from typing import List, Optional
from lexer import Token, TokenType
from ast_nodes import (
    ProgramNode, VarDeclNode, AssignNode, PrintNode, InputNode, BlockNode,
    IfNode, WhileNode, FuncDeclNode, FuncCallNode, ReturnNode, BinaryOpNode,
    UnaryOpNode, NumberNode, StringNode, BooleanNode, VarAccessNode, ASTNode
)
from errors import TanglishSyntaxError

class Parser:
    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.current = 0

    def _peek(self) -> Token:
        return self.tokens[self.current]

    def _previous(self) -> Token:
        return self.tokens[self.current - 1]

    def _is_at_end(self) -> bool:
        return self._peek().type == TokenType.EOF

    def _check(self, type_: TokenType) -> bool:
        if self._is_at_end():
            return False
        return self._peek().type == type_

    def _advance(self) -> Token:
        if not self._is_at_end():
            self.current += 1
        return self._previous()

    def _match(self, *types: TokenType) -> bool:
        for type_ in types:
            if self._check(type_):
                self._advance()
                return True
        return False

    def _consume(self, type_: TokenType, message: str) -> Token:
        if self._check(type_):
            return self._advance()
        token = self._peek()
        raise TanglishSyntaxError(f"{message}. Found '{token.value}' instead.", token.line, token.column)

    def parse(self) -> ProgramNode:
        statements = []
        while not self._is_at_end():
            stmt = self._parse_statement()
            if stmt:
                statements.append(stmt)
        return ProgramNode(statements)

    def _parse_statement(self) -> ASTNode:
        token = self._peek()

        if self._match(TokenType.VAI):
            return self._parse_var_declaration()
        elif self._match(TokenType.SOLLU):
            return self._parse_print_statement()
        elif self._match(TokenType.ENNA_NA):
            return self._parse_if_statement()
        elif self._match(TokenType.SUTHTHU):
            return self._parse_while_statement()
        elif self._match(TokenType.SEYAL):
            return self._parse_func_declaration()
        elif self._match(TokenType.THIRUPPU):
            return self._parse_return_statement()
        elif self._check(TokenType.LBRACE):
            return self._parse_block()
        else:
            return self._parse_assignment_or_expr_statement()

    def _parse_var_declaration(self) -> VarDeclNode:
        keyword_token = self._previous()
        name_token = self._consume(TokenType.IDENTIFIER, "Thavam: Variable peyar expect pandrom (Expected variable name)")
        self._consume(TokenType.ASSIGN, f"Thavam: Variable '{name_token.value}' aporam '=' irukkanum")
        expr = self._parse_expression()
        self._match(TokenType.SEMICOLON)
        return VarDeclNode(name_token.value, expr, keyword_token.line, keyword_token.column)

    def _parse_print_statement(self) -> PrintNode:
        sollu_token = self._previous()
        has_paren = self._match(TokenType.LPAREN)
        expr = self._parse_expression()
        if has_paren:
            self._consume(TokenType.RPAREN, "Thavam: sollu() kku closing ')' irukkanum")
        self._match(TokenType.SEMICOLON)
        return PrintNode(expr, sollu_token.line, sollu_token.column)

    def _parse_if_statement(self) -> IfNode:
        if_token = self._previous()
        condition = self._parse_expression()

        then_branch = self._parse_block()

        else_branch = None
        if self._match(TokenType.ILLENA):
            if self._match(TokenType.ENNA_NA):
                # 'illena enna_na' (else if)
                else_branch = self._parse_if_statement()
            else:
                else_branch = self._parse_block()

        return IfNode(condition, then_branch, else_branch, if_token.line, if_token.column)

    def _parse_while_statement(self) -> WhileNode:
        while_token = self._previous()
        condition = self._parse_expression()
        body = self._parse_block()
        return WhileNode(condition, body, while_token.line, while_token.column)

    def _parse_func_declaration(self) -> FuncDeclNode:
        func_token = self._previous()
        name_token = self._consume(TokenType.IDENTIFIER, "Thavam: Function peyar irukkanum (Expected function name)")
        self._consume(TokenType.LPAREN, "Thavam: Function parameters kaaha '(' expect pandrom")

        params = []
        if not self._check(TokenType.RPAREN):
            while True:
                param_token = self._consume(TokenType.IDENTIFIER, "Thavam: Parameter peyar expect pandrom")
                params.append(param_token.value)
                if not self._match(TokenType.COMMA):
                    break
        self._consume(TokenType.RPAREN, "Thavam: Function parameters mudikka ')' expect pandrom")

        body = self._parse_block()
        return FuncDeclNode(name_token.value, params, body, func_token.line, func_token.column)

    def _parse_return_statement(self) -> ReturnNode:
        ret_token = self._previous()
        value = None
        if not self._check(TokenType.SEMICOLON) and not self._check(TokenType.RBRACE) and not self._check(TokenType.MUDIVU) and not self._is_at_end():
            value = self._parse_expression()
        self._match(TokenType.SEMICOLON)
        return ReturnNode(value, ret_token.line, ret_token.column)

    def _parse_block(self) -> BlockNode:
        has_brace = self._match(TokenType.LBRACE)
        start_token = self._previous() if has_brace else self._peek()

        statements = []

        if has_brace:
            while not self._check(TokenType.RBRACE) and not self._check(TokenType.MUDIVU) and not self._is_at_end():
                stmt = self._parse_statement()
                if stmt:
                    statements.append(stmt)
            if self._check(TokenType.RBRACE):
                self._advance()
            elif self._check(TokenType.MUDIVU):
                self._advance()
            else:
                raise TanglishSyntaxError("Unclosed block. Expected '}' or 'mudivu'", start_token.line, start_token.column)
        else:
            # Block terminated by 'mudivu' keyword
            while not self._check(TokenType.MUDIVU) and not self._is_at_end():
                stmt = self._parse_statement()
                if stmt:
                    statements.append(stmt)
            if self._match(TokenType.MUDIVU):
                pass
            else:
                raise TanglishSyntaxError("Expected '{' or block terminated by 'mudivu'", start_token.line, start_token.column)

        return BlockNode(statements, start_token.line, start_token.column)

    def _parse_assignment_or_expr_statement(self) -> ASTNode:
        expr = self._parse_expression()
        
        # Check if this expression is part of an assignment: identifier = expr
        if isinstance(expr, VarAccessNode) and self._match(TokenType.ASSIGN):
            assign_token = self._previous()
            val_expr = self._parse_expression()
            self._match(TokenType.SEMICOLON)
            return AssignNode(expr.name, val_expr, assign_token.line, assign_token.column)

        self._match(TokenType.SEMICOLON)
        return expr

    def _parse_expression(self) -> ASTNode:
        return self._parse_logic_or()

    def _parse_logic_or(self) -> ASTNode:
        expr = self._parse_logic_and()
        while self._match(TokenType.OR):
            op_token = self._previous()
            right = self._parse_logic_and()
            expr = BinaryOpNode(expr, op_token.value, right, op_token.line, op_token.column)
        return expr

    def _parse_logic_and(self) -> ASTNode:
        expr = self._parse_equality()
        while self._match(TokenType.AND):
            op_token = self._previous()
            right = self._parse_equality()
            expr = BinaryOpNode(expr, op_token.value, right, op_token.line, op_token.column)
        return expr

    def _parse_equality(self) -> ASTNode:
        expr = self._parse_comparison()
        while self._match(TokenType.EQ, TokenType.NEQ):
            op_token = self._previous()
            right = self._parse_comparison()
            expr = BinaryOpNode(expr, op_token.value, right, op_token.line, op_token.column)
        return expr

    def _parse_comparison(self) -> ASTNode:
        expr = self._parse_term()
        while self._match(TokenType.LT, TokenType.GT, TokenType.LTE, TokenType.GTE):
            op_token = self._previous()
            right = self._parse_term()
            expr = BinaryOpNode(expr, op_token.value, right, op_token.line, op_token.column)
        return expr

    def _parse_term(self) -> ASTNode:
        expr = self._parse_factor()
        while self._match(TokenType.PLUS, TokenType.MINUS):
            op_token = self._previous()
            right = self._parse_factor()
            expr = BinaryOpNode(expr, op_token.value, right, op_token.line, op_token.column)
        return expr

    def _parse_factor(self) -> ASTNode:
        expr = self._parse_unary()
        while self._match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT):
            op_token = self._previous()
            right = self._parse_unary()
            expr = BinaryOpNode(expr, op_token.value, right, op_token.line, op_token.column)
        return expr

    def _parse_unary(self) -> ASTNode:
        if self._match(TokenType.MINUS, TokenType.NOT):
            op_token = self._previous()
            operand = self._parse_unary()
            return UnaryOpNode(op_token.value, operand, op_token.line, op_token.column)
        return self._parse_call_or_primary()

    def _parse_call_or_primary(self) -> ASTNode:
        expr = self._parse_primary()

        # Handle function calls
        if isinstance(expr, VarAccessNode) and self._match(TokenType.LPAREN):
            paren_token = self._previous()
            args = []
            if not self._check(TokenType.RPAREN):
                while True:
                    args.append(self._parse_expression())
                    if not self._match(TokenType.COMMA):
                        break
            self._consume(TokenType.RPAREN, "Thavam: Function call mudiya ')' expect pandrom")
            return FuncCallNode(expr.name, args, paren_token.line, paren_token.column)

        return expr

    def _parse_primary(self) -> ASTNode:
        token = self._peek()

        if self._match(TokenType.NUMBER):
            return NumberNode(token.value, token.line, token.column)
        if self._match(TokenType.STRING):
            return StringNode(token.value, token.line, token.column)
        if self._match(TokenType.UNMAI):
            return BooleanNode(True, token.line, token.column)
        if self._match(TokenType.POI):
            return BooleanNode(False, token.line, token.column)

        if self._match(TokenType.KETU):
            ketu_token = self._previous()
            prompt = None
            if self._match(TokenType.LPAREN):
                if not self._check(TokenType.RPAREN):
                    prompt = self._parse_expression()
                self._consume(TokenType.RPAREN, "Thavam: ketu() call ')' expect pandrom")
            return InputNode(prompt, ketu_token.line, ketu_token.column)

        if self._match(TokenType.IDENTIFIER):
            return VarAccessNode(token.value, token.line, token.column)

        if self._match(TokenType.LPAREN):
            expr = self._parse_expression()
            self._consume(TokenType.RPAREN, "Thavam: Expression closing ')' expect pandrom")
            return expr

        raise TanglishSyntaxError(f"Unexpected token in expression: '{token.value}'", token.line, token.column)
