"""
Convert a PDF drawing set into PNG images for a project page.

Usage (from the website folder):
    pip install pymupdf
    python scripts/pdf-to-images.py "projects/my-project/drawings.pdf"
    python scripts/pdf-to-images.py "projects/my-project/drawings.pdf" --dpi 150 --pages 1,2,5-7

Images are saved next to the PDF as sheet-01.png, sheet-02.png, ...
Reference them in the project's project.md (plans, elevations, structural, mep lists).
"""

import argparse
import pathlib
import sys

try:
    import pymupdf  # PyMuPDF
except ImportError:  # older installs
    try:
        import fitz as pymupdf  # type: ignore
    except ImportError:
        sys.exit("PyMuPDF is not installed. Run:  pip install pymupdf")


def parse_pages(spec: str | None, count: int) -> list[int]:
    if not spec:
        return list(range(count))
    pages: set[int] = set()
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-")
            pages.update(range(int(a) - 1, int(b)))
        elif part:
            pages.add(int(part) - 1)
    return sorted(p for p in pages if 0 <= p < count)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf", help="Path to the PDF file")
    ap.add_argument("--dpi", type=int, default=130, help="Resolution (default 130 — sharp but web-friendly)")
    ap.add_argument("--pages", help="Pages to export, e.g. 1,3,5-8 (default: all)")
    args = ap.parse_args()

    pdf = pathlib.Path(args.pdf)
    if not pdf.exists():
        sys.exit(f"File not found: {pdf}")

    doc = pymupdf.open(pdf)
    for i in parse_pages(args.pages, doc.page_count):
        out = pdf.with_name(f"sheet-{i + 1:02d}.png")
        doc[i].get_pixmap(dpi=args.dpi).save(out)
        print(f"Saved {out}")


if __name__ == "__main__":
    main()
