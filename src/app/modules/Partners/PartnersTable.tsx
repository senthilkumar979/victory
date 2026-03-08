import { Ellipsis, PencilIcon, Phone, TrashIcon, UserIcon } from 'lucide-react'

import { Badge } from '@/atoms/badge/Badge'
import { TextButton } from '@/atoms/button/Button'
import type { PartnerFormState } from './Partner.types'

interface PartnersTableProps {
  partners: PartnerFormState[]
  onEdit: (partner: PartnerFormState) => void
  onDelete: (partner: PartnerFormState) => void
}

export const PartnersTable = ({
  partners,
  onEdit,
  onDelete,
}: PartnersTableProps) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
    <table className="min-w-full divide-y divide-slate-200 bg-white">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
            <UserIcon className="size-4" />
            Name
          </th>
          <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Company
          </th>
          <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Designation
          </th>
          <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email
          </th>
          <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
            <Phone className="size-4" />
            Contact
          </th>
          <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Location
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Ellipsis className="size-4" />
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {partners.map((partner) => (
          <tr key={partner.id} className="hover:bg-slate-50/70">
            <td className="whitespace-nowrap px-2 py-3 text-sm font-medium text-slate-900">
              <b>{partner.name}</b>
            </td>
            <td className="whitespace-nowrap px-2 py-3 text-sm text-slate-700 font-bold">
              <span className="text-primary">
                {partner.company?.toUpperCase()}
              </span>
            </td>
            <td className="whitespace-nowrap px-2 py-3 text-sm text-slate-700">
              <Badge color="success">{partner.designation || '—'}</Badge>
            </td>
            <td className="whitespace-nowrap px-2 py-3 text-sm text-slate-700">
              {partner.primaryEmail || '—'}
            </td>
            <td className="whitespace-nowrap px-2 py-3 text-sm text-slate-700">
              {partner.primaryContact || '—'}
            </td>
            <td className="whitespace-nowrap px-2 py-3 text-sm text-slate-700">
              {partner.location || '—'}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
              <div className="flex items-center  gap-2">
                <TextButton
                  variant="textTertiary"
                  onClick={() => onEdit(partner)}
                >
                  <PencilIcon className="size-4" />
                </TextButton>
                <TextButton
                  variant="textError"
                  onClick={() => onDelete(partner)}
                >
                  <TrashIcon className="size-4" />
                </TextButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
