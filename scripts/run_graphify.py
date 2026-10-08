#!/usr/bin/env python3
"""
scripts/run_graphify.py
Standardized Project Knowledge Graph Runner
Supports:
  python scripts/run_graphify.py [--build]
  python scripts/run_graphify.py query "<term>"
  python scripts/run_graphify.py [any other graphify subcommand]
"""

import sys
import subprocess
import shutil
from pathlib import Path

PYTHON_CANDIDATES = [
    sys.executable,
    r"C:\Users\karim\AppData\Local\Programs\Python\Python314\python.exe",
    shutil.which("python3"),
    shutil.which("python"),
]

def find_graphify_python():
    for py in PYTHON_CANDIDATES:
        if not py or not Path(py).exists():
            continue
        try:
            check = subprocess.run(
                [py, "-c", "import graphify"],
                capture_output=True,
                text=True
            )
            if check.returncode == 0:
                return py
        except Exception:
            continue
    return None

def main():
    py = find_graphify_python()
    if not py:
        sys.stderr.write("[ERROR] Python environment with 'graphify' package not found.\n")
        sys.stderr.write("Please run: pip install graphifyy\n")
        return 1

    project_root = Path(__file__).resolve().parent.parent

    args = sys.argv[1:]
    if not args or args == ["--build"]:
        cmd = [py, "-m", "graphify", "extract", str(project_root), "--code-only"]
    elif args[0] == "query":
        cmd = [py, "-m", "graphify", "query"] + args[1:]
    else:
        cmd = [py, "-m", "graphify"] + args

    res = subprocess.run(cmd, cwd=str(project_root))
    return res.returncode

if __name__ == "__main__":
    sys.exit(main())
