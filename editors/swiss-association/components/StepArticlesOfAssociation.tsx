import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import type { SwissAssociationState } from "document-models/swiss-association";
import { Stage2DocumentStep } from "./Stage2DocumentStep.js";
import { buildAoaMarkdown } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
  onNext: () => void;
}

export function StepArticlesOfAssociation({
  state,
  dispatch,
  onBack,
  onNext,
}: Props) {
  return (
    <Stage2DocumentStep
      title="Articles of Association (AoA)"
      description="Now you are going to assemble the Articles of Association, the main governing document of your new entity. The template has been populated with the data you inputted in the previous steps. Please review the template and sign if you agree. The AoA has to be signed by all board members."
      documentType="AOA"
      dispatch={dispatch}
      documentState={state.aoaDocument}
      generateMarkdown={() => buildAoaMarkdown(state)}
      onBack={onBack}
      onNext={onNext}
      nextLabel="Continue to Founding Minutes →"
      nextRequiresSigned={true}
      lockedHint="The AoA is now locked and cannot be edited."
    />
  );
}
