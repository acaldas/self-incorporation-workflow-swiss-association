# Dissolution Phase — Design

## Overview

Add a fourth lifecycle phase, **Dissolution**, to the Swiss Association workflow. Scope is "core resolution + summary": capture the liquidation/asset-distribution details, show the end-to-end procedure as read-only guidance, and generate one signable **General Assembly dissolution resolution** document. This is the entity's end-of-life branch, distinct from the one-time incorporation flow.

Legal basis: Swiss Civil Code Art. 76–79 ZGB (dissolution by resolution of the General Assembly), the Articles of Association, and the Regulation GA. For a tax-exempt non-profit, remaining assets go to a similar-purpose entity, never to members.

## Context

The workflow today has three user-facing stages and nine wizard steps. Signable documents use one shared pattern: the `Stage2DocumentType` enum keys a `GeneratedStage2Document` in state, manipulated by `setStage2DocumentMarkdown` / `markStage2DocumentSigned`, rendered by the shared `Stage2DocumentStep` component. Detail-capture steps use `SectionCard` + `FormField` forms that dispatch a single "set details" operation. The left nav (`WizardLayout`) groups steps under stage headers; the right `ProgressSidebar` renders one card per stage. This design follows all of those existing patterns.

The user supplied the template content (a Part I procedure memo and a Part II GA resolution). Part II becomes the real signable template; Part I becomes read-only guidance.

## Decisions (from brainstorming)

- **Depth**: core resolution + summary (not a full liquidation machine).
- **Placement**: new Stage 4 "Dissolution", **always reachable** — steps 10–11 are navigable regardless of incorporation progress; steps 1–9 keep their current gating.
- **Template**: authored from the user-provided Part II text (no placeholder needed).

## Data model (document-model state)

Add to the global state schema:

```graphql
enum DissolutionResolutionForm {
  PHYSICAL
  VIRTUAL
  WRITTEN
}

type Dissolution {
  dissolutionDate: Date
  resolutionForm: DissolutionResolutionForm
  assetRecipient: String
  executingPersons: String
  remainingAssetsSummary: String
}
```

Extend `SwissAssociationState` with:

```graphql
  dissolution: Dissolution
  dissolutionResolutionDocument: GeneratedStage2Document
```

Extend the existing enum:

```graphql
enum Stage2DocumentType {
  AOA
  FOUNDING_MINUTES
  MPA
  REG_GA
  DISSOLUTION_RESOLUTION
}
```

All new fields are optional (an empty document must remain valid). Initial value adds `"dissolution": null` and `"dissolutionResolutionDocument": null`.

## Operations (document-model)

**One new operation**, in a new `dissolution` module:

- `SET_DISSOLUTION_DETAILS` — input mirrors the `Dissolution` fields. The state `DissolutionResolutionForm` enum is referenced directly in the input (enums are not re-mirrored).

```graphql
input SetDissolutionDetailsInput {
  dissolutionDate: Date
  resolutionForm: DissolutionResolutionForm
  assetRecipient: String
  executingPersons: String
  remainingAssetsSummary: String
}
```

Reducer: initialize `state.dissolution` if absent, then assign each provided field (truthy check per field so partial updates are allowed; falsy-but-valid not a concern here since all fields are strings/date/enum).

**No new document operations.** The resolution reuses `setStage2DocumentMarkdown` / `markStage2DocumentSigned` keyed by `DISSOLUTION_RESOLUTION`. The shared `getTargetDocument` helper (in `src/reducers/documents.ts`) gets one new branch returning `state.dissolutionResolutionDocument`, placed before the `mpaDocument` fallback — identical in shape to the `REG_GA` branch. The MCP-stored inline-ternary reducers for both operations get the matching `DISSOLUTION_RESOLUTION` branch (kept in sync with `src/`, per the established two-representation rule).

The `incorporationCompletedAt` logic is untouched — dissolution does not affect it.

## Template & content

- **Part II → `OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md`**, authored from the user's text, with tokens: `[Association Name]`, `[Date]`, `[Form]`, `[Insert recipient]`, and a signature block. Wired via a new `buildDissolutionResolutionMarkdown(state)` in `stage2Templates.ts` (`?raw` import + `applyReplacements`, same as the other builders). The signature block is generated from `state.members` (the executing members/signers), like the existing roster helpers.
- **Part I → a read-only "Dissolution & Liquidation Procedure" reference**, stored as a constant markdown string (`DISSOLUTION_PROCEDURE_MEMO`) and rendered collapsed on the details step. Not signable.

## Editor

- **Step 10 — `StepDissolutionDetails`** (new component): a `SectionCard`/`FormField` form for the five `Dissolution` fields → dispatches `SET_DISSOLUTION_DETAILS`. Includes the collapsible Part I procedure reference. `resolutionForm` is a select (Physical / Virtual / Written).
- **Step 11 — `StepDissolutionResolution`** (new component): a thin `Stage2DocumentStep` wrapper, `documentType="DISSOLUTION_RESOLUTION"`, `documentState={state.dissolutionResolutionDocument}`, `generateMarkdown={() => buildDissolutionResolutionMarkdown(state)}`, `nextRequiresSigned` omitted (it's the last step; "Back" only, like Final Archive has no forward).
- **`editor.tsx`**: render `case 10` and `case 11`; the existing steps 1–9 renumber nothing (archive stays 9). Dissolution steps come after. Gating: introduce `const DISSOLUTION_FIRST_STEP = 10`; a step is navigable when `step <= maxStep || step >= DISSOLUTION_FIRST_STEP`. The real `maxStep` logic for 1–9 is unchanged. (The uncommitted `DEV_UNLOCK_ALL_STEPS` shim is independent and not relied upon.)
- **`WizardLayout`**: add steps 10–11 to the nav step list and a **Stage 4 "Dissolution"** group header; mark a step locked only when `step.number > maxStep && step.number < DISSOLUTION_FIRST_STEP` (so 10–11 are never locked).
- **`ProgressSidebar`**: add a Stage 4 "Dissolution" card. `StageProgress` gains `dissolutionDetailsDone` and `dissolutionSigned`. Tasks: "Dissolution details set" (`dissolutionDetailsDone`) and "Resolution signed" (`dissolutionSigned`). Milestone "Entity dissolved" reached when `dissolutionSigned`.
- **`editor.tsx` stageProgress**: `dissolutionDetailsDone = !!(state.dissolution?.dissolutionDate && state.dissolution?.assetRecipient)`, `dissolutionSigned = state.dissolutionResolutionDocument?.isSigned === true`.

## Testing

Reducer tests (keep new branches covered; pre-existing global coverage gate is deferred debt and not in scope):
- `SET_DISSOLUTION_DETAILS` sets the `dissolution` object; partial update preserves prior fields.
- `DISSOLUTION_RESOLUTION` routing: `setStage2DocumentMarkdown` + `markStage2DocumentSigned` persist to `state.dissolutionResolutionDocument` (signed, locked, markdown), and do **not** leak into `mpaDocument` or set `incorporationCompletedAt`.

## Files touched

| File | Change |
|------|--------|
| document model (MCP) | enum value, `Dissolution` type + `DissolutionResolutionForm` enum, two state fields, initial value, `SET_DISSOLUTION_DETAILS` op, reducer branches |
| `document-models/swiss-association/v1/schema.graphql` + `gen/**` | regenerated |
| `document-models/swiss-association/v1/src/reducers/documents.ts` | `DISSOLUTION_RESOLUTION` branch |
| `document-models/swiss-association/v1/src/reducers/dissolution.ts` | new reducer file for `SET_DISSOLUTION_DETAILS` |
| `document-models/swiss-association/v1/tests/*` | new tests |
| `OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md` | new template (Part II) |
| `editors/swiss-association/components/stage2Templates.ts` | `buildDissolutionResolutionMarkdown` + `DISSOLUTION_PROCEDURE_MEMO` |
| `editors/swiss-association/components/StepDissolutionDetails.tsx` | new |
| `editors/swiss-association/components/StepDissolutionResolution.tsx` | new |
| `editors/swiss-association/components/ProgressSidebar.tsx` | Stage 4 card + `StageProgress` fields |
| `editors/swiss-association/components/WizardLayout.tsx` | steps 10–11 + Stage 4 group + gating tweak |
| `editors/swiss-association/editor.tsx` | render cases 10–11, gating constant, stageProgress fields |

## Out of scope

- Full liquidation machinery: creditor/debt settlement tracking, transaction-hash capture, multi-liquidator workflows, final liquidation accounts as a separate signable document.
- Automated registry filing / tax-authority notification.
- Adding a `phases[]` record for dissolution (the legacy `StepWorkflowStatus` stays as-is).
- Final Archive (step 9) is not modified here (it keeps its current three-document display; including the dissolution resolution there is a possible later follow-up).
