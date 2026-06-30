import { useState } from "react";
import { STAGES, DISSOLUTION_FIRST_STEP } from "./stages.js";
import type { StageDef } from "./stages.js";

interface MilestoneData {
  title: string;
  reached: boolean;
}

export interface StageProgress {
  detailsDone: boolean;
  membersDone: boolean;
  boardDone: boolean;
  aoaSigned: boolean;
  regGaSigned: boolean;
  meetingRolesDone: boolean;
  minutesSigned: boolean;
  multisigConfigured: boolean;
  mpaSigned: boolean;
  dissolutionDetailsDone: boolean;
  dissolutionSigned: boolean;
  hasMultisig: boolean;
}

// Maps a navigable step number to its "done" condition, derived from state.
// The MPA step (8) is satisfied either by signing it or — when no multisig is
// used — once the entity is constituted (matching the old "no multisig needed"
// completion). Final Archive (9) has no completion action of its own; it is
// done once the post-incorporation milestone (payments enabled) is reached.
function isStepDone(step: number, p: StageProgress): boolean {
  const constituted = p.aoaSigned && p.minutesSigned;
  const postIncorpDone = constituted && (p.mpaSigned || !p.hasMultisig);
  switch (step) {
    case 1:
      return p.detailsDone;
    case 2:
      return p.membersDone;
    case 3:
      return p.boardDone;
    case 4:
      return p.aoaSigned;
    case 5:
      return p.regGaSigned;
    case 6:
      return p.multisigConfigured;
    case 7:
      return p.minutesSigned;
    case 8:
      return p.mpaSigned || (!p.hasMultisig && constituted);
    case 9:
      return postIncorpDone;
    case 10:
      return p.dissolutionDetailsDone;
    case 11:
      return p.dissolutionSigned;
    default:
      return false;
  }
}

function stageMilestone(
  stageNumber: number,
  p: StageProgress,
): MilestoneData | undefined {
  const constituted = p.aoaSigned && p.minutesSigned;
  switch (stageNumber) {
    case 2:
      return { title: "Entity legally constituted", reached: constituted };
    case 3:
      return {
        title: "Entity enabled to pay and get paid",
        reached: constituted && (p.mpaSigned || !p.hasMultisig),
      };
    case 4:
      return { title: "Entity dissolved", reached: p.dissolutionSigned };
    default:
      return undefined;
  }
}

function stageAllDone(stage: StageDef, p: StageProgress): boolean {
  return stage.steps.every((s) => isStepDone(s.number, p));
}

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
        border: milestone.reached ? "1.5px solid #d4a92a" : "1px solid #e8dba8",
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

interface StepRowProps {
  number: number;
  label: string;
  done: boolean;
  active: boolean;
  locked: boolean;
  onClick: () => void;
}

function StepRow({
  number,
  label,
  done,
  active,
  locked,
  onClick,
}: StepRowProps) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
        active
          ? "bg-red-50"
          : locked
            ? "cursor-not-allowed"
            : "hover:bg-slate-50"
      }`}
    >
      <span
        className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 ${
          active
            ? "bg-red-600 text-white"
            : done
              ? "bg-green-500 text-white"
              : locked
                ? "bg-slate-100 text-slate-400"
                : "bg-slate-200 text-slate-500"
        }`}
      >
        {done && !active ? <CheckIcon size={9} /> : number}
      </span>
      <span
        className={`text-[11px] ${
          active
            ? "text-red-700 font-semibold"
            : locked
              ? "text-slate-400"
              : done
                ? "text-slate-500"
                : "text-slate-700"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function StageCard({
  stage,
  status,
  progress,
  currentStep,
  maxStep,
  onStepClick,
}: {
  stage: StageDef;
  status: "done" | "active" | "locked";
  progress: StageProgress;
  currentStep: number;
  maxStep: number;
  onStepClick: (step: number) => void;
}) {
  const completedCount = stage.steps.filter((s) =>
    isStepDone(s.number, progress),
  ).length;
  const totalCount = stage.steps.length;
  const fraction = totalCount > 0 ? completedCount / totalCount : 0;
  const milestone = stageMilestone(stage.number, progress);

  const bg =
    status === "done"
      ? "bg-green-50 border-green-200"
      : status === "active"
        ? "bg-red-50 border-red-200"
        : "bg-slate-50 border-slate-200";

  return (
    <div className={`border rounded-xl p-2.5 ${bg}`}>
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
            className={`h-full rounded-full ${status === "active" ? "bg-red-600" : "bg-slate-300"}`}
            style={{ width: `${fraction * 100}%` }}
          />
        </div>
      )}

      {/* Step navigation rows — shown for every stage */}
      <div className="mt-2 flex flex-col gap-0.5">
        {stage.steps.map((step) => {
          const locked =
            step.number > maxStep && step.number < DISSOLUTION_FIRST_STEP;
          return (
            <StepRow
              key={step.number}
              number={step.number}
              label={step.label}
              done={isStepDone(step.number, progress)}
              active={step.number === currentStep}
              locked={locked}
              onClick={() => onStepClick(step.number)}
            />
          );
        })}
      </div>

      {/* Milestone */}
      {milestone && (
        <MilestoneCard milestone={milestone} dimmed={status === "locked"} />
      )}
    </div>
  );
}

interface ProgressSidebarProps {
  progress: StageProgress;
  currentStep: number;
  maxStep: number;
  onStepClick: (step: number) => void;
}

export function ProgressSidebar({
  progress,
  currentStep,
  maxStep,
  onStepClick,
}: ProgressSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Overall progress counts steps across the incorporation stages (1–3).
  const incorporationSteps = STAGES.filter((s) => s.number <= 3).flatMap(
    (s) => s.steps,
  );
  const completed = incorporationSteps.filter((s) =>
    isStepDone(s.number, progress),
  ).length;
  const total = incorporationSteps.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  function getStageStatus(
    stage: StageDef,
    index: number,
  ): "done" | "active" | "locked" {
    if (stageAllDone(stage, progress)) return "done";
    if (stage.number === 4) return "active";
    const prevAllDone =
      index === 0 || stageAllDone(STAGES[index - 1], progress);
    return prevAllDone ? "active" : "locked";
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-20 right-4 z-10 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <div className="flex gap-0.5">
          {STAGES.map((s, i) => {
            const st = getStageStatus(s, i);
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
    <aside className="swiss-wizard-status w-56 min-h-[calc(100vh-73px)] bg-white border-l border-slate-200 pt-4 px-3 flex-shrink-0">
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
        {STAGES.map((stage, i) => (
          <StageCard
            key={stage.number}
            stage={stage}
            status={getStageStatus(stage, i)}
            progress={progress}
            currentStep={currentStep}
            maxStep={maxStep}
            onStepClick={onStepClick}
          />
        ))}
      </div>
    </aside>
  );
}
