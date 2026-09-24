interface BackgroundVideoProps {
  src: string
  className?: string
}

/** Autoplaying, muted, looping video that covers its positioned parent. */
export function BackgroundVideo({ src, className = '' }: BackgroundVideoProps) {
  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  )
}
