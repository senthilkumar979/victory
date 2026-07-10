'use client'

interface YouTubeEmbedProps {
  videoId: string
  title: string
  className?: string
}

export const YouTubeEmbed = ({ videoId, title, className }: YouTubeEmbedProps) => (
  <div
    className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`}
  >
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="absolute inset-0 h-full w-full border-0"
    />
  </div>
)
