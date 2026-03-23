#!/usr/bin/env python3
"""Regenerate TypeScriptRoadmapSvgContent.tsx — delegates to generate-roadmap-svg-jsx.py."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GEN = Path(__file__).resolve().parent / "generate-roadmap-svg-jsx.py"


def main() -> None:
    subprocess.check_call(
        [
            sys.executable,
            str(GEN),
            "--svg",
            str(ROOT / "src/app/modules/Roadmaps/typescript.svg"),
            "--out",
            str(ROOT / "src/app/modules/Roadmaps/TypeScriptRoadmapSvgContent.tsx"),
            "--component",
            "TypeScriptRoadmapSvgContent",
            "--source-svg",
            "src/app/modules/Roadmaps/typescript.svg",
        ]
    )


if __name__ == "__main__":
    main()
