# Dissolution Documents Upgrade — Design

## Overview

Replace the existing Stage 4 (Dissolution) procedure memo and GA resolution template with stronger, AoA-grounded versions produced for an association incorporated under our AoA template. The new resolution captures more structured input (dissolution ground, intended use of assets, registered-vs-unregistered status, named liquidators with roles), so this is a **full-capture** integration: extend the data model and form, not a text swap.

This builds directly on the already-shipped dissolution phase (`Dissolution` state, `dissolution` module, `SET_DISSOLUTION_DETAILS`, `DISSOLUTION_RESOLUTION` document routing, Steps 10–11, Stage 4 nav/sidebar). It modifies that phase; it does not re-create it.

Source documents (provided by the user, authored by another assistant instance):
- `~/Downloads/files/dissolution_resolution_template.md` — the signable Part II GA resolution.
- `~/Downloads/files/dissolution_memo.md` — the read-only Part I procedure guide.

## Context

The current dissolution resolution template (`OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md`) is six thin, generic sections. The current procedure reference is the `DISSOLUTION_PROCEDURE_MEMO` string constant in `editors/swiss-association/components/stage2Templates.ts`. State captures five fields: `dissolutionDate`, `resolutionForm` (PHYSICAL/VIRTUAL/WRITTEN), `assetRecipient`, `executingPersons` (free text), `remainingAssetsSummary`.

The new documents are materially better: they cross-reference the AoA and ZGB, state the dissolution ground explicitly, designate named liquidators tied to the multisig signers, **gate asset transfer on cantonal tax-authority recognition obtained before transfer**, add a discharge (Entlastung) section, and branch on whether the association is entered in the Commercial Register.

## AoA cross-reference verification (done during brainstorming)

Verified the new docs' citations against the actual AoA template (`_[TEMPLATE] default AoA OH _ standard  - .docx.md`). Finding: **the AoA only numbers two articles — Membership (4.1–4.4) and General Assembly (6.1–6.4). All other articles are named, unnumbered headings.**

- ✅ **Real, keep as-is:** §4.4 (End of Membership), §6.1 (Powers/discharge), §6.2 (meeting forms / Urabstimmung), §6.4 (Indemnification).
- ❌ **Invented numbers, must fix:** §5 Bodies, §8 Finance, §10 Auditor, §11 Dissolution, §14 Language. Those articles exist by name but carry **no number** in the AoA. There is no §11 at all (Dissolution is the 10th heading sequentially, but the AoA never prints the number).

**Correction rule:** for every unnumbered article, cite it **by name** ("the *Dissolution and Liquidation* article of the AoA", "the *Bodies* article (Personalunion)", "the *Finance* article", "the *Auditor* article", "the *Language* article — English version prevails"). Keep the four real sub-number citations. Apply this to both the resolution template and the memo. The substance of every reference is correct against the AoA; only the numeric labels change.

## Data model

Extend the existing global state (`SET_STATE_SCHEMA`). Add a value to the existing enum, add one enum and one object type, extend the `Dissolution` type:

```graphql
enum DissolutionResolutionForm { PHYSICAL  VIRTUAL  MIXED  WRITTEN }   # MIXED added

enum DissolutionGround { PURPOSE_FULFILLED  UNANIMOUS  REQUIRED_BY_LAW }  # new

type DissolutionLiquidator {   # new
  id: OID!
  name: String!
  role: String
}

type Dissolution {
  dissolutionDate: Date
  dissolutionGround: DissolutionGround        # new
  resolutionForm: DissolutionResolutionForm
  isRegistered: Boolean                       # new
  assetRecipient: String
  assetIntendedUse: String                    # new
  liquidators: [DissolutionLiquidator!]       # new; replaces executingPersons
  remainingAssetsSummary: String
}
```

- `executingPersons: String` is **removed** and replaced by the structured `liquidators` list. (Pre-release; no stored documents to migrate.)
- All fields stay optional — an empty document must remain valid. `isRegistered` defaults conceptually to "unregistered"; absence is treated as unregistered by the builder (no schema default needed).
- Initial value is unchanged (`dissolution: null`).

## Operation

One existing operation changes: `SET_DISSOLUTION_DETAILS`. New input schema:

```graphql
input DissolutionLiquidatorInput {
  id: OID!
  name: String!
  role: String
}

input SetDissolutionDetailsInput {
  dissolutionDate: Date
  dissolutionGround: DissolutionGround
  resolutionForm: DissolutionResolutionForm
  isRegistered: Boolean
  assetRecipient: String
  assetIntendedUse: String
  liquidators: [DissolutionLiquidatorInput!]
  remainingAssetsSummary: String
}
```

Reducer (`src/reducers/dissolution.ts` **and** the MCP inline reducer, kept in sync):
- Initialize `state.dissolution` if absent (all new fields null / `liquidators: null`).
- Per-field truthy-merge for strings/enums/date (unchanged pattern).
- `isRegistered`: explicit `!== undefined && !== null` check (boolean — falsy `false` is valid).
- `liquidators`: when `action.input.liquidators` is provided (not undefined), **replace** `state.dissolution.liquidators` with a mapped copy `{ id, name, role: role || null }`. The form always submits the full list, so replace semantics are correct.

No new errors (all fields optional; the form gates required fields in the UI, consistent with the rest of the wizard). `DISSOLUTION_RESOLUTION` document routing is unchanged.

## Templates & builder

`editors/swiss-association/components/stage2Templates.ts`:

- **Resolution template** — overwrite `OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md` with the new Part II text, citations name-based per the correction rule. Tokens for the builder: `[Association Name]`, `[Address]`, `[Date]`, `[Form]`, dissolution-ground selection, liquidator rows, `[Insert recipient]`, `[Insert purpose-aligned use]`, the registered-only block, and the signature table.
- **`DISSOLUTION_PROCEDURE_MEMO`** — replace the constant's content with the new Part I memo, citations name-based. Rendered read-only and complete (including the "If the association is registered" section) — no conditional logic on the memo.
- **`buildDissolutionResolutionMarkdown(state)`** gains logic to:
  - Fill association name and registered office address (`state.registeredAddress` / `state.seatCity`).
  - Render the **dissolution ground**: show only the selected ground (or all three as selectable bullets if none chosen).
  - Map `resolutionForm` to a label incl. `MIXED` → "Mixed".
  - Render **liquidator rows** from `state.dissolution.liquidators` (name — role); fall back to `state.members` names if the list is empty.
  - Fill `assetRecipient` and `assetIntendedUse`.
  - **Include or strip the registered-only block** (the §6 "in Liquidation" / creditor-call / register-deletion content) based on `isRegistered`.
  - Build the **signature table** (Name / Capacity / Signature or cryptographic hash / Date) from the liquidators (fall back to members), matching the AoA execution block.

## Editor UI

`editors/swiss-association/components/StepDissolutionDetails.tsx` (Step 10) adds, using existing `SectionCard` / `FormField` patterns:
- **Dissolution ground** — select (Purpose fulfilled / Unanimous resolution / Required by law), default Unanimous.
- **Resolution form** — select now includes **Mixed**.
- **Registered toggle** — checkbox "Association is entered in the Commercial Register" (default off). A short hint notes it switches on the registered-liquidation steps.
- **Intended use of assets** — text field beside Asset Recipient.
- **Liquidators** — an editable list **seeded from `state.members`** on first load (one row per member, name pre-filled, empty role), with add/remove and a free `role` per row (placeholder e.g. "Member / multisig signer").
- Keep the existing dissolution date, remaining-assets summary, and the collapsible procedure memo.
- `handleSave` dispatches the full `SET_DISSOLUTION_DETAILS` with all fields incl. the liquidators array; liquidator rows need stable `id`s (generate with `generateId()` for new rows, preserve existing).

`StepDissolutionResolution.tsx` (Step 11) is unchanged — it already delegates to the updated builder via `Stage2DocumentStep`.

`editor.tsx` stage-progress: `dissolutionDetailsDone` keeps `!!(state.dissolution?.dissolutionDate && state.dissolution?.assetRecipient)`. No sidebar/nav structural change.

## Testing

Reducer tests (`document-models/swiss-association/v1/tests/dissolution.test.ts`): extend to cover the new fields — set ground/form(MIXED)/isRegistered/intended use/liquidators; partial-update preserves prior fields; `isRegistered: false` persists (not coerced away); liquidators array replaced on re-dispatch. Keep new branches covered; the pre-existing global 95% coverage gate is deferred debt and not in scope — gate the new tests with `npx vitest run`.

The `DISSOLUTION_RESOLUTION` routing test in `documents.test.ts` is unaffected.

Builder is exercised via `npm run tsc` + manual smoke (no snapshot test infra exists for templates here).

Gates: `npm run tsc`, `npm run lint`, `npx vitest run` (dissolution + documents tests).

Manual smoke (Vetra Studio): on a SwissAssociation document, Step 10 captures all new fields and seeds liquidators from members; Step 11 generates a resolution with corrected name-based AoA citations, selected ground, liquidator rows, intended use, signature table, and the registered block present/absent per the toggle; sign + lock works; the doc shows in the archive once that view ships.

## Files touched

| File | Change |
|------|--------|
| document model (MCP) | `MIXED` enum value, `DissolutionGround` enum, `DissolutionLiquidator` type, four new `Dissolution` fields, remove `executingPersons`, updated `SET_DISSOLUTION_DETAILS` input + reducer |
| `document-models/swiss-association/v1/schema.graphql` + `gen/**` | regenerated |
| `document-models/swiss-association/v1/src/reducers/dissolution.ts` | updated reducer (new fields, boolean check, liquidators replace) |
| `document-models/swiss-association/v1/tests/dissolution.test.ts` | extended tests |
| `OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md` | overwritten with new resolution (name-based citations) |
| `editors/swiss-association/components/stage2Templates.ts` | new `DISSOLUTION_PROCEDURE_MEMO`, expanded `buildDissolutionResolutionMarkdown` |
| `editors/swiss-association/components/StepDissolutionDetails.tsx` | new fields + liquidators list seeded from members |

## Out of scope

- The Documents Archive View (separate spec, `2026-06-17-documents-archive-view-design.md`) — done after this; this upgrade only changes the resolution it will display.
- Full liquidation machinery (debt-settlement tracking, transaction-hash capture, separate final-accounts document, multi-stage closure tracking) — the memo describes these as guidance; we do not model them.
- Automated tax-authority / registry filing.
- Tailoring the memo's content to the `isRegistered` toggle (memo stays complete as reference).
- Migrating any existing dissolution data (pre-release).

## Branch

`feat/dissolution-docs-upgrade`, branched from `main` (which contains the base dissolution phase). The `feat/documents-archive-view` branch is left untouched.
