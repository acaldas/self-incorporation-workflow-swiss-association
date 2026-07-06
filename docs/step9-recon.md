# Step 9 Recon — Contributor Agreements

_Reconnaissance for building out the currently-placeholder "Contributor Agreements" step._
_Date: 2026-07-06 · Branch: main_

> **UPDATE (2026-07-06, part 2) — source template LOCATED, plus template-analysis
> for the generic-tool build. See [Part 2](#part-2--contributor-agreement-template-analysis).**

## TL;DR

- **Step 9 = "Contributor Agreements"** — the last step of the incorporation
  workflow before the (optional) dissolution steps. It is the sole step of
  **Stage 4 "Supplier & Contributor Management"**, and unlocks the capability
  **"Can contract people."**
- It is currently a **hardcoded placeholder shell**
  (`StepContributorAgreements.tsx`) — no template, no state, no reducer, no
  document generation. Renders an amber "Coming soon" card.
- Every other document step (AoA, Founding Minutes, MPA, Reg GA, Dissolution
  Resolution) is built on a shared, **singleton** pattern:
  `Stage2DocumentStep` + a `GeneratedStage2Document` state field +
  a `Stage2DocumentType` enum value + a `buildXMarkdown(state)` template fn.
- **The critical mismatch:** contributor agreements are inherently **plural**
  (one per contributor), but the existing infra models **one document per type**.
  This is the central design decision to resolve before implementing (see
  [Open Questions](#open-questions--decisions-needed)).
- **No contributor-agreement template exists yet.** The word "Contributor" only
  appears inside the MPA templates (as a defined term), not as its own document.

---

## 1. Where step 9 lives

| Concern | Location |
| --- | --- |
| Step render / routing | `editors/swiss-association/editor.tsx:180` → `case 9` |
| Placeholder component | `editors/swiss-association/components/StepContributorAgreements.tsx` |
| Stage/capability grouping | `editors/swiss-association/components/stages.ts:51-58` (Stage 4) |
| Milestone wiring | `editors/swiss-association/components/ProgressSidebar.tsx:80` |
| Capability-flow SVG node | `editors/swiss-association/components/CapabilityFlow.tsx:132` |
| Workflow-status copy | `editors/swiss-association/components/StepWorkflowStatus.tsx:396` (Phase 4) |

### Step routing facts (`editor.tsx`)
- `case 9` renders `<StepContributorAgreements onBack={() => setCurrentStep(8)} />`.
  It has **only `onBack`** — no `onNext`, so it is a dead-end in the numbered flow
  (steps 10/11 = dissolution are reached separately, always-navigable).
- `maxStep` logic (`editor.tsx:43-49`): step 9 becomes reachable only once the
  **MPA is signed** (`mpaSigned` → `maxStep = 9`). Chain:
  `stage2Started` (7) → `phaseAComplete` = AoA + Founding Minutes signed (8) →
  MPA signed (9).
- `DISSOLUTION_FIRST_STEP = 10`; step 9 is the last "locking" step.

---

## 2. Current state — placeholder only

`StepContributorAgreements.tsx` (40 lines) renders a title, a description, and a
single amber "Coming soon" `SectionCard`. Explicit code comment:

> `// Placeholder for the Contributor Agreements step. The agreement templates`
> `// will be supplied later; this shell keeps the step navigable in the meantime.`

The rest of the UI is **honest about the gap** — nothing fakes completion:
- `stages.ts:53` — _"The contributor agreement (step 9) is not built yet — the stage exists but its step is pending."_
- `ProgressSidebar.tsx:80` / milestone `case 4` — capability "Can contract people" is hardwired `reached: false`.
- `CapabilityFlow.tsx:132` — same node `reached: false`, _"That step isn't built yet, so this capability stays soft/available — honest."_

**Implication:** wiring step 9's completion into `StageProgress` (a new
`contributorAgreementSigned`-style flag) is part of the build, and will flip
these three `false`s to real signals.

---

## 3. The reference pattern (how the other document steps work)

Five document steps already follow one shared pattern. Step 9 should reuse it
(modulo the plurality problem in §4).

### 3a. Shared UI: `Stage2DocumentStep.tsx`
A single reusable component (422 lines) that, given props, renders:
Generate/Refresh draft, Show Markdown Source toggle, Export to PDF (opens a
print window with embedded serif CSS), and **Mark as Signed** (which persists
markdown then locks). Props of interest:

```
title, description,
documentType: Stage2DocumentType,        // enum discriminator
documentState: GeneratedStage2Document,  // the singleton state field
generateMarkdown: () => string,          // template builder
onBack, onNext, nextLabel, lockedHint, nextRequiresSigned
```

Wrappers are tiny — e.g. `StepMultisigParticipationAgreement.tsx` (34 lines)
just passes `documentType="MPA"`, `documentState={state.mpaDocument}`,
`generateMarkdown={() => buildMpaMarkdown(state)}`.

### 3b. State: singleton `GeneratedStage2Document` fields
`schema.graphql:84-89` + `99-136`. Each doc type has **its own named field** on
`SwissAssociationState`:
`aoaDocument`, `foundingMinutesDocument`, `mpaDocument`, `regGaDocument`,
`dissolutionResolutionDocument` — all typed `GeneratedStage2Document`
(`{ markdown, isSigned, signedAt, isLocked }`).

### 3c. Enum discriminator: `Stage2DocumentType`
`schema.graphql:39-45`:
```
enum Stage2DocumentType { AOA  FOUNDING_MINUTES  MPA  REG_GA  DISSOLUTION_RESOLUTION }
```

### 3d. Reducer: `document-models/swiss-association/v1/src/reducers/documents.ts`
Three ops: `startStage_2`, `setStage2DocumentMarkdown`, `markStage2DocumentSigned`.
`getTargetDocument(state, documentType)` is a **hardcoded if/else** that maps each
enum value to its named state field (defaulting to `mpaDocument`). Signing sets
`isSigned/signedAt/isLocked` and — for AoA+Founding Minutes — stamps
`incorporationCompletedAt`.

### 3e. Templates: `editors/swiss-association/components/stage2Templates.ts`
`buildMpaMarkdown(state)`, `buildDissolutionResolutionMarkdown(state)`, etc.
Raw `.md` templates are imported with Vite `?raw` from
`OH legal incorporation templates copy.md/` and token-substituted against state.

---

## 4. The core gap — singleton vs. plural

Every existing stage-2 document is a **singleton**: exactly one AoA, one MPA, etc.
The whole infra (named state field, hardcoded enum→field map, one wrapper) bakes
this in.

**Contributor agreements are plural by nature** — one agreement per contributor,
each with its own party details, scope, and signature. There is currently **no
"contributor" entity in state** at all: `SwissAssociationState` has `members`
and `boardMembers` (`AssociationMember[]`), but nothing modelling contributors or
a collection of executed agreements.

This means step 9 is **not** a drop-in copy of the MPA step. One of these
decisions must be made (see §7):

- **(A) Singleton-style, MVP:** treat "contributor agreement" as one templated
  document (like the MPA), ignoring per-person multiplicity for now. Cheapest;
  fits existing infra with one new enum value + one state field. Loses per-contributor tracking.
- **(B) Collection model:** add a `contributors: [Contributor!]!` list and a
  `contributorAgreements: [GeneratedStage2Document...]!` (or a combined
  `ContributorAgreement` type carrying party + doc). Correct, but requires new
  schema types, reducer ops keyed by contributor `OID`, and a list-aware UI —
  the `getTargetDocument` if/else and `Stage2DocumentStep` singleton assumption
  both need rework.

---

## 5. What's missing to implement (checklist)

Regardless of A vs. B:

- [ ] **Template** — a `[TEMPLATE] … Contributor Agreement …md` does not exist in
      `OH legal incorporation templates copy.md/`. Must be supplied before a
      `buildContributorAgreementMarkdown` can be written. **Blocking / external.**
- [ ] **Schema** (`SET_STATE_SCHEMA` via MCP + regenerate):
      new `Stage2DocumentType` value (e.g. `CONTRIBUTOR_AGREEMENT`) and/or new
      state field(s); for option B, new `Contributor`/`ContributorAgreement`
      types + inputs.
- [ ] **Reducer** (`src/reducers/documents.ts` **and** the model via MCP): extend
      `getTargetDocument` (option A) or add contributor-keyed ops (option B).
      ⚠️ Per project rules, changing the `documents` module via MCP **regenerates
      and clobbers** the hand-written `documents.ts` — restore from HEAD and
      re-apply (see memory: _codegen-clobbers-src-reducers_).
- [ ] **Template builder** in `stage2Templates.ts`.
- [ ] **Component** — replace the placeholder body of `StepContributorAgreements.tsx`
      with a `Stage2DocumentStep` wrapper (option A) or a list UI (option B).
- [ ] **Editor wiring** (`editor.tsx`) — give step 9 an `onNext` / proper terminal
      behavior; verify `maxStep` gating.
- [ ] **Progress/capability signals** — flip the three hardcoded `reached: false`
      (`ProgressSidebar.tsx:80`, milestone `case 4`, `CapabilityFlow.tsx:132`) to a
      real `StageProgress.contributorAgreementSigned` flag.
- [ ] **Tests** — reducer coverage stays ≥95% (add scenario + error-branch tests).

---

## 6. Capability context

Step 9 is the only step of **Stage 4 "Supplier & Contributor Management"**
(`stages.ts:51-58`) and gates the capability node **"Can contract people"**
in both the sidebar milestones and the capability-flow SVG. It sits alongside the
other post-incorporation capabilities:
- Stage 3 "Treasury & Governance" → "Can hold & move money" (multisig, step 6; MPA step 8 additive)
- Stage 4 "Supplier & Contributor" → **"Can contract people" (step 9 — this)**
- (external) "Can invoice & get paid, compliantly" — never reached in MVP (needs domicile + tax ID)

---

## 7. Open questions / decisions needed

1. **Singleton (A) or collection (B)?** — the single biggest fork; determines
   schema + reducer + UI shape. Recommend confirming with the user before coding.
2. **Where does the template come from?** No contributor-agreement template exists.
   Is one being supplied, or should it be drafted (and in EN only, per the
   AoA-English-only MVP convention in memory)?
3. **Does step 9 gate anything downstream?** Currently a dead-end before
   dissolution. Confirm it should remain optional/terminal (not block dissolution).
4. **Who are "contributors" vs. members/board?** The MPA defines "Contributors" as
   _"persons who engage in work under the Project … recipients of the Designated
   Ops Budget."_ Confirm whether contributor identities should be captured as
   structured state (option B) or left free-text in the template (option A).

---

## Appendix — key file references

- `editors/swiss-association/editor.tsx:43-50, 180-181`
- `editors/swiss-association/components/StepContributorAgreements.tsx` (placeholder)
- `editors/swiss-association/components/Stage2DocumentStep.tsx` (shared pattern)
- `editors/swiss-association/components/StepMultisigParticipationAgreement.tsx` (34-line reference wrapper)
- `editors/swiss-association/components/stage2Templates.ts` (`buildMpaMarkdown`, `?raw` template imports)
- `editors/swiss-association/components/stages.ts:51-58` (Stage 4)
- `editors/swiss-association/components/ProgressSidebar.tsx:80` + milestone `case 4`
- `editors/swiss-association/components/CapabilityFlow.tsx:132`
- `document-models/swiss-association/v1/schema.graphql:39-45, 84-89, 99-136`
- `document-models/swiss-association/v1/src/reducers/documents.ts` (`getTargetDocument`)
- Templates dir: `OH legal incorporation templates copy.md/` — **no contributor agreement present**

---

# Part 2 — Contributor Agreement Template Analysis

_Investigation for building step 9 as a GENERIC tool (any Swiss Operational-Hub
association). Investigation-only — no code/model/template written yet._

## 0. Template location — IMPORTANT

- The template is **NOT** in the repo's `oh legal  templates.md/` folder. That
  folder contains only the AoA and Founding Meeting Minutes.
- The actual source is a **`.docx` outside the repo**:
  `~/Documents/contract review claude/[TEMPLATE] Contributor Agreement FINAL.docx`
  (a redlined variant sits beside it: `Contributor Agreement - Redlined (Claude) Mar 2026.docx`).
- **Only ONE consolidated FINAL template exists** — it is the **entity-form**
  (preamble + variables assume the contractor acts through a legal entity), and
  it carries an instructional **front-matter** ("Description" + "Variables")
  above the contract proper. There is **no separate "individual / without-entity"
  file** — which actually validates the "ONE template + `contractorIsEntity`
  toggle" plan: the individual form is this doc minus the `entity_*` block.
- **Action needed before build:** the `.docx` must be converted to `.md` and
  placed inside the repo (the other steps import templates via Vite `?raw`, which
  only works for in-repo files). Recommended path:
  `oh legal  templates.md/[TEMPLATE] OH Contributor Agreement.md`.
- Two unrelated AccountAble-OPC signed PDFs (2022 DAOScope UG; 2024 Quadrille LLC)
  also exist on disk. They are **older MakerDAO-SES contractor agreements** and do
  **NOT** match this template (no PoWt, no Genesis IP/AGPLv3, no Zug). Ignore them.

## 1. Variable parameters (deduplicated)

`✳ = OH-side → read from existing Step 1 state, do NOT re-collect.`

### Dates
| Variable | Meaning |
| --- | --- |
| `date_Contract` | Contract date (long form, e.g. "January 1, 2025") |
| `termination_Period` | Notice period (calendar days) to terminate |

### OH side (Operational Hub) — source from state
| Variable | Maps to Step 1 state | Notes |
| --- | --- | --- |
| `OH_name` ✳ | `state.nameEn` / `nameDe` | Association name |
| `OH_Receiving_Address` ✳ | `state.registeredAddress` | Registered/agent address |
| (canton) ✳ | `state.seatCanton` | For governing-law + "canton of Zug" replacement (edits d/e) |
| (city) ✳ | `state.seatCity` | Available if needed |
| `reg_OH` | ⚠️ **NOT in Step 1 state** | Registration ID exists only post commercial-register; state has no field. **Gap** — collect manually or leave blank for MVP. |
| `OH_Agent` | partial: `state.chairName` / `secretaryName` / board | Signatory agent for the OH; wire to a chosen signatory. |
| `OH_canton` | — | **ORPHAN — excluded per instruction.** Labeled "canton" but described as "Address"; redundant with seatCanton + the hardcoded "canton of Zug". Drop. |

### Contractor side — collected fresh per agreement
| Variable | Entity-only? | Meaning |
| --- | --- | --- |
| `name_Contractor` | both | Legal name of the contractor-agent / individual |
| `contractor_Nationality` | both | Nationality of the agent/individual |
| `address_Contractor` | both | Address (entity address, or personal if individual) |
| `entity_Name` | **entity** | Contractor's legal entity name |
| `entity_Type_Contractor` | **entity** | Entity type |
| `entity_Jurisdiction_Contractor` | **entity** | Jurisdiction of registration |
| `reg_Contractor` | **entity** | Contractor registration ID |
| `title_Contractor` | both (optional) | Title held with the OH |
| `date_Of_Work_Initial` | both | Start date |
| `date_Of_Work_Final` | both | End date |

### Misc / Schedules
| Variable | Meaning |
| --- | --- |
| `services_To_Be_Rendered` | SOW scope (Schedule A) |
| `comp_Amount` | Monthly fee (Schedule B) |
| `denom_Type` | Denomination type (Fiat / crypto) |
| `denom_Currency` | Fiat currency — **conditional** on `denom_Type == "Fiat"` |
| `FTE` | Full-time-equivalent hours |
| `number_Powt` | PoWt units/month (Schedule C) — **to be removed, see edit (b)** |

### ⚠️ Token inconsistencies found (must normalize when templating)
- **`address_Agent_Contractor`** appears in the preamble (¶ preamble) but the
  Variables list + Schedule A call it **`address_Contractor`**. Pick one.
- **`number_SOW`** is used in the Schedule A header but is **not** declared in the
  Variables list. Add it.
- Body uses **"XXX worked hours"** / "total of XXX" (Schedule A §2) rather than the
  `FTE` token — wire `FTE` in, or the value never populates.

## 2. The 4 branch points — CONFIRMED

1. **Party-definition preamble.** OH line is fixed; the contractor line is the
   entity form: _"entity_Name, a entity_Type_Contractor duly organized in
   entity_Jurisdiction_Contractor with agent domiciled at address_Agent_Contractor."_
   Individual form collapses to name + nationality + personal address. ✅
2. **Contractor-obligations / delegation clause.** §2 bracket _"[using personnel
   and/or subcontractors …]"_ + §7 (NO EMPLOYER-EMPLOYEE) _"Any persons employed
   or engaged by the CONTRACTOR … shall be CONTRIBUTOR's employees or
   contractors…"_ — entity may delegate/subcontract; individual variant differs. ✅
3. **Signature block.** _"OH_name … represented by OH_Agent"_ vs _"Contractor,
   represented by name_Contractor"_. Entity: "represented by" the agent.
   Individual: name signs directly. Appears twice (main body + Schedule C). ✅
4. **Entity-vs-individual variable set.** The `entity_*` + `reg_Contractor`
   block (see table above) is present only when `contractorIsEntity = true`. ✅

## 3. The 5 generalization edits — locations CONFIRMED (with 2 corrections)

| # | Edit | Location in template | Confirmed? |
| --- | --- | --- | --- |
| (a) | IP clause → generic work-for-hire assignment; drop Genesis IP + AGPLv3 mandate | **§8 IP ASSIGNMENT**. Drop the `Genesis IP` definition (para (i) of "Developed IP" + its definition line) and the **"Commitment to Open Source Principles"** sub-section (the GNU **AGPLv3** mandate). **Keep** the generic "assign … Developed IP to the OH" assignment. | ✅ |
| (b) | Remove Schedule C (PoWt) + scrub PoWt everywhere | **Schedule C: "Disclosure Regarding Proof of Work Tickets (POWt)"** (whole schedule + its own signature block). ALSO scrub: the **List of Schedules** entry "Schedule C (optional) – Proof Of Work"; the **`number_Powt`** variable; Schedule A §2 references if any. **Note:** Schedule B (Compensation) is cash-only and does **not** itself mention PoWt — so "scrub from Compensation schedule/body" is a no-op there; the only PoWt content is Schedule C + the variable + the schedule-list line. | ✅ (with note) |
| (c) | Strip OPC references from **preamble** | **CORRECTION:** the OPC references (_"Accountable OPC, based in the Philippines"_, _"the OPC Agreement"_) are **NOT in the preamble** — they live in **§8 IP ASSIGNMENT**, inside the "Developed IP" definition (para (i)). The preamble has no OPC text. So this edit **folds into edit (a)** — removing Genesis IP removes the OPC reference. | ⚠️ relocated |
| (d) | Hardcoded "canton of Zug" → source from `seatCanton` | **3 occurrences:** preamble (_"a Swiss Association duly organized in the canton of Zug"_); Governing-Law §_"courts of the Canton of Zug, Switzerland"_; and _"Courts of the canton of Zug … (exclusive venue)"_. All → `state.seatCanton`. | ✅ (×3) |
| (e) | Governing-law clause → source from entity seat | **§ GOVERNING LAW, JURISDICTION, AND ARBITRATION.** **Nuance:** the OH is by definition a **Swiss** association, so _"laws of Switzerland"_ is inherent and can stay hardcoded; only the **canton (venue/jurisdiction)** is variable → `state.seatCanton` (same as edit d). | ✅ (national law stays; canton varies) |

## 4. Cleanup anchor — CONFIRMED

Exact heading text where the contract proper begins (everything above it —
"Description" + "Variables" front-matter — is excluded from output):

```
INDEPENDENT CONTRACTOR AGREEMENT
```

(All-caps, standalone line. In the source it is the first line after the
`Variables` guidance block; `number_Powt` is the last front-matter line before it.)

## 5. Proposed model-state shape (for discussion — nothing built)

Mirror the existing `GeneratedStage2Document` singleton pattern:

- **New `Stage2DocumentType` enum value:** `CONTRIBUTOR_AGREEMENT`.
- **New state field:** `contributorAgreementDocument: GeneratedStage2Document`
  (`{ markdown, isSigned, signedAt, isLocked }`) — identical to `mpaDocument`.
- **New input-collection state** (the per-agreement variables). Sketch:

  ```graphql
  type ContributorAgreementInputs {
    contractorIsEntity: Boolean          # THE toggle (branch driver)
    dateContract: Date
    terminationPeriodDays: Int
    # contractor (both forms)
    nameContractor: String
    contractorNationality: String
    addressContractor: String
    titleContractor: String
    dateOfWorkInitial: Date
    dateOfWorkFinal: Date
    # contractor (entity-only; required iff contractorIsEntity)
    entityName: String
    entityTypeContractor: String
    entityJurisdictionContractor: String
    regContractor: String
    # OH signatory (name/address/canton sourced from Step-1 state)
    ohAgent: String
    regOH: String                        # gap: no Step-1 source yet
    # SOW / compensation
    numberSow: String
    servicesToBeRendered: String
    fte: String
    compAmount: Amount_Money             # or String, matching membershipFee style
    denomType: String
    denomCurrency: Currency
    includePowt: Boolean                 # gates Schedule C
    numberPowt: Int
  }
  ```
  (Field names/scalars are a proposal; align with existing conventions before building.)

- **Builder:** `buildContributorAgreementMarkdown(state)` in `stage2Templates.ts`,
  importing the in-repo template `?raw`, doing token substitution, and honoring
  `contractorIsEntity` / `includePowt` to include/drop the branched blocks.

### ⚠️ Open structural question (carried from Part 1 §4)
The singleton shape models **one** contributor agreement. Real associations have
**many** contributors → many agreements. Options: **(A)** singleton MVP (one at a
time, like MPA) vs **(B)** a `contributorAgreements: [ … ]!` collection keyed by
`OID`. **This is the decision to lock before writing schema/reducer.** The
generic-tool framing (reusable across associations) leans toward (B), but (A) is
the cheaper MVP consistent with every existing step.

### Decisions needed to lock the state shape
1. **Singleton (A) or collection (B)?** (biggest fork)
2. **`reg_OH` gap:** collect manually, or omit for MVP (no registration ID until
   commercial-register stage)?
3. **Compensation typing:** `Amount_Money` vs free-text (current `membershipFee`
   is `String`)?
4. Confirm the two **corrections** above (edit c relocated to §8; edit e keeps
   national law, varies only canton) before templating.
