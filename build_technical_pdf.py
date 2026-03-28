from pathlib import Path
import re
import textwrap


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "GenreWhisper_Technical_Brief.md"
OUTPUT = ROOT / "GenreWhisper_Technical_Brief.pdf"


PAGE_WIDTH = 595
PAGE_HEIGHT = 842
LEFT = 54
TOP = 64
BOTTOM = 52
FONT_SIZE = 11
LINE_HEIGHT = 15
MAX_TEXT_WIDTH = 82


def escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def normalize_markdown(md: str) -> list[str]:
    lines = []
    for raw in md.splitlines():
        line = raw.rstrip()
        if line.startswith("# "):
            lines.append("")
            lines.append(line[2:].upper())
            lines.append("")
            continue
        if line.startswith("## "):
            lines.append("")
            lines.append(line[3:].upper())
            lines.append("")
            continue
        if line.startswith("### "):
            lines.append("")
            lines.append(line[4:])
            lines.append("")
            continue
        if line.startswith("- "):
            wrapped = textwrap.wrap("• " + line[2:], width=MAX_TEXT_WIDTH)
            lines.extend(wrapped or ["•"])
            continue
        if not line:
            lines.append("")
            continue
        clean = re.sub(r"`([^`]+)`", r"\1", line)
        clean = clean.replace("**", "")
        clean = clean.replace("*", "")
        wrapped = textwrap.wrap(clean, width=MAX_TEXT_WIDTH)
        lines.extend(wrapped or [""])
    return lines


def build_pages(lines: list[str]) -> list[list[str]]:
    usable_height = PAGE_HEIGHT - TOP - BOTTOM
    lines_per_page = usable_height // LINE_HEIGHT
    pages = []
    current = []
    for line in lines:
        if len(current) >= lines_per_page:
            pages.append(current)
            current = []
        current.append(line)
    if current:
        pages.append(current)
    return pages


def page_stream(lines: list[str]) -> bytes:
    y = PAGE_HEIGHT - TOP
    ops = ["BT", f"/F1 {FONT_SIZE} Tf", f"{LEFT} {y} Td"]
    first = True
    for line in lines:
        if first:
            ops.append(f"({escape_pdf_text(line)}) Tj")
            first = False
        else:
            ops.append(f"0 -{LINE_HEIGHT} Td")
            ops.append(f"({escape_pdf_text(line)}) Tj")
    ops.append("ET")
    data = "\n".join(ops).encode("latin-1", errors="replace")
    return data


def make_pdf(pages: list[list[str]], output: Path) -> None:
    objects = []

    def add_object(data: bytes) -> int:
        objects.append(data)
        return len(objects)

    font_id = add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    page_ids = []
    content_ids = []

    for lines in pages:
        stream = page_stream(lines)
        content = (
            f"<< /Length {len(stream)} >>\nstream\n".encode("latin-1")
            + stream
            + b"\nendstream"
        )
        content_id = add_object(content)
        content_ids.append(content_id)
        page_ids.append(None)

    pages_placeholder_id = add_object(b"<< >>")

    for idx, content_id in enumerate(content_ids):
        page_obj = (
            f"<< /Type /Page /Parent {pages_placeholder_id} 0 R "
            f"/MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            f"/Resources << /Font << /F1 {font_id} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        ).encode("latin-1")
        page_ids[idx] = add_object(page_obj)

    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    pages_obj = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("latin-1")
    objects[pages_placeholder_id - 1] = pages_obj

    catalog_id = add_object(f"<< /Type /Catalog /Pages {pages_placeholder_id} 0 R >>".encode("latin-1"))

    pdf = bytearray()
    pdf.extend(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]

    for idx, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{idx} 0 obj\n".encode("latin-1"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_pos = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))

    trailer = (
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
        f"startxref\n{xref_pos}\n%%EOF"
    )
    pdf.extend(trailer.encode("latin-1"))
    output.write_bytes(pdf)


if __name__ == "__main__":
    markdown_text = SOURCE.read_text(encoding="utf-8")
    lines = normalize_markdown(markdown_text)
    pages = build_pages(lines)
    make_pdf(pages, OUTPUT)
    print(f"Wrote {OUTPUT} with {len(pages)} pages.")
