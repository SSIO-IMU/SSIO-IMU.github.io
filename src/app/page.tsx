'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import type { CSSProperties } from 'react';
import '@/lib/env';

import ExpandableImage from '@/components/ExpandableImage';
import Figure from '@/components/Figure';
import KatexSpan from '@/components/KaTeX';
import ArrowLink from '@/components/links/ArrowLink';
import UnderlineLink from '@/components/links/UnderlineLink';
import TLIOScaling from '@/components/TLIOScaling';
import TrajectorySequenceBrowser from '@/components/TrajectorySequenceBrowser';
import VideoSlot from '@/components/VideoSlot';

// Video paths under public/. null renders a placeholder; set the path once the mp4 exists.
const VIDEOS = {
  teaser: '/video/teaser.mp4',
  intro: '/video/ssio_introduction.mp4',
  humanoidMacvo: '/video/teaser.mp4',
  humanoidLidar: '/video/G1-LiDAR/ssio-lidar-8x.mp4',
  mipo: '/video/MIPO-GPS/st-mary-ssio-gps.mp4',
  grandtourEig1: '/video/ANYmal-GPS/EIG-1_final.mp4',
  grandtourEth1: '/video/ANYmal-GPS/ETH-1_final.mp4',
  grandtourEth3: '/video/ANYmal-GPS/ETH-3_final.mp4',
  grandtourGri1: '/video/ANYmal-GPS/GRI-1_final.mp4',
  grandtourHeap1: '/video/ANYmal-GPS/HEAP-1_final.mp4',
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
  videos: { src: string | null; poster: string; label: string; width: number; height: number }[];
};

const demos: Demo[] = [
  {
    embodiment: 'humanoid',
    name: 'Humanoid',
    logo: '/images/logos/Humanoid_logo.png',
    platform: 'Unitree G1',
    videos: [
      { src: VIDEOS.humanoidMacvo, poster: '/video/teaser-poster.jpg', label: 'G1–MACVO · 2×', width: 2478, height: 1190 },
      { src: VIDEOS.humanoidLidar, poster: '/video/G1-LiDAR/ssio-lidar-poster.jpg', label: 'G1–SuperOdom · 8×', width: 2484, height: 1464 },
    ],
  },
  {
    embodiment: 'grandtour',
    name: 'GrandTour',
    logo: '/images/logos/ANYmal_logo.png',
    platform: 'ANYmal',
    videos: [
      { src: VIDEOS.grandtourEig1, poster: '/video/ANYmal-GPS/EIG-1-poster.jpg', label: 'EIG-1', width: 1500, height: 1092 },
      { src: VIDEOS.grandtourEth3, poster: '/video/ANYmal-GPS/ETH-3-poster.jpg', label: 'ETH-3', width: 1248, height: 1092 },
      { src: VIDEOS.grandtourGri1, poster: '/video/ANYmal-GPS/GRI-1-poster.jpg', label: 'GRI-1', width: 1778, height: 1092 },
      { src: VIDEOS.grandtourHeap1, poster: '/video/ANYmal-GPS/HEAP-1-poster.jpg', label: 'HEAP-1', width: 1830, height: 1092 },
      { src: VIDEOS.grandtourSnow2, poster: '/video/ANYmal-GPS/SNOW-2-poster.jpg', label: 'SNOW-2', width: 1998, height: 1092 },
    ],
  },
  {
    embodiment: 'mipo',
    name: 'MIPO',
    logo: '/images/logos/MIPO_logo.png',
    platform: 'Unitree Go1',
    videos: [{ src: VIDEOS.mipo, poster: '/video/MIPO-GPS/st-mary-poster.jpg', label: 'St. Mary', width: 1642, height: 1092 }],
  },
];

// Each inner list renders as one card; its videos flow two per row across the listed embodiments.
const demoCards: Embodiment[][] = [['humanoid'], ['grandtour', 'mipo']];

const trajectoryGallery: {
  embodiment: Embodiment;
  name: string;
  platform: string;
  image: string;
  alt: string;
  takeaway: string;
  caption: string;
}[] = [
  {
    embodiment: 'mipo',
    name: 'MIPO',
    platform: 'Unitree Go1',
    image: '/images/mipo_SSL_fig.png',
    alt: 'MIPO: 2D trajectories and velocity components for ST-sq5, T-Vis, FyT-04, and T-048. Ground truth is compared with self-supervision, with and without proprioceptive input.',
    takeaway: 'Joint states and calf IMUs provide additional motion information.',
    caption: 'MIPO trajectories and velocity components for four sequences compare ground truth with self-supervised models, with and without proprioceptive input.',
  },
  {
    embodiment: 'tlio',
    name: 'TLIO',
    platform: 'Pedestrian',
    image: '/images/tlio_ssl_trajectories.png',
    alt: 'TLIO: 2D trajectories and velocity components for three pedestrian sequences, comparing self-supervision with ground truth.',
    takeaway: 'The same recipe applies to pedestrian motion.',
    caption: 'TLIO trajectories and velocity components compare self-supervised predictions with ground truth on three pedestrian sequences.',
  },
  {
    embodiment: 'blackbird',
    name: 'Blackbird',
    platform: 'Racing drone',
    image: '/images/bb_ssl_trajectories.png',
    alt: 'Blackbird: 2D trajectories and velocity components for TiltedThrice, Star, and Patrick, comparing self-supervision with ground truth.',
    takeaway: 'The same recipe applies to racing-drone motion.',
    caption: 'Blackbird trajectories and velocity components compare self-supervised predictions with ground truth on TiltedThrice, Star, and Patrick.',
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

type DemoVideo = { demo: Demo; video: Demo['videos'][number] };

function videoPairs(items: DemoVideo[]) {
  return Array.from({ length: Math.ceil(items.length / 2) }, (_, i) => items.slice(2 * i, 2 * i + 2));
}

function DemoVideoFigure({ demo, video }: DemoVideo) {
  return (
    <figure>
      <VideoSlot
        src={video.src}
        poster={video.poster}
        label={`${demo.name} · ${video.label}`}
        width={video.width}
        height={video.height}
      />
      {video.src !== null && (
        <figcaption className='figure-caption'>
          <strong>{demo.platform}.</strong> {video.label}
        </figcaption>
      )}
    </figure>
  );
}

export default function HomePage() {
  const textColor = 'text-gray-600';
  const bgColor = 'bg-white';
  const maskColor = 'bg-white/75';
  const secondaryBgColor = 'bg-gray-100';
  const hlTextColor = 'text-primary-600';
  const linkIconClass = 'h-5 w-5 shrink-0 md:h-6 md:w-6';
  const resourceLinkClass =
    'h-14 justify-center gap-2 rounded-lg border border-solid border-gray-300 bg-white/60 px-3 text-sm [&>svg]:hidden md:mt-6 md:h-auto md:gap-1 md:rounded-none md:border-x-0 md:border-t-0 md:border-dotted md:border-dark md:bg-transparent md:px-0 md:text-lg md:[&>svg]:block';
  const citation_bibtex = `@article{qiu2026ssio,
      title={Self-Supervised Inertial Odometry},
      author={Yuheng Qiu and Yutian Chen and Carlton Cort and Weison Huang and Shibo Zhao and Pieter Abbeel and Rocky Duan and Koushil Sreenath and C. Karen Liu and Carmelo Sferrazza and Junyi Geng and Sebastian Scherer and Guanya Shi},
      year={2026},
}`;
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
          <h1 className='mb-6 mt-4 text-[clamp(1.75rem,8vw,3rem)] leading-[1.15] tracking-tight md:mb-4 md:text-5xl md:leading-none md:tracking-normal'>
            <span className='whitespace-nowrap'>
              <span className={hlTextColor}>S</span>elf-<span className={hlTextColor}>S</span>upervised
            </span>{' '}
            <span className='whitespace-nowrap'>
              <span className={hlTextColor}>I</span>nertial <span className={hlTextColor}>O</span>dometry
            </span>
          </h1>
          <div className='container pb-6'>
            <div className='text-[15px] leading-7 md:text-lg md:leading-[1.75] [&>span]:inline-block [&>span]:whitespace-nowrap [&_sup]:ml-0.5 [&_sup]:text-[0.65em]'>
              <span><UnderlineLink href='https://haleqiu.github.io/' className='font-normal'>Yuheng Qiu</UnderlineLink><sup>1,2</sup>,</span>{' '}
              <span><UnderlineLink href='https://www.yutianchen.blog/' className='font-normal'>Yutian Chen</UnderlineLink><sup>1,2</sup>,</span>{' '}
              <span>Carlton Cort<sup>2</sup>,</span>{' '}
              <span>Weison Huang<sup>2</sup>,</span>{' '}
              <span>Shibo Zhao<sup>1</sup>,</span>{' '}
              <br className='hidden md:block' />
              <span><UnderlineLink href='https://people.eecs.berkeley.edu/~pabbeel/' className='font-normal'>Pieter Abbeel</UnderlineLink><sup>1,3</sup>,</span>{' '}
              <span>Rocky Duan<sup>1</sup>,</span>{' '}
              <span>Koushil Sreenath<sup>1,3</sup>,</span>{' '}
              <span><UnderlineLink href='https://profiles.stanford.edu/c-karen-liu' className='font-normal'>C. Karen Liu</UnderlineLink><sup>1,4</sup>,</span>{' '}
              <span><UnderlineLink href='https://sferrazza.cc/' className='font-normal'>Carmelo Sferrazza</UnderlineLink><sup>1</sup>,</span>{' '}
              <br className='hidden md:block' />
              <span>Junyi Geng<sup>5</sup>,</span>{' '}
              <span><UnderlineLink href='https://theairlab.org/team/sebastian/' className='font-normal'>Sebastian Scherer</UnderlineLink><sup>2</sup>,</span>{' '}
              <span><UnderlineLink href='https://www.gshi.me/' className='font-normal'>Guanya Shi</UnderlineLink><sup>1,2</sup></span>
            </div>
          </div>
          <div className='grid w-full max-w-sm grid-cols-2 gap-3 md:flex md:max-w-none md:justify-center md:gap-8'>
            {/* TODO: point at the arXiv abstract once it is public. */}
            <ArrowLink className={resourceLinkClass} href='#' variant='light' size='large' icon={
              <img src='/svg/arxiv.svg' alt='arXiv logo' className={linkIconClass} loading='lazy' />
            }>
              arXiv{' '}
              <span className='block text-[11px] font-normal leading-tight text-gray-500 md:inline md:text-lg md:font-medium md:leading-normal md:text-inherit'>
                <span className='hidden md:inline'>(</span>coming soon<span className='hidden md:inline'>)</span>
              </span>
            </ArrowLink>
            <ArrowLink className={resourceLinkClass} href='https://github.com/SSIO-IMU' variant='light' size='large' icon={
              <img src='/svg/github.svg' alt='GitHub logo' className={linkIconClass} loading='lazy' />
            }>
              GitHub<span className='hidden md:inline'> Repo</span>
            </ArrowLink>
          </div>
          <div className='mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs leading-5 text-gray-500 md:mt-6 md:block md:text-sm md:text-gray-600 [&>span]:whitespace-nowrap [&_sup]:mr-0.5 [&_sup]:text-[0.7em]'>
            <span><sup>1</sup>Amazon FAR</span>{' '}
            <span><sup>2</sup>Carnegie Mellon University</span>{' '}
            <span><sup>3</sup>UC Berkeley</span>{' '}
            <br className='hidden md:block' />
            <span><sup>4</sup>Stanford University</span>{' '}
            <span><sup>5</sup>Penn State University</span>
          </div>
        </div>
      </section>

      <section className={clsx(bgColor, textColor)}>
        <div className='layout py-12'>
          <h2 className='text-center pb-4'>Abstract</h2>
          <p className='text-pretty text-base leading-[1.75] md:text-lg md:leading-[1.75]'>
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
            <h3 className='mb-4 text-center text-2xl font-semibold'>
              Six Datasets, One Recipe
            </h3>
            <ExpandableImage
              src='/images/fig1_corrected_legend.png'
              alt='Trajectory reconstructions and average velocity errors on six datasets, comparing self-supervised SSIO with supervised AirIO.'
              title='Six datasets, one recipe'
              width={2400}
              height={1000}
              imageClassName='bg-white p-2'
            />
            <figcaption className='figure-caption'>
              <strong>The same training recipe spans six datasets.</strong>{' '}
              Trajectory reconstructions (left) and average velocity error in m/s
              (right; lower is better) compare self-supervised SSIO with supervised
              AirIO across pedestrians, drones, quadrupeds, and a humanoid.
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        id='robot-demos'
        aria-labelledby='robot-demos-title'
        className={clsx(secondaryBgColor, textColor)}
      >
        <div className='layout py-12'>
          <h2 id='robot-demos-title' className='mb-4'>Self-Supervised Inertial Odometry on Real Robots</h2>
          <p className='pb-6 text-lg'>
            Learning from unlabeled motion on quadrupeds and a humanoid,
            without velocity or position labels.
          </p>
          <div className='grid grid-cols-1 gap-6'>
            {demoCards.map((embodiments) => {
              const cardDemos = demos.filter((d) => embodiments.includes(d.embodiment));
              const items = cardDemos.flatMap((demo) => demo.videos.map((video) => ({ demo, video })));
              return (
                <article
                  key={embodiments.join('-')}
                  id={`demo-${embodiments.join('-')}`}
                  className='rounded-2xl bg-white p-4 shadow-sm md:p-6'
                >
                  <div className='flex flex-wrap items-center gap-x-10 gap-y-4 pb-4'>
                    {cardDemos.map((demo) => (
                      <div key={demo.embodiment} className='flex items-center gap-3'>
                        <img src={demo.logo} alt='' className='h-12 w-12 object-contain' />
                        <div>
                          <h3 className='text-xl text-gray-800'>
                            {demo.name} <span className='font-normal text-gray-500'>· {demo.platform}</span>
                          </h3>
                          <TrainingDataLabel embodiment={demo.embodiment} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='grid gap-6'>
                    {videoPairs(items).map((pair) => (
                      <div
                        key={pair[0].video.label}
                        className='grid gap-6 md:grid-cols-[var(--video-columns)]'
                        style={{
                          // Columns proportional to aspect ratio give both videos in a row the same height.
                          // A lone video takes half the row so it is not shown larger than its neighbours.
                          '--video-columns': pair.length === 2
                            ? pair.map(({ video }) => `minmax(0, ${video.width / video.height}fr)`).join(' ')
                            : 'repeat(2, minmax(0, 1fr))',
                        } as CSSProperties}
                      >
                        {pair.map(({ demo, video }) => (
                          <DemoVideoFigure key={video.label} demo={demo} video={video} />
                        ))}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id='introduction' aria-labelledby='introduction-title' className='bg-dark py-8 text-gray-200'>
        <div className='layout'>
          <article className='rounded-2xl border border-white/10 bg-gray-900/50 p-4 shadow-2xl backdrop-blur md:p-6'>
            <h2 id='introduction-title' className='mb-4 text-center text-2xl font-semibold'>
              Introduction
            </h2>
            <VideoSlot src={VIDEOS.intro} poster='/video/ssio_introduction-poster.jpg' label='SSIO introduction' width={1920} height={1080} />
          </article>
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
          <h3 className='pb-2 pt-4'>Proprioceptive Input</h3>
          <p className='pb-2'>
            On the three articulated platforms that log proprioception, feeding joint states to the student (and, on MIPO, the four calf-mounted IMUs) lowers both velocity and trajectory error, with the teacher and loss unchanged.
          </p>
          <div className='grid items-start gap-8 pt-6 md:grid-cols-[1.63fr_1.29fr]'>
            <Figure
              img_src='/images/fig2_pipeline.png'
              alt='SSIO training pipeline with an IMU integration teacher, integration self-supervision, and pose graph distillation.'
              title='The IMU input provides the training signal'
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
            <Figure
              img_src='/images/fig3_Embodiment1_traj_v3.png'
              alt='Proprioceptive inputs for the Go1, ANYmal, and G1 robots, with GrandTour trajectories for Eig-1 and SNOW-2.'
              title='Proprioceptive inputs complement the IMU'
              caption='Top: proprioceptive input for Go1 (MIPO), ANYmal (GrandTour), and G1 (Humanoid). Bottom: GrandTour trajectories for the Eig-1 and SNOW-2 sequences.'
              isDark={false}
              idx={2}
            />
          </div>
        </div>
      </section>

      <section
        id='trajectory-gallery'
        aria-labelledby='trajectory-gallery-title'
        className={clsx(bgColor, textColor)}
      >
        <div className='layout py-12'>
          <h2 id='trajectory-gallery-title' className='mb-4'>Traj Gallery</h2>
          <p className='text-lg pb-6'>
            2D trajectories and velocity components compared with ground truth.
            Our models are trained from scratch with <span className={hlTextColor}>no velocity or position labels</span>.
          </p>
          <TabGroup>
            <TabList aria-label='Trajectory gallery views' className='mb-6 flex flex-wrap gap-2 border-b border-gray-300'>
              {['Test sequences', 'Overview figures'].map((view) => (
                <Tab
                  key={view}
                  className={({ selected }) => clsx(
                    '-mb-px border-b-2 px-4 py-3 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
                    selected
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent hover:text-primary-600'
                  )}
                >
                  {view}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              <TabPanel>
                <TrajectorySequenceBrowser />
              </TabPanel>
              <TabPanel>
                <TabGroup>
                  <TabList aria-label='Overview datasets' className='mb-6 flex flex-wrap gap-2'>
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
                          <div className='mb-4 flex flex-wrap items-baseline justify-between gap-2'>
                            <h3 className='text-xl text-gray-800'>
                              {item.name} <span className='font-normal text-gray-500'>· {item.platform}</span>
                            </h3>
                            <TrainingDataLabel embodiment={item.embodiment} />
                          </div>
                          <ExpandableImage
                            src={item.image}
                            alt={item.alt}
                            title={`${item.name} trajectories and velocities`}
                            width={2400}
                            height={1350}
                          />
                          <figcaption className='figure-caption'>
                            <strong>{item.takeaway}</strong> {item.caption}
                          </figcaption>
                        </figure>
                      </TabPanel>
                    ))}
                  </TabPanels>
                </TabGroup>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </section>

      <section className={clsx(bgColor, textColor)}>
        <div className='layout pt-4 pb-48'>
          <h2 className='mt-12 mb-4'>Citation</h2>
          <pre className='whitespace-pre-wrap'>{citation_bibtex}</pre>
        </div>
      </section>
    </main>
  );
}
