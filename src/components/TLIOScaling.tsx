'use client';

import { useEffect, useState } from 'react';

import ExpandableImage from '@/components/ExpandableImage';

export default function TLIOScaling() {
  const [animated, setAnimated] = useState(true);
  const imagePath = '/images/scaling/tlio-scaling-day';

  useEffect(() => {
    setAnimated(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <section
      id='tlio-scaling'
      aria-labelledby='tlio-scaling-title'
      className='border-t border-gray-200 bg-white text-gray-600'
    >
      <div className='layout py-12'>
        <div className='flex items-center justify-between gap-4 pb-4'>
          <h2 id='tlio-scaling-title' className='min-w-0'>Scaling with Unlabeled TLIO Data</h2>
          <button
            type='button'
            role='switch'
            aria-checked={animated}
            onClick={() => setAnimated((current) => !current)}
            className='group flex shrink-0 items-center gap-2 rounded-full py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
          >
            Animation
            <span
              aria-hidden='true'
              className='inline-flex h-6 w-11 items-center rounded-full bg-gray-400 transition-colors group-aria-checked:bg-primary-600'
            >
              <span className='h-4 w-4 translate-x-1 rounded-full bg-white transition-transform group-aria-checked:translate-x-6' />
            </span>
          </button>
        </div>
        <p className='pb-6 text-lg'>
          Eight training-data pools, from 15 minutes to 25.3 hours of unlabeled
          TLIO motion, trained with the same step budget.
        </p>
        <figure>
          <ExpandableImage
            src={`${imagePath}.${animated ? 'gif' : 'png'}`}
            expandedSrc={`${imagePath}.png`}
            alt='TLIO scaling: test average velocity error versus training steps for eight data pools, alongside their reconstructed trajectories and ground truth.'
            title='Scaling with unlabeled TLIO data'
            width={1600}
            height={620}
            imageClassName='bg-white'
          />
          <figcaption className='figure-caption'>
            <strong>Eight data pools share the same training-step budget.</strong>{' '}
            Left: test average velocity error during training, with a supervised
            reference. Right: one held-out test trajectory using each pool&apos;s
            validation-selected model. Each data pool appears in turn.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
