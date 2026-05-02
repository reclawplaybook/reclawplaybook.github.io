#!/usr/bin/env python3
"""
Render the ReClaw Playbook v3 markdown into a branded paid-product PDF.

The source markdown lives in the product workspace, while the final PDF belongs
with the public ReClaw site assets.
"""

from pathlib import Path
import re

from markdown_it import MarkdownIt
from playwright.sync_api import sync_playwright


SOURCE_MD = Path("/home/sch98/my-openclaw/workspace/products/reclaw-playbook-v3.md")
SITE_DIR = Path("/home/sch98/reclawplaybook-site")
OUTPUT_HTML = SITE_DIR / "reclaw-playbook-v3.html"
OUTPUT_PDF = SITE_DIR / "reclaw-playbook-v3.pdf"


CSS = """
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

@page {
  size: A4;
  margin: 18mm 17mm 20mm 17mm;
  background: #0c0c0e;
}

@page:first {
  margin: 0;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #0c0c0e;
  color: #f0ede6;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1.68;
}

body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

h1,
h2,
h3,
h4,
.display,
.cover-kicker,
.price-chip {
  font-family: 'Space Grotesk', sans-serif;
}

code,
pre,
.mono,
.page-label {
  font-family: 'JetBrains Mono', monospace;
}

.cover {
  min-height: 297mm;
  width: 210mm;
  padding: 30mm 23mm 25mm;
  background:
    linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255,255,255,0.025) 1px, transparent 1px),
    radial-gradient(circle at 82% 16%, rgba(245, 158, 11, 0.34), transparent 28%),
    radial-gradient(circle at 15% 78%, rgba(34, 197, 94, 0.16), transparent 30%),
    linear-gradient(145deg, #050506 0%, #111113 50%, #0c0c0e 100%);
  background-size: 18px 18px, 18px 18px, auto, auto, auto;
  border-bottom: 1px solid rgba(245, 158, 11, 0.34);
  page-break-after: always;
  position: relative;
  overflow: hidden;
}

.cover::before {
  content: '';
  position: absolute;
  inset: 14mm;
  border: 1px solid rgba(245, 158, 11, 0.18);
  border-radius: 12px;
  pointer-events: none;
}

.cover-inner {
  position: relative;
  z-index: 1;
  max-width: 145mm;
}

.cover-kicker {
  color: #f59e0b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 24mm;
}

.cover-title {
  color: #f0ede6;
  font-size: 48px;
  line-height: 1.04;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 10mm;
}

.cover-title span {
  color: #f59e0b;
}

.cover-subtitle {
  color: #c9c5bb;
  font-size: 18px;
  line-height: 1.5;
  margin: 0 0 14mm;
  max-width: 126mm;
}

.price-chip {
  display: inline-block;
  color: #0c0c0e;
  background: #f59e0b;
  border-radius: 999px;
  padding: 7px 13px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 22mm;
}

.cover-meta {
  color: #9b9ba4;
  border-top: 1px solid rgba(245, 158, 11, 0.24);
  padding-top: 8mm;
  max-width: 118mm;
}

.cover-meta p {
  margin: 0 0 4px;
  color: #9b9ba4;
}

.cover-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin: 12mm 0 14mm;
}

.cover-stat {
  border: 1px solid rgba(245, 158, 11, 0.30);
  background: rgba(12, 12, 14, 0.76);
  border-radius: 10px;
  padding: 10px 8px;
  box-shadow: 0 14px 36px rgba(0,0,0,0.28);
}

.cover-stat strong {
  display: block;
  color: #f59e0b;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  line-height: 1;
}

.cover-stat span {
  display: block;
  color: #c9c5bb;
  font-size: 9px;
  margin-top: 5px;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.launch-strip {
  color: #0c0c0e;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: .08em;
  padding: 7px 10px;
  margin-bottom: 8mm;
  border-radius: 4px;
}

.content {
  background: #0c0c0e;
}

.content > h1:first-child,
.content > h2:first-of-type + p,
.content > h2:first-of-type {
  display: none;
}

h1 {
  color: #f0ede6;
  font-size: 30px;
  line-height: 1.14;
  font-weight: 700;
  margin: 30px 0 14px;
  page-break-after: avoid;
}

h2 {
  color: #f0ede6;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 700;
  margin: 38px 0 14px;
  padding: 0 0 9px 14px;
  border-left: 4px solid #f59e0b;
  border-bottom: 1px solid rgba(245, 158, 11, 0.18);
  page-break-after: avoid;
}

h3 {
  color: #f8f4ec;
  font-size: 17px;
  line-height: 1.32;
  font-weight: 600;
  margin: 24px 0 8px;
  page-break-after: avoid;
}

h4 {
  color: #f59e0b;
  font-size: 14px;
  font-weight: 600;
  margin: 20px 0 8px;
  page-break-after: avoid;
}

p {
  color: #d7d1c7;
  margin: 0 0 12px;
  orphans: 3;
  widows: 3;
}

a {
  color: #fbbf24;
  text-decoration: none;
}

strong {
  color: #fff8ed;
  font-weight: 700;
}

em {
  color: #b9b3aa;
}

hr {
  border: 0;
  border-top: 1px solid rgba(245, 158, 11, 0.28);
  margin: 28px 0;
}

ul,
ol {
  color: #d7d1c7;
  margin: 10px 0 14px;
  padding-left: 23px;
}

li {
  margin: 0 0 6px;
  padding-left: 2px;
}

li::marker {
  color: #f59e0b;
}

pre {
  background: #131316;
  border: 1px solid rgba(245, 158, 11, 0.24);
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  margin: 16px 0 18px;
  padding: 14px 16px;
  white-space: pre-wrap;
  page-break-inside: avoid;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.24);
}

pre code {
  color: #fde68a;
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 10.7px;
  line-height: 1.58;
  white-space: pre-wrap;
  word-break: break-word;
}

code {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.11);
  border: 1px solid rgba(245, 158, 11, 0.18);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11px;
}

blockquote {
  background: rgba(245, 158, 11, 0.09);
  border-left: 4px solid #f59e0b;
  border-radius: 0 8px 8px 0;
  margin: 18px 0;
  padding: 12px 16px;
  page-break-inside: avoid;
}

blockquote p {
  color: #f0d8ac;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 18px 0;
  font-size: 11.4px;
  page-break-inside: avoid;
  background: #131316;
  border: 1px solid rgba(245, 158, 11, 0.18);
}

th,
td {
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

th {
  color: #f59e0b;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: rgba(245, 158, 11, 0.08);
}

td {
  color: #d7d1c7;
}

tr:last-child td {
  border-bottom: 0;
}

img {
  max-width: 100%;
}

"""


def convert_md_to_html(md_text: str) -> str:
    md = MarkdownIt("commonmark").enable("table")
    return md.render(md_text)


def plain_text(html: str) -> str:
    text = re.sub(r"<[^>]+>", "", html)
    return (
        text.replace("&mdash;", "-")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .strip()
    )


def build_html(md_source: str) -> str:
    body_html = convert_md_to_html(md_source)

    h1_match = re.search(r"<h1>(.*?)</h1>", body_html, re.DOTALL)
    h2_match = re.search(r"<h2>(.*?)</h2>", body_html, re.DOTALL)

    title = plain_text(h1_match.group(1)) if h1_match else "The ReClaw Playbook v3"
    subtitle = plain_text(h2_match.group(1)) if h2_match else "The Operating Manual for Your AI Staff"

    cover = f"""
<section class="cover">
  <div class="cover-inner">
    <div class="cover-kicker">ReClaw Playbook v3</div>
    <div class="launch-strip">PRESS START • INSTALL FIRST • CUSTOMIZE SECOND</div>
    <h1 class="cover-title">Build a <span>24/7 AI Agent</span> That Remembers</h1>
    <p class="cover-subtitle">{subtitle}. One command gets the loop running. Identity files make it yours. Heartbeats keep it alive.</p>
    <div class="cover-stats">
      <div class="cover-stat"><strong>$67</strong><span>buy once</span></div>
      <div class="cover-stat"><strong>24/7</strong><span>agent loop</span></div>
      <div class="cover-stat"><strong>1 CMD</strong><span>install</span></div>
    </div>
    <div class="price-chip">Includes scaffold • PDF • videos • team templates</div>
    <div class="cover-meta">
      <p><strong>{title}</strong></p>
      <p>Website: reclawplaybook.com</p>
      <p>Written by ReClaw, a working agent — not a theory deck.</p>
    </div>
  </div>
</section>
"""

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>{CSS}</style>
</head>
<body>
  {cover}
  <main class="content">
    {body_html}
  </main>
</body>
</html>
"""


def render_pdf(html: str) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1240, "height": 1754})
        page.set_content(html, wait_until="networkidle")
        page.pdf(
            path=str(OUTPUT_PDF),
            format="A4",
            print_background=True,
            display_header_footer=True,
            header_template="<span></span>",
            footer_template="""
              <div style="width:100%;font-family:'JetBrains Mono',monospace;font-size:8px;color:#4b4b55;padding:0 17mm;display:flex;justify-content:space-between;">
                <span>ReClaw Playbook v3</span>
                <span class="pageNumber"></span>
              </div>
            """,
            margin={
                "top": "18mm",
                "right": "17mm",
                "bottom": "20mm",
                "left": "17mm",
            },
        )
        browser.close()


def main() -> None:
    md_text = SOURCE_MD.read_text(encoding="utf-8")
    html = build_html(md_text)
    OUTPUT_HTML.write_text(html, encoding="utf-8")
    render_pdf(html)
    print(f"HTML: {OUTPUT_HTML} ({OUTPUT_HTML.stat().st_size:,} bytes)")
    print(f"PDF:  {OUTPUT_PDF} ({OUTPUT_PDF.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
