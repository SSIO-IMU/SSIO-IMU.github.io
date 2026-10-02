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

## Videos

Every video is a placeholder. Put the mp4 under `public/video/`, then set its path in
the `VIDEOS` table at the top of `src/app/page.tsx` (null = placeholder) and rebuild.

| Key | File | Where |
| --- | --- | --- |
| `teaser` | `teaser.mp4` | Hero background (silent loop) |
| `intro` | `ssio_introduction.mp4` | Dark slider, "Introduction" |
| `tlio` | `traj_tlio.mp4` | Human & Humanoid |
| `humanoid` | `traj_humanoid_g1.mp4` | Human & Humanoid |
| `mipo` | `traj_mipo_go1.mp4` | Legged Robots |
| `grandtour` | `traj_grandtour_anymal.mp4` | Legged Robots |
| `blackbird` | `traj_blackbird.mp4` | Racing Drone |
| `euroc` | `traj_euroc.mp4` | Racing Drone |

Transcode for the web:

```bash
ffmpeg -i input.mov -an -vcodec libx264 -pix_fmt yuv420p -crf 24 -movflags +faststart public/video/teaser.mp4
```

## TODO

- arXiv button in the hero points to `#`.
- Only some author names link to homepages.
