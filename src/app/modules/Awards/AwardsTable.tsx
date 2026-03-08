import { PencilIcon, TrashIcon } from 'lucide-react'

import { TextButton } from '@/atoms/button/Button'
import { StudentBatch } from '@/templates/StudentBatch'

import Image from 'next/image'
import type { AwardFormState } from './Award.types'
import { formatAwardDateDisplay } from './formatAwardDate'

const BatchDisplay = ({ batch }: { batch: string | number }) => {
  const num = typeof batch === 'number' ? batch : Number(batch)
  return !Number.isNaN(num) ? (
    <StudentBatch batch={num} />
  ) : (
    <span className="text-xs text-slate-500">Batch {String(batch)}</span>
  )
}

interface AwardsTableProps {
  awards: AwardFormState[]
  categoryNameById: Record<string, string>
  onEdit: (award: AwardFormState) => void
  onDelete: (award: AwardFormState) => void
}

export const AwardsTable = ({
  awards,
  categoryNameById,
  onEdit,
  onDelete,
}: AwardsTableProps) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
    <table className="min-w-full divide-y divide-slate-200 bg-white">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Awarded to
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Awarded on
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Category
          </th>
          <th className="max-w-xs px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {awards.map((award) => (
          <tr key={award.id} className="hover:bg-slate-50/70">
            <td className="px-4 py-3">
              <div className="flex flex-row items-center justify-start gap-3">
                {award.student ? (
                  <>
                    {award.student.picture ? (
                      <Image
                        width={10}
                        height={10}
                        src={award.student.picture}
                        alt={award.student.name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary">
                        {award.student.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-slate-900">
                        {award.student.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {award.awardedTo}
                      </span>
                      {award.student.batch != null &&
                        award.student.batch !== '' && (
                          <BatchDisplay batch={award.student.batch} />
                        )}
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-slate-600">
                    {award.awardedTo || '—'}
                  </span>
                )}
              </div>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
              {formatAwardDateDisplay(award.awardedOn)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
              {award.awardCategoryId
                ? categoryNameById[award.awardCategoryId] ?? '—'
                : '—'}
            </td>
            <td className="max-w-xs px-4 py-3 text-sm text-slate-700">
              <div
                className="line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: award.description || '—',
                }}
              />
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
              <div className="flex items-center justify-end gap-2">
                <TextButton
                  variant="textTertiary"
                  onClick={() => onEdit(award)}
                >
                  <PencilIcon className="size-4" />
                </TextButton>
                <TextButton variant="textError" onClick={() => onDelete(award)}>
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
