#!/usr/bin/env python3
"""Generate TypeScriptRoadmapSvgContent.tsx from typescript.svg."""

from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_PATH = Path(__file__).resolve().parent.parent / "src/app/modules/Roadmaps/typescript.svg"
OUT_PATH = Path(__file__).resolve().parent.parent / "src/app/modules/Roadmaps/TypeScriptRoadmapSvgContent.tsx"

INTERACTIVE_TYPES = frozenset({"topic", "subtopic", "title", "button", "link-item"})
COMPLETION_STROKE_TYPES = frozenset({"topic", "subtopic", "button"})
VOID_TAGS = frozenset({"path", "rect", "circle", "line"})


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


def emit_element(elem: ET.Element, parent: ET.Element | None, indent: int) -> list[str]:
    sp = " " * indent
    tag = elem.tag.split("}")[-1]

    node_id = elem.attrib.get("data-node-id")
    dtype = elem.attrib.get("data-type")

    skip: set[str] = set()
    extra_attrs: list[str] = []

    if tag == "rect" and parent is not None:
        pnid = parent.attrib.get("data-node-id")
        ptype = parent.attrib.get("data-type")
        if pnid and ptype in COMPLETION_STROKE_TYPES:
            base_stroke = elem.attrib.get("stroke", "black")
            sw_s = elem.attrib.get("stroke-width", "2.7")
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

    attr_list = attrs_to_jsx(dict(elem.attrib), skip)
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
                    f"{sp}  {{isCompleted('{node_id}') ? (",
                    f"{sp}    <>",
                    f'{sp}      <circle cx="{cx}" cy="{cy}" r="9.5" fill="#16a34a" />',
                    f'{sp}      <path',
                    f'        d="M{cx - 4} {cy}L{cx - 1.5} {cy + 3}L{cx + 4} {cy - 2}"',
                    f'        fill="none"',
                    f'        stroke="#fff"',
                    f"        strokeWidth={{2}}",
                    f'        strokeLinecap="round"',
                    f'        strokeLinejoin="round"',
                    f"      />",
                    f"{sp}    </>",
                    f"{sp}  ) : null}}",
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
        return [f'{sp}<{tag}{attr_str}>{body}</{tag}>']

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
    tree = ET.parse(SVG_PATH)
    root = tree.getroot()
    vb = root.attrib.get("viewBox", "")

    header = '''/**
 * AUTO-GENERATED by scripts/generate-typescript-roadmap-svg-jsx.py — do not edit by hand.
 * Source: src/app/modules/Roadmaps/typescript.svg
 */
'use client'

export interface TypeScriptRoadmapSvgContentProps {
  isCompleted: (nodeId: string) => boolean
  onNodeClick: (nodeId: string) => void
}

export function TypeScriptRoadmapSvgContent({
  isCompleted,
  onNodeClick,
}: TypeScriptRoadmapSvgContentProps) {
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

    OUT_PATH.write_text(header + "\n".join(body_lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
