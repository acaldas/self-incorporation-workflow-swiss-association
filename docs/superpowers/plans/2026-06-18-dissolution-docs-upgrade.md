# Dissolution Documents Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Stage 4 dissolution resolution template and procedure memo with AoA-grounded versions, capturing the new structured input (dissolution ground, intended use, registered status, named liquidators) as real fields.

**Architecture:** Extend the existing `Dissolution` state/op (add an enum value, one enum, one object type, four fields; drop `executingPersons`); overwrite the resolution template with a token-driven version and rewrite its builder to branch on registration and render liquidator/signature rows; replace the procedure-memo constant; expand the Step 10 form with the new fields and a members-seeded liquidator list. Citations to unnumbered AoA articles become name-based; the four real sub-number citations (§4.4, §6.1, §6.2, §6.4) stay.

**Tech Stack:** Powerhouse document model (GraphQL + reducers), reactor-mcp, React + TypeScript, Vitest.

**Branch:** `feat/dissolution-docs-upgrade` (already created off `main`; spec committed as `8f9284a`).

**Key context for the implementer:**
- reactor-mcp must be running (`ph vetra`). The SwissAssociation **document-model document id is `8d6de322-94fe-40b0-8eed-5c4802527424`** on drive `vetra-16dda929`.
- The MCP model and the `src/` reducers are kept in sync. **Changing a module's operations via MCP triggers codegen that can overwrite the hand-written `src/reducers/dissolution.ts`** — so always (re)write that file AFTER the MCP call + `generate`, not before.
- Editing the model via `addActions` triggers Vetra codegen (regenerates `schema.graphql` + `gen/`). If it doesn't auto-run, run `npm run generate`. Codegen may race the file watcher — if `tsc` errors on a just-regenerated `gen/` file, re-run `tsc` once.
- `npm run test:coverage` fails a global 95% gate due to **pre-existing** untested reducers, deferred by user decision. Do NOT treat that as a regression; use `npx vitest run` for the new tests and `npm run tsc` / `npm run lint` as gates.
- `executingPersons` is referenced ONLY in `src/reducers/dissolution.ts`, `tests/dissolution.test.ts`, and `StepDissolutionDetails.tsx` — all three are rewritten here. The builder uses `state.members`, not `executingPersons`.
- `applyReplacements`/`replaceToken` replace ALL occurrences of a token (split/join), so multi-occurrence tokens like `[Association Name]` and `[Address]` are fine.

---

### Task 1: Document model — enum value, ground enum, liquidator type, Dissolution fields, updated operation (MCP) + src reducer

**Files:**
- Modify (codegen output): `document-models/swiss-association/v1/schema.graphql`, `gen/**`
- Modify: `document-models/swiss-association/v1/src/reducers/dissolution.ts`

- [ ] **Step 1: Apply the model edits in one `addActions` call**

Call `mcp__reactor-mcp__addActions` with `documentId: "8d6de322-94fe-40b0-8eed-5c4802527424"`, all actions `scope: "global"`, in this order:

```json
{
  "documentId": "8d6de322-94fe-40b0-8eed-5c4802527424",
  "actions": [
    {
      "type": "SET_STATE_SCHEMA",
      "scope": "global",
      "input": {
        "scope": "global",
        "schema": "enum PrimaryLanguage {\n  EN\n  DE\n}\n\nenum MemberType {\n  NATURAL_PERSON\n  LEGAL_ENTITY\n}\n\nenum PhaseStatus {\n  LOCKED\n  IN_PROGRESS\n  AWAITING_SIGNATURES\n  COMPLETE\n}\n\nenum Stage2DocumentType {\n  AOA\n  FOUNDING_MINUTES\n  MPA\n  REG_GA\n  DISSOLUTION_RESOLUTION\n}\n\nenum DissolutionResolutionForm {\n  PHYSICAL\n  VIRTUAL\n  MIXED\n  WRITTEN\n}\n\nenum DissolutionGround {\n  PURPOSE_FULFILLED\n  UNANIMOUS\n  REQUIRED_BY_LAW\n}\n\ntype AssociationMember {\n  id: OID!\n  type: MemberType!\n  name: String!\n  nationalityOrCountry: String!\n  residenceOrCity: String!\n  representative: String\n}\n\ntype MultisigConfig {\n  platform: String\n  address: String\n  keysTotal: Int\n  decisionQuorum: Int\n  privateChannel: String\n  availabilityThreshold: String\n  internalPolicyLink: String\n  multisigDate: Date\n  emergencyProcedures: String\n}\n\ntype PhaseRecord {\n  id: OID!\n  phaseNumber: Int!\n  name: String!\n  status: PhaseStatus!\n  documentsGenerated: Boolean!\n  documentsSigned: Boolean!\n  completedDate: Date\n}\n\ntype GeneratedStage2Document {\n  markdown: String\n  isSigned: Boolean\n  signedAt: DateTime\n  isLocked: Boolean\n}\n\ntype DissolutionLiquidator {\n  id: OID!\n  name: String!\n  role: String\n}\n\ntype Dissolution {\n  dissolutionDate: Date\n  dissolutionGround: DissolutionGround\n  resolutionForm: DissolutionResolutionForm\n  isRegistered: Boolean\n  assetRecipient: String\n  assetIntendedUse: String\n  liquidators: [DissolutionLiquidator!]\n  remainingAssetsSummary: String\n}\n\ntype SwissAssociationState {\n  nameEn: String\n  nameDe: String\n  seatCity: String\n  seatCanton: String\n  registeredAddress: String\n  foundingDate: Date\n  fiscalYearEnd: String\n  membershipFee: String\n  primaryLanguage: PrimaryLanguage\n  purposeEn: String\n  purposeDe: String\n  members: [AssociationMember!]!\n  boardMembers: [AssociationMember!]\n  isPersonalunion: Boolean\n  chairName: String\n  chairRole: String\n  secretaryName: String\n  secretaryRole: String\n  multisig: MultisigConfig\n  stage2Started: Boolean\n  aoaDocument: GeneratedStage2Document\n  foundingMinutesDocument: GeneratedStage2Document\n  mpaDocument: GeneratedStage2Document\n  regGaDocument: GeneratedStage2Document\n  dissolution: Dissolution\n  dissolutionResolutionDocument: GeneratedStage2Document\n  incorporationCompletedAt: DateTime\n  currentPhase: Int\n  phases: [PhaseRecord!]!\n  languageClauseNeedsUpdate: Boolean\n  belowRecommendedMemberCount: Boolean\n  registeredAddressConfirmed: Boolean\n  customNotes: [String!]!\n}"
      }
    },
    {
      "type": "SET_OPERATION_SCHEMA",
      "scope": "global",
      "input": {
        "id": "op-set-dissolution",
        "schema": "input DissolutionLiquidatorInput {\n  id: OID!\n  name: String!\n  role: String\n}\n\ninput SetDissolutionDetailsInput {\n  dissolutionDate: Date\n  dissolutionGround: DissolutionGround\n  resolutionForm: DissolutionResolutionForm\n  isRegistered: Boolean\n  assetRecipient: String\n  assetIntendedUse: String\n  liquidators: [DissolutionLiquidatorInput!]\n  remainingAssetsSummary: String\n}"
      }
    },
    {
      "type": "SET_OPERATION_REDUCER",
      "scope": "global",
      "input": {
        "id": "op-set-dissolution",
        "reducer": "if (!state.dissolution) {\n  state.dissolution = { dissolutionDate: null, dissolutionGround: null, resolutionForm: null, isRegistered: null, assetRecipient: null, assetIntendedUse: null, liquidators: null, remainingAssetsSummary: null };\n}\nif (action.input.dissolutionDate) state.dissolution.dissolutionDate = action.input.dissolutionDate;\nif (action.input.dissolutionGround) state.dissolution.dissolutionGround = action.input.dissolutionGround;\nif (action.input.resolutionForm) state.dissolution.resolutionForm = action.input.resolutionForm;\nif (action.input.isRegistered !== undefined && action.input.isRegistered !== null) state.dissolution.isRegistered = action.input.isRegistered;\nif (action.input.assetRecipient) state.dissolution.assetRecipient = action.input.assetRecipient;\nif (action.input.assetIntendedUse) state.dissolution.assetIntendedUse = action.input.assetIntendedUse;\nif (action.input.liquidators) state.dissolution.liquidators = action.input.liquidators.map((l) => ({ id: l.id, name: l.name, role: l.role || null }));\nif (action.input.remainingAssetsSummary) state.dissolution.remainingAssetsSummary = action.input.remainingAssetsSummary;"
      }
    }
  ]
}
```

- [ ] **Step 2: Verify codegen regenerated schema + types**

Run: `grep -nE "MIXED|DissolutionGround|DissolutionLiquidator|assetIntendedUse|isRegistered|liquidators" document-models/swiss-association/v1/schema.graphql`
Expected: hits for the `MIXED` enum value, `DissolutionGround` enum, `DissolutionLiquidator` type, and the new `Dissolution` fields. Also confirm `executingPersons` is **gone**: `grep -n "executingPersons" document-models/swiss-association/v1/schema.graphql` → no output. If absent/stale, run `npm run generate`.

- [ ] **Step 3: (Re)write the dissolution reducer**

Overwrite `document-models/swiss-association/v1/src/reducers/dissolution.ts` (codegen may have stubbed it — replace its contents entirely):

```typescript
import type { SwissAssociationDissolutionOperations } from "document-models/swiss-association/v1";

export const swissAssociationDissolutionOperations: SwissAssociationDissolutionOperations =
  {
    setDissolutionDetailsOperation(state, action) {
      if (!state.dissolution) {
        state.dissolution = {
          dissolutionDate: null,
          dissolutionGround: null,
          resolutionForm: null,
          isRegistered: null,
          assetRecipient: null,
          assetIntendedUse: null,
          liquidators: null,
          remainingAssetsSummary: null,
        };
      }
      if (action.input.dissolutionDate)
        state.dissolution.dissolutionDate = action.input.dissolutionDate;
      if (action.input.dissolutionGround)
        state.dissolution.dissolutionGround = action.input.dissolutionGround;
      if (action.input.resolutionForm)
        state.dissolution.resolutionForm = action.input.resolutionForm;
      if (
        action.input.isRegistered !== undefined &&
        action.input.isRegistered !== null
      )
        state.dissolution.isRegistered = action.input.isRegistered;
      if (action.input.assetRecipient)
        state.dissolution.assetRecipient = action.input.assetRecipient;
      if (action.input.assetIntendedUse)
        state.dissolution.assetIntendedUse = action.input.assetIntendedUse;
      if (action.input.liquidators)
        state.dissolution.liquidators = action.input.liquidators.map((l) => ({
          id: l.id,
          name: l.name,
          role: l.role || null,
        }));
      if (action.input.remainingAssetsSummary)
        state.dissolution.remainingAssetsSummary =
          action.input.remainingAssetsSummary;
    },
  };
```

- [ ] **Step 4: Typecheck**

Run: `npm run tsc`
Expected: PASS. (If a just-regenerated `gen/` file errors, re-run once — codegen/file-watcher race.)

- [ ] **Step 5: Commit**

```bash
git add document-models/swiss-association/v1/schema.graphql document-models/swiss-association/v1/gen document-models/swiss-association/v1/src/reducers/dissolution.ts
git commit -m "$(cat <<'EOF'
feat: extend dissolution model with ground, registration, liquidators

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Reducer tests for the new fields

**Files:**
- Modify: `document-models/swiss-association/v1/tests/dissolution.test.ts`

> Note: strict red-green isn't practical for generated model wiring; these tests verify the implemented behavior and guard against regressions.

- [ ] **Step 1: Replace the dissolution test file**

Overwrite `document-models/swiss-association/v1/tests/dissolution.test.ts`:

```typescript
import {
  reducer,
  setDissolutionDetails,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("DissolutionOperations", () => {
  it("sets all dissolution details including the new fields", () => {
    const document = utils.createDocument();

    const updated = reducer(
      document,
      setDissolutionDetails({
        dissolutionDate: "2026-06-17T00:00:00.000Z",
        dissolutionGround: "UNANIMOUS",
        resolutionForm: "MIXED",
        isRegistered: true,
        assetRecipient: "Some Foundation",
        assetIntendedUse: "Continued open-source funding",
        liquidators: [
          { id: "liq-1", name: "Alice", role: "Member / signer" },
          { id: "liq-2", name: "Bob", role: "Member / signer" },
        ],
        remainingAssetsSummary: "CHF 0 after transfers",
      }),
    );

    const d = updated.state.global.dissolution;
    expect(d?.dissolutionDate).toBe("2026-06-17T00:00:00.000Z");
    expect(d?.dissolutionGround).toBe("UNANIMOUS");
    expect(d?.resolutionForm).toBe("MIXED");
    expect(d?.isRegistered).toBe(true);
    expect(d?.assetRecipient).toBe("Some Foundation");
    expect(d?.assetIntendedUse).toBe("Continued open-source funding");
    expect(d?.liquidators).toHaveLength(2);
    expect(d?.liquidators?.[0]).toEqual({
      id: "liq-1",
      name: "Alice",
      role: "Member / signer",
    });
    expect(d?.remainingAssetsSummary).toBe("CHF 0 after transfers");
  });

  it("persists isRegistered=false (not coerced away) and defaults role to null", () => {
    const document = utils.createDocument();

    const updated = reducer(
      document,
      setDissolutionDetails({
        isRegistered: false,
        liquidators: [{ id: "liq-1", name: "Alice" }],
      }),
    );

    const d = updated.state.global.dissolution;
    expect(d?.isRegistered).toBe(false);
    expect(d?.liquidators?.[0].role).toBeNull();
  });

  it("merges partial updates and replaces the liquidators array", () => {
    const document = utils.createDocument();

    const first = reducer(
      document,
      setDissolutionDetails({
        assetRecipient: "Foundation A",
        liquidators: [{ id: "liq-1", name: "Alice", role: "Signer" }],
      }),
    );
    const second = reducer(
      first,
      setDissolutionDetails({
        dissolutionDate: "2026-07-01T00:00:00.000Z",
        liquidators: [{ id: "liq-2", name: "Carol", role: "Signer" }],
      }),
    );

    const d = second.state.global.dissolution;
    expect(d?.assetRecipient).toBe("Foundation A");
    expect(d?.dissolutionDate).toBe("2026-07-01T00:00:00.000Z");
    expect(d?.liquidators).toHaveLength(1);
    expect(d?.liquidators?.[0].name).toBe("Carol");
  });
});
```

- [ ] **Step 2: Run the dissolution tests**

Run: `npx vitest run document-models/swiss-association/v1/tests/dissolution.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 3: Confirm the routing test still passes**

Run: `npx vitest run document-models/swiss-association/v1/tests/documents.test.ts`
Expected: PASS (unchanged — `DISSOLUTION_RESOLUTION` routing test untouched).

- [ ] **Step 4: Commit**

```bash
git add document-models/swiss-association/v1/tests/dissolution.test.ts
git commit -m "$(cat <<'EOF'
test: cover new dissolution fields and liquidator replace semantics

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Rewrite the resolution template, the procedure memo, and the builder

**Files:**
- Overwrite: `OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md`
- Modify: `editors/swiss-association/components/stage2Templates.ts`

- [ ] **Step 1: Overwrite the resolution template (Part II)**

Replace the entire contents of `OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md` with exactly:

```markdown
**General Assembly Resolution**

**Dissolution and Liquidation of [Association Name]**

**Association:** [Association Name], a non-profit association under Art. 60–79 ZGB
**Registered office:** [Address], Zug, Switzerland
**Date:** [Date]
**Form:** [Form]

The Members of the Association, constituting the General Assembly (in Personalunion with the board per the *Bodies* article of the AoA), resolve as follows:

## 1. Dissolution

The Association is dissolved pursuant to the *Dissolution and Liquidation* article of the AoA and Art. 76 ZGB, with effect from the date of this resolution. The Association continues to exist as an *association in liquidation* until the liquidation is complete and these resolutions are fully implemented.

The ground for dissolution is: [Ground].

## 2. Confirmation of Financial Status

The Members confirm, to the best of their knowledge, that the Association's financial position has been or will be established as at the dissolution date, and that all debts, levies, and other obligations will be settled before any remaining assets are allocated (per the *Dissolution and Liquidation* article of the AoA).

## 3. Designation of Liquidators

Under Personalunion (the *Bodies* article of the AoA), the following persons are designated to execute the liquidation, including settlement of obligations, asset transfers, and related transactions. They act jointly:

[Liquidators]

Where assets are held in a multisig arrangement, the designated liquidators correspond to the required signers.

## 4. Asset Allocation

After settlement of all obligations, any remaining assets shall be allocated as follows:

**Recipient:** [Insert recipient]
**Intended use:** [Insert purpose-aligned use]

The Members confirm that this allocation:

- aligns with the Association's purpose (per the *Dissolution and Liquidation* article of the AoA);
- does **not** benefit Members, or persons or entities controlled by or under common control with any Member (per the *Dissolution and Liquidation* article of the AoA);
- is **subject to recognition by the cantonal tax authority**, which shall be obtained **before** the transfer is executed.

The Members authorise the liquidators to obtain such tax-authority recognition and to adjust the recipient if required by the tax authority, consistent with the purpose-alignment and non-distribution constraints above.

## 5. Execution and Completion

The liquidators shall:

- settle all obligations;
- obtain tax-authority recognition of the asset allocation;
- execute the asset transfers (by bank transfer and/or multisig transaction), documenting recipients, addresses, and transaction hashes;
- prepare final liquidation accounts.

Liquidation is complete upon execution of the transfers and approval of the final liquidation accounts by the Members.

## 6. Tax, Regulatory, and Formal Closure

The liquidators are authorised and instructed to:

- notify the cantonal tax authority of the wind-up and deregister the Association as a tax-exempt entity;
- file any final tax / VAT returns due;
- close social security / AHV accounts, if applicable;
- close bank accounts and confirm zero balances; confirm crypto wallets are empty and, after all transfers are complete, optionally decommission the multisig;
- retain all Association records for ten years (the §6.4 indemnification and §4.4 end-of-membership obligations survive dissolution).

<!--REGISTERED_START-->
The liquidators are further instructed to carry the Association as "[Association Name] in Liquidation", publish the call for creditors, and apply for deletion from the Commercial Register in accordance with applicable law.
<!--REGISTERED_END-->

## 7. Discharge

Upon approval of the final liquidation accounts, the Members grant discharge (Entlastung) to the liquidators in respect of their conduct of the liquidation (per §6.1 of the AoA).

## Confirmation

This resolution is adopted **unanimously** by the Members.

The English version of this resolution prevails (per the *Language* article of the AoA).

## Signatures

| Name | Capacity | Signature / cryptographic signature hash | Date |
|------|----------|-------------------------------------------|------|
[SignatureRows]

*[Cryptographic signature hash per signing party, with timestamp — consistent with the AoA execution block.]*

[Address], Zug, [Date], Switzerland
```

- [ ] **Step 2: Replace the procedure-memo constant**

In `editors/swiss-association/components/stage2Templates.ts`, replace the entire `DISSOLUTION_PROCEDURE_MEMO` constant (currently around lines 443–458) with:

```typescript
export const DISSOLUTION_PROCEDURE_MEMO = `## Dissolution & Liquidation Procedure (Reference)

_For an association under our AoA. Assumptions: unregistered association, voluntary dissolution by unanimous member resolution, Personalunion (members act as liquidators), prior tax-exempt status, no disputes. Debts are not assumed away — where the association is debt-free, the relevant steps are confirmations, not omissions. Legal basis: ZGB Art. 60–79 (esp. Art. 76), the Articles of Association (Bodies, General Assembly §6, Finance, Auditor, Dissolution and Liquidation articles), and the Regulation of the General Assembly._

> Procedural guideline only — not legal or tax advice. Asset allocation and tax deregistration for a charitable association must be confirmed with the cantonal tax authority and, where useful, a Swiss lawyer or fiduciary (Treuhänder).

1. **General Assembly resolution to dissolve (unanimous)** — resolve to dissolve with effect from the resolution date (the association continues as an *association in liquidation*); confirm the dissolution ground; designate the liquidators (under Personalunion, the members / multisig signers); confirm the intended use of remaining assets, subject to tax-authority recognition; instruct final accounts and tax filings. _Output: signed Dissolution Resolution._
2. **Establish the financial position (closing balance)** — closing balance sheet at the dissolution date; reconcile bank accounts, crypto wallets, receivables; identify all liabilities. If an auditor is maintained (Auditor article), it may confirm the closing position; many small associations waive the auditor under the thresholds. _Output: closing balance sheet._
3. **Settle debts and administrative items** — collect receivables (incl. unpaid membership fees); pay open invoices and liabilities; terminate contracts (providers, domicile, subscriptions, tools); review/close registrations (VAT, AHV). In the clean case this is a documented confirmation that no debts exist — not an omission.
4. **Confirm asset allocation and obtain tax-authority recognition** — remaining assets **must** be used consistently with the purpose, **must not** go to members or related parties, and **must** be recognised by the tax authority. Identify the recipient (a tax-exempt entity with a same/similar purpose), verify the recipient's exemption is current, submit the intended allocation to the cantonal tax authority, and obtain confirmation **before** transferring. This recognition gates Step 5. _Output: tax-authority recognition._
5. **Transfer / allocate remaining assets** — transfer to the recognised recipient per purpose; **no distribution to members**; execute via bank/multisig; where the recipient cannot receive crypto, liquidate to fiat first and document the conversion; record recipients, wallet addresses, and transaction hashes. _Output: asset transfer records._
6. **Prepare final liquidation accounts** — opening balance, all liquidation movements, final balance (typically zero); an optional short liquidation report may accompany.
7. **Final confirmation by Members** — confirm completion and no remaining obligations; approve the final accounts; grant discharge (Entlastung) to the liquidators (per §6.1). For an **unregistered** association, legal existence ends on approval of the final accounts. _Output: signed approval of accounts._
8. **Tax & regulatory closure** — notify the tax authority of the wind-up and the recognised allocation; file final tax / VAT returns; close AHV accounts if there were employees; deregister as a tax-exempt entity. Tax-exempt treatment generally continues through an orderly liquidation provided the asset-binding (Vermögensbindung) is respected — which is why Step 4 matters.
9. **Close bank accounts & infrastructure** — close accounts after confirming zero balances and archive statements; confirm wallets are empty; decommission the multisig only **after** all transfers are confirmed (premature decommissioning can strand assets or deadlock signing); close remaining tools, domains, subscriptions.
10. **Record retention** — retain all records (governing documents, financials, resolutions, transfer records, tax correspondence) for **ten years**; this outlives the association and supports the indemnification (§6.4) and end-of-membership (§4.4) obligations that survive dissolution.

**If the association *is* registered in the Commercial Register:** the liquidation largely follows the rules for a stock corporation. The association is carried as "[Name] in Liquidation"; a call for creditors (Schuldenruf) must be published; deletion can be requested at the earliest one year after the creditor call (or three months if a licensed audit expert confirms in writing that debts are settled and no third-party interests are endangered); the deletion application is signed by all liquidators; legal existence ends on **deletion from the register**, not on approval of the final accounts. Check the register if registration status is in doubt — the two paths differ materially (weeks vs. a year or more).

_Outcome: the association is fully dissolved and wound up — debts settled, remaining assets allocated to a purpose-aligned recipient with tax-authority recognition, final accounts approved, tax/AHV closed, infrastructure decommissioned, records retained ten years._`;
```

- [ ] **Step 3: Rewrite the builder**

In the same file, replace the entire `buildDissolutionResolutionMarkdown` function (currently around lines 460–500) with:

```typescript
const DISSOLUTION_GROUND_LABELS: Record<string, string> = {
  PURPOSE_FULFILLED: "fulfilment of the Association's purpose",
  UNANIMOUS: "a unanimous resolution of the Members",
  REQUIRED_BY_LAW: "a circumstance required by applicable law",
};

const DISSOLUTION_FORM_LABELS: Record<string, string> = {
  PHYSICAL: "Physical",
  VIRTUAL: "Virtual",
  MIXED: "Mixed",
  WRITTEN: "Written (Urabstimmung)",
};

export function buildDissolutionResolutionMarkdown(
  state: SwissAssociationState,
) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const address = state.registeredAddress || state.seatCity || "[Address]";
  const d = state.dissolution;
  // dissolutionDate is stored as a full ISO datetime (the Date scalar
  // validates via z.iso.datetime()); show date-only in the document.
  const date = d?.dissolutionDate
    ? d.dissolutionDate.slice(0, 10)
    : formatDate(undefined);
  const form = d?.resolutionForm
    ? DISSOLUTION_FORM_LABELS[d.resolutionForm]
    : "Physical / Virtual / Mixed / Written (Urabstimmung)";
  const ground = d?.dissolutionGround
    ? DISSOLUTION_GROUND_LABELS[d.dissolutionGround]
    : DISSOLUTION_GROUND_LABELS.UNANIMOUS;
  const recipient = d?.assetRecipient || "[Insert recipient]";
  const intendedUse = d?.assetIntendedUse || "[Insert purpose-aligned use]";

  // Liquidators: prefer the captured list, else fall back to the members roster.
  const liquidators =
    d?.liquidators && d.liquidators.length > 0
      ? d.liquidators.map((l) => ({ name: l.name, role: l.role || "" }))
      : (state.members || []).map((m) => ({ name: m.name, role: "" }));

  const liquidatorBlock =
    liquidators.length > 0
      ? liquidators
          .map((l) => `- ${l.name}${l.role ? ` — ${l.role}` : ""}`)
          .join("\n")
      : "- [Name] — [role / capacity]";

  let template = applyReplacements(dissolutionResolutionTemplateRaw, [
    { token: "[Association Name]", value: associationName },
    { token: "[Address]", value: address },
    { token: "[Date]", value: date },
    { token: "[Form]", value: form },
    { token: "[Ground]", value: ground },
    { token: "[Insert recipient]", value: recipient },
    { token: "[Insert purpose-aligned use]", value: intendedUse },
  ]);

  template = template.split("[Liquidators]").join(liquidatorBlock);

  // Include the registered-only block only when the association is registered;
  // otherwise strip the whole marked block.
  if (d?.isRegistered) {
    template = template
      .split("<!--REGISTERED_START-->\n")
      .join("")
      .split("<!--REGISTERED_END-->\n")
      .join("")
      .split("<!--REGISTERED_START-->")
      .join("")
      .split("<!--REGISTERED_END-->")
      .join("");
  } else {
    template = template.replace(
      /<!--REGISTERED_START-->[\s\S]*?<!--REGISTERED_END-->\n?/,
      "",
    );
  }

  const sigRows = (
    liquidators.length > 0 ? liquidators : [{ name: "", role: "" }]
  )
    .map(
      (l) =>
        `| ${l.name || "____________________"} | ${l.role || "____________"} | ____________________ | __________ |`,
    )
    .join("\n");
  template = template.split("[SignatureRows]").join(sigRows);

  return appendPlaceholderReport(template, "Dissolution Resolution");
}
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run tsc && npm run lint`
Expected: `tsc` PASS; lint 0 errors (pre-existing warnings only). `formatDate`, `applyReplacements`, `appendPlaceholderReport`, and the `dissolutionResolutionTemplateRaw` import already exist in this file.

- [ ] **Step 5: Commit**

```bash
git add "OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md" editors/swiss-association/components/stage2Templates.ts
git commit -m "$(cat <<'EOF'
feat: upgrade dissolution resolution template, memo, and builder

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Expand the Step 10 details form

**Files:**
- Overwrite: `editors/swiss-association/components/StepDissolutionDetails.tsx`

- [ ] **Step 1: Replace StepDissolutionDetails.tsx**

Overwrite the file entirely:

```tsx
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateId } from "document-model";
import type { SwissAssociationState } from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import { setDissolutionDetails } from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";
import { DISSOLUTION_PROCEDURE_MEMO } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
  onNext: () => void;
}

const FORM_OPTIONS = [
  { value: "PHYSICAL", label: "Physical" },
  { value: "VIRTUAL", label: "Virtual" },
  { value: "MIXED", label: "Mixed" },
  { value: "WRITTEN", label: "Written (Urabstimmung)" },
] as const;

type FormValue = (typeof FORM_OPTIONS)[number]["value"];

const GROUND_OPTIONS = [
  { value: "PURPOSE_FULFILLED", label: "Fulfilment of the purpose" },
  { value: "UNANIMOUS", label: "Unanimous resolution of the Members" },
  { value: "REQUIRED_BY_LAW", label: "Required by applicable law" },
] as const;

type GroundValue = (typeof GROUND_OPTIONS)[number]["value"];

interface LiquidatorRow {
  id: string;
  name: string;
  role: string;
}

export function StepDissolutionDetails({
  state,
  dispatch,
  onBack,
  onNext,
}: Props) {
  const d = state.dissolution;

  const [dissolutionDate, setDissolutionDate] = useState(
    d?.dissolutionDate ? d.dissolutionDate.slice(0, 10) : "",
  );
  const [resolutionForm, setResolutionForm] = useState<FormValue>(
    (d?.resolutionForm as FormValue) ?? "WRITTEN",
  );
  const [dissolutionGround, setDissolutionGround] = useState<GroundValue>(
    (d?.dissolutionGround as GroundValue) ?? "UNANIMOUS",
  );
  const [isRegistered, setIsRegistered] = useState<boolean>(
    d?.isRegistered ?? false,
  );
  const [assetRecipient, setAssetRecipient] = useState(d?.assetRecipient ?? "");
  const [assetIntendedUse, setAssetIntendedUse] = useState(
    d?.assetIntendedUse ?? "",
  );
  const [remainingAssetsSummary, setRemainingAssetsSummary] = useState(
    d?.remainingAssetsSummary ?? "",
  );
  const [liquidators, setLiquidators] = useState<LiquidatorRow[]>(() => {
    if (d?.liquidators && d.liquidators.length > 0) {
      return d.liquidators.map((l) => ({
        id: l.id,
        name: l.name,
        role: l.role ?? "",
      }));
    }
    // Seed from the members roster (Personalunion: members are the liquidators).
    return (state.members || []).map((m) => ({
      id: generateId(),
      name: m.name,
      role: "",
    }));
  });
  const [showProcedure, setShowProcedure] = useState(false);

  function updateLiquidator(id: string, patch: Partial<LiquidatorRow>) {
    setLiquidators((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }

  function addLiquidator() {
    setLiquidators((rows) => [
      ...rows,
      { id: generateId(), name: "", role: "" },
    ]);
  }

  function removeLiquidator(id: string) {
    setLiquidators((rows) => rows.filter((r) => r.id !== id));
  }

  function handleSave() {
    dispatch(
      setDissolutionDetails({
        // Date scalar validates via z.iso.datetime(); the date input emits
        // "YYYY-MM-DD", so widen it to a full ISO datetime before dispatch.
        dissolutionDate: dissolutionDate
          ? `${dissolutionDate}T00:00:00.000Z`
          : undefined,
        dissolutionGround,
        resolutionForm,
        isRegistered,
        assetRecipient: assetRecipient || undefined,
        assetIntendedUse: assetIntendedUse || undefined,
        liquidators: liquidators
          .filter((l) => l.name.trim() !== "")
          .map((l) => ({
            id: l.id,
            name: l.name.trim(),
            role: l.role.trim() || undefined,
          })),
        remainingAssetsSummary: remainingAssetsSummary || undefined,
      }),
    );
    onNext();
  }

  const isValid = dissolutionDate.trim() !== "" && assetRecipient.trim() !== "";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Dissolution Details
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Capture the liquidation and asset-distribution details. These populate
          the General Assembly dissolution resolution in the next step.
        </p>
      </div>

      <SectionCard title="Resolution">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Dissolution Date" required>
            <input
              type="date"
              value={dissolutionDate}
              onChange={(e) => setDissolutionDate(e.target.value)}
              className="sw-input"
            />
          </FormField>
          <FormField label="Resolution Form">
            <select
              value={resolutionForm}
              onChange={(e) => setResolutionForm(e.target.value as FormValue)}
              className="sw-input"
            >
              {FORM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField
          label="Ground for Dissolution"
          hint="The basis under the AoA's Dissolution and Liquidation article."
        >
          <select
            value={dissolutionGround}
            onChange={(e) =>
              setDissolutionGround(e.target.value as GroundValue)
            }
            className="sw-input"
          >
            {GROUND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isRegistered}
            onChange={(e) => setIsRegistered(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Association is entered in the Commercial Register
            <span className="block text-xs text-slate-500">
              Adds the register-deletion / creditor-call steps to the resolution.
              Most charitable associations are unregistered — leave unchecked if
              unsure.
            </span>
          </span>
        </label>
      </SectionCard>

      <SectionCard title="Liquidators">
        <p className="text-xs text-slate-500">
          Under Personalunion the Members execute the liquidation. Seeded from
          your members roster — add a role/capacity per person (e.g. multisig
          signer).
        </p>
        <div className="space-y-2">
          {liquidators.map((l) => (
            <div key={l.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={l.name}
                onChange={(e) =>
                  updateLiquidator(l.id, { name: e.target.value })
                }
                placeholder="Name"
                className="sw-input flex-1"
              />
              <input
                type="text"
                value={l.role}
                onChange={(e) =>
                  updateLiquidator(l.id, { role: e.target.value })
                }
                placeholder="Role / capacity"
                className="sw-input flex-1"
              />
              <button
                type="button"
                onClick={() => removeLiquidator(l.id)}
                className="text-slate-400 hover:text-red-500 px-2"
                aria-label="Remove liquidator"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLiquidator}
          className="sw-btn-secondary text-sm"
        >
          + Add liquidator
        </button>
      </SectionCard>

      <SectionCard title="Liquidation & Assets">
        <FormField
          label="Asset Recipient"
          required
          hint="Remaining assets go to a similar-purpose, tax-exempt entity — never to members. Subject to cantonal tax-authority recognition before transfer."
        >
          <input
            type="text"
            value={assetRecipient}
            onChange={(e) => setAssetRecipient(e.target.value)}
            placeholder="e.g. Another tax-exempt non-profit with a similar purpose"
            className="sw-input"
          />
        </FormField>
        <FormField
          label="Intended Use of Assets"
          hint="How the recipient will use the assets, consistent with the purpose."
        >
          <input
            type="text"
            value={assetIntendedUse}
            onChange={(e) => setAssetIntendedUse(e.target.value)}
            placeholder="e.g. Continued funding of open-source public goods"
            className="sw-input"
          />
        </FormField>
        <FormField label="Remaining Assets Summary" hint="Optional.">
          <textarea
            value={remainingAssetsSummary}
            onChange={(e) => setRemainingAssetsSummary(e.target.value)}
            rows={3}
            placeholder="e.g. CHF 0 after all transfers; wallets emptied."
            className="sw-input resize-none"
          />
        </FormField>
      </SectionCard>

      <div className="border border-slate-200 rounded-xl bg-white">
        <button
          type="button"
          onClick={() => setShowProcedure((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700"
        >
          <span>Dissolution &amp; Liquidation Procedure (reference)</span>
          <span className="text-slate-400">{showProcedure ? "▲" : "▼"}</span>
        </button>
        {showProcedure && (
          <div className="px-4 pb-4 prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {DISSOLUTION_PROCEDURE_MEMO}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {!isValid && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          Please provide the dissolution date and asset recipient before
          continuing.
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid}
          className="sw-btn-primary"
        >
          Save &amp; Continue →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run tsc && npm run lint`
Expected: `tsc` PASS; lint 0 errors. No remaining reference to `executingPersons` anywhere: `grep -rn "executingPersons" editors document-models --include="*.ts" --include="*.tsx" | grep -vE "/gen/|/dist/"` → no output.

- [ ] **Step 3: Commit**

```bash
git add editors/swiss-association/components/StepDissolutionDetails.tsx
git commit -m "$(cat <<'EOF'
feat: capture dissolution ground, registration, intended use, liquidators

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full gates**

Run: `npm run tsc && npm run lint && npx vitest run`
Expected: `tsc` PASS; lint 0 errors; all tests pass (existing + updated dissolution + documents tests).

- [ ] **Step 2: Manual smoke (recommended)**

In Vetra Studio: open a SwissAssociation document with at least two members.
- Step 10 (Dissolution Details): the liquidator list is pre-seeded from members; ground select and the "Mixed" form option are present; the registered checkbox and the intended-use field appear. Fill the date + recipient, add roles, save.
- Step 11 (Dissolution Resolution): generate the resolution. Confirm: name-based AoA citations (no "§11"; §6.1/§6.4 retained), the selected ground in §1, liquidator rows in §3, recipient + intended use in §4, a signature **table** built from the liquidators, and the registered-only paragraph in §6 **present only when** the checkbox was ticked. Sign + lock works.

- [ ] **Step 3: Confirm clean tree**

Run: `git status -s`
Expected: clean (all feature changes committed).

---

## Out of scope (unchanged from spec)

- The Documents Archive View (separate spec/plan) — done after this.
- Full liquidation machinery (debt-settlement tracking, transaction-hash capture, separate final-accounts document).
- Automated tax-authority / registry filing.
- Tailoring the procedure memo's content to the `isRegistered` toggle (memo stays complete as reference).
- Migrating any existing dissolution data (pre-release; `executingPersons` is dropped outright).
