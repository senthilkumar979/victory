'use client'

import {
  BookOpen,
  Code2,
  ExternalLink,
  FileText,
  GraduationCap,
  Link2,
  Video,
} from 'lucide-react'

type ResourceType =
  | 'video'
  | 'article'
  | 'book'
  | 'course'
  | 'code'
  | 'documentation'
  | 'other'

const RESOURCE_TYPE_CONFIG: Record<
  ResourceType,
  { icon: React.ElementType; label: string; className: string }
> = {
  video: {
    icon: Video,
    label: 'Video',
    className: 'text-red-500',
  },
  article: {
    icon: FileText,
    label: 'Article',
    className: 'text-amber-500',
  },
  book: {
    icon: BookOpen,
    label: 'Book',
    className: 'text-emerald-500',
  },
  course: {
    icon: GraduationCap,
    label: 'Course',
    className: 'text-blue-500',
  },
  code: {
    icon: Code2,
    label: 'Code',
    className: 'text-green-500',
  },
  documentation: {
    icon: BookOpen,
    label: 'Docs',
    className: 'text-sky-500',
  },
  other: {
    icon: Link2,
    label: 'Link',
    className: 'text-muted-foreground',
  },
}

interface DrawerResourcesProps {
  resources: { title: string; url: string; type?: ResourceType }[]
}

const TYPE_ORDER: ResourceType[] = [
  'documentation',
  'article',
  'video',
  'course',
  'book',
  'code',
  'other',
]

const getResourcesByType = (
  resources: DrawerResourcesProps['resources'],
): Map<ResourceType, typeof resources> => {
  const grouped = new Map<ResourceType, typeof resources>()

  for (const resource of resources) {
    const type =
      resource.type && TYPE_ORDER.includes(resource.type)
        ? resource.type
        : 'other'
    const existing = grouped.get(type) ?? []
    grouped.set(type, [...existing, resource])
  }
  return grouped
}

export const DrawerResources = ({ resources }: DrawerResourcesProps) => {
  if (resources.length === 0) return null

  const grouped = getResourcesByType(resources)

  return (
    <section className="space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Resources
      </h3>
      <div className="space-y-4">
        {TYPE_ORDER?.map((type) => {
          const items = grouped.get(type) ?? []
          if (items.length === 0) return null

          const config =
            type === 'other'
              ? RESOURCE_TYPE_CONFIG.other
              : RESOURCE_TYPE_CONFIG[type as ResourceType]
          const Icon = config.icon

          return (
            <div key={type}>
              <div className="mb-2 flex items-center gap-2">
                <Icon className={`size-4 ${config.className}`} />
                <span className="text-xs font-medium text-muted-foreground">
                  {type === 'other' ? 'Other' : config.label}
                </span>
              </div>
              <ul className="space-y-2">
                {items.map((resource, index) => (
                  <li key={`${resource.url}-${index}`}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-lg border border-muted/60 bg-muted/30 p-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
                    >
                      <span className="line-clamp-2 flex-1 text-sm text-foreground group-hover:text-primary">
                        {resource.title}
                      </span>
                      <ExternalLink className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
