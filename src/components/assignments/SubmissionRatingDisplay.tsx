interface RatingDisplayProps {
  rating: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export const formatSubmissionRating = (rating: number): string =>
  `${Number(rating.toFixed(1))} / 5`

export const SubmissionRatingDisplay = ({
  rating,
  showLabel = true,
  size = 'md',
}: RatingDisplayProps) => {
  const starSize = size === 'sm' ? 'text-sm' : 'text-lg'
  const fullStars = Math.floor(rating)
  const fraction = rating - fullStars
  const emptyStars = 5 - Math.ceil(rating)

  return (
    <div className="flex items-center gap-2">
      <div className={`flex text-amber-400 ${starSize}`} aria-hidden>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`}>★</span>
        ))}
        {fraction > 0 && (
          <span className="relative inline-block">
            <span className="text-slate-600">★</span>
            <span
              className="absolute inset-0 overflow-hidden text-amber-400"
              style={{ width: `${fraction * 100}%` }}
            >
              ★
            </span>
          </span>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="text-slate-600">
            ★
          </span>
        ))}
      </div>
      {showLabel && (
        <span className={`font-medium text-slate-200 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {formatSubmissionRating(rating)}
        </span>
      )}
    </div>
  )
}

export const hasSubmissionFeedback = (submission: {
  rating: number | null
}): boolean => submission.rating != null
