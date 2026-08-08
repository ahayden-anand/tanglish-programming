import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from lexer import Lexer, TokenType

class TestLexer(unittest.TestCase):
    def test_keywords_and_identifiers(self):
        source = 'vai x = 10 sollu("hello")'
        lexer = Lexer(source)
        tokens = lexer.tokenize()

        types = [t.type for t in tokens]
        self.assertEqual(types, [
            TokenType.VAI,
            TokenType.IDENTIFIER,
            TokenType.ASSIGN,
            TokenType.NUMBER,
            TokenType.SOLLU,
            TokenType.LPAREN,
            TokenType.STRING,
            TokenType.RPAREN,
            TokenType.EOF
        ])
        self.assertEqual(tokens[1].value, 'x')
        self.assertEqual(tokens[3].value, 10)
        self.assertEqual(tokens[6].value, 'hello')

    def test_operators(self):
        source = 'a + b == c * d'
        lexer = Lexer(source)
        tokens = lexer.tokenize()
        ops = [t.type for t in tokens if t.type not in (TokenType.IDENTIFIER, TokenType.EOF)]
        self.assertEqual(ops, [TokenType.PLUS, TokenType.EQ, TokenType.STAR])

if __name__ == '__main__':
    unittest.main()
