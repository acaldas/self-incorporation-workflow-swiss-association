import { useState } from "react";
import type { SwissAssociationState } from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import { setMeetingRoles } from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";
import { Stage2DocumentStep } from "./Stage2DocumentStep.js";
import { buildFoundingMinutesMarkdown } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onNext: () => void;
  onBack: () => void;
  onOpenAoa?: () => void;
}

export function StepFoundingMeeting({
  state,
  dispatch,
  onNext,
  onBack,
  onOpenAoa,
}: Props) {
  const [chairName, setChairName] = useState(state.chairName ?? "");
  const [secretaryName, setSecretaryName] = useState(state.secretaryName ?? "");
  const [rolesSaved, setRolesSaved] = useState(
    !!(state.chairName && state.secretaryName),
  );

  function handleSaveRoles() {
    dispatch(
      setMeetingRoles({
        chairName,
        chairRole: state.chairRole ?? "Chair",
        secretaryName,
        secretaryRole: state.secretaryRole ?? "Secretary",
      }),
    );
    setRolesSaved(true);
  }

  const isValid = chairName.trim() !== "" && secretaryName.trim() !== "";
  const phaseAComplete =
    state.aoaDocument?.isSigned === true &&
    state.foundingMinutesDocument?.isSigned === true;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Founding Meeting
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Now it is the moment to conduct the Founding Meeting, the initial
          meeting where a Swiss Association is formally created. The founding
          meeting must include at least two founding members who agree to
          establish the association.
        </p>
      </div>

      <SectionCard title="Meeting Roles">
        <div className="space-y-4">
          <FormField label="Who is chair?" required>
            <input
              type="text"
              value={chairName}
              onChange={(e) => setChairName(e.target.value)}
              placeholder="Full legal name"
              className="sw-input"
            />
          </FormField>
          <FormField label="Who is secretary?" required>
            <input
              type="text"
              value={secretaryName}
              onChange={(e) => setSecretaryName(e.target.value)}
              placeholder="Full legal name"
              className="sw-input"
            />
          </FormField>
        </div>
        <div className="mt-4 flex gap-3">
          {!rolesSaved && (
            <button onClick={onBack} className="sw-btn-secondary">
              ← Back
            </button>
          )}
          <button
            onClick={handleSaveRoles}
            disabled={!isValid}
            className="sw-btn-primary"
          >
            {rolesSaved ? "Update Roles" : "Save Roles & Review Minutes →"}
          </button>
        </div>
      </SectionCard>

      {rolesSaved && (
        <>
          {phaseAComplete && (
            <div className="p-5 bg-green-50 border border-green-300 rounded-xl">
              <p className="text-base font-semibold text-green-900">
                The Association {state.nameEn || state.nameDe || "Association"}{" "}
                is now officially incorporated.
              </p>
              <p className="text-sm text-green-800 mt-1">
                Both the Articles of Association and Founding Meeting Minutes
                have been executed.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {onOpenAoa && (
                  <button onClick={onOpenAoa} className="sw-btn-secondary">
                    Open Executed Articles of Association
                  </button>
                )}
              </div>
            </div>
          )}

          <Stage2DocumentStep
            title="Founding Meeting Minutes"
            description="Review the Founding Meeting Minutes generated from the data you provided. Sign to confirm the official record of the founding."
            documentType="FOUNDING_MINUTES"
            dispatch={dispatch}
            documentState={state.foundingMinutesDocument}
            generateMarkdown={() => buildFoundingMinutesMarkdown(state)}
            onBack={onBack}
            onNext={onNext}
            nextLabel="Continue to Workflow Status →"
            nextRequiresSigned={true}
            lockedHint="The Founding Meeting Minutes are now locked and cannot be edited."
          />
        </>
      )}
    </div>
  );
}
