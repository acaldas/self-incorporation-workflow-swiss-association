# Progress Sidebar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the right sidebar progress tracker with a 3-stage stacked progress card design featuring milestone markers and a collapsible panel, and rename the flow to "Self Incorporation Flow."

**Architecture:** Extract the right sidebar into a new `ProgressSidebar` component with its own stage/milestone computation logic. Wire it into `WizardLayout` via props. The sidebar reads from `SwissAssociationState` to derive stage completion and milestone status — no document model changes needed.

**Tech Stack:** React 19, TypeScript (nodenext), Tailwind CSS classes + inline styles (matching existing editor pattern)

---

## File Structure

| File | Role |
|------|------|
| `editors/swiss-association/components/ProgressSidebar.tsx` | **New.** Self-contained progress sidebar: stage cards, milestone cards, collapse toggle, floating pill. All visual logic lives here. |
| `editors/swiss-association/editor.tsx` | **Modify.** Compute stage/milestone data from document state, pass to WizardLayout. Replace old `progress` object with new `stageProgress` shape. |
| `editors/swiss-association/components/WizardLayout.tsx` | **Modify.** Remove old right sidebar (`<aside>` + `StatusRow`). Import and render `ProgressSidebar`. Update header title text. Accept new props shape. |

---

### Task 1: Create ProgressSidebar component with stage cards

**Files:**
- Create: `editors/swiss-association/components/ProgressSidebar.tsx`

- [ ] **Step 1: Create the types and stage data structure**

In `editors/swiss-association/components/ProgressSidebar.tsx`, define the component's types and the static stage definitions:

```tsx
import { useState } from "react";

interface TaskItem {
  label: string;
  done: boolean;
}

interface MilestoneData {
  title: string;
  reached: boolean;
}

interface StageData {
  number: number;
  name: string;
  tasks: TaskItem[];
  milestone?: MilestoneData;
}

export interface StageProgress {
  detailsDone: boolean;
  membersDone: boolean;
  boardDone: boolean;
  aoaSigned: boolean;
  meetingRolesDone: boolean;
  minutesSigned: boolean;
  multisigConfigured: boolean;
  mpaSigned: boolean;
  hasMultisig: boolean;
}

function buildStages(p: StageProgress): StageData[] {
  const stage1: StageData = {
    number: 1,
    name: "Pre-Incorporation",
    tasks: [
      { label: "Association details", done: p.detailsDone },
      { label: "Member registry", done: p.membersDone },
      { label: "Board setup", done: p.boardDone },
    ],
  };

  const stage2: StageData = {
    number: 2,
    name: "Incorporation",
    tasks: [
      { label: "AoA signed", done: p.aoaSigned },
      { label: "Meeting roles set", done: p.meetingRolesDone },
      { label: "Reg GA signed", done: false },
      { label: "Minutes signed", done: p.minutesSigned },
    ],
    milestone: {
      title: "Entity legally constituted",
      reached: p.aoaSigned && p.minutesSigned,
    },
  };

  const m1Reached = p.aoaSigned && p.minutesSigned;

  if (!p.hasMultisig && m1Reached) {
    return [
      stage1,
      stage2,
      {
        number: 3,
        name: "Post-Incorporation",
        tasks: [{ label: "No multisig needed", done: true }],
        milestone: {
          title: "Entity enabled to pay and get paid",
          reached: true,
        },
      },
    ];
  }

  const stage3: StageData = {
    number: 3,
    name: "Post-Incorporation",
    tasks: [
      { label: "Multisig configured", done: p.multisigConfigured },
      { label: "MPA signed", done: p.mpaSigned },
    ],
    milestone: {
      title: "Entity enabled to pay and get paid",
      reached: m1Reached && p.mpaSigned,
    },
  };

  return [stage1, stage2, stage3];
}
```

- [ ] **Step 2: Build the StageCard sub-component**

Add below the `buildStages` function in the same file:

```tsx
function CheckIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path
        d="M2 5L4 7.5L8 2.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StageCard({
  stage,
  status,
}: {
  stage: StageData;
  status: "done" | "active" | "locked";
}) {
  const completedCount = stage.tasks.filter((t) => t.done).length;
  const totalCount = stage.tasks.length;
  const fraction = totalCount > 0 ? completedCount / totalCount : 0;

  const bg =
    status === "done"
      ? "bg-green-50 border-green-200"
      : status === "active"
        ? "bg-red-50 border-red-200"
        : "bg-slate-50 border-slate-200";

  return (
    <div
      className={`border rounded-xl p-2.5 ${bg} ${status === "locked" ? "opacity-50" : ""}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
              status === "done"
                ? "bg-green-500 text-white"
                : status === "active"
                  ? "bg-red-600 text-white"
                  : "bg-slate-200 text-slate-400"
            }`}
          >
            {status === "done" ? <CheckIcon /> : stage.number}
          </div>
          <span
            className={`text-[11px] font-semibold ${
              status === "done"
                ? "text-green-800"
                : status === "active"
                  ? "text-red-800"
                  : "text-slate-400"
            }`}
          >
            {stage.name}
          </span>
        </div>
        {status === "done" ? (
          <span className="text-[9px] bg-green-500 text-white px-1.5 py-px rounded-full font-semibold">
            Done
          </span>
        ) : (
          <span
            className={`text-[9px] font-semibold ${status === "active" ? "text-red-600" : "text-slate-300"}`}
          >
            {completedCount} / {totalCount}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {status !== "done" && (
        <div
          className={`h-[3px] rounded-full overflow-hidden ${status === "active" ? "bg-red-100" : "bg-slate-200"}`}
        >
          <div
            className={`h-full rounded-full ${status === "active" ? "bg-red-600" : ""}`}
            style={{ width: `${fraction * 100}%` }}
          />
        </div>
      )}

      {/* Task list — only for active stage */}
      {status === "active" && (
        <div className="mt-2 flex flex-col gap-[3px]">
          {stage.tasks.map((task) => (
            <div key={task.label} className="flex items-center gap-1.5">
              {task.done ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="flex-shrink-0"
                >
                  <path
                    d="M2 5L4 7.5L8 2.5"
                    stroke="#22c55e"
                    strokeWidth="1.3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full border-[1.5px] border-slate-300 flex-shrink-0 mx-[1px]" />
              )}
              <span
                className={`text-[10px] ${task.done ? "text-slate-400 line-through" : "text-slate-900"}`}
              >
                {task.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Milestone */}
      {stage.milestone && (
        <MilestoneCard
          milestone={stage.milestone}
          dimmed={status === "locked"}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build the MilestoneCard sub-component**

Add above `StageCard` in the same file:

```tsx
function MilestoneCard({
  milestone,
  dimmed,
}: {
  milestone: MilestoneData;
  dimmed: boolean;
}) {
  return (
    <div
      className="mt-2.5 rounded-lg px-2 py-1.5 flex items-center gap-1.5"
      style={{
        background: "#fefbf0",
        border: milestone.reached
          ? "1.5px solid #d4a92a"
          : "1px solid #e8dba8",
        boxShadow: milestone.reached
          ? "0 0 8px rgba(212, 169, 42, 0.15)"
          : "none",
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <span className="text-sm">★</span>
      <div>
        <div
          style={{
            fontSize: "9px",
            fontWeight: milestone.reached ? 700 : 600,
            color: milestone.reached ? "#8a6d1b" : "#b8b0a0",
            letterSpacing: "0.3px",
          }}
        >
          {milestone.reached ? "MILESTONE REACHED" : "MILESTONE"}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: milestone.reached ? "#6b5212" : "#b8b0a0",
            fontWeight: milestone.reached ? 500 : 400,
          }}
        >
          {milestone.title}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build the main ProgressSidebar export**

Add at the bottom of the file:

```tsx
export function ProgressSidebar({ progress }: { progress: StageProgress }) {
  const [collapsed, setCollapsed] = useState(false);
  const stages = buildStages(progress);

  const allTasks = stages.flatMap((s) => s.tasks);
  const completed = allTasks.filter((t) => t.done).length;
  const total = allTasks.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  function getStageStatus(
    stage: StageData,
    index: number,
  ): "done" | "active" | "locked" {
    const allDone = stage.tasks.every((t) => t.done);
    if (allDone) return "done";
    const prevAllDone =
      index === 0 || stages[index - 1].tasks.every((t) => t.done);
    if (prevAllDone) return "active";
    return "locked";
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-20 right-4 z-10 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <div className="flex gap-0.5">
          {stages.map((s) => {
            const st = getStageStatus(s, s.number - 1);
            return (
              <div
                key={s.number}
                className="w-1.5 h-1.5 rounded-sm"
                style={{
                  background:
                    st === "done"
                      ? "#22c55e"
                      : st === "active"
                        ? "#dc2626"
                        : "#e2e8f0",
                }}
              />
            );
          })}
        </div>
        <span className="text-[9px] font-semibold text-slate-500">
          {Math.round(pct)}%
        </span>
        <span className="text-[10px] text-slate-400">◀</span>
      </button>
    );
  }

  return (
    <aside className="swiss-wizard-status w-52 min-h-[calc(100vh-73px)] bg-white border-l border-slate-200 pt-4 px-3 flex-shrink-0">
      {/* Collapse toggle */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setCollapsed(true)}
          className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 text-[10px]"
        >
          ▶
        </button>
      </div>

      {/* Overall header */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Self Incorporation Flow
          </span>
          <span className="text-[11px] font-semibold text-slate-900">
            {completed} / {total}
          </span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background:
                pct >= 100
                  ? "#22c55e"
                  : `linear-gradient(90deg, #22c55e ${Math.max(0, pct - 15)}%, #dc2626 100%)`,
            }}
          />
        </div>
      </div>

      {/* Stage cards */}
      <div className="flex flex-col gap-2">
        {stages.map((stage, i) => (
          <StageCard
            key={stage.number}
            stage={stage}
            status={getStageStatus(stage, i)}
          />
        ))}
      </div>
    </aside>
  );
}
```

- [ ] **Step 5: Verify the file compiles**

Run: `npm run tsc`
Expected: No new errors from `ProgressSidebar.tsx` (the component is not yet imported anywhere, so it just needs to type-check in isolation).

- [ ] **Step 6: Commit**

```bash
git add editors/swiss-association/components/ProgressSidebar.tsx
git commit -m "feat: add ProgressSidebar component with 3-stage cards and milestones"
```

---

### Task 2: Wire ProgressSidebar into WizardLayout

**Files:**
- Modify: `editors/swiss-association/components/WizardLayout.tsx`

- [ ] **Step 1: Replace the old right sidebar and types**

Remove the `ProgressData` interface, the `StatusRow` component, and the `progress` prop. Import `ProgressSidebar` and `StageProgress`. Replace the `<aside>` block with the new component.

The full updated file:

```tsx
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
        {/* Sidebar stepper */}
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run tsc`
Expected: Errors in `editor.tsx` because it still passes the old `progress` prop. That's expected — we fix it in Task 3.

- [ ] **Step 3: Commit**

```bash
git add editors/swiss-association/components/WizardLayout.tsx
git commit -m "feat: replace old progress sidebar with ProgressSidebar component in WizardLayout"
```

---

### Task 3: Update editor.tsx to compute stage progress

**Files:**
- Modify: `editors/swiss-association/editor.tsx`

- [ ] **Step 1: Replace the progress computation and prop**

Replace the old `progress` object and the `progress={progress}` prop with the new `stageProgress` shape. The full updated file:

```tsx
import { useState } from "react";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import {
  actions,
  useSelectedSwissAssociationDocument,
} from "document-models/swiss-association";
import { WizardLayout } from "./components/WizardLayout.js";
import { StepAssociationDetails } from "./components/StepAssociationDetails.js";
import { StepMemberRegistry } from "./components/StepMemberRegistry.js";
import { StepBoardSetup } from "./components/StepBoardSetup.js";
import { StepFoundingMeeting } from "./components/StepFoundingMeeting.js";
import { StepMultisigConfig } from "./components/StepMultisigConfig.js";
import { StepArticlesOfAssociation } from "./components/StepArticlesOfAssociation.js";
import { StepMultisigParticipationAgreement } from "./components/StepMultisigParticipationAgreement.js";
import { StepFinalArchive } from "./components/StepFinalArchive.js";
import { StepRegulationGA } from "./components/StepRegulationGA.js";
import type { StageProgress } from "./components/ProgressSidebar.js";

export default function Editor() {
  const [document, dispatch] = useSelectedSwissAssociationDocument();
  const [currentStep, setCurrentStep] = useState(1);

  if (!document || !dispatch) {
    return (
      <div style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>
        Select a SwissAssociation document to open this editor.
      </div>
    );
  }

  const state = document.state.global;
  const safeDispatch = dispatch;
  const phaseAComplete =
    state.aoaDocument?.isSigned === true &&
    state.foundingMinutesDocument?.isSigned === true;
  const mpaSigned = state.mpaDocument?.isSigned === true;

  const maxStep = !state.stage2Started
    ? 7
    : phaseAComplete
      ? mpaSigned
        ? 9
        : 8
      : 7;

  const stageProgress: StageProgress = {
    detailsDone: !!(
      state.nameEn &&
      state.seatCity &&
      state.registeredAddress &&
      state.purposeEn
    ),
    membersDone: (state.members?.length ?? 0) >= 2,
    boardDone: (state.boardMembers?.length ?? 0) >= 1,
    aoaSigned: state.aoaDocument?.isSigned === true,
    meetingRolesDone: !!(state.chairName && state.secretaryName),
    minutesSigned: state.foundingMinutesDocument?.isSigned === true,
    multisigConfigured: !!state.multisig,
    mpaSigned: state.mpaDocument?.isSigned === true,
    hasMultisig: !!state.multisig,
  };

  function handleStepClick(step: number) {
    if (step <= maxStep) {
      setCurrentStep(step);
    }
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <StepAssociationDetails
            state={state}
            dispatch={safeDispatch}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <StepMemberRegistry
            state={state}
            dispatch={safeDispatch}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <StepBoardSetup
            state={state}
            dispatch={safeDispatch}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <StepArticlesOfAssociation
            state={state}
            dispatch={safeDispatch}
            onBack={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
          />
        );
      case 5:
        return (
          <StepRegulationGA
            state={state}
            dispatch={safeDispatch}
            onBack={() => setCurrentStep(4)}
            onNext={() => setCurrentStep(6)}
          />
        );
      case 6:
        return (
          <StepMultisigConfig
            state={state}
            dispatch={safeDispatch}
            onNext={() => setCurrentStep(7)}
            onBack={() => setCurrentStep(5)}
          />
        );
      case 7:
        return (
          <StepFoundingMeeting
            state={state}
            dispatch={safeDispatch}
            onNext={() => {
              if (!state.stage2Started) {
                safeDispatch(
                  actions.startStage_2({ startedAt: new Date().toISOString() }),
                );
              }
              setCurrentStep(8);
            }}
            onBack={() => setCurrentStep(6)}
            onOpenAoa={() => setCurrentStep(4)}
          />
        );
      case 8:
        return (
          <StepMultisigParticipationAgreement
            state={state}
            dispatch={safeDispatch}
            onBack={() => setCurrentStep(7)}
            onNext={() => setCurrentStep(9)}
          />
        );
      case 9:
        return (
          <StepFinalArchive state={state} onBack={() => setCurrentStep(8)} />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <DocumentToolbar />
      <style>{`
        .sw-input {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #0f172a;
          background-color: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .sw-input:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
        .sw-input::placeholder {
          color: #94a3b8;
        }
        select.sw-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
        }
        .sw-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #fff;
          background-color: #dc2626;
          border: 1px solid #dc2626;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .sw-btn-primary:hover:not(:disabled) {
          background-color: #b91c1c;
        }
        .sw-btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .sw-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          background-color: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .sw-btn-secondary:hover {
          background-color: #f8fafc;
        }
      `}</style>
      <WizardLayout
        currentStep={currentStep}
        onStepClick={handleStepClick}
        maxStep={maxStep}
        stageProgress={stageProgress}
      >
        {renderStep()}
      </WizardLayout>
    </>
  );
}
```

- [ ] **Step 2: Verify everything compiles**

Run: `npm run tsc`
Expected: 0 errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint:fix`
Expected: 0 errors (warnings are acceptable).

- [ ] **Step 4: Run tests**

Run: `npm run test`
Expected: All 23 existing tests pass (no reducer changes were made).

- [ ] **Step 5: Commit**

```bash
git add editors/swiss-association/editor.tsx
git commit -m "feat: wire stageProgress into editor and WizardLayout"
```

---

### Task 4: Visual verification in browser

**Files:** None (manual testing)

- [ ] **Step 1: Start Vetra**

Run: `npx ph-cli vetra`
Open: `http://localhost:3002/`

- [ ] **Step 2: Create or open a SwissAssociation document**

In Connect, navigate to the Vetra drive. Create a new SwissAssociation document (or open an existing one).

- [ ] **Step 3: Verify the sidebar renders**

Check that:
- The right sidebar shows "SELF INCORPORATION FLOW" header with "0 / X" counter
- Three stage cards are visible: Pre-Incorporation (active), Incorporation (locked), Post-Incorporation (locked)
- Stage 1 shows task checkmarks (Association details, Member registry, Board setup)
- Stage 2 shows the M1 milestone card (dimmed)
- Stage 3 shows the M2 milestone card (dimmed)

- [ ] **Step 4: Verify the header title**

Check that the top header bar reads "Self Incorporation Flow" (not "Swiss Association Incorporation").

- [ ] **Step 5: Verify the collapse toggle**

Click the ▶ chevron in the sidebar — sidebar should disappear and a floating pill button should appear top-right with colored dots and percentage. Click the pill to re-expand.

- [ ] **Step 6: Test stage progression**

Fill in association details (name, seat, address, purpose), add 2 members, set up board → Stage 1 should show "Done" (green, collapsed), Stage 2 should become active with task checkmarks.

- [ ] **Step 7: Commit (if any fixes needed)**

If visual testing revealed fixes, commit them:
```bash
git add -p
git commit -m "fix: visual adjustments from browser testing"
```
