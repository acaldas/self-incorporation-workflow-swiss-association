import type { ReactNode } from "react";
import { ProgressSidebar } from "./ProgressSidebar.js";
import type { StageProgress } from "./ProgressSidebar.js";

const STEPS = [
  { number: 1, label: "Association Details" },
  { number: 2, label: "Member Registry" },
  { number: 3, label: "Board Setup" },
  { number: 4, label: "Review & Sign AoA" },
  { number: 5, label: "Review & Sign Reg GA" },
  { number: 6, label: "Treasury Governance" },
  { number: 7, label: "Founding Meeting & Minutes" },
  { number: 8, label: "Review & Sign MPA" },
  { number: 9, label: "Final Archive" },
];

interface WizardLayoutProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  maxStep: number;
  children: ReactNode;
  stageProgress?: StageProgress;
}

export function WizardLayout({
  currentStep,
  onStepClick,
  maxStep,
  children,
  stageProgress,
}: WizardLayoutProps) {
  return (
    <div className="swiss-wizard min-h-screen bg-slate-50">
      {/* Header */}
      <div className="swiss-wizard-header bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 1H9.5V6.5H15V9.5H9.5V15H6.5V9.5H1V6.5H6.5V1Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">
              Self Incorporation Flow
            </h1>
            <p className="text-xs text-slate-500">
              Non-profit Verein · Art. 60–79 ZGB
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar stepper — keep exactly as-is */}
        <nav className="swiss-wizard-nav w-56 min-h-[calc(100vh-73px)] bg-white border-r border-slate-200 pt-6 px-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
            Incorporation Steps
          </p>
          <ol className="space-y-1">
            {STEPS.map((step) => {
              const isActive = step.number === currentStep;
              const isDone = step.number < currentStep;
              const isLocked = step.number > maxStep;
              return (
                <li key={step.number}>
                  <button
                    onClick={() => onStepClick(step.number)}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-red-50 text-red-700"
                        : isLocked
                          ? "text-slate-300 cursor-not-allowed"
                          : isDone
                            ? "text-slate-600 hover:bg-slate-50"
                            : "text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        isActive
                          ? "bg-red-600 text-white"
                          : isLocked
                            ? "bg-slate-100 text-slate-300"
                            : isDone
                              ? "bg-green-500 text-white"
                              : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isDone ? (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M1.5 5L4 7.5L8.5 2.5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </span>
                    <span className="text-sm font-medium">{step.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>

        {/* Progress sidebar */}
        {stageProgress && <ProgressSidebar progress={stageProgress} />}
      </div>
    </div>
  );
}
