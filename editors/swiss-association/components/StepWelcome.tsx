import { SectionCard } from "./SectionCard.js";

interface Props {
  onNext: () => void;
  onCheckSuitability: () => void;
}

const STAGES = [
  {
    title: "Pre-Incorporation",
    description: "Enter your association's details, members, and board",
  },
  {
    title: "Founding",
    description:
      "Generate and sign your founding documents (Articles, Regulations, Minutes)",
  },
  {
    title: "Contract Management",
    description:
      "Complete agreements, counsel deliverables, and tax registration",
  },
];

const REQUIREMENTS = [
  "Names and details of founding members",
  "A board (chair + secretary)",
  "Your association's purpose and registered address",
];

export function StepWelcome({ onNext, onCheckSuitability }: Props) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Incorporate Your Swiss Association — Digitally
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          This tool guides you through creating a legally-constituted Swiss
          non-profit association (Verein), entirely online. Your documents are
          generated, signed, and stored as you go.
        </p>
      </div>

      <button
        onClick={onCheckSuitability}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100 transition-colors"
      >
        <span aria-hidden="true">🧭</span>
        Check if a Swiss association fits your needs
      </button>

      <SectionCard title="What you'll do">
        <ol className="space-y-4">
          {STAGES.map((stage, i) => (
            <li key={stage.title} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {stage.title}
                </p>
                <p className="text-sm text-slate-500">{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard title="What you'll need">
        <ul className="space-y-2">
          {REQUIREMENTS.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="flex justify-end pt-2">
        <button onClick={onNext} className="sw-btn-primary">
          Get Started →
        </button>
      </div>
    </div>
  );
}
