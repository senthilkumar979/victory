#!/usr/bin/env python3
"""Regenerate src/data/roadmaps/typescript.ts from roadmap.sh content (developer-roadmap repo)."""

from __future__ import annotations

import json
import re
import ssl
import urllib.request

LIST_URL = "https://api.github.com/repos/kamranahmedse/developer-roadmap/contents/src/data/roadmaps/typescript/content"
GRAPH_URL = "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps/typescript/typescript.json"
BASE = "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps/typescript/content"

CTX = ssl.create_default_context()


def fetch_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "victory-roadmap-gen"})
    with urllib.request.urlopen(req, context=CTX) as r:
        return json.loads(r.read().decode())


def fetch_raw(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "victory-roadmap-gen"})
    with urllib.request.urlopen(req, context=CTX) as r:
        return r.read().decode()


TYPE_MAP = {
    "official": "documentation",
    "article": "article",
    "video": "video",
    "course": "course",
    "book": "book",
    "code": "code",
    "documentation": "documentation",
}


def parse_md(text: str) -> tuple[str, str, list[dict]]:
    lines = text.splitlines()
    title = lines[0].lstrip("# ").strip() if lines else ""
    desc_lines: list[str] = []
    for line in lines[1:]:
        if line.strip().startswith("Visit the following"):
            break
        desc_lines.append(line)
    desc = " ".join(s.strip() for s in desc_lines if s.strip()).strip()
    if not desc:
        desc = "Explore the resources below to go deeper."
    resources = []
    for m in re.finditer(r"- \[@(\w+)@([^\]]+)\]\(([^)]+)\)", text):
        tag, rtitle, url = m.groups()
        resources.append(
            {
                "title": rtitle.strip(),
                "url": url.strip(),
                "type": TYPE_MAP.get(tag.lower(), "other"),
            }
        )
    if not resources:
        resources = [
            {
                "title": "TypeScript Handbook",
                "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
                "type": "documentation",
            }
        ]
    return title, desc, resources


def main() -> None:
    items = fetch_json(LIST_URL)
    id_to_file: dict[str, str] = {}
    for it in items:
        m = re.search(r"@([A-Za-z0-9_-]+)\.md$", it["name"])
        if m:
            id_to_file[m.group(1)] = it["name"]

    graph = json.loads(urllib.request.urlopen(GRAPH_URL, context=CTX).read().decode())
    id_to_label: dict[str, str] = {}
    for n in graph["nodes"]:
        lab = n.get("data", {}).get("label")
        if lab:
            id_to_label[n["id"]] = lab
        if n["type"] == "linksgroup":
            for link in n.get("data", {}).get("links", []):
                lid = link.get("id")
                if lid:
                    id_to_label[lid] = link.get("label", "")

    parsed: dict[str, tuple[str, str, list]] = {}
    for nid, fname in id_to_file.items():
        text = fetch_raw(f"{BASE}/{fname}")
        parsed[nid] = parse_md(text)

    parsed["iogwMmOvub2ZF4zgg6WyF"] = (
        "TypeScript",
        "TypeScript adds static types to JavaScript so you can catch mistakes early and scale large codebases safely.",
        [
            {
                "title": "TypeScript Documentation",
                "url": "https://www.typescriptlang.org/docs/",
                "type": "documentation",
            },
            {
                "title": "TypeScript Handbook",
                "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
                "type": "documentation",
            },
            {
                "title": "Why TypeScript?",
                "url": "https://www.typescriptlang.org/why-typescript",
                "type": "article",
            },
        ],
    )

    want: set[str] = set()
    for n in graph["nodes"]:
        if n["type"] in ("topic", "subtopic", "title"):
            want.add(n["id"])
        if n["type"] == "button":
            want.add(n["id"])
        if n["type"] == "linksgroup":
            for link in n.get("data", {}).get("links", []):
                if link.get("id"):
                    want.add(link["id"])

    nodes_out: list[dict] = []
    for nid in sorted(want, key=lambda x: id_to_label.get(x, "")):
        if nid in parsed:
            title, desc, res = parsed[nid]
        else:
            label = id_to_label.get(nid, nid)
            title = label
            desc = f"Learn more about {label} in the TypeScript ecosystem."
            res = [
                {
                    "title": "TypeScript Handbook",
                    "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
                    "type": "documentation",
                }
            ]
        nodes_out.append({"id": nid, "title": title, "description": desc, "resources": res})

    seen: set[str] = set()
    deduped: list[dict] = []
    for n in nodes_out:
        if n["id"] in seen:
            continue
        seen.add(n["id"])
        deduped.append(n)

    lines = [
        'import type { RoadmapData } from "./types"',
        "",
        "export const typescriptRoadmap: RoadmapData = {",
        '  title: "TypeScript",',
        "  description:",
        '    "A typed superset of JavaScript: from everyday types to advanced type-level programming.",',
        "  nodes: [",
    ]
    for n in deduped:
        lines.append("    {")
        lines.append(f'      id: "{n["id"]}",')
        lines.append(f"      title: {json.dumps(n['title'])},")
        lines.append(f"      description: {json.dumps(n['description'])},")
        lines.append("      resources: [")
        for r in n["resources"]:
            lines.append("        {")
            lines.append(f"          title: {json.dumps(r['title'])},")
            lines.append(f"          url: {json.dumps(r['url'])},")
            lines.append(f"          type: {json.dumps(r['type'])},")
            lines.append("        },")
        lines.append("      ],")
        lines.append("    },")
    lines.append("  ],")
    lines.append("}")
    lines.append("")

    out = "src/data/roadmaps/typescript.ts"
    with open(out, "w") as f:
        f.write("\n".join(lines))
    print(f"Wrote {len(deduped)} nodes to {out}")


if __name__ == "__main__":
    main()
