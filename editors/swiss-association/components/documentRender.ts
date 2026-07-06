// Shared "modern-clean legal" rendering for every generated document.
//
// One markdown→HTML converter + one stylesheet are used for BOTH the on-screen
// preview and the print-to-PDF window, so what you see is what prints. Serif
// display face for the title/headings, humanist sans for body, generous
// whitespace, indented clauses, and print page-break control (signature blocks
// never split; schedules/signature pages start on a fresh page).

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Inline emphasis only (bold / italic). Runs after escaping, so user-entered
// content (names, addresses) can never inject markup.
function inlineMd(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function renderTable(tableLines: string[]): string {
  const parseRow = (row: string) =>
    row
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
  const header = parseRow(tableLines[0]);
  const bodyRows = tableLines.slice(2); // row 1 is the |---|---| separator
  const headHtml = header.map((c) => `<th>${inlineMd(c)}</th>`).join("");
  const bodyHtml = bodyRows
    .map(
      (row) =>
        `<tr>${parseRow(row)
          .map((c) => `<td>${inlineMd(c)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  return `<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

interface ListItem {
  indent: number;
  ordered: boolean;
  content: string;
}

const LIST_RE = /^(\s*)([*+-]|\d+\.)\s+(.*)$/;

// Build (possibly nested) <ul>/<ol> from consecutive list lines, by indentation.
function renderList(lines: string[], start: number): [string, number] {
  const items: ListItem[] = [];
  let i = start;
  while (i < lines.length) {
    const m = LIST_RE.exec(lines[i]);
    if (!m) {
      // Tolerate a single blank line between items.
      if (lines[i].trim() === "" && LIST_RE.test(lines[i + 1] ?? "")) {
        i++;
        continue;
      }
      break;
    }
    items.push({
      indent: m[1].length,
      ordered: /\d/.test(m[2]),
      content: m[3],
    });
    i++;
  }

  let idx = 0;
  function build(indent: number): string {
    const tag = items[idx].ordered ? "ol" : "ul";
    let html = `<${tag}>`;
    while (idx < items.length && items[idx].indent >= indent) {
      if (items[idx].indent > indent) {
        const nested = build(items[idx].indent);
        html = html.replace(/<\/li>$/, `${nested}</li>`);
      } else {
        html += `<li>${inlineMd(items[idx].content)}</li>`;
        idx++;
      }
    }
    return `${html}</${tag}>`;
  }
  return [build(items[0].indent), i];
}

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Signature-block wrappers (emitted by buildSignatureSection) — kept intact
    // as page-break-protected containers.
    if (trimmed === "<!-- SIG -->") {
      out.push('<div class="sig-block">');
      i++;
      continue;
    }
    if (trimmed === "<!-- /SIG -->") {
      out.push("</div>");
      i++;
      continue;
    }
    // Any other stray HTML comment (leftover marker) is dropped.
    if (/^<!--.*-->$/.test(trimmed)) {
      i++;
      continue;
    }

    if (trimmed === "") {
      i++;
      continue;
    }

    let m: RegExpExecArray | null;
    if ((m = /^####\s+(.*)$/.exec(trimmed))) {
      out.push(`<h4>${inlineMd(m[1])}</h4>`);
      i++;
      continue;
    }
    if ((m = /^###\s+(.*)$/.exec(trimmed))) {
      out.push(`<h3>${inlineMd(m[1])}</h3>`);
      i++;
      continue;
    }
    if ((m = /^##\s+(.*)$/.exec(trimmed))) {
      // Major boundaries (schedules, the signature page) start a new page.
      const cls = /^(Schedule|Signatures|List of Schedules)\b/i.test(m[1])
        ? ' class="section-break"'
        : "";
      out.push(`<h2${cls}>${inlineMd(m[1])}</h2>`);
      i++;
      continue;
    }
    if ((m = /^#\s+(.*)$/.exec(trimmed))) {
      out.push(`<h1>${inlineMd(m[1])}</h1>`);
      i++;
      continue;
    }

    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      out.push("<hr/>");
      i++;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(inlineMd(lines[i].trim().replace(/^>\s?/, "")));
        i++;
      }
      out.push(`<blockquote>${buf.join("<br/>")}</blockquote>`);
      continue;
    }

    if (/^\s*\|/.test(line)) {
      const tbl: string[] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        tbl.push(lines[i].trim());
        i++;
      }
      out.push(renderTable(tbl));
      continue;
    }

    if (LIST_RE.test(line)) {
      const [html, next] = renderList(lines, i);
      out.push(html);
      i = next;
      continue;
    }

    out.push(`<p>${inlineMd(trimmed)}</p>`);
    i++;
  }

  return out.join("\n");
}

// The single shared stylesheet. Scoped under `.legal-doc` so it can live inside
// the editor without leaking, and reused verbatim in the print window.
export const LEGAL_DOC_CSS = `
.legal-doc {
  --serif: Georgia, "Charter", "Times New Roman", serif;
  --sans: system-ui, -apple-system, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
  font-family: var(--sans);
  font-size: 11pt;
  line-height: 1.7;
  color: #1a1a1a;
  text-align: left;
}
.legal-doc h1 {
  font-family: var(--serif);
  font-size: 20pt;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.02em;
  margin: 0 0 1.75rem 0;
  padding-bottom: 0.6rem;
  border-bottom: 2px solid #1a1a1a;
  line-height: 1.25;
}
.legal-doc h2 {
  font-family: var(--serif);
  font-size: 13.5pt;
  font-weight: 700;
  margin: 1.9rem 0 0.6rem 0;
  padding-top: 0.9rem;
  border-top: 1px solid #d8d8d8;
  line-height: 1.3;
}
.legal-doc h3 {
  font-family: var(--serif);
  font-size: 11.5pt;
  font-weight: 700;
  margin: 1.2rem 0 0.4rem 0;
}
.legal-doc h4 {
  font-family: var(--serif);
  font-size: 11pt;
  font-weight: 700;
  margin: 1rem 0 0.3rem 0;
}
.legal-doc p { margin: 0.55rem 0; }
.legal-doc strong { font-weight: 700; }
.legal-doc em { font-style: italic; }
.legal-doc ul, .legal-doc ol {
  margin: 0.55rem 0;
  padding-left: 1.9rem;
}
.legal-doc li { margin: 0.3rem 0; padding-left: 0.2rem; }
.legal-doc ul ul, .legal-doc ol ol, .legal-doc ul ol, .legal-doc ol ul {
  margin: 0.25rem 0;
}
.legal-doc blockquote {
  border-left: 3px solid #cbd5e1;
  margin: 0.9rem 0;
  padding: 0.2rem 0 0.2rem 0.9rem;
  color: #475569;
  font-size: 0.95em;
}
.legal-doc hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1.4rem 0;
}
.legal-doc table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.96em;
}
.legal-doc th, .legal-doc td {
  border: 1px solid #cbd5e1;
  padding: 0.5rem 0.6rem;
  vertical-align: top;
  text-align: left;
}
.legal-doc th { background: #f4f4f5; font-weight: 700; }
.legal-doc tr { break-inside: avoid; page-break-inside: avoid; }

/* Signature blocks: never split a signer across a page break. */
.legal-doc .sig-block {
  break-inside: avoid;
  page-break-inside: avoid;
  margin: 1.1rem 0;
  padding-top: 0.9rem;
  border-top: 1px solid #d8d8d8;
}
.legal-doc .sig-block p { margin: 0.3rem 0; }

@media print {
  @page { margin: 2.4cm 2.6cm; }
  .legal-doc { font-size: 11pt; }
  .legal-doc h1 { page-break-after: avoid; }
  .legal-doc h2, .legal-doc h3, .legal-doc h4 { page-break-after: avoid; }
  .legal-doc h2.section-break { page-break-before: always; }
  .legal-doc table { page-break-inside: auto; }
}
`;

// Open a print window with the styled document and trigger the browser's
// print-to-PDF. No server pipeline, no jsPDF.
export function openPrintWindow(markdown: string, title: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const bodyHtml = markdownToHtml(markdown);
  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${escapeHtml(title)}</title>
    <style>${LEGAL_DOC_CSS}
      body { margin: 0; background: #fff; }
      .legal-doc { max-width: 820px; margin: 0 auto; padding: 32px 0; }
    </style>
  </head>
  <body>
    <div class="legal-doc">${bodyHtml}</div>
  </body>
</html>`);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 400);
}
