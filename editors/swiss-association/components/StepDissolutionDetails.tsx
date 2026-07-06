import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SwissAssociationState } from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import { setDissolutionDetails } from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";
import { DISSOLUTION_PROCEDURE_MEMO } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
  onNext: () => void;
}

const FORM_OPTIONS = [
  { value: "PHYSICAL", label: "Physical" },
  { value: "VIRTUAL", label: "Virtual" },
  { value: "WRITTEN", label: "Written (Urabstimmung)" },
] as const;

type FormValue = (typeof FORM_OPTIONS)[number]["value"];

export function StepDissolutionDetails({
  state,
  dispatch,
  onBack,
  onNext,
}: Props) {
  const d = state.dissolution;
  const defaultExecuting = state.members.map((m) => m.name).join(", ");

  const [dissolutionDate, setDissolutionDate] = useState(
    d?.dissolutionDate ? d.dissolutionDate.slice(0, 10) : "",
  );
  const [resolutionForm, setResolutionForm] = useState<FormValue>(
    (d?.resolutionForm ?? "WRITTEN") as FormValue,
  );
  const [assetRecipient, setAssetRecipient] = useState(d?.assetRecipient ?? "");
  const [executingPersons, setExecutingPersons] = useState(
    d?.executingPersons ?? defaultExecuting,
  );
  const [remainingAssetsSummary, setRemainingAssetsSummary] = useState(
    d?.remainingAssetsSummary ?? "",
  );
  const [showProcedure, setShowProcedure] = useState(false);

  function handleSave() {
    dispatch(
      setDissolutionDetails({
        // Date scalar validates via z.iso.datetime(); the date input emits
        // "YYYY-MM-DD", so widen it to a full ISO datetime before dispatch.
        dissolutionDate: dissolutionDate
          ? `${dissolutionDate}T00:00:00.000Z`
          : undefined,
        resolutionForm,
        assetRecipient: assetRecipient || undefined,
        executingPersons: executingPersons || undefined,
        remainingAssetsSummary: remainingAssetsSummary || undefined,
      }),
    );
    onNext();
  }

  const isValid = dissolutionDate.trim() !== "" && assetRecipient.trim() !== "";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Dissolution Details
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Capture the liquidation and asset-distribution details. These populate
          the General Assembly dissolution resolution in the next step.
        </p>
      </div>

      <SectionCard title="Resolution">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Dissolution Date" required>
            <input
              type="date"
              value={dissolutionDate}
              onChange={(e) => setDissolutionDate(e.target.value)}
              className="sw-input"
            />
          </FormField>
          <FormField label="Resolution Form">
            <select
              value={resolutionForm}
              onChange={(e) => setResolutionForm(e.target.value as FormValue)}
              className="sw-input"
            >
              {FORM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Liquidation & Assets">
        <FormField
          label="Executing Persons"
          hint="Who executes the liquidation (members / multisig signers)."
        >
          <input
            type="text"
            value={executingPersons}
            onChange={(e) => setExecutingPersons(e.target.value)}
            placeholder="e.g. Alice Müller, Bob Weber"
            className="sw-input"
          />
        </FormField>
        <FormField
          label="Asset Recipient"
          required
          hint="Remaining assets go to a similar-purpose entity — never to members."
        >
          <input
            type="text"
            value={assetRecipient}
            onChange={(e) => setAssetRecipient(e.target.value)}
            placeholder="e.g. Another tax-exempt non-profit with a similar purpose"
            className="sw-input"
          />
        </FormField>
        <FormField label="Remaining Assets Summary" hint="Optional.">
          <textarea
            value={remainingAssetsSummary}
            onChange={(e) => setRemainingAssetsSummary(e.target.value)}
            rows={3}
            placeholder="e.g. CHF 0 after all transfers; wallets emptied."
            className="sw-input resize-none"
          />
        </FormField>
      </SectionCard>

      <div className="border border-slate-200 rounded-xl bg-white">
        <button
          type="button"
          onClick={() => setShowProcedure((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700"
        >
          <span>Dissolution &amp; Liquidation Procedure (reference)</span>
          <span className="text-slate-400">{showProcedure ? "▲" : "▼"}</span>
        </button>
        {showProcedure && (
          <div className="px-4 pb-4 prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {DISSOLUTION_PROCEDURE_MEMO}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {!isValid && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          Please provide the dissolution date and asset recipient before
          continuing.
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid}
          className="sw-btn-primary"
        >
          Save &amp; Continue →
        </button>
      </div>
    </div>
  );
}
