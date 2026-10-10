'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import ExpandableImage from '@/components/ExpandableImage';

export default function TLIOScaling() {
  const [mode, setMode] = useState<'day' | 'night'>('day');
  const [animated, setAnimated] = useState(true);
  const isNight = mode === 'night';
  const imagePath = `/images/scaling/tlio-scaling-${mode}`;

  useEffect(() => {
    setAnimated(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <section
      id='tlio-scaling'
      aria-labelledby='tlio-scaling-title'
      className={clsx(
        'border-t',
        isNight ? 'border-gray-800 bg-black text-gray-200' : 'border-gray-200 bg-white text-gray-600'
      )}
    >
      <div className='layout py-12'>
        <div className='flex flex-wrap items-center justify-between gap-4 pb-4'>
          <h2 id='tlio-scaling-title' className={isNight ? 'text-gray-100' : 'text-gray-800'}>
            <span className='text-primary-600'>Finding 1:</span> Accuracy scales with unlabeled data
          </h2>
          <div
            role='group'
            aria-label='Scaling visualization color mode'
            className={clsx(
              'flex rounded-full border p-1',
              isNight ? 'border-gray-600' : 'border-gray-300'
            )}
          >
            {(['day', 'night'] as const).map((option) => (
              <button
                key={option}
                type='button'
                aria-pressed={mode === option}
                onClick={() => setMode(option)}
                className={clsx(
                  'rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
                  mode === option && 'bg-primary-600 text-white'
                )}
              >
                {option === 'day' ? 'Day mode' : 'Night mode'}
              </button>
            ))}
          </div>
        </div>
        <p className='pb-6 text-lg'>
          Held-out velocity error improves steadily as the unlabeled TLIO data
          grows from 15 minutes to 25.3 hours, approaching the supervised AirIO
          baseline at full scale. All eight data pools share the same step budget.
        </p>
        <figure>
          <ExpandableImage
            src={`${imagePath}.${animated ? 'gif' : 'png'}`}
            expandedSrc={`${imagePath}.png`}
            alt='TLIO scaling: test average velocity error versus training steps for eight data pools, alongside their reconstructed trajectories and ground truth.'
            title='Scaling with unlabeled TLIO data'
            width={1600}
            height={620}
            imageClassName={isNight ? 'bg-black' : 'bg-white'}
          />
          <figcaption className={clsx('figure-caption', isNight && 'text-gray-300 [&_strong]:text-gray-100')}>
            <strong>Eight data pools share the same training-step budget.</strong>{' '}
            Left: test average velocity error during training, with a supervised
            reference. Right: one held-out test trajectory using each pool&apos;s
            validation-selected model. Each data pool appears in turn.
          </figcaption>
        </figure>
        <button
          type='button'
          onClick={() => setAnimated(!animated)}
          className={clsx(
            'mt-4 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
            isNight ? 'border-gray-600' : 'border-gray-300'
          )}
        >
          {animated ? 'Show final frame' : 'Play animation'}
        </button>
      </div>
    </section>
  );
}
