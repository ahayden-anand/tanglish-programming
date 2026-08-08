import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from lexer import Lexer
from parser import Parser
from interpreter import Interpreter

class TestInterpreter(unittest.TestCase):
    def test_variable_and_math(self):
        code = '''
vai a = 10
vai b = 20
vai c = a + b
sollu(c)
'''
        output = []
        lexer = Lexer(code)
        tokens = lexer.tokenize()
        parser = Parser(tokens)
        ast = parser.parse()

        interpreter = Interpreter(output_fn=lambda m: output.append(str(m)))
        interpreter.interpret(ast)

        self.assertEqual(output, ['30'])

    def test_functions_and_recursion(self):
        code = '''
seyal fib(n) {
    enna_na n <= 1 {
        thiruppu n
    }
    thiruppu fib(n - 1) + fib(n - 2)
}

sollu(fib(6))
'''
        output = []
        lexer = Lexer(code)
        tokens = lexer.tokenize()
        parser = Parser(tokens)
        ast = parser.parse()

        interpreter = Interpreter(output_fn=lambda m: output.append(str(m)))
        interpreter.interpret(ast)

        self.assertEqual(output, ['8'])

if __name__ == '__main__':
    unittest.main()
