'use client'

import { DropdownMenu } from 'radix-ui'
import {
  LinkedinIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react'

import type { AwardFormState } from './Award.types'

const menuItemBase =
  'flex cursor-default select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50'

const menuItemEdit = `${menuItemBase} text-secondary data-[highlighted]:bg-secondary/30 data-[highlighted]:text-secondary`
const menuItemLinkedIn = `${menuItemBase} text-[#0a66c2] data-[highlighted]:bg-sky-50 data-[highlighted]:text-[#004182]`
const menuItemDelete = `${menuItemBase} text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700`

const menuContentClass =
  'z-50 min-w-[13rem] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg'

interface AwardRowActionsProps {
  award: AwardFormState
  onEdit: (award: AwardFormState) => void
  onDelete: (award: AwardFormState) => void
  onPublishToLinkedIn: (award: AwardFormState) => void
}

export const AwardRowActions = ({
  award,
  onEdit,
  onDelete,
  onPublishToLinkedIn,
}: AwardRowActionsProps) => (
  <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger
      type="button"
      className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
      aria-label={`Actions for award ${award.awardedTo}`}
    >
      <MoreVerticalIcon className="size-4 shrink-0" />
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        className={menuContentClass}
        align="end"
        sideOffset={6}
      >
        <DropdownMenu.Item
          className={menuItemEdit}
          onSelect={() => onEdit(award)}
        >
          <PencilIcon className="size-4 shrink-0 text-secondary" />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className={menuItemLinkedIn}
          disabled={!award.id}
          onSelect={() => onPublishToLinkedIn(award)}
        >
          <LinkedinIcon className="size-4 shrink-0 text-[#0a66c2]" />
          Publish to LinkedIn
        </DropdownMenu.Item>
        <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
        <DropdownMenu.Item
          className={menuItemDelete}
          onSelect={() => onDelete(award)}
        >
          <TrashIcon className="size-4 shrink-0 text-red-600" />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
)
