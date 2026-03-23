#!/usr/bin/env python3
"""Regenerate javascript.ts — delegates to generate-roadmap-data.py --slug javascript."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

GEN = Path(__file__).resolve().parent / "generate-roadmap-data.py"


def main() -> None:
    subprocess.check_call([sys.executable, str(GEN), "--slug", "javascript"])


if __name__ == "__main__":
    main()
