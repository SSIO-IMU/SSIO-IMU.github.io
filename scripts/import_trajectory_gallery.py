#!/usr/bin/env python3
"""Import the sequences linked by an all_test trajectory gallery."""

import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil


DATASETS = {
    "humanoid": "Humanoid",
    "grandtour": "GrandTour",
    "mipo": "MIPO",
    "euroc": "EuRoC",
    "tlio": "TLIO",
    "blackbird": "Blackbird",
}


class GalleryImages(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "img" and "data-gif" in attrs:
            animation = attrs["data-gif"]
            if animation in self.images:
                raise ValueError(f"Duplicate gallery entry: {animation}")
            self.images[animation] = attrs["data-poster"]


def natural_key(name):
    return [int(part) if part.isdigit() else part for part in re.split(r"(\d+)", name.casefold())]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Directory containing index.html and manifest.json")
    args = parser.parse_args()
    source = args.source.resolve()
    root = Path(__file__).resolve().parents[1]
    destination = root / "public/images/trajectories"

    gallery = GalleryImages()
    gallery.feed((source / "index.html").read_text())
    manifest = json.loads((source / "manifest.json").read_text())
    entries = {entry["gif"]: entry for entry in manifest["sequences"]}
    groups = {key: [] for key in DATASETS}
    assets = []

    if not gallery.images:
        raise ValueError("The source gallery has no sequence images")
    for animation, poster in gallery.images.items():
        entry = entries[animation]
        if entry["poster"] != poster:
            raise ValueError(f"Poster differs between index and manifest: {animation}")
        for relative in [animation, poster]:
            asset = (source / relative).resolve()
            if not asset.is_relative_to(source):
                raise ValueError(f"Asset is outside the source gallery: {relative}")
            expected = entry["render"]["files"][asset.name]
            if hashlib.sha256(asset.read_bytes()).hexdigest() != expected:
                raise ValueError(f"Asset checksum differs from manifest: {relative}")
            assets.append((asset, destination / relative))

        width, height = entry["render"]["identity"]["size_px"]
        groups[entry["dataset_key"]].append({
            "id": f'{entry["dataset_key"]}-{Path(animation).parent.name}',
            "name": entry["sequence"],
            "poster": f"/images/trajectories/{poster}",
            "animation": f"/images/trajectories/{animation}",
            "width": width,
            "height": height,
        })

    datasets = [
        {
            "id": key,
            "name": name,
            "sequences": sorted(groups[key], key=lambda entry: natural_key(entry["name"])),
        }
        for key, name in DATASETS.items()
        if groups[key]
    ]
    for asset, target in assets:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(asset, target)
    data_file = root / "src/data/trajectory-sequences.json"
    data_file.parent.mkdir(parents=True, exist_ok=True)
    data_file.write_text(json.dumps(datasets, indent=2, ensure_ascii=False) + "\n")
    print(f"Imported {len(gallery.images)} sequences and {len(assets)} verified assets.")
    for dataset in datasets:
        print(f'{dataset["name"]}: {len(dataset["sequences"])} sequences')


if __name__ == "__main__":
    main()
