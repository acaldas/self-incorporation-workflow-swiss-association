// Single source of truth for the wizard's stage/step structure.
// Step 0 (Welcome) is intentionally NOT listed here — it is an intro screen,
// not a navigable workflow step.

export interface StageStep {
  number: number;
  label: string;
}

export interface StageDef {
  number: number;
  name: string;
  steps: StageStep[];
}

// Stages are grouped to mirror the capability-flow diagram. Step NUMBERS are
// deliberately preserved (no renumbering) even though the grouping moves step 6
// (Multisig Setup) out of Incorporation and after step 7 — the visible numbers
// may run out of order across stages, and that is expected.
export const STAGES: StageDef[] = [
  {
    number: 1,
    name: "Pre-Incorporation",
    steps: [
      { number: 1, label: "Association Details" },
      { number: 2, label: "Member Registry" },
      { number: 3, label: "Board Setup" },
    ],
  },
  {
    // Completing this stage = "Exists as a legal person" — a shell entity that
    // stops here is COMPLETE. Step 6 (treasury) is intentionally NOT here.
    number: 2,
    name: "Incorporation",
    steps: [
      { number: 4, label: "Review & Sign AoA" },
      { number: 5, label: "Review & Sign Reg GA" },
      { number: 7, label: "Founding Meeting & Minutes" },
    ],
  },
  {
    // Capability "Can hold & move money" — defined by the multisig (step 6).
    // The MPA (step 8) is additive/optional within the stage; it does not gate
    // the capability.
    number: 3,
    name: "Treasury & Governance",
    steps: [
      { number: 6, label: "Multisig Setup" },
      { number: 8, label: "Review & Sign MPA" },
    ],
  },
  {
    // Capability "Can contract people". The contributor agreement (step 9) is
    // not built yet — the stage exists but its step is pending.
    number: 4,
    name: "Supplier & Contributor Management",
    steps: [{ number: 9, label: "Contributor agreements" }],
  },
  {
    number: 5,
    name: "Dissolution",
    steps: [
      { number: 10, label: "Dissolution Details" },
      { number: 11, label: "Dissolution Resolution" },
    ],
  },
];

// Dissolution steps are always reachable regardless of maxStep gating.
export const DISSOLUTION_FIRST_STEP = 10;
