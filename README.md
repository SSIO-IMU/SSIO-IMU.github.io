# SSIO project page

Project page for **Self-Supervised Inertial Odometry**, served at <https://ssio-imu.github.io>.
Built on the [Co-Me](https://github.com/co-me-tokens/co-me-tokens.github.io) /
[AirIO](https://github.com/air-io/air-io.github.io) Next.js + Tailwind template.

```bash
corepack pnpm install
corepack pnpm dev      # http://localhost:3000
corepack pnpm build    # static export into docs/ (commit docs/)
```

GitHub Pages: Settings → Pages → Deploy from branch `main`, folder `/docs`.

## Figures and captions

The abstract uses a 740 px reading column; its overview figure retains the full
content width. Overview figures, method diagrams, scaling plots, and trajectory
plots open in an overlay with fit-to-screen and 100% views. Close the overlay with
its close button, Escape, or a click outside the panel. The scaling and trajectory
overlays show the final frame so plot details can be inspected.

`src/components/ExpandableImage.tsx` supplies the viewer. Figure captions share
the `.figure-caption` style and start with a short takeaway.

## TLIO scaling visualization

The section after the trajectory gallery supports day and night modes, animated
GIFs, and a final-frame view. Reduced-motion preferences select the static frame.
The component is `src/components/TLIOScaling.tsx`; its assets are in
`public/images/scaling/`.

Both GIFs are copied from
`IMUnet/MACIO_Pipeline2/Doc/figure_scaling/render/gifs/`:
`scaling_law_one_by_one_clean_2x.gif` for day mode and the same filename under
`transparent_dark/` for night mode. The PNGs are their final frames.

## Videos

Robot demos follow the abstract and “Six Datasets, One Recipe” figure.
The cards appear in this order: Humanoid, GrandTour, then MIPO.
The humanoid card contains both G1–MACVO (2×) and G1–SuperOdom (8×) and is directly
accessible at the `#demo-humanoid` anchor.
GrandTour and MIPO each occupy a full-width row. GrandTour has six sequence
tabs—EIG-1, ETH-1, ETH-3, GRI-1, HEAP-1, and SNOW-2—with one active player.
Their videos fill the card width, with height following each video's native
aspect ratio. The humanoid pair shares a height on tablet and desktop and
stacks on mobile. Videos are never cropped or stretched.

The G1 teaser plays at 2× speed with “2×” and “Self-supervised with 1h data”
burned into the top left and an SSIO (pink) / MACVO (blue) legend in a bottom
strip. `video/G1-MACVO/make_teaser.py` renders it from the original screencast;
the edited master is `video/G1-MACVO/ssio-macvo-teaser-2x.mp4`, and the website
copy is `public/video/teaser.mp4`. Its poster is `public/video/teaser-poster.jpg`.

The G1 SuperOdom video is `public/video/G1-LiDAR/ssio-lidar-8x.mp4`, copied from
the edited master in `video/G1-LiDAR/`. Its first 3 seconds are trimmed, its
existing 8× playback is preserved, and “Self-supervised with 1h data” is burned
in beneath the top-left 8× marker so playback controls cannot cover it.
Only the SSIO (yellow) / SuperOdom (red) legend appears in the bottom strip.
The rendering script is
`video/G1-LiDAR/make_lidar_demo.py`.

The MIPO video has a black header with “Unitree Go-1 with self-supervision” and
an SSIO (solid pink) / GPS (GT) (dashed teal) legend in a bottom strip, matching
G1–MACVO. Both strips sit outside the full original recording. Its 16-second,
30 fps playback is unchanged. Render it from the original with:

```bash
python video/make_gps_demo.py video/MIPO-GPS/st_mary_ssio_joints_3panel.mp4 \
  video/MIPO-GPS/st-mary-ssio-gps.mp4 --platform 'Unitree Go-1'
```

The labeled master is `video/MIPO-GPS/st-mary-ssio-gps.mp4`, with its website
copy under `public/video/MIPO-GPS/`. GrandTour labeled masters are in
`video/ANYmal-GPS/`, with website copies under `public/video/ANYmal-GPS/`.
All clips are H.264 MP4s with fast-start metadata.
The six GrandTour clips come from `FINAL_GrandTour_satellite_videos`, including
the updated EIG-1 and SNOW-2 renders. Each has an “ANYmal with self-supervision”
title above the recording and the same SSIO / GPS (GT) legend below it.
The original content retains its native dimensions, with 96 px added at the top
and bottom. Each clip remains 10 seconds at 30 fps. Their posters use the frame
at 5 seconds.

Render each GrandTour clip from the original downloads, for example:

```bash
python video/make_gps_demo.py \
  ~/Downloads/FINAL_GrandTour_satellite_videos/EIG-1_GrandTour_satellite.mp4 \
  video/ANYmal-GPS/EIG-1_final.mp4 --platform ANYmal
```

Each demo has a poster set in the `demos` array. G1–MACVO reuses the hero poster.
G1–SuperOdom and MIPO use the full frame at 5 seconds, scaled to 1280 px wide.
Their poster paths are `G1-LiDAR/ssio-lidar-poster.jpg` and
`MIPO-GPS/st-mary-poster.jpg`, under `public/video/`. GrandTour poster filenames
match the sequence tabs, such as `ANYmal-GPS/EIG-1-poster.jpg`.

Put each mp4 under `public/video/`, then set its path in the `VIDEOS` table at the
top of `src/app/page.tsx` (null = coming soon) and rebuild. The `demos` array
controls the visible cards and records each clip's native width and height for
the proportional layout. `trainingDurations` holds confirmed self-supervised
training durations: humanoid uses **1 h** of unlabeled data. Other durations are
pending confirmation and are omitted from the page; total dataset durations
include held-out recordings and must not be used as training durations.
The title-page background plays the teaser beneath a light overlay, using a
frame from the same video as its poster. The full frame fits without cropping.

| Key | File | Where |
| --- | --- | --- |
| `teaser` | `teaser.mp4` | Title-page background (silent video loop) |
| `intro` | `ssio_introduction.mp4` | Centered Introduction section |
| `humanoidMacvo` | `teaser.mp4` | Main-page humanoid demo · G1–MACVO (2×) |
| `humanoidLidar` | `G1-LiDAR/ssio-lidar-8x.mp4` | Main-page humanoid demo · G1–SuperOdom (8×) |
| `mipo` | `MIPO-GPS/st-mary-ssio-gps.mp4` | Main-page MIPO demo · SSIO / GPS (GT) |
| `grandtourEig1` | `ANYmal-GPS/EIG-1_final.mp4` | GrandTour · EIG-1 (initial selection) |
| `grandtourEth1` | `ANYmal-GPS/ETH-1_final.mp4` | GrandTour · ETH-1 |
| `grandtourEth3` | `ANYmal-GPS/ETH-3_final.mp4` | GrandTour · ETH-3 |
| `grandtourGri1` | `ANYmal-GPS/GRI-1_final.mp4` | GrandTour · GRI-1 |
| `grandtourHeap1` | `ANYmal-GPS/HEAP-1_final.mp4` | GrandTour · HEAP-1 |
| `grandtourSnow2` | `ANYmal-GPS/SNOW-2_final.mp4` | GrandTour · SNOW-2 |

Transcode for the web:

```bash
ffmpeg -i input.mov -an -vcodec libx264 -pix_fmt yuv420p -crf 24 -movflags +faststart public/video/teaser.mp4
```

## Trajectory gallery

“Traj Gallery” opens on **Test sequences**, with 69 trajectories across six
datasets. On desktop, dataset filters and search narrow a scrollable, numbered
sequence list; only the selected sequence is displayed. The order is Humanoid, GrandTour, MIPO,
EuRoC, TLIO, then Blackbird, with natural sequence-name sorting within each
dataset. Previous/Next buttons and Up/Down/Home/End keys navigate the list.
The list sits beside the preview on desktop. Below 1024 px, every matching plot
appears in the normal page scroll, grouped by dataset, with filters and search
above the plots.

The selected sequence plays its GIF automatically. Changing the sequence or
filters starts the selected GIF. The desktop browser loads one trajectory at a
time. On smaller screens, offscreen plots use lazy-loaded static frames; only
visible plots play animations. A shared control switches all plots to final
frames or enables visible animations.
**Show final frame** switches to its PNG, and **Play animation** resumes the GIF. Both formats
retain the original plots, legends, and scales, and can be opened at full size.
World-frame velocities use ground-truth attitude, with trajectories anchored at
the origin. No aggregate results table is shown.

The **Overview figures** tab retains the original MIPO, TLIO, and Blackbird
figures and their dataset tabs. The `trajectoryGallery` array in
`src/app/page.tsx` defines these overviews.

`src/components/TrajectorySequenceBrowser.tsx` renders the sequence browser from
`src/data/trajectory-sequences.json`; media live in `public/images/trajectories/`.
To refresh them from the IMUnet gallery:

```bash
python scripts/import_trajectory_gallery.py \
  ../IMUnet/SSIO/Doc/figure1_trajectories/render/gifs/all_test
npm run build
```

The source directory was formerly under `MACIO_Pipeline2/Doc/`. The importer
uses the entries linked by `index.html` and verifies every copied PNG and GIF
against `manifest.json`. That source page lists 69 sequences and excludes
TLIO sequence `263070267597787`, although it remains in the source manifest.

## TODO

- arXiv button in the hero points to `#`.
- Only some author names link to homepages.
