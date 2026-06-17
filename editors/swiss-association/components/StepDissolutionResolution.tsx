import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import type { SwissAssociationState } from "document-models/swiss-association";
import { Stage2DocumentStep } from "./Stage2DocumentStep.js";
import { buildDissolutionResolutionMarkdown } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
}

export function StepDissolutionResolution({ state, dispatch, onBack }: Props) {
  const detailsDone = !!(
    state.dissolution?.dissolutionDate && state.dissolution?.assetRecipient
  );
  const alreadySigned = state.dissolutionResolutionDocument?.isSigned === true;

  // Step 11 is always reachable, so guard against generating/signing a
  // resolution before the dissolution details (date + asset recipient) exist —
  // otherwise the document would carry an unresolved "[Insert recipient]".
  if (!detailsDone && !alreadySigned) {
    return (
      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Dissolution Resolution
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate and sign the General Assembly resolution dissolving the
            association.
          </p>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-medium text-amber-800">
            Complete the dissolution details first
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Set the dissolution date and asset recipient on the previous step
            before generating the resolution.
          </p>
        </div>
        <div className="flex justify-start pt-2">
          <button type="button" onClick={onBack} className="sw-btn-secondary">
            ← Back to details
          </button>
        </div>
      </div>
    );
  }

  return (
    <Stage2DocumentStep
      title="Dissolution Resolution"
      description="Generate and sign the General Assembly resolution dissolving the association and approving the liquidation and asset allocation."
      documentType="DISSOLUTION_RESOLUTION"
      dispatch={dispatch}
      documentState={state.dissolutionResolutionDocument}
      generateMarkdown={() => buildDissolutionResolutionMarkdown(state)}
      onBack={onBack}
      lockedHint="The dissolution resolution is now locked and cannot be edited."
    />
  );
}
