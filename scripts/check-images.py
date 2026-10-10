"""Verify the image optimiser is actually serving the manifest photographs.

Why this exists: a bad `next.config.ts` allowlist fails SILENTLY at build time.
The build passes, the page renders, and the only symptom is an empty frame in
the browser. So the allowlist and the optimiser both need a real runtime check
rather than an inspection.

Run against a live server:
    npx next start -p 3151 &
    curl -s http://localhost:3151/ -o /tmp/final.html
    python3 scripts/check-images.py
"""
import json
import re
import subprocess
import sys
import time
import urllib.parse

BASE = "http://localhost:3160"
PAGE = "/tmp/final.html"


def curl(url: str) -> tuple[str, str, str]:
    """Returns (status, content-type, size). Never raises."""
    result = subprocess.run(
        ["curl", "-s", "-o", "/dev/null",
         "-w", "%{http_code} %{content_type} %{size_download}",
         "--max-time", "30", url],
        capture_output=True, text=True,
    )
    parts = result.stdout.split()
    return (
        parts[0] if parts else "000",
        parts[1] if len(parts) > 1 else "none",
        parts[2] if len(parts) > 2 else "0",
    )


def main() -> int:
    try:
        html = open(PAGE, encoding="utf-8").read()
    except FileNotFoundError:
        print(f"missing {PAGE} — curl the homepage into it first")
        return 1

    # The optimiser URLs the page actually asks for. Decode only: an earlier
    # version of this script also stripped backslashes, which mangled the
    # percent-encoding and produced twelve false failures.
    sources = {
        urllib.parse.unquote(match)
        for match in re.findall(r"/_next/image\?url=([^&\"\\]+)", html)
    }

    manifest = json.load(open("/home/i9i/Buy Me Coffee/travel-lab/data/photos.json"))
    manifest_urls = {entry["url"] for entry in manifest.values()}

    print(f"manifest entries : {len(manifest_urls)}")
    print(f"optimiser URLs   : {len(sources)}")

    unknown = sorted(sources - manifest_urls)
    print(f"not in manifest  : {len(unknown)}")
    for url in unknown[:5]:
        print("   ", url[:100])

    # Commons serves the ORIGINAL rather than a thumbnail when the image is already
    # small enough that resizing would not help — so "not a thumbnail URL" is
    # not itself a fault. What matters is whether the optimiser can actually
    # serve it, which the sample below checks directly.
    #
    # The one real failure mode was a 5.3MB original that made the optimiser
    # time out and return 500. scripts/thumbnail-photos.py fixes those; this
    # check reports anything still large enough to be a risk.
    LARGE_BYTES = 2_000_000
    oversized: list[tuple[str, int]] = []
    for url in manifest_urls:
        if "/thumb/" in url:
            continue
        code, _, size = curl(url)
        size_int = int(size or 0)
        if code != "200" or size_int > LARGE_BYTES:
            oversized.append((url, size_int))
    print(f"large/unreachable originals: {len(oversized)}")
    for url, size in oversized[:5]:
        print(f"    {size // 1024}KB  {url[-60:]}")

    # `q` is REQUIRED by the optimiser, and it must be a value it has been
    # configured with. Two earlier versions of this script reported false
    # failures: one omitted `q` entirely, one passed an arbitrary `q=70` that
    # the optimiser rejects. These are the app's own values.
    # An optimiser URL must correspond to a manifest entry exactly. Earlier this
    # compared against the raw HTML substring, which matched the thumb URL's
    # prefix and so reported a false mismatch.
    print("\n--- sampling the optimiser (w=1080, q=75) ---")
    ok = bad = 0
    for url in sorted(sources)[:10]:
        proxied = (
            f"{BASE}/_next/image?url={urllib.parse.quote(url, safe='')}&w=1080&q=75"
        )
        code, ctype, size = curl(proxied)
        served = code == "200" and ctype.startswith("image/")
        ok, bad = (ok + 1, bad) if served else (ok, bad + 1)
        kb = int(size or 0) // 1024
        print(f"  {'OK ' if served else 'BAD'} {code} {ctype:12s} {kb:4d}KB  {url[-50:]}")
        time.sleep(0.5)

    print(f"\nsampled {ok + bad}: {ok} served as images, {bad} did not")

    failures = len(unknown) + len(oversized) + bad
    if failures:
        print(f"\n{failures} problem(s) found")
        return 1
    print("\nall checked images are served correctly")
    return 0


if __name__ == "__main__":
    sys.exit(main())