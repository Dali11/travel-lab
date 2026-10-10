"""Rewrite every photograph in the manifest to a properly sized thumbnail.

Why this must happen:

`upload.wikimedia.org/wikipedia/commons/<hash>/<File>` is the ORIGINAL upload.
Some are 5MB+. The Next.js image optimiser has to fetch and decode the whole
thing, and it times out — the endpoint returns 500 and the page shows nothing.
The optimiser never times out on a `/thumb/...` URL, because the upstream CDN
has already resized it.

This was not visible from the HTML: nine of the eleven original-URL entries
happened to be small enough to optimise fine, so the site looked healthy until a
5.3MB lodge photo returned 500.

An earlier version of this script built thumbnail URLs by hand and got a 400 on
every one. Commons will not generate a thumbnail for a URL derived that way.
Instead this asks the API for `iiurlwidth`, which returns the correct `thumburl`
directly — the CDN's own answer rather than a guess.

Run:  python3 scripts/thumbnail-photos.py
"""
import json
import subprocess
import time
import urllib.parse

MANIFEST = "/home/i9i/Buy Me Coffee/travel-lab/data/photos.json"
UA = "travel-lab-dev/1.0 (photo manifest maintenance)"
WIDTH = 1600


def strip_tracking(url: str) -> str:
    return url.split("?")[0].replace(
        "https://thumb.wikimedia.org/", "https://upload.wikimedia.org/"
    )


def filename_from_url(url: str) -> str | None:
    """Recover the Commons filename from either the original or thumb form."""
    url = urllib.parse.unquote(strip_tracking(url))
    # .../commons/<a>/<ab>/<File>   or   .../commons/thumb/<a>/<ab>/<File>/<w>px-<File>
    tail = url.split("/commons/", 1)[-1]
    parts = tail.split("/")
    if parts[0] == "thumb":
        parts = parts[1:]
    # Drop the two hash directories.
    parts = parts[2:]
    if not parts:
        return None
    return parts[0]


def api_thumbnail(filename: str) -> str | None:
    """Ask Commons for the real thumbnail URL. Returns None on failure."""
    title = "File:" + filename
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&format=json"
        "&prop=imageinfo&iiprop=url&iiurlwidth=%d&titles=%s"
        % (WIDTH, urllib.parse.quote(title, safe=""))
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
            thumb = page["imageinfo"][0].get("thumburl")
            return strip_tracking(thumb) if thumb else None
    except Exception:
        return None
    return None


def head(url: str) -> tuple[int, int]:
    """(status, bytes). Never raises."""
    result = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code} %{size_download}",
         "-L", "--max-time", "30", "-A", UA, url],
        capture_output=True, text=True,
    )
    parts = result.stdout.split()
    return (
        int(parts[0]) if parts and parts[0].isdigit() else 0,
        int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0,
    )


def main() -> int:
    manifest = json.load(open(MANIFEST))
    converted = kept = failed = 0

    for key, entry in manifest.items():
        current = strip_tracking(entry["url"])
        if "/thumb/" in current:
            kept += 1
            continue

        filename = filename_from_url(current)
        if not filename:
            print(f"  skip  {key}: could not read a filename from {current}")
            failed += 1
            continue

        candidate = api_thumbnail(filename)
        if not candidate:
            print(f"  FAIL  {key}: no thumbnail from API for {filename}")
            entry["url"] = current
            failed += 1
            time.sleep(0.4)
            continue

        status, size = head(candidate)
        if status != 200 or size == 0:
            print(f"  FAIL  {key}: thumbnail returned {status} ({size}B)")
            entry["url"] = current
            failed += 1
            time.sleep(0.4)
            continue

        entry["url"] = candidate
        converted += 1
        print(f"  ok    {key}: {size // 1024}KB  {candidate[-46:]}")
        time.sleep(0.4)

    json.dump(manifest, open(MANIFEST, "w"), indent=2, ensure_ascii=False)
    print(f"\nconverted {converted}, already thumbnails {kept}, failed {failed}")
    print(f"manifest now has {len(manifest)} entries")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())