import { PencilIcon, TrashIcon } from 'lucide-react'

import { TextButton } from '@/atoms/button/Button'
import { StudentBatch } from '@/templates/StudentBatch'

import Image from 'next/image'
import type { PresenterFormState } from './Presenter.types'
import { formatPresenterDateDisplay } from './formatPresenterDate'

const BatchDisplay = ({ batch }: { batch: string | number }) => {
  const num = typeof batch === 'number' ? batch : Number(batch)
  return !Number.isNaN(num) ? (
    <StudentBatch batch={num} />
  ) : (
    <span className="text-xs text-slate-500">Batch {String(batch)}</span>
  )
}

interface PresentersTableProps {
  presenters: PresenterFormState[]
  onEdit: (presenter: PresenterFormState) => void
  onDelete: (presenter: PresenterFormState) => void
}

export const PresentersTable = ({
  presenters,
  onEdit,
  onDelete,
}: PresentersTableProps) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
    <table className="min-w-full divide-y divide-slate-200 bg-white">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Presented by
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Date
          </th>
          <th className="max-w-xs px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Topic
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {presenters.map((presenter) => (
          <tr key={presenter.id} className="hover:bg-slate-50/70">
            <td className="px-4 py-3">
              <div className="flex flex-row items-center justify-start gap-3">
                {presenter.student ? (
                  <>
                    {presenter.student.picture ? (
                      <Image
                        width={10}
                        height={10}
                        src={presenter.student.picture}
                        alt={presenter.student.name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary">
                        {presenter.student.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-slate-900">
                        {presenter.student.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {presenter.presentedBy}
                      </span>
                      {presenter.student.batch != null &&
                        presenter.student.batch !== '' && (
                          <BatchDisplay batch={presenter.student.batch} />
                        )}
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-slate-600">
                    {presenter.presentedBy || '—'}
                  </span>
                )}
              </div>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
              {formatPresenterDateDisplay(presenter.presentedDate)}
            </td>
            <td className="max-w-xs px-4 py-3 text-sm text-slate-700">
              <span className="line-clamp-2">{presenter.topic || '—'}</span>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
              <div className="flex items-center justify-end gap-2">
                <TextButton
                  variant="textTertiary"
                  onClick={() => onEdit(presenter)}
                >
                  <PencilIcon className="size-4" />
                </TextButton>
                <TextButton variant="textError" onClick={() => onDelete(presenter)}>
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
