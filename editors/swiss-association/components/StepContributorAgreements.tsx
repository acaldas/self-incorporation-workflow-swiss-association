import { SectionCard } from "./SectionCard.js";

interface Props {
  onBack: () => void;
}

// Placeholder for the Contributor Agreements step. The agreement templates will
// be supplied later; this shell keeps the step navigable in the meantime.
export function StepContributorAgreements({ onBack }: Props) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Contributor Agreements
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Generate and execute agreements with the association's contributors.
        </p>
      </div>

      <SectionCard title="Templates">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-semibold text-amber-800 mb-1">
            Coming soon
          </p>
          <p className="text-xs text-amber-700">
            The contributor agreement templates will be added here. This step is
            a placeholder for now.
          </p>
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
