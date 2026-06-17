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
