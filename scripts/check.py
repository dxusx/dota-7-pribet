#!/usr/bin/env python3
"""
scripts/check.py
Cross-platform ground-truth verification wrapper for DOTA 7 PRIBET.
"""

import sys
import subprocess
import shutil
from pathlib import Path

def main():
    node_bin = shutil.which("node")
    if not node_bin:
        sys.stderr.write("[ENV ERROR] Node.js binary not found in PATH.\n")
        return 1

    script_path = Path(__file__).resolve().parent / "check.js"
    res = subprocess.run([node_bin, str(script_path)])
    return res.returncode

if __name__ == "__main__":
    sys.exit(main())
