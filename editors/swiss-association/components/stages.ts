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
    number: 2,
    name: "Incorporation",
    steps: [
      { number: 4, label: "Review & Sign AoA" },
      { number: 5, label: "Review & Sign Reg GA" },
      { number: 6, label: "Treasury Governance" },
      { number: 7, label: "Founding Meeting & Minutes" },
    ],
  },
  {
    number: 3,
    name: "Contract management",
    steps: [
      { number: 8, label: "Review & Sign MPA" },
      { number: 9, label: "Contributor agreements" },
    ],
  },
  {
    number: 4,
    name: "Dissolution",
    steps: [
      { number: 10, label: "Dissolution Details" },
      { number: 11, label: "Dissolution Resolution" },
    ],
  },
];

// Dissolution steps are always reachable regardless of maxStep gating.
export const DISSOLUTION_FIRST_STEP = 10;
