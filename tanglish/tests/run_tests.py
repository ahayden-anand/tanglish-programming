import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

if __name__ == '__main__':
    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=os.path.dirname(__file__), pattern='test_*.py')
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(not result.wasSuccessful())
