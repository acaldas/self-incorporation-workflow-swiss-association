import { useState } from "react";
import { generateId } from "document-model";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ContributorAgreement,
  ContributorTermType,
  SwissAssociationAction,
  SwissAssociationState,
} from "document-models/swiss-association";
import {
  addContributorAgreement,
  markContributorAgreementSigned,
  removeContributorAgreement,
  setContributorAgreementMarkdown,
} from "document-models/swiss-association";
import { SectionCard } from "./SectionCard.js";
import { ContributorAgreementForm } from "./ContributorAgreementForm.js";
import { Stage2DocumentStep } from "./Stage2DocumentStep.js";
import { buildContributorAgreementMarkdown } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
}

const TERM_LABELS: Record<ContributorTermType, string> = {
  FIXED_DATE: "Fixed date",
  ON_SOW_COMPLETION: "On SOW completion",
  NOTICE: "Notice",
};

function agreementLabel(a: ContributorAgreement): string {
  if (a.contractorIsEntity) return a.entityName || "Unnamed entity";
  return a.contractorName || "Unnamed contractor";
}

export function StepContributorAgreements({ state, dispatch, onBack }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // A document instance created before this field was added has no value for it
  // at runtime, even though the schema types it as a non-null array. Guard so
  // the list never crashes on `undefined` (the "contributorAgreements" error).
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const agreements = state.contributorAgreements ?? [];
  const selected = agreements.find((a) => a.id === selectedId) ?? null;

  function handleAdd() {
    const id = generateId();
    dispatch(
      addContributorAgreement({
        id,
        contractorIsEntity: false,
        termType: "FIXED_DATE",
      }),
    );
    setSelectedId(id);
  }

  function handleRemove(id: string) {
    dispatch(removeContributorAgreement({ id }));
    if (selectedId === id) setSelectedId(null);
  }

  // ---- Detail view for a single agreement -------------------------------
  if (selected) {
    const isSigned = selected.generatedDocument?.isSigned === true;
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {agreementLabel(selected)}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {selected.contractorIsEntity ? "Legal entity" : "Individual"} ·{" "}
              {TERM_LABELS[selected.termType]}
              {isSigned ? " · Signed" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="sw-btn-secondary"
          >
            ← Back to list
          </button>
        </div>

        {isSigned && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
            This agreement has been signed and locked. Its details can no longer
            be edited.
          </div>
        )}

        <ContributorAgreementForm
          key={selected.id}
          agreement={selected}
          dispatch={dispatch}
          disabled={isSigned}
        />

        <Stage2DocumentStep
          key={`doc-${selected.id}`}
          title="Contributor Agreement Document"
          description="Generate the agreement from the details above, review it, then mark it signed to lock it."
          dispatch={dispatch}
          documentState={selected.generatedDocument}
          generateMarkdown={() =>
            buildContributorAgreementMarkdown(selected, state)
          }
          onBack={() => setSelectedId(null)}
          lockedHint="This contributor agreement is now locked and cannot be edited."
          persistMarkdown={(markdown) =>
            dispatch(
              setContributorAgreementMarkdown({ id: selected.id, markdown }),
            )
          }
          markSigned={(signedAt) =>
            dispatch(
              markContributorAgreementSigned({ id: selected.id, signedAt }),
            )
          }
        />
      </div>
    );
  }

  // ---- List view ---------------------------------------------------------
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Contributor Agreements
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Engage contributors under an independent-contractor agreement. Add one
          agreement per contributor — each is generated and signed on its own.
        </p>
      </div>

      <SectionCard title="Agreements">
        {agreements.length === 0 ? (
          <p className="text-sm text-slate-500">
            No contributor agreements yet. Add one to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {agreements.map((a) => {
              const isSigned = a.generatedDocument?.isSigned === true;
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {agreementLabel(a)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {a.contractorIsEntity ? "Legal entity" : "Individual"} ·{" "}
                      {TERM_LABELS[a.termType]}
                      {isSigned ? " · Signed" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isSigned && (
                      <span className="text-[10px] bg-green-500 text-white px-1.5 py-px rounded-full font-semibold">
                        Signed
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className="sw-btn-secondary"
                    >
                      {isSigned ? "View" : "Open"}
                    </button>
                    {!isSigned && (
                      <button
                        type="button"
                        onClick={() => handleRemove(a.id)}
                        className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleAdd}
          className="sw-btn-primary mt-4"
        >
          + Add contributor agreement
        </button>
      </SectionCard>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
      </div>
    </div>
  );
}
