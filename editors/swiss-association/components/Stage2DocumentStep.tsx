import { useEffect, useState } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {
  GeneratedStage2Document,
  Stage2DocumentType,
} from "document-models/swiss-association";
import type { SwissAssociationAction } from "document-models/swiss-association";
import {
  markStage2DocumentSigned,
  setStage2DocumentMarkdown,
} from "document-models/swiss-association";
import { SectionCard } from "./SectionCard.js";

interface Stage2DocumentStepProps {
  title: string;
  description: string;
  documentType: Stage2DocumentType;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  documentState: GeneratedStage2Document | null | undefined;
  generateMarkdown: () => string;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  lockedHint?: string;
  nextRequiresSigned?: boolean;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (/^### /.test(line)) {
      html.push(`<h3>${inlineMarkdown(escapeHtml(line.slice(4)))}</h3>`);
      i++;
      continue;
    }
    if (/^## /.test(line)) {
      html.push(`<h2>${inlineMarkdown(escapeHtml(line.slice(3)))}</h2>`);
      i++;
      continue;
    }
    if (/^# /.test(line)) {
      html.push(`<h1>${inlineMarkdown(escapeHtml(line.slice(2)))}</h1>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      html.push(`<hr/>`);
      i++;
      continue;
    }

    // GFM Table
    if (/^\|/.test(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      // second row is separator (|---|---|), skip it
      const headerRow = tableLines[0];
      const bodyRows = tableLines.slice(2);
      const parseRow = (row: string) =>
        row
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());

      const headerCells = parseRow(headerRow);
      const headerHtml = headerCells
        .map((c) => `<th>${inlineMarkdown(escapeHtml(c))}</th>`)
        .join("");

      const bodyHtml = bodyRows
        .map((row) => {
          const cells = parseRow(row);
          return `<tr>${cells.map((c) => `<td>${inlineMarkdown(escapeHtml(c))}</td>`).join("")}</tr>`;
        })
        .join("");

      html.push(
        `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`,
      );
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      html.push(`<br/>`);
      i++;
      continue;
    }

    // Default paragraph
    html.push(`<p>${inlineMarkdown(escapeHtml(line))}</p>`);
    i++;
  }

  return html.join("\n");
}

function exportMarkdownAsPdf(markdown: string, title: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const safeTitle = escapeHtml(title);
  const bodyHtml = markdownToHtml(markdown);

  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${safeTitle}</title>
    <style>
      @page { margin: 2.5cm 2.8cm; }
      body {
        font-family: "Georgia", serif;
        font-size: 11pt;
        line-height: 1.65;
        color: #1a1a1a;
        max-width: 900px;
        margin: 0 auto;
        padding: 40px 0;
      }
      h1 {
        font-size: 18pt;
        font-weight: bold;
        text-align: center;
        margin: 0 0 36px 0;
        padding-bottom: 12px;
        border-bottom: 2px solid #1a1a1a;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      h2 {
        font-size: 13pt;
        font-weight: bold;
        margin: 32px 0 8px 0;
        padding-top: 16px;
        border-top: 1px solid #ccc;
      }
      h3 {
        font-size: 11pt;
        font-weight: bold;
        margin: 20px 0 6px 0;
      }
      p { margin: 6px 0; }
      hr {
        border: none;
        border-top: 1px solid #ccc;
        margin: 32px 0;
        page-break-after: avoid;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        font-size: 10pt;
      }
      th {
        background: #f0f0f0;
        font-weight: bold;
        padding: 8px 10px;
        border: 1px solid #bbb;
        text-align: left;
      }
      td {
        padding: 7px 10px;
        border: 1px solid #ccc;
        vertical-align: top;
        line-height: 1.55;
      }
      tr:nth-child(even) td { background: #fafafa; }
      strong { font-weight: bold; }
      em { font-style: italic; }

      /* Signature page */
      .sig-block {
        margin: 28px 0;
        padding: 20px 0 8px 0;
        border-top: 1px solid #ccc;
        page-break-inside: avoid;
      }

      @media print {
        h1 { page-break-after: avoid; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 400);
}

export function Stage2DocumentStep({
  title,
  description,
  documentType,
  dispatch,
  documentState,
  generateMarkdown,
  onBack,
  onNext,
  nextLabel = "Continue →",
  lockedHint,
  nextRequiresSigned = false,
}: Stage2DocumentStepProps) {
  const [generationMessage, setGenerationMessage] = useState<string | null>(
    null,
  );
  const [previewMarkdown, setPreviewMarkdown] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const isLocked = documentState?.isLocked === true;
  const isSigned = documentState?.isSigned === true;
  const markdown =
    previewMarkdown ?? documentState?.markdown ?? generateMarkdown();

  useEffect(() => {
    setPreviewMarkdown(null);
    setGenerationMessage(null);
    setShowSource(false);
  }, [documentType, documentState?.signedAt, documentState?.isLocked]);

  function handleGenerate() {
    try {
      const nextMarkdown = generateMarkdown();
      setPreviewMarkdown(nextMarkdown);

      if (isLocked) {
        setGenerationMessage(
          `Preview refreshed at ${new Date().toLocaleTimeString()} (document is locked; draft not persisted).`,
        );
        return;
      }

      dispatch(
        setStage2DocumentMarkdown({
          documentType,
          markdown: nextMarkdown,
        }),
      );
      setGenerationMessage(
        `Draft refreshed at ${new Date().toLocaleTimeString()}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown generation error";
      setGenerationMessage(`Draft generation failed: ${message}`);
    }
  }

  function handleMarkSigned() {
    if (isLocked) return;
    const markdownToPersist = previewMarkdown ?? generateMarkdown();

    if (!documentState?.markdown || previewMarkdown) {
      dispatch(
        setStage2DocumentMarkdown({
          documentType,
          markdown: markdownToPersist,
        }),
      );
    }
    dispatch(
      markStage2DocumentSigned({
        documentType,
        signedAt: new Date().toISOString(),
      }),
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <style>{`
        .stage2-contract { font-family: Georgia, "Times New Roman", serif; line-height: 1.65; }
        .stage2-contract h1, .stage2-contract h2, .stage2-contract h3, .stage2-contract h4 {
          color: #0f172a;
          line-height: 1.3;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .stage2-contract h1 { font-size: 1.4rem; }
        .stage2-contract h2 { font-size: 1.2rem; }
        .stage2-contract h3 { font-size: 1.05rem; }
        .stage2-contract p, .stage2-contract li { font-size: 0.98rem; }
        .stage2-contract p { margin: 0.35rem 0; }
        .stage2-contract ul, .stage2-contract ol { margin: 0.5rem 0 0.5rem 1.25rem; }
        .stage2-contract table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .stage2-contract th, .stage2-contract td {
          border: 1px solid #cbd5e1;
          padding: 0.45rem 0.5rem;
          vertical-align: top;
          font-size: 0.92rem;
        }
        .stage2-contract th { background: #f8fafc; font-weight: 700; }
        .stage2-contract blockquote {
          border-left: 3px solid #cbd5e1;
          padding-left: 0.75rem;
          color: #475569;
          margin: 0.75rem 0;
        }
        .stage2-contract hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.25rem 0; }
      `}</style>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      {isSigned && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-medium text-green-800">
            Signed and locked at{" "}
            {new Date(documentState?.signedAt || "").toLocaleString()}
          </p>
          {lockedHint && (
            <p className="text-xs text-green-700 mt-1">{lockedHint}</p>
          )}
        </div>
      )}

      <SectionCard title="Generated Markdown">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLocked}
              className="sw-btn-secondary"
            >
              Generate / Refresh Draft
            </button>
            <button
              type="button"
              onClick={() => setShowSource((current) => !current)}
              className="sw-btn-secondary"
            >
              {showSource ? "Show Document View" : "Show Markdown Source"}
            </button>
            <button
              type="button"
              onClick={() => exportMarkdownAsPdf(markdown, title)}
              className="sw-btn-secondary"
            >
              Export to PDF
            </button>
            <button
              type="button"
              onClick={handleMarkSigned}
              disabled={isLocked}
              className="sw-btn-primary"
            >
              Mark as Signed
            </button>
          </div>
          {generationMessage && (
            <p className="text-xs text-slate-500">{generationMessage}</p>
          )}
          {showSource ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-slate-700">
                {markdown}
              </pre>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
              <article className="stage2-contract max-w-none text-slate-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              </article>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextRequiresSigned && !isSigned}
            className="sw-btn-primary"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
