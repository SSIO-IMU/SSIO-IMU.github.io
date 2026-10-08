#!/usr/bin/env python3
"""Add a platform title above a recording and an SSIO/GPS legend below it."""

import argparse
from pathlib import Path
import subprocess


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--platform", required=True, choices=["Unitree Go-1", "ANYmal"])
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve():
        parser.error("Keep the original recording separate from the labeled output.")

    font = subprocess.check_output(
        ["fc-match", "-f", "%{file}", "DejaVu Sans:style=Bold"], text=True
    ).strip()

    # Match the pink prediction and dashed teal GPS reference in the plots.
    # Keep the full recording between the title and a G1-style legend footer.
    filters = [
        "setpts=PTS-STARTPTS",
        "pad=ceil(iw/2)*2:ceil(ih/2)*2+192:0:96:color=black",
        f"drawtext=fontfile='{font}':text='{args.platform} with self-supervision':"
        "fontsize=48:fontcolor=white:x=(w-text_w)/2:y=48-text_h/2",
        "drawbox=x=iw/2-334:y=ih-51:w=84:h=6:color=0xE8627D:t=fill",
        f"drawtext=fontfile='{font}':text='SSIO':fontsize=48:fontcolor=white:"
        "x=w/2-232:y=h-48-text_h/2",
        "drawbox=x=iw/2-20:y=ih-51:w=20:h=6:color=0x629FAB:t=fill",
        "drawbox=x=iw/2+12:y=ih-51:w=20:h=6:color=0x629FAB:t=fill",
        "drawbox=x=iw/2+44:y=ih-51:w=20:h=6:color=0x629FAB:t=fill",
        f"drawtext=fontfile='{font}':text='GPS (GT)':fontsize=48:fontcolor=white:"
        "x=w/2+82:y=h-48-text_h/2",
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
