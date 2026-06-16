import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import type { SwissAssociationState } from "document-models/swiss-association";
import { Stage2DocumentStep } from "./Stage2DocumentStep.js";
import { buildMpaMarkdown } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
  onNext: () => void;
}

export function StepMultisigParticipationAgreement({
  state,
  dispatch,
  onBack,
  onNext,
}: Props) {
  return (
    <Stage2DocumentStep
      title="Multisig Participation Agreement (MPA)"
      description="Generate and execute the MPA after incorporation, with the Association as a legal signing party."
      documentType="MPA"
      dispatch={dispatch}
      documentState={state.mpaDocument}
      generateMarkdown={() => buildMpaMarkdown(state)}
      onBack={onBack}
      onNext={onNext}
      nextLabel="Continue to Final Archive →"
      lockedHint="The MPA is now locked and cannot be edited."
      nextRequiresSigned
    />
  );
}
