import type { SwissAssociationState } from "document-models/swiss-association";
import { SectionCard } from "./SectionCard.js";

interface Props {
  state: SwissAssociationState;
  onBack: () => void;
}

function SignedDocCard({
  title,
  markdown,
  signedAt,
}: {
  title: string;
  markdown: string | null | undefined;
  signedAt: string | null | undefined;
}) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">
        Signed at:{" "}
        {signedAt ? new Date(signedAt).toLocaleString() : "Not signed"}
      </p>
      <pre className="whitespace-pre-wrap text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-100 max-h-56 overflow-auto">
        {markdown || "(No markdown generated)"}
      </pre>
    </div>
  );
}

export function StepFinalArchive({ state, onBack }: Props) {
  const associationName = state.nameEn || state.nameDe || "Association";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Final Archive</h2>
        <p className="text-sm text-slate-500 mt-1">
          All three executed documents are displayed below as the permanent
          incorporation archive for {associationName}.
        </p>
      </div>

      <div className="p-4 bg-green-50 border border-green-300 rounded-xl">
        <p className="text-sm font-semibold text-green-900">Archive complete</p>
        <p className="text-xs text-green-800 mt-1">
          AoA, Founding Meeting Minutes, and MPA are signed and stored in the
          document state for long-term record keeping.
        </p>
      </div>

      <SectionCard title="Executed Documents">
        <div className="space-y-3">
          <SignedDocCard
            title="Articles of Association (AoA)"
            markdown={state.aoaDocument?.markdown}
            signedAt={state.aoaDocument?.signedAt}
          />
          <SignedDocCard
            title="Founding Meeting Minutes"
            markdown={state.foundingMinutesDocument?.markdown}
            signedAt={state.foundingMinutesDocument?.signedAt}
          />
          <SignedDocCard
            title="Multisig Participation Agreement (MPA)"
            markdown={state.mpaDocument?.markdown}
            signedAt={state.mpaDocument?.signedAt}
          />
        </div>
      </SectionCard>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
      </div>
    </div>
  );
}
