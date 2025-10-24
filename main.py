"""Command-line interface for the novel generator.

This script provides a way to generate a novel from the command line. It takes
a single argument: the title of the novel to be generated.

Usage:
    python main.py "The Title of the Novel"
"""

import sys
from generator import generate_novel, log

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python main.py \"Título de la novela\"")
        sys.exit(1)

    novel_title = sys.argv[1]
    log(f"Comenzando generación de novela: {novel_title}")
    generate_novel(novel_title)
