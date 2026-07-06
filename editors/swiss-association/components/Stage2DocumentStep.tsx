import { useEffect, useState } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
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
import {
  LEGAL_DOC_CSS,
  markdownToHtml,
  openPrintWindow,
} from "./documentRender.js";

interface Stage2DocumentStepProps {
  title: string;
  description: string;
  // Singleton documents identify themselves by type; collection items (e.g.
  // contributor agreements) instead inject `persistMarkdown` / `markSigned`.
  documentType?: Stage2DocumentType;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  documentState: GeneratedStage2Document | null | undefined;
  generateMarkdown: () => string;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  lockedHint?: string;
  nextRequiresSigned?: boolean;
  // Optional overrides for persistence — when provided they take precedence
  // over the documentType-based dispatch (used by collection items keyed by id).
  persistMarkdown?: (markdown: string) => void;
  markSigned?: (signedAt: string) => void;
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
  persistMarkdown,
  markSigned,
}: Stage2DocumentStepProps) {
  // Persist/sign via the injected callbacks when present, otherwise fall back to
  // the singleton documentType-based dispatch.
  function persist(markdown: string) {
    if (persistMarkdown) {
      persistMarkdown(markdown);
    } else if (documentType) {
      dispatch(setStage2DocumentMarkdown({ documentType, markdown }));
    }
  }
  function sign(signedAt: string) {
    if (markSigned) {
      markSigned(signedAt);
    } else if (documentType) {
      dispatch(markStage2DocumentSigned({ documentType, signedAt }));
    }
  }
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

      persist(nextMarkdown);
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
      persist(markdownToPersist);
    }
    sign(new Date().toISOString());
  }

  return (
    <div className="max-w-3xl space-y-6">
      <style>{LEGAL_DOC_CSS}</style>
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
              onClick={() => openPrintWindow(markdown, title)}
              className="sw-btn-secondary"
            >
              Download PDF
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
              <div
                className="legal-doc max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
              />
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
