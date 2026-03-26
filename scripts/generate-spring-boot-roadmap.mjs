/**
 * One-time generator: spring-boot.svg -> SpringBootRoadmap.tsx
 * Run: node scripts/generate-spring-boot-roadmap.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const svgPath = path.join(root, 'src/app/modules/Roadmaps/spring-boot.svg')
const outPath = path.join(root, 'src/app/modules/Roadmaps/SpringBootRoadmap.tsx')

const raw = fs.readFileSync(svgPath, 'utf8')

function xmlAttrsToJsx(tagContent) {
  let s = tagContent
  const replacements = [
    [/stroke-width=/g, 'strokeWidth='],
    [/stroke-linecap=/g, 'strokeLinecap='],
    [/stroke-linejoin=/g, 'strokeLinejoin='],
    [/stroke-dasharray=/g, 'strokeDasharray='],
    [/text-anchor=/g, 'textAnchor='],
    [/dominant-baseline=/g, 'dominantBaseline='],
    [/font-size=/g, 'fontSize='],
    [/xmlns:xlink/g, 'xmlnsXlink'],
  ]
  for (const [re, rep] of replacements) s = s.replace(re, rep)

  s = s.replace(/\s*<\/line>\s*/g, '')
  s = s.replace(/<line([^/>\n]+)>/g, '<line$1 />')
  s = s.replace(/\s*<\/rect>\s*/g, '')
  s = s.replace(/<rect([^/>\n]+)>/g, '<rect$1 />')

  s = s.replace(/data-edge-id="xy-edge__([^"]+)"/g, (_, id) => {
    const clean = String(id).replace(/\//g, '-')
    return `data-edge-id="reactflow__edge-${clean}"`
  })

  s = s.replace(
    /\b(x|y|x1|y1|x2|y2|width|height|rx|r|cx|cy|dy|d)="([-0-9.eE]+)"/g,
    (_, name, num) => `${name}={${num}}`,
  )
  s = s.replace(
    /\bstrokeDasharray="([-0-9.]+)"/g,
    (_, num) => `strokeDasharray={${num}}`,
  )
  s = s.replace(
    /\bstrokeDasharray="([-0-9.]+) ([-0-9.]+)"/g,
    (_, a, b) => `strokeDasharray="${a} ${b}"`,
  )

  s = s.replace(/<path([^>]*?)strokeDasharray=\{0\}/g, '<path$1strokeDasharray={0}')
  s = s.replace(/strokeDasharray="\s*0\s*"/g, 'strokeDasharray={0}')

  s = s.replace(/style="([^"]*)"/g, (_, style) => {
    const parts = style.split(';').map((p) => p.trim()).filter(Boolean)
    const obj = {}
    for (const p of parts) {
      const [k, ...rest] = p.split(':')
      const rawKey = k.trim()
      if (rawKey.startsWith('--')) continue
      const key = rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      let val = rest.join(':').trim()
      if (val === 'round') obj[key] = 'round'
      else if (/^[\d.]+$/.test(val)) obj[key] = parseFloat(val)
      else if (/^[\d.]+\s+[\d.]+$/.test(val)) obj[key] = val
      else if (val.startsWith('#')) obj[key] = val
      else obj[key] = val
    }
    if (Object.keys(obj).length === 0) return ''
    const inner = Object.entries(obj)
      .map(([k, v]) => {
        const valStr = typeof v === 'string' ? `'${v}'` : JSON.stringify(v)
        return `${k}: ${valStr}`
      })
      .join(', ')
    return `style={{ ${inner} }}`
  })
  return s
}

function parseRectBounds(inner) {
  const xm = inner.match(/x="\s*([^"]+)"/)
  const ym = inner.match(/y="\s*([^"]+)"/)
  const wm = inner.match(/width="\s*([^"]+)"/)
  const hm = inner.match(/height="\s*([^"]+)"/)
  if (!xm || !ym || !wm || !hm) return null
  return {
    x: parseFloat(xm[1]),
    y: parseFloat(ym[1]),
    w: parseFloat(wm[1]),
    h: parseFloat(hm[1]),
  }
}

function completionSvg(id, bounds) {
  if (!bounds) return ''
  const cx = bounds.x + bounds.w - 14
  const cy = bounds.y + bounds.h / 2
  return `
        <circle
          cx={${cx}}
          cy={${cy}}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('${id}') ? 'block' : 'none'}
        />
        <path
          d={\`M ${cx - 4} ${cy} L ${cx - 2} ${cy + 3} L ${cx + 4} ${cy - 2}\`}
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('${id}') ? 'block' : 'none'}
        />`
}

function processGroup(openTag, inner, id, type) {
  const bounds = parseRectBounds(inner)
  const jsxInner = xmlAttrsToJsx(inner)
  let jsxOpen = xmlAttrsToJsx(openTag)

  const interactive =
    type === 'topic' || type === 'subtopic' || type === 'title'
  if (!interactive || !id) {
    return `${jsxOpen}\n${jsxInner}\n</g>`
  }

  jsxOpen = jsxOpen.replace(
    /^<g\s/,
    `<g onClick={() => onNodeClick('${id}')} style={{ cursor: 'pointer' }} `,
  )

  let extra = ''
  if (type === 'title') {
    extra = ''
  } else {
    extra = completionSvg(id, bounds)
  }

  return `${jsxOpen}\n${jsxInner}${extra}\n</g>`
}

const firstG = raw.indexOf('<g data-node-id')
const pathsBlock = raw.slice(raw.indexOf('<path'), firstG)
let pathsJsx = xmlAttrsToJsx(pathsBlock)
pathsJsx = pathsJsx.replace(/\s*<\/path>\s*/g, '')
pathsJsx = pathsJsx.replace(/<path([^/>\n]+)>/g, '<path$1 />')

const groups = []
let pos = firstG
while (pos < raw.length) {
  const start = raw.indexOf('<g ', pos)
  if (start === -1) break
  const gt = raw.indexOf('>', start)
  const openTag = raw.slice(start, gt + 1)
  const idMatch = openTag.match(/data-node-id="([^"]+)"/)
  const typeMatch = openTag.match(/data-type="([^"]+)"/)
  const end = raw.indexOf('</g>', gt)
  if (end === -1) break
  const inner = raw.slice(gt + 1, end)
  groups.push({
    openTag,
    inner,
    id: idMatch?.[1],
    type: typeMatch?.[1],
  })
  pos = end + 4
}

const body = groups.map((g) => processGroup(g.openTag, g.inner, g.id, g.type)).join('\n')

const header = `/**
 * Spring Boot roadmap diagram. Generated from src/app/modules/Roadmaps/spring-boot.svg
 * Regenerate: node scripts/generate-spring-boot-roadmap.mjs
 */

import type { RoadmapDetailsProps } from '@/data/roadmaps/types'
import { useCallback } from 'react'

export const SpringBootRoadmap = ({
  onNodeClick,
  completedNodes = [],
}: RoadmapDetailsProps) => {
  const isCompleted = useCallback(
    (nodeId: string) => completedNodes.includes(nodeId),
    [completedNodes],
  )

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-731 -168 1093 1769"
      version="1.1"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
      className="h-auto w-full max-w-full"
    >
`

const footer = `
    </svg>
  )
}
`

fs.writeFileSync(outPath, header + pathsJsx + '\n' + body + footer, 'utf8')
console.log('Wrote', outPath)
