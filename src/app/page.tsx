'use client';

import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import '@/lib/env';

import Figure from '@/components/Figure';
import KatexSpan from '@/components/KaTeX';
import ArrowLink from '@/components/links/ArrowLink';
import UnderlineLink from '@/components/links/UnderlineLink';
import VideoSlot from '@/components/VideoSlot';

// Video paths under public/. null renders a placeholder; set the path once the mp4 exists.
const VIDEOS = {
  teaser: null as string | null, // '/video/teaser.mp4'
  intro: null as string | null, // '/video/ssio_introduction.mp4'
  tlio: null as string | null, // '/video/traj_tlio.mp4'
  humanoid: null as string | null, // '/video/traj_humanoid_g1.mp4'
  mipo: null as string | null, // '/video/traj_mipo_go1.mp4'
  grandtour: null as string | null, // '/video/traj_grandtour_anymal.mp4'
  blackbird: null as string | null, // '/video/traj_blackbird.mp4'
  euroc: null as string | null, // '/video/traj_euroc.mp4'
};

type Dataset = {
  name: string;
  logo: string;
  platform: string;
  stats: string;
  video: string | null;
  videoFile: string;
};

// Dataset statistics from Tab. I of the paper.
const trajectoryGroups: { title: string; blurb: string; datasets: Dataset[] }[] = [
  {
    title: 'Human & Humanoid',
    blurb: 'Pedestrian motion from a head-mounted IMU, and a Unitree G1 humanoid.',
    datasets: [
      { name: 'TLIO', logo: '/images/logos/TLIO_logo.png', platform: 'Pedestrian', stats: '31.6 h · 42.3 km · max 6.0 m/s', video: VIDEOS.tlio, videoFile: 'traj_tlio.mp4' },
      { name: 'Humanoid', logo: '/images/logos/Humanoid_logo.png', platform: 'Unitree G1', stats: '1.31 h · 1.9 km · max 3.9 m/s', video: VIDEOS.humanoid, videoFile: 'traj_humanoid_g1.mp4' },
    ],
  },
  {
    title: 'Legged Robots',
    blurb: 'A Unitree Go1 running fast gaits indoors, and an ANYmal on in-the-wild outdoor terrain.',
    datasets: [
      { name: 'MIPO', logo: '/images/logos/MIPO_logo.png', platform: 'Unitree Go1', stats: '58.6 min · 1.4 km · max 6.6 m/s', video: VIDEOS.mipo, videoFile: 'traj_mipo_go1.mp4' },
      { name: 'GrandTour', logo: '/images/logos/ANYmal_logo.png', platform: 'ANYmal', stats: '5.65 h · 10.3 km · max 1.5 m/s', video: VIDEOS.grandtour, videoFile: 'traj_grandtour_anymal.mp4' },
    ],
  },
  {
    title: 'Racing Drone',
    blurb: 'Aggressive racing-drone flight up to 8.7 m/s, and micro aerial vehicle flight.',
    datasets: [
      { name: 'Blackbird', logo: '/images/logos/BlackBird_logo.png', platform: 'Racing drone', stats: '5.0 h · 28.4 km · max 8.7 m/s', video: VIDEOS.blackbird, videoFile: 'traj_blackbird.mp4' },
      { name: 'EuRoC', logo: '/images/logos/EuRoC_logo.png', platform: 'Micro aerial vehicle', stats: '22.5 min · 892 m · max 2.9 m/s', video: VIDEOS.euroc, videoFile: 'traj_euroc.mp4' },
    ],
  },
];

// [AVE (m/s), ATE (m)] per dataset from Tab. II of the paper; null = error too large to report.
const resultDatasets = ['TLIO', 'EuRoC', 'Blackbird', 'MIPO', 'GrandTour', 'Humanoid'];
const resultRows: { method: string; ours: boolean; cells: [string, string][] }[] = [
  { method: 'RoNIN', ours: false, cells: [['0.119', '2.718'], ['0.575', '5.276'], ['1.738', '16.85'], ['0.145', '0.452'], ['0.051', '2.807'], ['–', '–']] },
  { method: 'TLIO', ours: false, cells: [['0.092', '1.702'], ['1.646', '10.43'], ['1.609', '17.66'], ['0.202', '0.501'], ['0.108', '3.879'], ['–', '–']] },
  { method: 'AirIO', ours: false, cells: [['0.081', '1.890'], ['0.335', '3.720'], ['0.318', '6.100'], ['0.120', '0.310'], ['0.068', '3.190'], ['0.087', '1.260']] },
  { method: 'AirIO† baseline', ours: false, cells: [['0.084', '2.080'], ['0.344', '3.720'], ['0.362', '6.390'], ['0.121', '0.310'], ['0.070', '3.380'], ['0.096', '1.400']] },
  { method: 'Ours', ours: true, cells: [['0.104', '3.040'], ['0.423', '9.030'], ['0.475', '18.39'], ['0.182', '1.630'], ['0.096', '4.370'], ['0.167', '4.360']] },
  { method: 'Ours (w/ PGD)', ours: true, cells: [['0.100', '3.010'], ['0.401', '10.23'], ['0.430', '17.93'], ['0.166', '1.640'], ['0.095', '4.340'], ['0.148', '4.270']] },
];

export default function HomePage() {
  const textColor = 'text-gray-600';
  const bgColor = 'bg-white';
  const maskColor = 'bg-stone-300/70';
  const secondaryBgColor = 'bg-gray-100';
  const hlTextColor = 'text-primary-600';
  const linkIconClass = 'h-6 w-6 shrink-0';
  const citation_bibtex = `@article{qiu2026ssio,
      title={Self-Supervised Inertial Odometry},
      author={Yuheng Qiu and Yutian Chen and Carlton Cort and Weison Huang and Shibo Zhao and Pieter Abbeel and Rocky Duan and Koushil Sreenath and C. Karen Liu and Carmelo Sferrazza and Junyi Geng and Sebastian Scherer and Guanya Shi},
      year={2026},
}`;
  const sliderItems: { title: string; content: React.ReactNode }[] = [
    {
      title: 'Introduction',
      content: <VideoSlot src={VIDEOS.intro} label='public/video/ssio_introduction.mp4' />,
    },
    {
      title: 'Six Datasets, One Recipe',
      content: (
        <img
          src='/images/fig1_corrected_legend.png'
          alt='Trajectories on six datasets: self-supervised model against the supervised AirIO baseline'
          className='mx-auto w-full rounded-md bg-white p-2'
        />
      ),
    },
  ];
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [groupIdx, setGroupIdx] = useState(0);
  const group = trajectoryGroups[groupIdx];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const firstChild = slider.children[0] as HTMLElement | undefined;
    if (!firstChild) return;
    slider.scrollLeft = firstChild.offsetLeft - (slider.clientWidth - firstChild.clientWidth) / 2;
  }, []);

  return (
    <main>
      <section className={clsx(bgColor, textColor, 'relative flex items-center justify-center h-screen overflow-hidden')}>
        <div className='layout z-20 relative flex min-h-screen flex-col items-center justify-center p-4 text-center'>
          <h1 className='mt-4 text-5xl mb-4'>
            <span className={hlTextColor}>S</span>elf-<span className={hlTextColor}>S</span>upervised{' '}
            <span className={hlTextColor}>I</span>nertial <span className={hlTextColor}>O</span>dometry
          </h1>
          <div className='container pb-6'>
            <span className='text-lg'>
              <UnderlineLink href='https://haleqiu.github.io/'>Yuheng Qiu</UnderlineLink><span className='align-super text-sm'>1,2</span>, &nbsp;
              <UnderlineLink href='https://www.yutianchen.blog/'>Yutian Chen</UnderlineLink><span className='align-super text-sm'>1,2</span>, &nbsp;
              Carlton Cort<span className='align-super text-sm'>2</span>, &nbsp;
              Weison Huang<span className='align-super text-sm'>2</span>, &nbsp;
              Shibo Zhao<span className='align-super text-sm'>1</span>, <br />
              <UnderlineLink href='https://people.eecs.berkeley.edu/~pabbeel/'>Pieter Abbeel</UnderlineLink><span className='align-super text-sm'>†1,3</span>, &nbsp;
              Rocky Duan<span className='align-super text-sm'>†1</span>, &nbsp;
              Koushil Sreenath<span className='align-super text-sm'>†1,3</span>, &nbsp;
              C. Karen Liu<span className='align-super text-sm'>†1,4</span>, &nbsp;
              <UnderlineLink href='https://sferrazza.cc/'>Carmelo Sferrazza</UnderlineLink><span className='align-super text-sm'>†1</span>, <br />
              Junyi Geng<span className='align-super text-sm'>5</span>, &nbsp;
              <UnderlineLink href='https://theairlab.org/team/sebastian/'>Sebastian Scherer</UnderlineLink><span className='align-super text-sm'>2</span>, &nbsp;
              <UnderlineLink href='https://www.gshi.me/'>Guanya Shi</UnderlineLink><span className='align-super text-sm'>†1,2</span>
            </span>
          </div>
          <div className='container flex flex-row items-center space-x-8 justify-center text-lg'>
            {/* TODO: point at the arXiv abstract once it is public. */}
            <ArrowLink className='mt-6' href='#' variant='light' size='large' icon={
              <img src='/svg/arxiv.svg' alt='arXiv logo' className={linkIconClass} loading='lazy' />
            }>
              arXiv (coming soon)
            </ArrowLink>
            <ArrowLink className='mt-6' href='https://github.com/SSIO-IMU' variant='light' size='large' icon={
              <img src='/svg/github.svg' alt='GitHub logo' className={linkIconClass} loading='lazy' />
            }>
              GitHub Repo
            </ArrowLink>
          </div>
        </div>
        <div className={clsx('absolute w-auto min-w-full min-h-full max-w-none z-10', maskColor)} />
        <div className='absolute bottom-4 left-4 z-20 text-sm'>
          <p><span className='align-super text-xs'>1</span>Amazon FAR &nbsp;<span className='align-super text-xs'>2</span>Carnegie Mellon University &nbsp;<span className='align-super text-xs'>3</span>UC Berkeley</p>
          <p><span className='align-super text-xs'>4</span>Stanford University &nbsp;<span className='align-super text-xs'>5</span>Penn State University &nbsp;<span className='align-super text-xs'>†</span>Amazon FAR team co-lead</p>
        </div>
        {VIDEOS.teaser === null ? (
          <div className='absolute bottom-4 right-4 z-20 rounded border border-dashed border-gray-500 px-3 py-1 text-sm'>
            Teaser video placeholder
          </div>
        ) : (
          <video autoPlay loop muted playsInline className='absolute inset-0 w-full h-full z-0 object-cover object-top'>
            <source src={VIDEOS.teaser} type='video/mp4' />
            Your browser does not support the video tag.
          </video>
        )}
      </section>

      <section className={clsx(bgColor, textColor)}>
        <div className='layout py-12'>
          <h2 className='text-center pb-4'>Abstract</h2>
          <p className='text-pretty'>
            Learning inertial odometry for a new platform usually requires labeled trajectories.
            We show that an <b>IMU integration teacher</b> can train a velocity model from scratch without velocity or position labels.
            The teacher is <i>myopic</i>: it integrates each short window independently.
            The student learns from these short-window targets yet predicts long-horizon velocity changes more accurately than its teacher.
            Integration self-supervision draws its training signal from the input itself: over each window, the calibrated IMU samples are integrated into a velocity change, and the student&apos;s predicted velocities at the window endpoints must reproduce it.
            Optional <b>pose graph distillation</b> (PGD) then refines the student: one pose graph over many windows is solved for sequence-consistent velocities, which become fine-tuning targets for the student.
            A new embodiment then requires no motion capture, RTK, or SLAM ground truth, only unlabeled IMU recorded on the platform during normal operation.
            Across six datasets spanning pedestrians, drones, quadrupeds, and a humanoid, the same recipe applied unchanged trains inertial odometry comparable to a supervised AirIO baseline.
          </p>
        </div>
      </section>

      <section className='bg-dark text-gray-200 py-8'>
        <div className='relative'>
          <div
            ref={sliderRef}
            className='flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-6 px-48 pb-2 scrollbar-dark'
            aria-label='SSIO highlights slider'
          >
            {sliderItems.map((item) => (
              <article
                key={item.title}
                className='flex-none snap-center w-[85%] md:w-[70%] lg:w-[55%] bg-gray-900/50 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur'
              >
                <h3 className='text-2xl font-semibold mb-4'>{item.title}</h3>
                {item.content}
              </article>
            ))}
          </div>
          <div className='pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-dark to-transparent' />
          <div className='pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-dark to-transparent' />
        </div>
      </section>

      <section className={clsx(secondaryBgColor, textColor)}>
        <div className='layout py-12'>
          <h2 className='mb-4'>Trajectories Across Embodiments</h2>
          <p className='text-lg pb-6'>
            One recipe, applied unchanged and trained from random initialization on each dataset,
            with <span className={hlTextColor}>no velocity or position labels</span>.
          </p>
          <div className='flex flex-wrap gap-2 pb-4' role='tablist' aria-label='Embodiment group'>
            {trajectoryGroups.map((g, i) => (
              <button
                key={g.title}
                role='tab'
                aria-selected={groupIdx === i}
                onClick={() => setGroupIdx(i)}
                className={clsx(
                  'rounded-full border px-5 py-2 font-semibold transition',
                  groupIdx === i
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 bg-white hover:border-primary-600 hover:text-primary-600'
                )}
              >
                {g.title}
              </button>
            ))}
          </div>
          <p className='pb-4 italic'>{group.blurb}</p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6' role='tabpanel'>
            {group.datasets.map((d) => (
              <article key={d.name} className='rounded-2xl bg-white p-4 shadow-sm'>
                <div className='flex items-center gap-3 pb-3'>
                  <img src={d.logo} alt='' className='h-10 w-10 object-contain' />
                  <div>
                    <div className='text-lg font-semibold text-gray-800'>
                      {d.name} <span className='font-normal text-gray-500'>· {d.platform}</span>
                    </div>
                    <div className='text-sm text-gray-500'>{d.stats}</div>
                  </div>
                </div>
                <VideoSlot src={d.video} label={`public/video/${d.videoFile}`} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={clsx(bgColor, textColor)}>
        <div className='layout py-12'>
          <h2 className='mb-4'>Self-Supervised Learning From Scratch</h2>
          <p className='text-lg pb-4'>
            With reference attitude for teacher gravity compensation, our PGD-refined models stay within{' '}
            <span className={hlTextColor}><KatexSpan text='$0.07$' /> m/s</span> average velocity error (AVE) of the same-architecture supervised AirIO† baseline on every dataset.
          </p>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] text-center text-sm'>
              <thead>
                <tr className='border-b border-gray-300'>
                  <th rowSpan={2} className='py-2 text-left'>Method</th>
                  {resultDatasets.map((d) => (
                    <th key={d} colSpan={2} className='pt-2'>{d}</th>
                  ))}
                </tr>
                <tr className='border-b-2 border-gray-300'>
                  {resultDatasets.map((d) => (
                    <React.Fragment key={d}>
                      <th className='pb-1 font-normal'>AVE↓</th>
                      <th className='pb-1 font-normal'>ATE↓</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultRows.map((r) => (
                  <tr key={r.method} className={clsx('border-b border-gray-200', r.ours && 'bg-orange-50 font-semibold text-gray-800')}>
                    <td className='py-2 text-left'>
                      {r.method}
                      <span className='font-light italic'>{r.ours ? ' (self-supervised)' : ' (supervised)'}</span>
                    </td>
                    {r.cells.map(([ave, ate], i) => (
                      <React.Fragment key={resultDatasets[i]}>
                        <td>{ave}</td>
                        <td>{ate}</td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='pt-2 text-sm font-light'>
            AVE in m/s, ATE in m. &ldquo;–&rdquo; denotes error too large to report.
            AirIO† removes the attitude encoder from AirIO and is trained with ground-truth velocity: the matched-architecture reference for our rows.
          </p>
        </div>
      </section>

      <section className={clsx(secondaryBgColor, textColor)}>
        <div className='layout py-12'>
          <h2 className='pb-4'>Methods</h2>
          <p className='text-lg'>The training signal comes from the IMU input itself, not from a recorded trajectory:</p>
          <ol className='text-lg list-decimal ml-12 pb-4'>
            <li className='pt-2'>
              <span className={hlTextColor}>Integration self-supervision.</span> A frozen integration teacher turns each short IMU window into a velocity change; the network&apos;s predicted velocities at the window endpoints must reproduce it.
            </li>
            <li className='pt-2'>
              <span className={hlTextColor}>Pose graph distillation (PGD).</span> One full-sequence pose graph built from the teacher&apos;s IMU factors and the network&apos;s velocity factors is solved for sequence-consistent velocities, which then supervise the network.
            </li>
          </ol>
          <div className='mx-auto max-w-3xl'>
            <Figure
              img_src='/images/fig2_pipeline.png'
              caption={
                <span>
                  <b>Integration self-supervision</b> trains the motion network to match the body-frame velocity change predicted by the frozen integration teacher.
                  {' '}<b>Pose graph distillation</b> builds a full-sequence pose graph from the teacher&apos;s IMU factors and the network&apos;s velocity factors; the graph posterior <KatexSpan text='$\mathbf{v}^{\mathrm{opt}}$' /> then supervises the network through an L2 loss.
                  {' '}Velocity regularization <KatexSpan text='$\mathcal{L}^{\mathrm{reg}}$' /> is applied over detected static frames.
                </span>
              }
              isDark={false}
              idx={1}
            />
          </div>
          <div className='pb-16' />
          <h3 className='pb-2'>Proprioceptive Input</h3>
          <p className='pb-2'>
            On the three articulated platforms that log proprioception, feeding joint states to the student (and, on MIPO, the four calf-mounted IMUs) lowers both velocity and trajectory error, with the teacher and loss unchanged.
          </p>
          <div className='mx-auto max-w-3xl'>
            <Figure
              img_src='/images/fig3_Embodiment1_traj_v3.png'
              caption='Top: proprioceptive input for Go1 (MIPO), ANYmal (GrandTour), and G1 (Humanoid). Bottom: GrandTour trajectories for the Eig-1 and SNOW-2 sequences.'
              isDark={false}
              idx={2}
            />
          </div>
        </div>
      </section>

      <section className={clsx(bgColor, textColor)}>
        <div className='layout pt-4 pb-48'>
          <h2 className='mt-12 mb-4'>Citation</h2>
          <pre className='ml-12 whitespace-pre-wrap'>{citation_bibtex}</pre>
        </div>
      </section>
    </main>
  );
}
