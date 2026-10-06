'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import '@/lib/env';

import Figure from '@/components/Figure';
import KatexSpan from '@/components/KaTeX';
import ArrowLink from '@/components/links/ArrowLink';
import UnderlineLink from '@/components/links/UnderlineLink';
import TLIOScaling from '@/components/TLIOScaling';
import VideoSlot from '@/components/VideoSlot';

// Video paths under public/. null renders a placeholder; set the path once the mp4 exists.
const VIDEOS = {
  teaser: '/video/teaser.mp4',
  intro: null as string | null, // '/video/ssio_introduction.mp4'
  humanoidMacvo: '/video/teaser.mp4',
  humanoidLidar: '/video/G1-LiDAR/ssio-lidar-8x.mp4',
  mipo: '/video/MIPO-GPS/st_mary_ssio_joints_3panel.mp4',
  grandtourEig1: '/video/ANYmal-GPS/EIG-1_final.mp4',
  grandtourSnow2: '/video/ANYmal-GPS/SNOW-2_final.mp4',
};

type Embodiment = 'mipo' | 'humanoid' | 'grandtour' | 'tlio' | 'blackbird';

// Training durations only; total dataset durations include held-out recordings.
// Fill the remaining durations when the training splits are confirmed.
const trainingDurations: Record<Embodiment, string | null> = {
  mipo: null,
  humanoid: '1 h',
  grandtour: null,
  tlio: null,
  blackbird: null,
};

type Demo = {
  embodiment: Embodiment;
  name: string;
  logo: string;
  platform: string;
  videos: { src: string | null; label: string; width: number; height: number }[];
};

const demos: Demo[] = [
  {
    embodiment: 'mipo',
    name: 'MIPO',
    logo: '/images/logos/MIPO_logo.png',
    platform: 'Unitree Go1',
    videos: [{ src: VIDEOS.mipo, label: 'St. Mary', width: 1642, height: 900 }],
  },
  {
    embodiment: 'humanoid',
    name: 'Humanoid',
    logo: '/images/logos/Humanoid_logo.png',
    platform: 'Unitree G1',
    videos: [
      { src: VIDEOS.humanoidMacvo, label: 'G1–MACVO · 2×', width: 2478, height: 1190 },
      { src: VIDEOS.humanoidLidar, label: 'G1–LiDAR · 8×', width: 2484, height: 1464 },
    ],
  },
  {
    embodiment: 'grandtour',
    name: 'GrandTour',
    logo: '/images/logos/ANYmal_logo.png',
    platform: 'ANYmal',
    videos: [
      { src: VIDEOS.grandtourEig1, label: 'EIG-1', width: 1464, height: 900 },
      { src: VIDEOS.grandtourSnow2, label: 'SNOW-2', width: 1950, height: 900 },
    ],
  },
];

const trajectoryGallery: {
  embodiment: Embodiment;
  name: string;
  platform: string;
  image: string;
  alt: string;
}[] = [
  {
    embodiment: 'mipo',
    name: 'MIPO',
    platform: 'Unitree Go1',
    image: '/images/mipo_SSL_fig.png',
    alt: 'MIPO: 2D trajectories and velocity components for ST-sq5, T-Vis, FyT-04, and T-048. Ground truth is compared with self-supervision, with and without proprioceptive input.',
  },
  {
    embodiment: 'tlio',
    name: 'TLIO',
    platform: 'Pedestrian',
    image: '/images/tlio_ssl_trajectories.png',
    alt: 'TLIO: 2D trajectories and velocity components for three pedestrian sequences, comparing self-supervision with ground truth.',
  },
  {
    embodiment: 'blackbird',
    name: 'Blackbird',
    platform: 'Racing drone',
    image: '/images/bb_ssl_trajectories.png',
    alt: 'Blackbird: 2D trajectories and velocity components for TiltedThrice, Star, and Patrick, comparing self-supervision with ground truth.',
  },
];

function TrainingDataLabel({ embodiment }: { embodiment: Embodiment }) {
  const duration = trainingDurations[embodiment];
  return (
    <p className='text-sm font-semibold text-primary-700'>
      Self-supervised{duration ? ` · ${duration} of unlabeled data` : ' · Unlabeled data'}
    </p>
  );
}

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
  const maskColor = 'bg-white/75';
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
      content: <VideoSlot src={VIDEOS.intro} label='SSIO introduction' />,
    },
  ];
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const firstChild = slider.children[0] as HTMLElement | undefined;
    if (!firstChild) return;
    slider.scrollLeft = firstChild.offsetLeft - (slider.clientWidth - firstChild.clientWidth) / 2;
  }, []);

  return (
    <main>
      <section className={clsx(bgColor, textColor, 'relative flex min-h-screen items-center justify-center overflow-hidden')}>
        {VIDEOS.teaser === null ? (
          <img
            src='/images/fig1_corrected_legend.png'
            alt=''
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 z-0 h-full w-full object-contain'
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden='true'
            poster='/video/teaser-poster.jpg'
            className='pointer-events-none absolute inset-0 z-0 h-full w-full object-contain'
          >
            <source src={VIDEOS.teaser} type='video/mp4' />
          </video>
        )}
        <div className={clsx('pointer-events-none absolute inset-0 z-10', maskColor)} />
        <div className='layout z-20 relative flex flex-col items-center justify-center px-4 py-12 text-center'>
          <h1 className='mt-4 text-5xl mb-4'>
            <span className={hlTextColor}>S</span>elf-<span className={hlTextColor}>S</span>upervised{' '}
            <span className={hlTextColor}>I</span>nertial <span className={hlTextColor}>O</span>dometry
          </h1>
          <div className='container pb-6'>
            <span className='text-lg'>
              <UnderlineLink href='https://haleqiu.github.io/' className='font-normal'>Yuheng Qiu</UnderlineLink><span className='align-super text-sm'>1,2</span>, &nbsp;
              <UnderlineLink href='https://www.yutianchen.blog/' className='font-normal'>Yutian Chen</UnderlineLink><span className='align-super text-sm'>1,2</span>, &nbsp;
              Carlton Cort<span className='align-super text-sm'>2</span>, &nbsp;
              Weison Huang<span className='align-super text-sm'>2</span>, &nbsp;
              Shibo Zhao<span className='align-super text-sm'>1</span>, <br />
              <UnderlineLink href='https://people.eecs.berkeley.edu/~pabbeel/' className='font-normal'>Pieter Abbeel</UnderlineLink><span className='align-super text-sm'>1,3</span>, &nbsp;
              Rocky Duan<span className='align-super text-sm'>1</span>, &nbsp;
              Koushil Sreenath<span className='align-super text-sm'>1,3</span>, &nbsp;
              C. Karen Liu<span className='align-super text-sm'>1,4</span>, &nbsp;
              <UnderlineLink href='https://sferrazza.cc/' className='font-normal'>Carmelo Sferrazza</UnderlineLink><span className='align-super text-sm'>1</span>, <br />
              Junyi Geng<span className='align-super text-sm'>5</span>, &nbsp;
              <UnderlineLink href='https://theairlab.org/team/sebastian/' className='font-normal'>Sebastian Scherer</UnderlineLink><span className='align-super text-sm'>2</span>, &nbsp;
              <UnderlineLink href='https://www.gshi.me/' className='font-normal'>Guanya Shi</UnderlineLink><span className='align-super text-sm'>1,2</span>
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
          <div className='mt-6 text-sm'>
            <p><span className='align-super text-xs'>1</span>Amazon FAR &nbsp;<span className='align-super text-xs'>2</span>Carnegie Mellon University &nbsp;<span className='align-super text-xs'>3</span>UC Berkeley</p>
            <p><span className='align-super text-xs'>4</span>Stanford University &nbsp;<span className='align-super text-xs'>5</span>Penn State University</p>
          </div>
        </div>
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
          <figure className='mt-8'>
            <figcaption className='mb-4 text-center text-2xl font-semibold'>
              Six Datasets, One Recipe
            </figcaption>
            <img
              src='/images/fig1_corrected_legend.png'
              alt='Trajectories on six datasets: self-supervised model against the supervised AirIO baseline'
              width={2400}
              height={1000}
              loading='lazy'
              className='mx-auto h-auto w-full rounded-md bg-white p-2'
            />
          </figure>
        </div>
      </section>

      <section
        id='robot-demos'
        aria-labelledby='robot-demos-title'
        className={clsx(secondaryBgColor, textColor)}
      >
        <div className='layout py-12'>
          <h2 id='robot-demos-title' className='mb-4'>Self-Supervised Odometry in Motion</h2>
          <p className='pb-6 text-lg'>
            Learning from unlabeled motion on quadrupeds and a humanoid,
            without velocity or position labels.
          </p>
          <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
            {demos.map((demo) => (
              <article
                key={demo.embodiment}
                id={`demo-${demo.embodiment}`}
                className={clsx(
                  'rounded-2xl bg-white p-4 shadow-sm md:p-6',
                  demo.videos.length > 1 && 'md:col-span-2'
                )}
              >
                <div className='flex items-center gap-3 pb-4'>
                  <img src={demo.logo} alt='' className='h-12 w-12 object-contain' />
                  <div>
                    <h3 className='text-xl text-gray-800'>
                      {demo.name} <span className='font-normal text-gray-500'>· {demo.platform}</span>
                    </h3>
                    <TrainingDataLabel embodiment={demo.embodiment} />
                  </div>
                </div>
                <div
                  className='grid gap-6 md:grid-cols-[var(--video-columns)]'
                  style={{
                    '--video-columns': demo.videos
                      .map(({ width, height }) => `minmax(0, ${width / height}fr)`)
                      .join(' '),
                  } as React.CSSProperties}
                >
                  {demo.videos.map((video) => (
                    <figure key={video.label}>
                      <VideoSlot
                        src={video.src}
                        label={`${demo.name} · ${video.label}`}
                        width={video.width}
                        height={video.height}
                      />
                      {video.src !== null && (
                        <figcaption className='pt-2 text-sm text-gray-500'>
                          {video.label}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>
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

      <section
        id='trajectory-gallery'
        aria-labelledby='trajectory-gallery-title'
        className={clsx(secondaryBgColor, textColor)}
      >
        <div className='layout py-12'>
          <h2 id='trajectory-gallery-title' className='mb-4'>Traj Gallery</h2>
          <p className='text-lg pb-6'>
            2D trajectories and velocity components compared with ground truth.
            Each model is trained from scratch with <span className={hlTextColor}>no velocity or position labels</span>.
          </p>
          <TabGroup>
            <TabList aria-label='Trajectory datasets' className='mb-6 flex flex-wrap gap-2'>
              {trajectoryGallery.map((item) => (
                <Tab
                  key={item.embodiment}
                  className={({ selected }) => clsx(
                    'rounded-full border px-5 py-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
                    selected
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-300 bg-white hover:border-primary-600 hover:text-primary-600'
                  )}
                >
                  {item.name}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {trajectoryGallery.map((item) => (
                <TabPanel key={item.embodiment}>
                  <figure className='rounded-2xl bg-white p-4 shadow-sm md:p-6'>
                    <figcaption className='mb-4 flex flex-wrap items-baseline justify-between gap-2'>
                      <h3 className='text-xl text-gray-800'>
                        {item.name} <span className='font-normal text-gray-500'>· {item.platform}</span>
                      </h3>
                      <TrainingDataLabel embodiment={item.embodiment} />
                    </figcaption>
                    <a
                      href={item.image}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={`Open ${item.name} trajectory and velocity plots at full resolution`}
                      className='block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600'
                    >
                      <img
                        src={item.image}
                        alt={item.alt}
                        width={2400}
                        height={1350}
                        loading='lazy'
                        className='h-auto w-full'
                      />
                    </a>
                  </figure>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
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

      <TLIOScaling />

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
