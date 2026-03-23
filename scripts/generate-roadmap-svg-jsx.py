#!/usr/bin/env python3
"""Generate *RoadmapSvgContent.tsx from roadmap SVG (roadmap.sh export).

- Optional --edge-stroke: React graph edges — only <path data-edge-id> get #cea500 (ignore SVG stroke).
- Optional --pair-icon-links: map icon-link circles + check paths to nearest graph node; completion UI
  uses fill #16a34a and display={isCompleted(id) ? 'block' : 'none'} like ReactRoadmap.tsx.
"""

from __future__ import annotations

import argparse
import json
import re
import ssl
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

INTERACTIVE_TYPES = frozenset({"topic", "subtopic", "title", "button", "link-item"})
COMPLETION_STROKE_TYPES = frozenset({"topic", "subtopic", "button"})
VOID_TAGS = frozenset({"path", "rect", "circle", "line"})

GRAPH_URL_JS = (
    "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/"
    "src/data/roadmaps/javascript/javascript.json"
)

EDGE_STROKE_OVERRIDE: str | None = None
EDGE_STROKE_WIDTH: float = 3.5


def camel_case_attr(name: str) -> str:
    if name == "class":
        return "className"
    if name.startswith("xmlns:"):
        return "xmlns" + name.split(":", 1)[1].title()
    parts = name.split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def parse_style_string(s: str) -> dict[str, str | float | int]:
    out: dict[str, str | float | int] = {}
    for part in s.split(";"):
        part = part.strip()
        if not part or ":" not in part:
            continue
        k, v = part.split(":", 1)
        kraw = k.strip()
        if kraw.startswith("--"):
            continue
        ck = camel_case_attr(kraw)
        v = v.strip()
        if re.match(r"^-?\d+(\.\d+)?$", v):
            out[ck] = float(v) if "." in v else int(v)
        else:
            out[ck] = v
    return out


def react_attr_name(k: str) -> str:
    if k.startswith("data-"):
        return k
    return camel_case_attr(k)


def attrs_to_jsx(attrib: dict[str, str], skip: set[str]) -> list[str]:
    style_merged: dict[str, str | float | int] = {}
    parts: list[str] = []
    for k, v in attrib.items():
        if k in skip:
            continue
        if k == "style":
            style_merged.update(parse_style_string(v))
            continue
        rk = react_attr_name(k)
        if rk == "id" and v == "icon-link":
            continue
        if rk == "zIndex":
            style_merged["zIndex"] = int(v) if v.isdigit() else v
            continue
        if rk == "textAnchor" and v == "left":
            v = "start"
        parts.append(f"{rk}={jsx_attr_value(v)}")
    if style_merged:
        inner_parts: list[str] = []
        for k, v in style_merged.items():
            if k.startswith("--"):
                inner_parts.append(f"{json.dumps(k)}: {repr(v)}")
            else:
                inner_parts.append(f"{k}: {repr(v)}")
        parts.append("style={{ " + ", ".join(inner_parts) + " }}")
    return parts


def jsx_attr_value(v: str) -> str:
    v = v.strip()
    if re.match(r"^-?\d+(\.\d+)?$", v):
        return "{" + v + "}"
    return json.dumps(v)


def escape_text(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def fetch_javascript_graph() -> dict:
    ctx = ssl.create_default_context()
    req = urllib.request.Request(GRAPH_URL_JS, headers={"User-Agent": "victory-roadmap-gen"})
    with urllib.request.urlopen(req, context=ctx) as r:
        return json.loads(r.read().decode())


def build_matchable_nodes(graph: dict) -> list[dict[str, float | str]]:
    out: list[dict[str, float | str]] = []
    match_types = frozenset({"subtopic", "topic", "title", "button"})
    for n in graph.get("nodes", []):
        if n.get("type") not in match_types:
            continue
        p = n.get("position")
        if not p or "x" not in p or "y" not in p:
            continue
        out.append({"id": n["id"], "x": float(p["x"]), "y": float(p["y"])})
    return out


def nearest_node_id(cx: float, cy: float, nodes: list[dict[str, float | str]]) -> str:
    best: str | None = None
    best_d = 1e30
    for n in nodes:
        px, py = float(n["x"]), float(n["y"])
        d = (px - cx) ** 2 + (py - cy) ** 2
        if d < best_d:
            best_d = d
            best = str(n["id"])
    return best or ""


def is_legend_icon(cx: float, cy: float) -> bool:
    """Legend key circles (left of roadmap); keep SVG fills, no completion binding."""
    return cx < -420.0 and cy < -90.0


def pair_icon_links_on_root(svg_root: ET.Element, nodes: list[dict[str, float | str]]) -> None:
    """Pair root-level <circle id=icon-link> + following <path> checkmarks to nearest graph node."""
    kids = list(svg_root)
    i = 0
    while i < len(kids) - 1:
        c = kids[i]
        n = kids[i + 1]
        if c.tag.split("}")[-1] != "circle" or n.tag.split("}")[-1] != "path":
            i += 1
            continue
        if c.attrib.get("id") != "icon-link":
            i += 1
            continue
        try:
            cx = float(c.attrib.get("cx", "0"))
            cy = float(c.attrib.get("cy", "0"))
        except ValueError:
            i += 1
            continue
        if is_legend_icon(cx, cy):
            i += 1
            continue
        nid = nearest_node_id(cx, cy, nodes)
        if nid:
            c.attrib["data-completion-node"] = nid
            n.attrib["data-completion-node"] = nid
        i += 2


def emit_element(elem: ET.Element, parent: ET.Element | None, indent: int) -> list[str]:
    sp = " " * indent
    tag = elem.tag.split("}")[-1]

    node_id = elem.attrib.get("data-node-id")
    dtype = elem.attrib.get("data-type")

    attrib = dict(elem.attrib)
    completion_nid = attrib.pop("data-completion-node", None)

    skip: set[str] = set()
    extra_attrs: list[str] = []

    if tag == "path" and attrib.get("data-edge-id") and EDGE_STROKE_OVERRIDE:
        skip.update({"stroke", "stroke-width"})
        extra_attrs.append(f"stroke={json.dumps(EDGE_STROKE_OVERRIDE)}")
        extra_attrs.append(f"strokeWidth={{{EDGE_STROKE_WIDTH}}}")

    if tag == "circle" and completion_nid:
        skip.update({"fill"})
        extra_attrs.append('fill="#16a34a"')
        extra_attrs.append(f"display={{isCompleted('{completion_nid}') ? 'block' : 'none'}}")

    if tag == "path" and completion_nid:
        extra_attrs.append(f"display={{isCompleted('{completion_nid}') ? 'block' : 'none'}}")

    if tag == "rect" and parent is not None:
        pnid = parent.attrib.get("data-node-id")
        ptype = parent.attrib.get("data-type")
        if pnid and ptype in COMPLETION_STROKE_TYPES:
            base_stroke = attrib.get("stroke", "black")
            sw_s = attrib.get("stroke-width", "2.7")
            try:
                sw = float(sw_s)
            except ValueError:
                sw = 2.7
            skip.update({"stroke", "stroke-width"})
            extra_attrs.append(f"stroke={{isCompleted('{pnid}') ? '#16a34a' : {json.dumps(base_stroke)}}}")
            extra_attrs.append(f"strokeWidth={{isCompleted('{pnid}') ? {max(sw, 3.5)} : {sw}}}")

    on_click = ""
    g_style = ""
    if dtype in INTERACTIVE_TYPES and node_id:
        on_click = f" onClick={{() => onNodeClick('{node_id}')}}"
        g_style = " style={{ cursor: 'pointer' }}"

    attr_list = attrs_to_jsx(attrib, skip)
    attr_list.extend(extra_attrs)
    attr_str = (" " + " ".join(attr_list)) if attr_list else ""

    open_suffix = ""
    if tag == "g" and dtype in INTERACTIVE_TYPES and node_id:
        open_suffix = on_click + g_style
    elif tag != "g" and on_click:
        open_suffix = on_click

    children = list(elem)

    title_checkmark: list[str] = []
    if tag == "g" and dtype == "title" and node_id:
        tx = ty = None
        for ch in elem:
            if ch.tag.split("}")[-1] == "text":
                tx, ty = ch.attrib.get("x"), ch.attrib.get("y")
                break
        if tx and ty:
            try:
                fx, fy = float(tx), float(ty)
                cx, cy = fx - 22, fy
                title_checkmark = [
                    f'{sp}  <circle cx="{cx}" cy="{cy}" r="9.5" fill="#16a34a" display={{isCompleted(\'{node_id}\') ? \'block\' : \'none\'}} />',
                    f"{sp}  <path",
                    f'        d="M{cx - 4} {cy}L{cx - 1.5} {cy + 3}L{cx + 4} {cy - 2}"',
                    f'        fill="none"',
                    f'        stroke="#fff"',
                    f"        strokeWidth={{2}}",
                    f'        strokeLinecap="round"',
                    f'        strokeLinejoin="round"',
                    f'        display={{isCompleted(\'{node_id}\') ? \'block\' : \'none\'}}',
                    f"      />",
                ]
            except ValueError:
                pass

    if tag == "text":
        inner_parts: list[str] = []
        if elem.text and elem.text.strip():
            inner_parts.append(escape_text(elem.text))
        for ch in children:
            ctag = ch.tag.split("}")[-1]
            if ctag == "tspan":
                ta = attrs_to_jsx(dict(ch.attrib), set())
                ta_str = (" " + " ".join(ta)) if ta else ""
                t_inner = ""
                if ch.text:
                    t_inner = escape_text(ch.text)
                inner_parts.append(f"<tspan{ta_str}>{t_inner}</tspan>")
            if ch.tail and ch.tail.strip():
                inner_parts.append(escape_text(ch.tail.strip()))
        body = "".join(inner_parts) if inner_parts else (escape_text(elem.text or ""))
        return [f"{sp}<{tag}{attr_str}>{body}</{tag}>"]

    if not children:
        if tag in VOID_TAGS:
            return [f"{sp}<{tag}{attr_str}{open_suffix} />"]
        return [f"{sp}<{tag}{attr_str}{open_suffix}></{tag}>"]

    lines = [f"{sp}<{tag}{attr_str}{open_suffix}>"]
    for ch in children:
        lines.extend(emit_element(ch, elem, indent + 2))
        if ch.tail and ch.tail.strip():
            lines.append(f"{sp}  {escape_text(ch.tail.strip())}")
    lines.extend(title_checkmark)
    lines.append(f"{sp}</{tag}>")
    return lines


def main() -> None:
    global EDGE_STROKE_OVERRIDE, EDGE_STROKE_WIDTH

    repo = Path(__file__).resolve().parent.parent
    ap = argparse.ArgumentParser()
    ap.add_argument("--svg", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--component", required=True)
    ap.add_argument("--source-svg", required=True)
    ap.add_argument("--edge-stroke", default=None)
    ap.add_argument("--edge-stroke-width", type=float, default=3.5)
    ap.add_argument(
        "--pair-icon-links",
        action="store_true",
        help="Pair root-level icon-link circles to javascript.json nodes (nearest position).",
    )
    args = ap.parse_args()

    svg_path = args.svg if args.svg.is_absolute() else repo / args.svg
    out_path = args.out if args.out.is_absolute() else repo / args.out

    EDGE_STROKE_OVERRIDE = args.edge_stroke
    EDGE_STROKE_WIDTH = args.edge_stroke_width

    tree = ET.parse(svg_path)
    root = tree.getroot()
    vb = root.attrib.get("viewBox", "")

    if args.pair_icon_links:
        g = fetch_javascript_graph()
        pair_icon_links_on_root(root, build_matchable_nodes(g))

    props_name = f"{args.component}Props"
    header = f'''/**
 * AUTO-GENERATED by scripts/generate-roadmap-svg-jsx.py — do not edit by hand.
 * Source: {args.source_svg}
 */
'use client'

export interface {props_name} {{
  isCompleted: (nodeId: string) => boolean
  onNodeClick: (nodeId: string) => void
}}

export function {args.component}({{
  isCompleted,
  onNodeClick,
}}: {props_name}) {{
  return (
'''

    body_lines = [
        '    <svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" version="1.1"'
        " style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}"
        ' className="h-auto w-full max-w-full">',
    ]
    for ch in root:
        body_lines.extend(emit_element(ch, root, 6))
    body_lines.append("    </svg>")
    body_lines.append("  )")
    body_lines.append("}")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(header + "\n".join(body_lines) + "\n", encoding="utf-8")
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
