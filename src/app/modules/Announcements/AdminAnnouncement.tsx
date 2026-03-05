import { Button, TextButton } from '@/atoms/button/Button'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { AnnouncementFormState } from './Announcement.types'
import { AnnouncementFormDrawer } from './AnnouncementFormDrawer'
import { DeleteAnnouncement } from './DeleteAnnouncement'

export const AdminAnnouncement = () => {
  const { announcements, isLoading, error, refetch } = useAnnouncements()

  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formState, setFormState] = useState<AnnouncementFormState | undefined>(
    undefined,
  )
  const [
    announcementToDelete,
    setAnnouncementToDelete,
  ] = useState<AnnouncementFormState | null>(null)

  const isEditing = useMemo(() => Boolean(formState?.id), [formState?.id])

  const handleOpenCreate = () => {
    setFormState(undefined)
    setIsFormDrawerOpen(true)
  }

  const handleOpenEdit = (announcement: AnnouncementFormState) => {
    setFormState({
      id: announcement.id,
      title: announcement.title,
      description: announcement.description,
    })
    setIsFormDrawerOpen(true)
  }

  const handleAddOrEditSuccess = () => {
    setIsFormDrawerOpen(false)
    setFormState(undefined)
    refetch()
  }

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false)
    setAnnouncementToDelete(null)
    refetch()
  }

  const handleOpenDelete = (announcement: AnnouncementFormState) => {
    setAnnouncementToDelete(announcement)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="relative">
      <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 py-2">
        <div className="px-3 py-3">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                Announcements
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Manage system-wide announcements shown to your users.
              </p>
            </div>

            <Button onClick={handleOpenCreate}>Add announcement</Button>
          </div>

          {isLoading && (
            <div className="mb-4 rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              Loading announcements…
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
              Failed to load announcements. {error}
            </div>
          )}

          {!isLoading && !error && announcements.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/70 text-sm text-slate-400">
              No announcements created yet.
            </div>
          )}

          {announcements.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/80 shadow-sm">
              <table className="min-w-full divide-y divide-slate-800/80">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Preview
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {announcements.map((announcement) => (
                    <tr
                      key={announcement.id}
                      className="hover:bg-slate-900/80"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-50">
                        {announcement.title}
                      </td>
                      <td className="max-w-md px-4 py-3 text-sm text-slate-300">
                        <div
                          className="line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: announcement.description,
                          }}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        <TextButton
                          variant="textTertiary"
                          onClick={() => handleOpenEdit(announcement)}
                        >
                          <PencilIcon className="size-4" />
                        </TextButton>
                        <TextButton
                          variant="textError"
                          onClick={() => handleOpenDelete(announcement)}
                        >
                          <TrashIcon className="size-4" />
                        </TextButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AnnouncementFormDrawer
          isOpen={isFormDrawerOpen}
          announcementToEdit={formState}
          onClose={() => {
            setIsFormDrawerOpen(false)
            setFormState(undefined)
          }}
          onSuccess={handleAddOrEditSuccess}
        />

        <DeleteAnnouncement
          show={isDeleteModalOpen}
          announcementToDelete={announcementToDelete}
          onDelete={handleDeleteSuccess}
        />
      </div>
    </div>
  )
}
