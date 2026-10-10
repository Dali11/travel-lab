"""Add a verified Commons photograph to data/photos.json.

Used when a card's copy names a subject the current photograph does not show.
In this project the "Ride a tuk-tuk through Lilongwe" card was illustrated with
a market photograph: licensed and reachable, but it made a claim the image
could not support. The fix is a real photograph of the actual vehicle — a
bajaji, which is what a tuk-tuk is called in Malawi — not a change of caption.

Usage:
    python3 scripts/add-photo.py tuk-tuk "Bajaji on dirt road.jpg"
"""
import json
import re
import subprocess
import sys
import time
import urllib.parse

MANIFEST = "/home/i9i/Buy Me Coffee/travel-lab/data/photos.json"
UA = "travel-lab-dev/1.0 (photo manifest maintenance)"
WIDTH = 1600


def strip_tracking(url: str) -> str:
    return url.split("?")[0].replace(
        "https://thumb.wikimedia.org/", "https://upload.wikimedia.org/"
    )


def clean_credit(html: str) -> str:
    text = re.sub(r"<[^>]+>", "", html or "")
    return re.sub(r"\s+", " ", text).strip()[:44] or "Wikimedia Commons"


def lookup(title: str) -> dict | None:
    """Resolve a Commons file title to a verified manifest entry."""
    quoted = urllib.parse.quote("File:" + title.replace(" ", "_"), safe="")
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&format=json"
        "&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=%d&titles=%s" % (WIDTH, quoted)
    )
    result = subprocess.run(
        ["curl", "-s", "--max-time", "30", "-A", UA, url],
        capture_output=True, text=True,
    )
    try:
        pages = json.loads(result.stdout)["query"]["pages"]
        for _, page in pages.items():
            if "missing" in page:
                return None
            info = page["imageinfo"][0]
            meta = info.get("extmetadata", {})
            return {
                "url": strip_tracking(info.get("thumburl") or info["url"]),
                "credit": clean_credit(meta.get("Artist", {}).get("value", "")),
                "license": meta.get("LicenseShortName", {}).get("value", ""),
                "attributionUrl":
                    "https://commons.wikimedia.org/wiki/File:" + title.replace(" ", "_"),
            }
    except Exception:
        return None
    return None


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__)
        return 2

    key, title = argv[1], argv[2]
    entry = lookup(title)
    if not entry:
        print(f"  FAIL  no Commons file titled '{title}'")
        return 1

    if not entry["license"]:
        print("  FAIL  no licence recorded — refusing to add an unattributed image")
        return 1

    verify = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code} %{size_download}",
         "-L", "--max-time", "25", "-A", UA, entry["url"]],
        capture_output=True, text=True,
    )
    status, size = verify.stdout.split()
    if status != "200":
        print(f"  FAIL  {key}: image returned {status}")
        return 1

    manifest = json.load(open(MANIFEST))
    replaced = key in manifest
    manifest[key] = entry
    json.dump(manifest, open(MANIFEST, "w"), indent=2, ensure_ascii=False)

    verb = "replaced" if replaced else "added"
    print(f"  ok    {key} {verb}: {int(size) // 1024}KB "
          f"{entry['credit']} · {entry['license']}")
    print(f"        {entry['url']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))