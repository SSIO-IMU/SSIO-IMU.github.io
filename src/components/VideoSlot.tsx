import clsx from 'clsx';
import React from 'react';

type VideoSlotProp = {
  // null renders a placeholder box; set a /video/... path once the clip exists.
  src: string | null;
  label: string;
  className?: string;
  controls?: boolean;
};

const VideoSlot = ({ src, label, className, controls = true }: VideoSlotProp) => {
  if (src === null) {
    return (
      <div
        className={clsx(
          'flex aspect-video w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-400/60 bg-gray-500/10 text-center',
          className
        )}
      >
        <span className='text-sm font-semibold uppercase tracking-wider'>Video coming soon</span>
        <span className='mt-1 text-sm opacity-70'>{label}</span>
      </div>
    );
  }
  return (
    <video
      aria-label={label}
      autoPlay
      muted
      loop
      playsInline
      controls={controls}
      className={clsx('mx-auto w-full rounded-md shadow-sm', className)}
    >
      <source src={src} type='video/mp4' />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoSlot;
