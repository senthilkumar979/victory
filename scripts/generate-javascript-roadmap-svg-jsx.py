#!/usr/bin/env python3
"""Regenerate JavaScriptRoadmapSvgContent.tsx — React edge color + icon completion like ReactRoadmap."""

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
            str(ROOT / "src/app/modules/Roadmaps/javascript.svg"),
            "--out",
            str(ROOT / "src/app/modules/Roadmaps/JavaScriptRoadmapSvgContent.tsx"),
            "--component",
            "JavaScriptRoadmapSvgContent",
            "--source-svg",
            "src/app/modules/Roadmaps/javascript.svg",
            "--edge-stroke",
            "#cea500",
            "--edge-stroke-width",
            "3.5",
            "--pair-icon-links",
        ]
    )


if __name__ == "__main__":
    main()
