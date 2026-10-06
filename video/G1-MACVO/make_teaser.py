#!/usr/bin/env python3
"""Render the G1 teaser at 2x speed with training-data text and a color legend."""

import argparse
from pathlib import Path
import subprocess


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument(
        "output",
        type=Path,
        nargs="?",
        default=Path(__file__).with_name("ssio-macvo-teaser-2x.mp4"),
    )
    args = parser.parse_args()
    font = subprocess.check_output(
        ["fc-match", "-f", "%{file}", "DejaVu Sans:style=Bold"], text=True
    ).strip()

    # Match the recording: pink IMU/SSIO, blue visual-odometry/MACVO reference.
    # The footer preserves the complete plots and point cloud above it.
    filters = [
        "setpts=(PTS-STARTPTS)/2",
        "fps=60",
        "pad=ceil(iw/2)*2:ceil(ih/2)*2+96:0:0:color=black",
        f"drawtext=fontfile='{font}':text='2×':fontsize=64:fontcolor=white:"
        "x=40:y=48:box=1:boxcolor=black@0.75:boxborderw=16",
        f"drawtext=fontfile='{font}':text='Self-supervised with 1h data':"
        "fontsize=48:fontcolor=white:x=40:y=144:"
        "box=1:boxcolor=black@0.75:boxborderw=12",
        "drawbox=x=iw/2-310:y=ih-51:w=84:h=6:color=0xE66F87:t=fill",
        f"drawtext=fontfile='{font}':text='SSIO':fontsize=48:fontcolor=white:"
        "x=w/2-208:y=h-48-text_h/2",
        "drawbox=x=iw/2+18:y=ih-51:w=84:h=6:color=0x4FA3DC:t=fill",
        f"drawtext=fontfile='{font}':text='MACVO':fontsize=48:fontcolor=white:"
        "x=w/2+120:y=h-48-text_h/2",
    ]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "warning",
            "-stats", "-stats_period", "5", "-y",
            "-i", str(args.source), "-map", "0:v:0",
            "-vf", ",".join(filters),
            "-an", "-c:v", "libx264", "-preset", "fast",
            "-crf", "18", "-pix_fmt", "yuv420p", "-threads", "8",
            "-movflags", "+faststart",
            str(args.output),
        ],
        check=True,
    )
    print(f"Saved {args.output.resolve()}")


if __name__ == "__main__":
    main()
