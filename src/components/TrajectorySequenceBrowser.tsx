'use client';

import { KeyboardEvent, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import trajectoryDatasets from '@/data/trajectory-sequences.json';

import ExpandableImage from '@/components/ExpandableImage';

const totalSequences = trajectoryDatasets.reduce(
  (total, dataset) => total + dataset.sequences.length,
  0
);
const controlClass =
  'rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold transition hover:border-primary-600 hover:text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-inherit';

export default function TrajectorySequenceBrowser() {
  const [datasetFilter, setDatasetFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animated, setAnimated] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const listRef = useRef<HTMLElement>(null);
  const search = query.trim().toLowerCase();
  const groups = trajectoryDatasets
    .filter((dataset) => datasetFilter === 'all' || dataset.id === datasetFilter)
    .map((dataset) => ({
      ...dataset,
      sequences: dataset.sequences.filter((sequence) =>
        `${dataset.name} ${sequence.name}`.toLowerCase().includes(search)
      ),
    }))
    .filter((dataset) => dataset.sequences.length > 0);
  const sequences = groups.flatMap((dataset) =>
    dataset.sequences.map((sequence) => ({ ...sequence, datasetName: dataset.name }))
  );
  const selected = sequences.find((sequence) => sequence.id === selectedId) ?? sequences[0];
  const selectedIndex = sequences.indexOf(selected);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const revealSelection = () => {
      const button = list.querySelector<HTMLButtonElement>('[aria-current="true"]');
      if (!button) return;
      const bounds = list.getBoundingClientRect();
      const choice = button.getBoundingClientRect();
      if (choice.top < bounds.top) list.scrollTop += choice.top - bounds.top;
      if (choice.bottom > bounds.bottom) list.scrollTop += choice.bottom - bounds.bottom;
    };
    revealSelection();
    const observer = new ResizeObserver(revealSelection);
    observer.observe(list);
    return () => observer.disconnect();
  }, [selected?.id, isMobile]);

  function selectSequence(id: string) {
    setSelectedId(id);
    setAnimated(true);
  }

  function handleSequenceKeys(event: KeyboardEvent<HTMLElement>) {
    if (!(event.target instanceof HTMLButtonElement)) return;
    const buttons = Array.from(listRef.current?.querySelectorAll('button') ?? []);
    const index = buttons.indexOf(event.target);
    let nextIndex;
    switch (event.key) {
      case 'ArrowUp': nextIndex = Math.max(0, index - 1); break;
      case 'ArrowDown': nextIndex = Math.min(sequences.length - 1, index + 1); break;
      case 'Home': nextIndex = 0; break;
      case 'End': nextIndex = sequences.length - 1; break;
      default: return;
    }
    event.preventDefault();
    selectSequence(sequences[nextIndex].id);
    buttons[nextIndex].focus({ preventScroll: true });
  }

  return (
    <div>
      <div role='group' aria-label='Filter trajectory datasets' className='mb-5 flex flex-wrap gap-2'>
        {[{ id: 'all', name: 'All datasets', count: totalSequences }, ...trajectoryDatasets.map((dataset) => ({
          id: dataset.id,
          name: dataset.name,
          count: dataset.sequences.length,
        }))].map((dataset) => (
          <button
            key={dataset.id}
            type='button'
            aria-pressed={datasetFilter === dataset.id}
            onClick={() => {
              setDatasetFilter(dataset.id);
              setSelectedId(null);
              setAnimated(true);
            }}
            className={cn(
              controlClass,
              datasetFilter === dataset.id && 'border-primary-600 bg-primary-600 text-white hover:text-white'
            )}
          >
            {dataset.name} <span className='ml-1 font-normal opacity-75'>{dataset.count}</span>
          </button>
        ))}
      </div>

      {isMobile ? (
        <div>
          <label htmlFor='trajectory-mobile-search' className='mb-2 block text-sm font-semibold text-gray-800'>
            Search sequences
          </label>
          <input
            id='trajectory-mobile-search'
            type='search'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search name or dataset'
            className='w-full rounded-lg border-gray-300 text-sm focus:border-primary-600 focus:ring-primary-600'
          />
          <div className='my-4 flex flex-wrap items-center justify-between gap-3'>
            <p role='status' className='text-sm text-gray-500'>
              {sequences.length} of {totalSequences} sequences · scroll to explore
            </p>
            <button type='button' onClick={() => setAnimated(!animated)} className={controlClass}>
              {animated ? 'Show final frames' : 'Play animations'}
            </button>
          </div>
          <p className='mb-6 text-xs leading-relaxed text-gray-500'>
            World-frame velocities use ground-truth attitude; trajectories start at the origin.
          </p>
          <div className='space-y-8'>
            {groups.map((dataset) => (
              <section key={dataset.id} aria-label={`${dataset.name} test sequences`}>
                <h3 className='mb-4 text-lg text-gray-800'>
                  {dataset.name}{' '}
                  <span className='text-sm font-normal text-gray-500'>
                    {dataset.sequences.length} {dataset.sequences.length === 1 ? 'sequence' : 'sequences'}
                  </span>
                </h3>
                <div className='space-y-5'>
                  {dataset.sequences.map((sequence) => (
                    <TrajectoryCard
                      key={sequence.id}
                      sequence={sequence}
                      datasetName={dataset.name}
                      animated={animated}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
          {sequences.length === 0 && (
            <div className='rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center'>
              <p className='mb-4'>No sequences match your search.</p>
              <button
                type='button'
                onClick={() => {
                  setDatasetFilter('all');
                  setQuery('');
                }}
                className={controlClass}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      ) : (
      <div className='grid grid-cols-[15rem_minmax(0,1fr)] items-start gap-6'>
        <aside
          aria-label='Trajectory sequence selector'
          className='flex h-72 min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white lg:h-[34rem]'
        >
          <div className='border-b border-gray-200 p-4'>
            <label htmlFor='trajectory-sequence-search' className='mb-2 block font-semibold text-gray-800'>
              Browse sequences
            </label>
            <input
              id='trajectory-sequence-search'
              type='search'
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedId(null);
                setAnimated(true);
              }}
              placeholder='Search name or dataset'
              aria-controls='trajectory-sequence-list'
              className='w-full min-w-0 rounded-lg border-gray-300 text-sm focus:border-primary-600 focus:ring-primary-600'
            />
            <p role='status' className='mt-2 text-xs text-gray-500'>
              {sequences.length} of {totalSequences} sequences · scroll to browse
            </p>
          </div>
          <nav
            id='trajectory-sequence-list'
            ref={listRef}
            aria-label='Sequences ordered by dataset and name'
            onKeyDown={handleSequenceKeys}
            className='scrollbar-gallery min-h-0 flex-1 overflow-y-scroll overscroll-contain p-2'
          >
            {groups.map((dataset) => (
              <div key={dataset.id} className='mb-3'>
                <h3 className='px-2 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  {dataset.name} · {dataset.sequences.length}
                </h3>
                <ol className='space-y-1'>
                  {dataset.sequences.map((sequence, index) => (
                    <li key={sequence.id}>
                      <button
                        type='button'
                        aria-current={selected?.id === sequence.id ? 'true' : undefined}
                        aria-controls='trajectory-sequence-preview'
                        onClick={() => selectSequence(sequence.id)}
                        className={cn(
                          'flex w-full items-baseline gap-2 rounded-lg border px-2 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-600',
                          selected?.id === sequence.id
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-transparent hover:bg-gray-100'
                        )}
                      >
                        <span aria-hidden='true' className='w-5 shrink-0 text-xs tabular-nums text-gray-500'>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className='min-w-0 [overflow-wrap:anywhere]'>{sequence.name}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            {sequences.length === 0 && (
              <p className='p-3 text-sm text-gray-500'>No matching sequences.</p>
            )}
          </nav>
        </aside>

        <div id='trajectory-sequence-preview' className='min-w-0'>
          {selected ? (
            <>
              <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                <p role='status' className='text-sm text-gray-500'>
                  Sequence {selectedIndex + 1} of {sequences.length} · {selected.datasetName}
                </p>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    aria-label='Previous sequence'
                    disabled={selectedIndex === 0}
                    onClick={() => selectSequence(sequences[selectedIndex - 1].id)}
                    className={controlClass}
                  >
                    ← Previous
                  </button>
                  <button
                    type='button'
                    aria-label='Next sequence'
                    disabled={selectedIndex === sequences.length - 1}
                    onClick={() => selectSequence(sequences[selectedIndex + 1].id)}
                    className={controlClass}
                  >
                    Next →
                  </button>
                </div>
              </div>
              <figure className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
                <div className='border-b border-gray-100 px-4 py-3'>
                  <h3 className='text-base font-semibold text-gray-800 [overflow-wrap:anywhere]'>
                    {selected.name}
                  </h3>
                </div>
                <div className='px-4 pt-4'>
                  <ExpandableImage
                    src={animated ? selected.animation : selected.poster}
                    expandedSrc={selected.poster}
                    alt={`${selected.datasetName} ${selected.name}: 2D trajectory and world-frame velocity, comparing ground truth, supervised AirIO, and self-supervised SSIO.`}
                    title={`${selected.datasetName}: ${selected.name}`}
                    width={selected.width}
                    height={selected.height}
                  />
                </div>
                <figcaption className='figure-caption px-4 pb-4'>
                  <strong>Self-supervised and supervised predictions.</strong>{' '}
                  SSIO and AirIO are compared with ground truth on this test sequence.
                </figcaption>
                <div className='flex flex-wrap items-center gap-3 border-t border-gray-100 p-4'>
                  <button
                    type='button'
                    aria-pressed={animated}
                    onClick={() => setAnimated(!animated)}
                    className={controlClass}
                  >
                    {animated ? 'Show final frame' : 'Play animation'}
                  </button>
                  <a
                    href={selected.poster}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm font-semibold text-primary-700 underline underline-offset-4'
                  >
                    Open full size ↗
                  </a>
                </div>
              </figure>
              <p className='mt-3 text-xs text-gray-500'>
                World-frame velocities use ground-truth attitude; trajectories start at the origin.
              </p>
            </>
          ) : (
            <div className='rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center'>
              <p className='mb-4'>No sequences match your search.</p>
              <button
                type='button'
                onClick={() => {
                  setDatasetFilter('all');
                  setQuery('');
                  setSelectedId(null);
                  setAnimated(true);
                }}
                className={controlClass}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

type TrajectorySequence = (typeof trajectoryDatasets)[number]['sequences'][number];

function TrajectoryCard({
  sequence,
  datasetName,
  animated,
}: {
  sequence: TrajectorySequence;
  datasetName: string;
  animated: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <figure ref={ref} className='rounded-xl border border-gray-200 bg-white p-3 sm:p-4'>
      <h4 className='mb-3 text-sm font-semibold text-gray-800 [overflow-wrap:anywhere]'>
        {sequence.name}
      </h4>
      <ExpandableImage
        src={visible && animated ? sequence.animation : sequence.poster}
        expandedSrc={sequence.poster}
        alt={`${datasetName} ${sequence.name}: trajectory and world-frame velocity, comparing ground truth, supervised AirIO, and self-supervised SSIO.`}
        title={`${datasetName}: ${sequence.name}`}
        width={sequence.width}
        height={sequence.height}
      />
      <figcaption className='figure-caption'>
        <strong>{datasetName}.</strong>{' '}
        Ground truth, supervised AirIO, and self-supervised SSIO.
      </figcaption>
    </figure>
  );
}
