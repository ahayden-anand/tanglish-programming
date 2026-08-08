#!/usr/bin/env python3
import sys
import os

# Add tanglish directory to python module search path
tanglish_dir = os.path.join(os.path.dirname(__file__), 'tanglish')
sys.path.insert(0, tanglish_dir)

from tanglish import main

if __name__ == "__main__":
    main()
