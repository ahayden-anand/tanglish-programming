import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from lexer import Lexer
from parser import Parser
from ast_nodes import ProgramNode, VarDeclNode, PrintNode, BinaryOpNode

class TestParser(unittest.TestCase):
    def test_var_decl_and_print(self):
        code = 'vai a = 5 + 10\nsollu(a)'
        lexer = Lexer(code)
        tokens = lexer.tokenize()
        parser = Parser(tokens)
        ast = parser.parse()

        self.assertIsInstance(ast, ProgramNode)
        self.assertEqual(len(ast.statements), 2)
        
        var_decl = ast.statements[0]
        self.assertIsInstance(var_decl, VarDeclNode)
        self.assertEqual(var_decl.name, 'a')
        self.assertIsInstance(var_decl.value_expr, BinaryOpNode)

        print_stmt = ast.statements[1]
        self.assertIsInstance(print_stmt, PrintNode)

if __name__ == '__main__':
    unittest.main()
