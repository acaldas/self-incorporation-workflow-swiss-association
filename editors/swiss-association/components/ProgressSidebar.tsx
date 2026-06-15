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
  regGaSigned: boolean;
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
      { label: "Reg GA signed", done: p.regGaSigned },
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
          {stages.map((s, i) => {
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
