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

## TLIO scaling visualization

The section after the results table supports day and night modes, animated GIFs,
and a final-frame view. Reduced-motion preferences select the static frame.
The component is `src/components/TLIOScaling.tsx`; its assets are in
`public/images/scaling/`.

Both GIFs are copied from
`IMUnet/MACIO_Pipeline2/Doc/figure_scaling/render/gifs/`:
`scaling_law_one_by_one_clean_2x.gif` for day mode and the same filename under
`transparent_dark/` for night mode. The PNGs are their final frames.

## Videos

Robot demos appear directly below the abstract, without subset tabs. MIPO and
humanoid have prominent cards, followed by both ANYmal GrandTour clips (EIG-1 and
SNOW-2). The humanoid card contains both G1–MACVO (2×) and G1–LiDAR (8×),
with the 1 h self-supervised training duration shown under each clip.
It is directly accessible at the `#demo-humanoid` anchor.

The G1 teaser plays at 2× speed with “2×” and “Self-supervised with 1h data”
burned into the top left and an SSIO (pink) / MACVO (blue) legend in a bottom
strip. `video/G1-MACVO/make_teaser.py` renders it from the original screencast;
the edited master is `video/G1-MACVO/ssio-macvo-teaser-2x.mp4`, and the website
copy is `public/video/teaser.mp4`. Its poster is `public/video/teaser-poster.jpg`.

The G1 LiDAR video is `public/video/G1-LiDAR/ssio-lidar-8x.mp4`, copied from
the edited master in `video/G1-LiDAR/`. Its first 3 seconds are trimmed, its
existing 8× playback is preserved, and “Self-supervised with 1h data” is burned
in beneath the top-left 8× marker so playback controls cannot cover it.
Its title and SSIO (yellow) / LiDAR (red) legend remain in a bottom strip.
The rendering script is
`video/G1-LiDAR/make_lidar_demo.py`.

The other source clips are in `video/MIPO-GPS/` and `video/ANYmal-GPS/`; the
website copies use the same subfolders under `public/video/`. All clips are
H.264 MP4s with fast-start metadata.

Put each mp4 under `public/video/`, then set its path in the `VIDEOS` table at the
top of `src/app/page.tsx` (null = coming soon) and rebuild. The `demos` array
controls the visible cards. `trainingDurations` holds confirmed self-supervised
training durations: humanoid uses **1 h** of unlabeled data. Other durations are
pending confirmation and are omitted from the page; total dataset durations
include held-out recordings and must not be used as training durations.
The title-page background plays the teaser beneath a light overlay, using a
frame from the same video as its poster. The full frame fits without cropping.

| Key | File | Where |
| --- | --- | --- |
| `teaser` | `teaser.mp4` | Title-page background (silent video loop) |
| `intro` | `ssio_introduction.mp4` | Dark slider, "Introduction" |
| `humanoidMacvo` | `teaser.mp4` | Main-page humanoid demo · G1–MACVO (2×) |
| `humanoidLidar` | `G1-LiDAR/ssio-lidar-8x.mp4` | Main-page humanoid demo · G1–LiDAR (8×) |
| `mipo` | `MIPO-GPS/st_mary_ssio_joints_3panel.mp4` | Main-page MIPO demo |
| `grandtourEig1` | `ANYmal-GPS/EIG-1_final.mp4` | Main-page ANYmal demos |
| `grandtourSnow2` | `ANYmal-GPS/SNOW-2_final.mp4` | Main-page ANYmal demos |

Transcode for the web:

```bash
ffmpeg -i input.mov -an -vcodec libx264 -pix_fmt yuv420p -crf 24 -movflags +faststart public/video/teaser.mp4
```

## Trajectory gallery

“Traj Gallery” displays the existing MIPO, TLIO, and Blackbird figures in
clickable dataset tabs, with MIPO selected initially. The tabs also support
keyboard navigation. Each section shows only 2D trajectories and velocity
components, including the original legends and scale bars. Each image opens at
full resolution. The `trajectoryGallery` array in `src/app/page.tsx` defines the
entries; images remain in `public/images/`.

## TODO

- arXiv button in the hero points to `#`.
- Only some author names link to homepages.
