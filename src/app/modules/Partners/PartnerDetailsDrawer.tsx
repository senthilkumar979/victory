'use client'

import {
  AtSign,
  Building2,
  ContactRoundIcon,
  MapPin,
  PencilIcon,
  Phone,
  Radar,
  User,
} from 'lucide-react'

import { Button } from '@/atoms/button/Button'
import { Drawer } from '@/ui/organisms/drawer/Drawer'

import type { PartnerFormState } from './Partner.types'

interface PartnerDetailsDrawerProps {
  isOpen: boolean
  partner: PartnerFormState | null
  onClose: () => void
  onEdit: (partner: PartnerFormState) => void
}

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) => (
  <div className="flex gap-3 rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
    <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate text-sm text-slate-200">{value || '—'}</p>
    </div>
  </div>
)

export const PartnerDetailsDrawer = ({
  isOpen,
  partner,
  onClose,
  onEdit,
}: PartnerDetailsDrawerProps) => {
  const handleEdit = () => {
    if (!partner) return
    onClose()
    onEdit(partner)
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="lg">
      <Drawer.Title description={partner?.company || undefined}>
        <span className="text-primary font-bold text-lg">
          {partner?.name ?? 'Partner details'}
        </span>
      </Drawer.Title>
      <Drawer.Body>
        {partner ? (
          <div className="space-y-4">
            <DetailRow icon={User} label="Name" value={partner.name} />
            <DetailRow
              icon={Building2}
              label="Company"
              value={partner.company}
            />
            <DetailRow
              icon={ContactRoundIcon}
              label="Designation"
              value={partner.designation}
            />
            <DetailRow icon={Radar} label="Category" value={partner.category} />
            <DetailRow
              icon={MapPin}
              label="Location"
              value={partner.location}
            />
            <DetailRow
              icon={AtSign}
              label="Primary email"
              value={partner.primaryEmail}
            />
            {partner.secondaryEmail && (
              <DetailRow
                icon={AtSign}
                label="Secondary email"
                value={partner.secondaryEmail}
              />
            )}
            <DetailRow
              icon={Phone}
              label="Primary contact"
              value={partner.primaryContact}
            />
            {partner.secondaryContact && (
              <DetailRow
                icon={Phone}
                label="Secondary contact"
                value={partner.secondaryContact}
              />
            )}
            {partner.description && (
              <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                  {partner.description}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" size="sm" onClick={handleEdit}>
          <PencilIcon className="size-4" /> Edit
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
