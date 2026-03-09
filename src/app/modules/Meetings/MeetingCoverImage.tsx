import type { MeetingFormState } from './Meeting.types'

export const MeetingCoverImage = ({
  meeting,
}: {
  meeting: MeetingFormState
}) => {
  return (
    <div>
      {meeting.coverImageUrl ? (
        <img
          src={meeting.coverImageUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div>
          <img
            src="https://91qunajyvl11yxyb.public.blob.vercel-storage.com/meeting-placeholder.png"
            alt="Meeting placeholder"
            className="h-auto w-full object-cover rounded-md"
            width={100}
            height={100}
          />
        </div>
      )}
    </div>
  )
}
