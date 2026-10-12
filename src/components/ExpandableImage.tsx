'use client';

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Expand, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type ExpandableImageProps = {
  src: string;
  alt: string;
  title: string;
  width?: number;
  height?: number;
  expandedSrc?: string;
  imageClassName?: string;
};

export default function ExpandableImage({
  src,
  alt,
  title,
  width,
  height,
  expandedSrc = src,
  imageClassName,
}: ExpandableImageProps) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className='group relative w-full'>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading='lazy'
          decoding='async'
          className={cn('h-auto w-full rounded-md', imageClassName)}
        />
        <button
          type='button'
          aria-label={`Enlarge ${title}`}
          aria-haspopup='dialog'
          title='Enlarge figure'
          onClick={() => {
            setZoomed(false);
            setOpen(true);
          }}
          className='pointer-events-none absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white/90 text-gray-700 opacity-0 shadow-sm transition group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-white hover:text-primary-700 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100'
        >
          <Expand aria-hidden='true' className='h-5 w-5' />
        </button>
      </div>

      <Dialog open={open} onClose={setOpen} initialFocus={closeRef} className='relative z-50'>
        <DialogBackdrop className='fixed inset-0 bg-gray-950/75' />
        <div className='fixed inset-0 flex items-center justify-center p-2 sm:p-6'>
          <DialogPanel className='flex max-h-[calc(100dvh-1rem)] w-full max-w-[1600px] flex-col overflow-hidden rounded-xl bg-white text-gray-800 shadow-2xl sm:max-h-[calc(100dvh-3rem)]'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3'>
              <DialogTitle className='line-clamp-2 min-w-0 basis-full text-base font-semibold [overflow-wrap:anywhere] sm:flex-1 sm:basis-auto'>
                {title}
              </DialogTitle>
              <button
                type='button'
                aria-pressed={zoomed}
                onClick={() => setZoomed(!zoomed)}
                className='min-h-10 rounded-md border border-gray-300 px-3 text-sm font-medium hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600'
              >
                {zoomed ? 'Fit to screen' : 'Zoom to 100%'}
              </button>
              <button
                ref={closeRef}
                type='button'
                aria-label='Close enlarged figure'
                onClick={() => setOpen(false)}
                className='flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
            <div className='min-h-0 overflow-auto overscroll-contain bg-gray-50 p-2 sm:p-4'>
              <img
                src={expandedSrc}
                alt={alt}
                className={cn(
                  'h-auto',
                  zoomed ? 'max-w-none' : 'mx-auto max-h-[75dvh] max-w-full object-contain',
                  imageClassName
                )}
              />
            </div>
            <div className='flex justify-end border-t border-gray-200 px-4 py-3'>
              <a
                href={expandedSrc}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm font-medium text-primary-700 underline underline-offset-4'
              >
                Open original image ↗
              </a>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
