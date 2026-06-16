import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import type { SwissAssociationState } from "document-models/swiss-association";
import { Stage2DocumentStep } from "./Stage2DocumentStep.js";
import { buildFoundingMinutesMarkdown } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
  onNext?: () => void;
  onOpenAoa?: () => void;
}

export function StepFoundingMeetingMinutes({
  state,
  dispatch,
  onBack,
  onNext,
  onOpenAoa,
}: Props) {
  return (
    <div className="space-y-6">
      <Stage2DocumentStep
        title="Founding Meeting Minutes"
        description="Review and execute the Founding Meeting Minutes document generated from Stage 1 records."
        documentType="FOUNDING_MINUTES"
        dispatch={dispatch}
        documentState={state.foundingMinutesDocument}
        generateMarkdown={() => buildFoundingMinutesMarkdown(state)}
        onBack={onBack}
        onNext={onNext}
        nextLabel="Check Incorporation Milestone →"
        lockedHint="The Founding Meeting Minutes are now locked and cannot be edited."
      />

      {state.aoaDocument?.isSigned &&
        state.foundingMinutesDocument?.isSigned && (
          <div className="max-w-3xl p-5 bg-green-50 border border-green-300 rounded-xl">
            <p className="text-base font-semibold text-green-900">
              🎉 The Association {state.nameEn || state.nameDe || "Association"}{" "}
              is now officially incorporated.
            </p>
            <p className="text-sm text-green-800 mt-1">
              Both the Articles of Association and Founding Meeting Minutes have
              been executed.
            </p>
            <ul className="mt-3 text-sm text-green-800 list-disc list-inside">
              <li>Executed document: Articles of Association</li>
              <li>Executed document: Founding Meeting Minutes</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {onOpenAoa && (
                <button onClick={onOpenAoa} className="sw-btn-secondary">
                  Open Executed Articles of Association
                </button>
              )}
              <button className="sw-btn-secondary" disabled>
                Viewing Executed Founding Meeting Minutes
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
