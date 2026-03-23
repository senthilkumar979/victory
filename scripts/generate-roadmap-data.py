#!/usr/bin/env python3
"""Regenerate src/data/roadmaps/{typescript|javascript}.ts from developer-roadmap (roadmap.sh)."""

from __future__ import annotations

import argparse
import json
import re
import ssl
import urllib.request

CTX = ssl.create_default_context()
GH_API = "https://api.github.com/repos/kamranahmedse/developer-roadmap/contents/src/data/roadmaps"
BASE = "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps"

TYPE_MAP = {
    "official": "documentation",
    "article": "article",
    "video": "video",
    "course": "course",
    "book": "book",
    "code": "code",
    "documentation": "documentation",
}

CONFIG = {
    "typescript": {
        "export_name": "typescriptRoadmap",
        "title": "TypeScript",
        "description": (
            "A typed superset of JavaScript: from everyday types to advanced type-level programming."
        ),
        "content_dir": "typescript/content",
        "graph_file": "typescript/typescript.json",
        "root_override": {
            "id": "iogwMmOvub2ZF4zgg6WyF",
            "title": "TypeScript",
            "description": (
                "TypeScript adds static types to JavaScript so you can catch mistakes early "
                "and scale large codebases safely."
            ),
            "resources": [
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
        },
        "fallback": {
            "title": "TypeScript Handbook",
            "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
            "type": "documentation",
        },
    },
    "javascript": {
        "export_name": "javascriptRoadmap",
        "title": "JavaScript",
        "description": (
            "The language of the web: syntax, the runtime, and the modern JavaScript ecosystem."
        ),
        "content_dir": "javascript/content",
        "graph_file": "javascript/javascript.json",
        "root_override": {
            "id": "iogwMmOvub2ZF4zgg6WyF",
            "title": "JavaScript",
            "description": (
                "JavaScript is the programming language of the web. It runs in browsers and "
                "on servers (Node.js), and powers interactive sites, apps, and APIs."
            ),
            "resources": [
                {
                    "title": "JavaScript on MDN",
                    "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                    "type": "documentation",
                },
                {
                    "title": "javascript.info",
                    "url": "https://javascript.info",
                    "type": "course",
                },
                {
                    "title": "ECMAScript specification",
                    "url": "https://tc39.es/ecma262/",
                    "type": "documentation",
                },
            ],
        },
        "fallback": {
            "title": "MDN — JavaScript Guide",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            "type": "documentation",
        },
    },
}


def fetch_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "victory-roadmap-gen"})
    with urllib.request.urlopen(req, context=CTX) as r:
        return json.loads(r.read().decode())


def fetch_raw(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "victory-roadmap-gen"})
    with urllib.request.urlopen(req, context=CTX) as r:
        return r.read().decode()


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
    return title, desc, resources


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", choices=list(CONFIG.keys()), required=True)
    args = ap.parse_args()
    cfg = CONFIG[args.slug]

    list_url = f"{GH_API}/{args.slug}/content"
    graph_url = f"{BASE}/{cfg['graph_file']}"
    content_base = f"{BASE}/{cfg['content_dir']}"

    items = fetch_json(list_url)
    id_to_file: dict[str, str] = {}
    for it in items:
        m = re.search(r"@([A-Za-z0-9_-]+)\.md$", it["name"])
        if m:
            id_to_file[m.group(1)] = it["name"]

    graph = json.loads(urllib.request.urlopen(graph_url, context=CTX).read().decode())
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
        text = fetch_raw(f"{content_base}/{fname}")
        parsed[nid] = parse_md(text)

    ro = cfg["root_override"]
    parsed[ro["id"]] = (ro["title"], ro["description"], ro["resources"])

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

    fb = cfg["fallback"]
    nodes_out: list[dict] = []
    for nid in sorted(want, key=lambda x: id_to_label.get(x, "")):
        if nid in parsed:
            title, desc, res = parsed[nid]
            if not res:
                res = [dict(fb)]
        else:
            label = id_to_label.get(nid, nid)
            title = label
            ecosystem = "JavaScript" if args.slug == "javascript" else "TypeScript"
            desc = f"Learn more about {label} in the {ecosystem} ecosystem."
            res = [dict(fb)]
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
        f"export const {cfg['export_name']}: RoadmapData = {{",
        f'  title: {json.dumps(cfg["title"])},',
        "  description:",
        f"    {json.dumps(cfg['description'])},",
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

    out = f"src/data/roadmaps/{args.slug}.ts"
    with open(out, "w") as f:
        f.write("\n".join(lines))
    print(f"Wrote {len(deduped)} nodes to {out}")


if __name__ == "__main__":
    main()
