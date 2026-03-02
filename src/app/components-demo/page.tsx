'use client'

import { Alert } from '@/ui/atoms/alert/Alert'
import { Badge } from '@/ui/atoms/badge/Badge'
import { Breadcrumbs } from '@/ui/atoms/breadcrumbs/Breadcrumbs'
import {
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  TextButton,
} from '@/ui/atoms/button/Button'
import { useState } from 'react'

type DemoCategory = 'atoms' | 'molecules' | 'organisms' | 'templates'

const navItemClass =
  'px-3 py-1.5 text-sm rounded-md border border-transparent cursor-pointer transition-colors'

const activeNavItemClass = 'bg-primary text-primary-foreground border-primary'

const inactiveNavItemClass =
  'text-muted-foreground hover:text-foreground hover:bg-muted'

interface SectionCardProps {
  title: string
  children: React.ReactNode
}

const SectionCard = ({ title, children }: SectionCardProps) => (
  <section className="w-full rounded-lg border border-border bg-foreground p-4 shadow-sm">
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </h2>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </section>
)

const ComponentsDemoPage = () => {
  const [activeCategory, setActiveCategory] = useState<DemoCategory>('atoms')

  return (
    <main className="min-h-screen bg-foreground px-6 py-8 text-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold">Components demo</h1>
          <nav aria-label="Component categories" className="flex gap-2">
            {([
              'atoms',
              'molecules',
              'organisms',
              'templates',
            ] as DemoCategory[]).map((category) => {
              const isActive = activeCategory === category

              return (
                <button
                  key={category}
                  type="button"
                  className={`${navItemClass} ${
                    isActive ? activeNavItemClass : inactiveNavItemClass
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              )
            })}
          </nav>
        </header>

        {activeCategory === 'atoms' ? (
          <div className="flex flex-col gap-4">
            <SectionCard title="Buttons">
              <PrimaryButton>Primary</PrimaryButton>
              <SecondaryButton>Secondary</SecondaryButton>
              <TextButton>Text</TextButton>
              <TertiaryButton>Tertiary</TertiaryButton>
              <PrimaryButton mode="outline">Primary outline</PrimaryButton>
              <SecondaryButton mode="outline">
                Secondary outline
              </SecondaryButton>
              <TextButton mode="outline">Text outline</TextButton>
              <TertiaryButton mode="outline">Tertiary outline</TertiaryButton>
              <PrimaryButton size="sm">Primary sm</PrimaryButton>
              <PrimaryButton size="md">Primary md</PrimaryButton>
              <PrimaryButton size="lg">Primary lg</PrimaryButton>
              <PrimaryButton disabled>Disabled primary</PrimaryButton>
              <TextButton disabled>Disabled text</TextButton>
            </SectionCard>

            <SectionCard title="Badges">
              <Badge>Primary solid</Badge>
              <Badge color="primary" variant="outline">
                Primary outline
              </Badge>
              <Badge color="primary" variant="ghost">
                Primary ghost
              </Badge>
              <Badge color="secondary">Secondary solid</Badge>
              <Badge color="secondary" variant="outline">
                Secondary outline
              </Badge>
              <Badge color="secondary" variant="ghost">
                Secondary ghost
              </Badge>
              <Badge color="success">Success solid</Badge>
              <Badge color="success" variant="outline">
                Success outline
              </Badge>
              <Badge color="success" variant="ghost">
                Success ghost
              </Badge>
              <Badge color="error">Error solid</Badge>
              <Badge color="error" variant="outline">
                Error outline
              </Badge>
              <Badge color="error" variant="ghost">
                Error ghost
              </Badge>
              <Badge color="warning">Warning solid</Badge>
              <Badge color="warning" variant="outline">
                Warning outline
              </Badge>
              <Badge color="warning" variant="ghost">
                Warning ghost
              </Badge>
              <Badge color="info">Info solid</Badge>
              <Badge color="info" variant="outline">
                Info outline
              </Badge>
              <Badge color="info" variant="ghost">
                Info ghost
              </Badge>
              <Badge
                color="tertiary"
                variant="solid"
                startIcon={
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                }
                endIcon={<span className="text-xs">●</span>}
              >
                With icons
              </Badge>
            </SectionCard>

            <SectionCard title="Alerts">
              <div className="flex w-full flex-col gap-2">
                <Alert
                  color="primary"
                  title="Primary alert"
                  message="This is a primary alert message."
                />
                <Alert
                  color="success"
                  title="Success alert"
                  message="Your changes have been saved successfully."
                />
                <Alert
                  color="warning"
                  title="Warning alert"
                  message="Please double-check the information before proceeding."
                />
                <Alert
                  color="error"
                  title="Error alert"
                  message="Something went wrong. Try again in a moment."
                />
                <Alert
                  color="info"
                  title="Info alert"
                  message="Here is some additional context for this page."
                />
              </div>
            </SectionCard>

            <SectionCard title="Breadcrumbs">
              <Breadcrumbs
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Components', href: '/components-demo' },
                  { label: 'Atoms' },
                ]}
              />
            </SectionCard>
          </div>
        ) : null}

        {activeCategory === 'molecules' ? (
          <p className="text-sm text-muted-foreground">
            Molecule-level components will appear here as they are added to the
            design system.
          </p>
        ) : null}

        {activeCategory === 'organisms' ? (
          <p className="text-sm text-muted-foreground">
            Organism-level components will appear here as they are implemented.
          </p>
        ) : null}

        {activeCategory === 'templates' ? (
          <p className="text-sm text-muted-foreground">
            Template-level layouts will appear here to showcase page structures.
          </p>
        ) : null}
      </div>
    </main>
  )
}

export default ComponentsDemoPage
