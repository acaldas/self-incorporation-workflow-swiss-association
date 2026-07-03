import type { SwissAssociationState } from "document-models/swiss-association";
import aoaTemplateRaw from "../../../oh legal  templates.md/_[TEMPLATE] default AoA OH _ standard  - .docx.md?raw";
import foundingMinutesTemplateRaw from "../../../oh legal  templates.md/[TEMPLATE] OH Founding Meeting Minutes.md?raw";
import mpaV2TemplateRaw from "../../../OH legal incorporation templates copy.md/[TEMPLATE]  MPA v2.docx.md?raw";
import regulationGATemplateRaw from "../../../OH legal incorporation templates copy.md/[TEMPLATE] OH  Regs General Assembly.md?raw";
import dissolutionResolutionTemplateRaw from "../../../OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md?raw";

function formatList(items: string[]) {
  if (items.length === 0) return "- (to be completed)";
  return items.map((item) => `- ${item}`).join("\n");
}

function formatDate(date: string | null | undefined) {
  return date || new Date().toISOString().slice(0, 10);
}

function formatMemberLine(
  name: string,
  nationalityOrCountry: string,
  residenceOrCity: string,
) {
  return `${name} (${nationalityOrCountry}, ${residenceOrCity})`;
}

function replaceToken(template: string, token: string, value: string) {
  let next = template.split(token).join(value);

  // Some legal templates escape bracket placeholders as \[Token\].
  if (token.includes("[") || token.includes("]")) {
    const escapedToken = token.replaceAll("[", "\\[").replaceAll("]", "\\]");
    next = next.split(escapedToken).join(value);
  }

  return next;
}

function replaceTokenOnce(template: string, token: string, value: string) {
  let next = template.replace(token, value);

  if (token.includes("[") || token.includes("]")) {
    const escapedToken = token.replaceAll("[", "\\[").replaceAll("]", "\\]");
    next = next.replace(escapedToken, value);
  }

  return next;
}

type ReplacementSpec = {
  token: string;
  value: string;
};

const IGNORED_BRACKET_TOKENS = new Set([
  "[Inaugural Meeting Minutes]",
  "[…]",
  "[...]",
  "[]",
  "[ ]",
]);

function applyReplacements(template: string, replacements: ReplacementSpec[]) {
  return replacements.reduce(
    (nextTemplate, replacement) =>
      replaceToken(nextTemplate, replacement.token, replacement.value),
    template,
  );
}

function findUnresolvedBracketTokens(template: string) {
  const matches = template.match(/\[[^\]\n]{1,120}\]/g) || [];
  const cleaned = matches
    .map((match) => match.trim())
    .filter((match) => !IGNORED_BRACKET_TOKENS.has(match));
  return Array.from(new Set(cleaned)).sort((a, b) => a.localeCompare(b));
}

function appendPlaceholderReport(template: string, templateName: string) {
  const unresolved = findUnresolvedBracketTokens(template);
  if (unresolved.length === 0) return template;

  return `${template}

---

> Placeholder check (${templateName}): unresolved bracket tokens
${unresolved.map((token) => `- ${token}`).join("\n")}
`;
}

function toMemberLines(state: SwissAssociationState) {
  return (state.members || []).map((member) =>
    formatMemberLine(
      member.name,
      member.nationalityOrCountry,
      member.residenceOrCity,
    ),
  );
}

// Attendee line for the founding minutes: "Name/Entity + representative, City".
// The representative is only shown for members that have one (e.g. legal entities).
function toFoundingAttendeeLines(state: SwissAssociationState) {
  return (state.members || []).map((member) => {
    const rep = member.representative ? ` + ${member.representative}` : "";
    return `${member.name}${rep}, ${member.residenceOrCity}`;
  });
}

function toBoardMemberLines(state: SwissAssociationState) {
  return (state.boardMembers || []).map((member) =>
    formatMemberLine(
      member.name,
      member.nationalityOrCountry,
      member.residenceOrCity,
    ),
  );
}

function resolveAddress(state: SwissAssociationState) {
  return (
    state.registeredAddress ||
    `${state.seatCity || "Zug"}, ${state.seatCanton || "Switzerland"}`
  );
}

function stripAoaPreamble(template: string): string {
  // The template starts with a description/parameter block before the first table row.
  // Strip everything up to (but not including) the first table row.
  const tableStart = template.indexOf("|");
  return tableStart > 0 ? template.slice(tableStart) : template;
}

function buildSignaturePage(
  associationName: string,
  date: string,
  city: string,
  boardMembers: { name: string; nationalityOrCountry: string }[],
): string {
  const signerBlocks = boardMembers
    .map(
      (m) => `---

**${m.name}**
Board Member · ${m.nationalityOrCountry}

Signature: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Place: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
`,
    )
    .join("\n");

  return `

---

# Signature Page

## ${associationName} — Articles of Association

The undersigned board members hereby confirm their adoption of the Articles of Association of **${associationName}**, executed on **${date}** in **${city}**, Switzerland.

${signerBlocks}`;
}

export function buildAoaMarkdown(state: SwissAssociationState) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const date = formatDate(state.foundingDate);
  const city = state.seatCity || "Zug";

  const templateWithBaseData = applyReplacements(aoaTemplateRaw, [
    { token: "[Association Name]", value: associationName },
    { token: "[purpose]", value: state.purposeEn || "N/A" },
    { token: "[Date]", value: date },
    { token: "[Address]", value: resolveAddress(state) },
  ]);
  const signatories = formatList(toMemberLines(state));
  let template = applyReplacements(templateWithBaseData, [
    { token: "[Signatories (Name, Company}]", value: signatories },
    { token: "[Signatory: Signing Party (Name, Company)]", value: signatories },
    {
      token: "[cryptographic signature hash (per signing party, timestamp]",
      value: "pending-signature-hash",
    },
    { token: "[MJP domicile provider]", value: resolveAddress(state) },
  ]);

  // Strip the description/parameter preamble and add a clean title
  template = stripAoaPreamble(template);
  template = `# ${associationName} Articles of Association\n\n` + template;

  if (!state.isPersonalunion) {
    template = replaceToken(
      template,
      "General Assembly (personal union with the board)",
      "General Assembly and a separate board",
    );
    template = replaceToken(
      template,
      "Generalversammlung (Personalunion mit Vorstand)",
      "Generalversammlung und separater Vorstand",
    );
    template += `\n\n## Art. 7 Separate Board Composition (Generated)\n${formatList(
      toBoardMemberLines(state),
    )}\n`;
  }

  // Append professional signature page for board members
  const signers = state.boardMembers?.length
    ? state.boardMembers
    : state.members || [];
  template += buildSignaturePage(associationName, date, city, signers);

  return appendPlaceholderReport(template, "AoA");
}

export function buildFoundingMinutesMarkdown(state: SwissAssociationState) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const date = formatDate(state.foundingDate);
  const chairName = state.chairName || "Chair";
  const secretaryName = state.secretaryName || "Secretary";

  // Registered (Swiss) seat — set in Step 1. Distinct from and independent of
  // the meeting venue: the meeting may be held abroad while the seat stays Swiss.
  const seatCity = state.seatCity || "[Registered Seat]";

  // Meeting place — entered in the Founding Meeting step (Step 4).
  const meetingPlaceSentence = state.meetingIsOnline
    ? "The founding meeting was held online."
    : `The founding meeting was held at ${
        state.meetingVenue || "[Meeting Venue]"
      }.`;
  const meetingPlaceLabel = state.meetingIsOnline
    ? "Online"
    : state.meetingVenue || "[Meeting Venue]";

  // Optional local counsel (e.g. a Swiss counsel like MME). Empty = none.
  const counselName = state.counselName?.trim() || "";

  // Attendees = founding members (Name/Entity + representative, City).
  const memberLines = toFoundingAttendeeLines(state);
  const membersBlock = formatList(memberLines);
  // Top attendance list additionally names local counsel when present.
  const attendantBlock = formatList(
    counselName
      ? [...memberLines, `${counselName} (local counsel)`]
      : memberLines,
  );

  // The template opens with an authoring legend (title, "Description",
  // "Variable Parameters", "Fix Parameters") that must NOT appear in the
  // executed document. Strip everything before the real minutes heading.
  // Anchor on the heading's distinctive "\[Association Name\]" token — the
  // legend title above it is "**Founding Meeting Minutes**", so a bare
  // "**Founding Meeting" anchor would wrongly match the title and strip nothing.
  let raw = foundingMinutesTemplateRaw;
  const bodyStart = raw.indexOf("**Founding Meeting  \\[Association Name\\]");
  if (bodyStart > 0) raw = raw.slice(bodyStart);

  let template = applyReplacements(raw, [
    { token: "[Association Name]", value: associationName },
    // Match the name WITH its trailing common-noun "association" first, so a
    // name that already ends in "Association" doesn't read "… association".
    {
      token: "Powerhouse Genesis Operational Hub association",
      value: associationName,
    },
    { token: "Powerhouse Genesis Operational Hub", value: associationName },
    { token: "[Association name]", value: associationName },
    { token: "[Date]", value: date },
    // Registered (Swiss) seat — replace the hardcoded "Zug" literals.
    {
      token: "registered seat in Zug",
      value: `registered seat in ${seatCity}`,
    },
    { token: "Registered seat: Zug", value: `Registered seat: ${seatCity}` },
    // Meeting place — preamble label first, then the body line (see below).
    {
      token: "Meeting Place: Online",
      value: `Meeting Place: ${meetingPlaceLabel}`,
    },
    { token: "*Place: Online*", value: `*${meetingPlaceSentence}*` },
    // Section 5 signatory list = founding members only (counsel does not sign for the association).
    { token: "[Attendees / Founding Members]", value: membersBlock },
    { token: "[Role, Chair]", value: chairName },
    {
      token: "Chair [Role]",
      value: `Chair ${chairName}`,
    },
    {
      token: "Secretary  [Role]",
      value: `Secretary ${secretaryName}`,
    },
    { token: "[signatory power]", value: "joint signatory power" },
  ]);

  // Top "Attendant" section lists the same placeholder three times, each wrapped
  // in a single-asterisk italic pair (*…*). Replace the WHOLE wrapped line — not
  // just the inner token — otherwise the empty duplicates leave orphan "**"
  // markers. The first gets the full (unwrapped) attendance block so it renders
  // as a real bullet list; the remaining duplicates are removed entirely.
  template = replaceTokenOnce(
    template,
    "*Attendees (Name / Company \\+ representative, City)*",
    attendantBlock,
  );
  template = replaceToken(
    template,
    "*Attendees (Name / Company \\+ representative, City)*",
    "",
  );
  template = replaceToken(
    template,
    "*Attendees (Name / Company + representative, City)*",
    "",
  );

  template = replaceToken(
    template,
    "CARS as Secretary of the meeting",
    `${secretaryName} as Secretary of the meeting`,
  );

  // Replace the two signatory placeholder lines. In the template the chair's
  // line has no leading curly quote ("Signatory\u201d: \u2026") and the secretary's does
  // ("\u201cSignatory\u201d: \u2026"). Replace the leading-quote (secretary) line FIRST so the
  // chair pattern below can't also match inside the secretary line.
  template = template
    .replace(
      /\u201cSignatory\u201d: Signing Party \(Name, Entity, Role\)\)/,
      `${secretaryName} (Secretary)`,
    )
    .replace(
      /Signatory\u201d: Signing Party \(Name, Entity, Role\)\)/,
      `${chairName} (Chair)`,
    );

  // Prepend clean title
  template =
    `# ${associationName} \u2014 Founding Meeting Minutes\n\n` + template;

  // Append professional signature page
  template += `

---

# Signature Page

## ${associationName} — Founding Meeting Minutes

The undersigned hereby confirm the founding meeting of **${associationName}**, held on **${date}**.

---

**${chairName}**
Chair of the Founding Meeting

Signature: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Place: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

---

**${secretaryName}**
Secretary of the Founding Meeting

Signature: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Place: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
`;

  // Optional local counsel signature block — only when counsel was named.
  if (counselName) {
    template += `
---

**${counselName}**
Local Counsel

Signature: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Place: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
`;
  }

  return appendPlaceholderReport(template, "Founding Meeting Minutes");
}

export function buildRegulationGAMarkdown(state: SwissAssociationState) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const date = formatDate(state.foundingDate);
  const chairName = state.chairName || "Chair";
  const secretaryName = state.secretaryName || "Secretary";

  // Strip preamble BEFORE replacements so the anchor text is still intact
  let raw = regulationGATemplateRaw;
  const bodyStart = raw.indexOf("**Article I.");
  if (bodyStart > 0) raw = raw.slice(bodyStart);

  let template = applyReplacements(raw, [
    { token: "[Association Name]", value: associationName },
    { token: "[Date]", value: date },
    {
      token: "[default majority rule =absolute majority]",
      value: "absolute majority",
    },
    {
      token: "[special majority rule = unanimous vote]",
      value: "unanimous vote",
    },
  ]);

  // Prepend clean title
  template =
    `# ${associationName} — Regulation of the General Assembly\n\n` + template;

  // Replace signatory placeholders
  template = template
    .replace("Signatory 1 (Role = chair]", chairName)
    .replace("Signatory 2 (Role = secretary)", secretaryName);

  // Append professional signature page
  const sigPage = `

---

# Signature Page

## ${associationName} — Regulation of the General Assembly

Approved by the General Assembly on **${date}**.

---

**${chairName}**
Chair of the General Assembly

Signature: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Place: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

---

**${secretaryName}**
Secretary of the General Assembly

Signature: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

Place: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
`;

  template += sigPage;
  return appendPlaceholderReport(template, "Regulation GA");
}

export function buildMpaMarkdown(state: SwissAssociationState) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const boardMembers = toBoardMemberLines(state);
  const multisig = state.multisig;
  const activeSigner = state.boardMembers?.[0] || state.members?.[0];
  let template = applyReplacements(mpaV2TemplateRaw, [
    { token: "[Association Name]", value: associationName },
    {
      token: "[Active Signer  Personal Name]",
      value: activeSigner?.name || "Active Signer",
    },
    {
      token: "[Citizenship]",
      value: activeSigner?.nationalityOrCountry || "N/A",
    },
    {
      token: "[Residence Country]",
      value: activeSigner?.residenceOrCity || "N/A",
    },
    {
      token: "[Active Signer Entity Name]",
      value: activeSigner?.name || "Active Signer Entity",
    },
    {
      token: "(Incorporation City, Incorporation Country]",
      value: `${activeSigner?.residenceOrCity || "N/A"}, ${activeSigner?.nationalityOrCountry || "N/A"}`,
    },
    {
      token: "Number of Keys",
      value: String(multisig?.keysTotal || "N/A"),
    },
    {
      token: "[Decision Quorum]",
      value: String(multisig?.decisionQuorum || "N/A"),
    },
    {
      token: "[Multisignature Platform]",
      value: multisig?.platform || "Safe Multisig",
    },
    {
      token: "[Wallet Address]",
      value: multisig?.address || "N/A",
    },
    {
      token: "Private Channel (for association members only) Discord channel",
      value: `Private Channel (for association members only) ${multisig?.privateChannel || "N/A"}`,
    },
    {
      token: "[Link to internal policy documents]",
      value: multisig?.internalPolicyLink || "N/A",
    },
  ]);

  // Add explicit generated signer roster at the end.
  template += `\n\n## Generated Signer Roster\n${formatList(boardMembers)}\n`;
  return appendPlaceholderReport(template, "MPA v2");
}

export const DISSOLUTION_PROCEDURE_MEMO = `## Dissolution & Liquidation Procedure (Reference)

_Assumptions: unanimous agreement, no debts, no disputes. Legal basis: ZGB, Articles of Association, Regulation GA._

1. **General Assembly Resolution (unanimous)** — resolve to dissolve, confirm no debts, designate the persons executing liquidation, approve use of remaining assets, instruct final accounts and tax filings.
2. **Confirm financial position** — closing balance sheet at the dissolution date; reconcile bank accounts, crypto wallets, receivables.
3. **Settle final administrative items** — invoices, contracts, registrations (VAT, social security), tools/subscriptions.
4. **Transfer / allocate remaining assets** — per purpose, no member distributions; document recipients, wallet addresses, transaction hashes.
5. **Prepare final liquidation accounts** — opening balance, transfers, final balance (typically zero).
6. **Final confirmation by Members** — confirm completion and approve final accounts.
7. **Tax & regulatory closure** — notify tax authorities, file final returns, close social security.
8. **Close bank accounts & infrastructure** — confirm zero balances, archive statements, empty/decommission wallets.
9. **Formal deregistration** — if registered, file deletion with the Swiss Commercial Register.
10. **Record retention** — store all records for 10 years.

_Outcome: Association fully dissolved, compliant, and closed with a clean audit trail._`;

export function buildDissolutionResolutionMarkdown(
  state: SwissAssociationState,
) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const d = state.dissolution;
  // dissolutionDate is stored as a full ISO datetime (the Date scalar
  // validates via z.iso.datetime()); show date-only in the document.
  const date = d?.dissolutionDate
    ? d.dissolutionDate.slice(0, 10)
    : formatDate(undefined);
  const formLabels: Record<string, string> = {
    PHYSICAL: "Physical",
    VIRTUAL: "Virtual",
    WRITTEN: "Written (Urabstimmung)",
  };
  const form = d?.resolutionForm
    ? formLabels[d.resolutionForm]
    : "Physical / Virtual / Written (Urabstimmung)";
  const recipient = d?.assetRecipient || "[Insert recipient]";
  const signers = (state.members || []).map((m) => m.name);

  let template = applyReplacements(dissolutionResolutionTemplateRaw, [
    { token: "[Association Name]", value: associationName },
    { token: "[Date]", value: date },
    { token: "[Form]", value: form },
    { token: "[Insert recipient]", value: recipient },
  ]);

  const sigBlock =
    signers.length > 0
      ? signers
          .map(
            (name) =>
              `Name: ${name}    Signature: ____________________    Date: __________`,
          )
          .join("\n\n")
      : "Name: ____________________    Signature: ____________________    Date: __________";
  template = template.split("[Signatures]").join(sigBlock);

  return appendPlaceholderReport(template, "Dissolution Resolution");
}
