"""Audit the photo manifest for subject mismatches.

A photograph can be correctly licensed, correctly verified and still be wrong:
a market photograph standing in for "ride a tuk-tuk", or a Mulanje tea estate
photograph standing in for a different estate. Nothing in the data reveals this —
you only catch it by reading each key against the Commons filename.

This reports:
  1. keys that share one photograph (aliases and copy-paste substitutions)
  2. keys whose filename names a different subject than the key implies
"""
import json
import re
import urllib.parse
from collections import defaultdict

MANIFEST = "/home/i9i/Buy Me Coffee/travel-lab/data/photos.json"

# Filename fragments that contradict a key. Matched case-insensitively.
CONTRADICTS = {
    "Serengeti": "wildlife-lion",
    "Maseru": "guesthouse",
    "Victoria": "lake-house",
    "Nigeria": "honey-beekeepers",
    "Bauchi": "honey-beekeepers",
}

# Keys whose COPY names a subject. If the photograph is of something else, the
# card is making a claim the image does not support.
SUBJECT_KEYS = {
    # "bajaji" is what a tuk-tuk is called in Malawi. A Commons file titled
    # "Bajaji on dirt road" is exactly the right photograph, so the keyword
    # list has to know the local word or it reports a false mismatch.
    "tuk-tuk": ("tuk", "minibus", "taxi", "bajaji"),
    "wildlife-lion": ("lion",),
    "guesthouse": ("guesthouse", "guest house", "hotel", "lodg"),
    "lake-house": ("lake house", "beach house", "villa"),
    "honey-beekeepers": ("bee", "honey", "apiary", "hive"),
    "eco-lodge": ("lodge", "camp", "treehouse", "tree house"),
}


def filename_of(url: str) -> str:
    url = urllib.parse.unquote(url.split("?")[0])
    tail = url.split("/commons/", 1)[-1].split("/")
    if tail[0] == "thumb":
        tail = tail[1:]
    return tail[2] if len(tail) > 2 else url[-50:]


def main() -> None:
    manifest = json.load(open(MANIFEST))
    print(f"entries: {len(manifest)}\n")

    # 1. Shared photographs.
    #
    # Some sharing is deliberate and correct:
    #   zomba-mountain / zomba-plateau  — the same view, correctly used for both
    #   chizumulu / chizumulu-island     — the same island, two keys
    #   banaba / kumbali-island /
    #   lake-malawi-national-park       — stand-ins for places with no photo of
    #                                      their own; these show the lake, which
    #                                      is genuinely what they are
    # What is NOT acceptable is a key borrowing a photograph of a different
    # SUBJECT — that was the tuk-tuk card showing a market.
    by_url: dict[str, list[str]] = defaultdict(list)
    for key, entry in manifest.items():
        by_url[entry["url"]].append(key)

    shared = {url: keys for url, keys in by_url.items() if len(keys) > 1}
    print(f"=== photographs shared by more than one key ({len(shared)}) ===")
    for url, keys in shared.items():
        print(f"  {' + '.join(sorted(keys))}")
        print(f"     -> {filename_of(url)[:66]}")
    print()

    # 2. Filenames that name a different country or place.
    print("=== filenames contradicting the key ===")
    found = 0
    for key, entry in manifest.items():
        name = filename_of(entry["url"]).lower()
        for needle, expected in CONTRADICTS.items():
            if needle.lower() in name and needle.lower() != expected.lower():
                print(f"  {key}: {filename_of(entry['url'])[:64]}")
                found += 1
    if not found:
        print("  none")
    print()

    # 3. Subject mismatch against the card copy.
    print("=== subject vs card copy ===")
    for key, needles in SUBJECT_KEYS.items():
        entry = manifest.get(key)
        if not entry:
            continue
        name = filename_of(entry["url"]).lower()
        ok = any(n.lower() in name for n in needles)
        flag = "ok " if ok else "MISMATCH"
        print(f"  {flag} {key:18s} {filename_of(entry['url'])[:60]}")


if __name__ == "__main__":
    main()