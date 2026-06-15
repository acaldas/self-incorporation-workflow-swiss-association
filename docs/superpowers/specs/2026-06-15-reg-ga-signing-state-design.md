# Reg GA Signing — Persisted State Design

## Overview

Make signing of the **Regulation of the General Assembly (Reg GA)** real, persisted document state, consistent with the other three signable documents (AoA, Founding Minutes, MPA). Today Reg GA signing lives in ephemeral local React state and is lost on reload, which is why the progress sidebar shows "Reg GA signed" as permanently pending.

The fix folds Reg GA into the existing `Stage2DocumentType` pattern rather than building a parallel mechanism — fixing the bug *and* removing the ~250 lines of duplicated UI logic that caused it.

## Context

The Swiss Association editor has four signable documents across Phases 1–2: Articles of Association, Regulation of the General Assembly, Founding Meeting Minutes, and the Multisig Participation Agreement.

- **AoA, Founding Minutes, MPA** are tracked properly. They flow through the `Stage2DocumentType` enum (`AOA | FOUNDING_MINUTES | MPA`), the `setStage2DocumentMarkdown` / `markStage2DocumentSigned` operations, and persist to state as `GeneratedStage2Document` (`markdown`, `isSigned`, `signedAt`, `isLocked`). Their editor steps are thin wrappers around the shared `Stage2DocumentStep` component.
- **Reg GA is the odd one out.** `editors/swiss-association/components/StepRegulationGA.tsx` reimplements PDF export, markdown-to-HTML rendering, and signing as local `useState(false)`. Clicking "Mark as Signed" sets a local flag that is never dispatched and is lost on reload. There is no `regGaDocument` in state and no `REG_GA` in the enum.

Confirmed gap locations:
- `editors/swiss-association/components/ProgressSidebar.tsx:49` → `{ label: "Reg GA signed", done: false }` (hardcoded pending)
- `editors/swiss-association/components/StepRegulationGA.tsx` → local `signed` state, no dispatch
- `document-models/swiss-association/v1/schema.graphql` → no `regGaDocument`, enum lacks `REG_GA`

Prior spec (`2026-06-12-progress-sidebar-redesign.md`) flagged this explicitly: "Reg GA signed — (not currently tracked in state — show as always-pending for now)".

## Approach

**Chosen: fold Reg GA into the existing `Stage2DocumentType` pattern.** Reuse the proven persistence/locking/signed-display code path that AoA, Minutes, and MPA already share. Rejected alternatives: dedicated `SetRegGaMarkdown` / `MarkRegGaSigned` operations (duplicates existing logic for no benefit), and a bare boolean flag (loses markdown/signedAt/locking, stays inconsistent).

## Design

### 1. Document model — schema

Via MCP (`SET_STATE_SCHEMA`, scope `global`), then regenerate code:

- Extend the enum: `Stage2DocumentType` → `AOA | FOUNDING_MINUTES | MPA | REG_GA`
- Add one field to `SwissAssociationState`: `regGaDocument: GeneratedStage2Document`

No new operations and no input-type changes. `SetStage2DocumentMarkdownInput` and `MarkStage2DocumentSignedInput` already carry `documentType: Stage2DocumentType!`, so they cover `REG_GA` automatically once the enum is extended.

### 2. Reducer — one new branch

Edit `document-models/swiss-association/v1/src/reducers/documents.ts` **and** mirror the change in the document model via MCP (`SET_OPERATION_REDUCER`) so future codegen carries the fix.

Extend the `getTargetDocument` helper with a `REG_GA` case routing to `state.regGaDocument`, creating a `defaultStage2Document()` if absent — identical in shape to the existing `AOA` / `FOUNDING_MINUTES` cases:

```ts
if (documentType === "REG_GA") {
  if (!state.regGaDocument) state.regGaDocument = defaultStage2Document();
  return state.regGaDocument;
}
```

The two operations route through this helper, so no operation body changes beyond the helper.

**Deliberate non-change:** `markStage2DocumentSignedOperation` sets `incorporationCompletedAt` when AoA + Minutes are signed. This condition stays as-is — Reg GA is **not** added to the "entity legally constituted" gate (matches the BPMN/prior spec where M1 = AoA + Minutes). Reg GA tracking is purely additive to the checklist.

### 3. Editor — rewrite `StepRegulationGA.tsx`

Replace the entire bespoke component with a thin wrapper around `Stage2DocumentStep`, identical in shape to `StepArticlesOfAssociation`:

```tsx
<Stage2DocumentStep
  title="Regulation of the General Assembly"
  description={/* existing review-and-sign copy */}
  documentType="REG_GA"
  dispatch={dispatch}
  documentState={state.regGaDocument}
  generateMarkdown={() => buildRegulationGAMarkdown(state)}
  onBack={onBack}
  onNext={onNext}
  nextRequiresSigned={true}
  lockedHint="The Regulation of the General Assembly is now locked and cannot be edited."
/>
```

This deletes the local `markdownToHtml`, `exportMarkdownAsPdf`, and `useState` code (~250 lines) and inherits persistence, locking, signed display, and PDF export from the shared component. The existing `buildRegulationGAMarkdown(state)` template builder is reused unchanged.

**Behavior change:** after signing, the document locks and becomes uneditable — consistent with AoA / Minutes / MPA.

### 4. Sidebar wiring

- `ProgressSidebar.tsx`: add `regGaSigned: boolean` to the `StageProgress` interface; change line 49 from `done: false` → `done: p.regGaSigned`.
- `editor.tsx`: add `regGaSigned: state.regGaDocument?.isSigned === true` to the `stageProgress` object.

## Testing

Reducers must stay ≥95% coverage on lines/branches/functions/statements. The new `REG_GA` branch in `getTargetDocument` adds coverage obligations.

Add a scenario test in `document-models/swiss-association/v1/tests/`:
- Dispatch `setStage2DocumentMarkdown({ documentType: "REG_GA", markdown })` then `markStage2DocumentSigned({ documentType: "REG_GA", signedAt })`.
- Assert `state.regGaDocument` has `isSigned === true`, the given `markdown`, the given `signedAt`, and `isLocked === true`.
- Assert that signing **only** Reg GA does **not** set `incorporationCompletedAt` (guards the deliberate non-change in §2).
- Optionally assert the lock holds: a second `setStage2DocumentMarkdown` for `REG_GA` after signing is a no-op (matches existing `isLocked` guard).

Run after changes: `npm run tsc`, `npm run lint:fix`, `npm run test:coverage`.

## Files Touched

| File | Change |
|------|--------|
| `document-models/swiss-association/v1/schema.graphql` | Regenerated: `REG_GA` enum value + `regGaDocument` state field |
| `document-models/swiss-association/v1/src/reducers/documents.ts` | New `REG_GA` branch in `getTargetDocument` |
| `editors/swiss-association/components/StepRegulationGA.tsx` | Rewrite as thin `Stage2DocumentStep` wrapper |
| `editors/swiss-association/components/ProgressSidebar.tsx` | `regGaSigned` field + wire line 49 |
| `editors/swiss-association/editor.tsx` | Add `regGaSigned` to `stageProgress` |
| `document-models/swiss-association/v1/tests/*` | New scenario test for `REG_GA` |

Plus the MCP document-model update (`SET_STATE_SCHEMA`, `SET_OPERATION_REDUCER`) that drives regeneration of `gen/`.

## Out of Scope

- Wizard step **order** (Reg GA stays step 5).
- Milestone definitions and the multisig-declined Stage 3 logic.
- Anything related to the Resolution of the General Assembly (separate future feature: needs a template and a GA-vs-board requirement decision).
