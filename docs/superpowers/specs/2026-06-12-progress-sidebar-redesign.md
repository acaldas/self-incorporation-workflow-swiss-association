# Progress Sidebar Redesign — Self Incorporation Flow

## Overview

Redesign the right sidebar progress tracker in the Swiss Association editor. Replace the current flat phase/checklist layout with a 3-stage stacked progress card design featuring milestone markers and a collapsible panel. Also rename the flow from "Swiss Association Incorporation" to "Self Incorporation Flow" throughout the UI.

## Context

The current sidebar (`WizardLayout.tsx` right panel) shows 4 phases with small dots and text labels. Problems: it looks plain, doesn't feel motivating, and its structure doesn't match the BPMN workflow (v2.3) that defines the legal incorporation process.

The BPMN has 4 phases and 4 actor pools, but from the user's perspective the work collapses to 3 stages. BPMN Phase 2 (Preparation of Governing Documents) has no user tasks — it's system/counsel work — so it merges into the background.

Source: `swiss_association_bpmn_17.html`, Figure 4 (v2.3).

## Stage Structure

| Stage | Name | User Tasks | Milestone |
|-------|------|-----------|-----------|
| 1 | Pre-Incorporation | Association details, Member registry, Board setup | — |
| 2 | Incorporation | Sign AoA, Set meeting roles, Sign Reg GA, Sign Minutes | M1: Entity legally constituted |
| 3 | Post-Incorporation | Choose multisig, Sign Resolution, Sign MPA | M2: Entity enabled to pay and get paid |

### How stages map to document state

The sidebar tracks task completion from the document state, not from wizard step numbers. The wizard step order may be reordered in future to match v2.3 BPMN (e.g. moving multisig config after founding meeting), but that's out of scope here.

| Task | Tracked by |
|------|-----------|
| Association details | `nameEn && seatCity && registeredAddress && purposeEn` |
| Member registry | `members.length >= 2` |
| Board setup | `boardMembers.length >= 1` |
| AoA signed | `aoaDocument?.isSigned` |
| Meeting roles set | `chairName && secretaryName` |
| Reg GA signed | *(not currently tracked in state — show as always-pending for now)* |
| Minutes signed | `foundingMinutesDocument?.isSigned` |
| Multisig configured | `multisig !== null` |
| Resolution signed | *(future — not in current schema)* |
| MPA signed | `mpaDocument?.isSigned` |

### Milestone conditions

- **M1** fires when: `aoaDocument?.isSigned && foundingMinutesDocument?.isSigned`
- **M2** fires when: M1 is reached AND (`mpaDocument?.isSigned` OR multisig was declined)

### No-multisig case

If user does not configure multisig, Stage 3 still appears but with a single summary state: "No multisig needed" with a checkmark. M2 fires immediately after M1 since there's nothing to do. The stage card shows as "Done" with the milestone reached.

## Visual Design

### Overall Header

- Label: "SELF INCORPORATION FLOW" (uppercase, small, muted)
- Right-aligned fraction counter: e.g. "3 / 7"
- Thin progress bar below: green-to-red gradient showing overall completion

### Stage Cards

Three vertically stacked cards, one per stage.

**Done state** (green):
- Green background (`#f0fdf4`), green border (`#bbf7d0`)
- Green checkmark circle + stage name
- "Done" badge (green pill)
- Collapsed — no task list visible
- Progress bar at 100%

**Active state** (red):
- Red background (`#fef2f2`), red border (`#fecaca`)
- Red numbered circle + stage name
- Fraction counter (e.g. "1 / 4")
- Progress bar showing completion ratio
- Expanded task list with checkmarks:
  - Done task: green checkmark SVG + strikethrough grey text
  - Current task: red ring outline + bold black text
  - Pending task: grey ring outline + muted text

**Locked state** (grey):
- Grey background (`#f8fafc`), grey border (`#e2e8f0`)
- Grey numbered circle + stage name
- 50% opacity
- No task list
- Progress bar empty

### Milestone Cards

Gold mini-cards embedded inside their parent stage card, below the task list.

**Unreached state:**
- Background `#fefbf0`, border `#e8dba8`
- Star icon (★) + "MILESTONE" label + title text
- Muted gold colors

**Reached state:**
- Same background, stronger border (`#d4a92a`, 1.5px)
- Subtle gold glow (`box-shadow`)
- "MILESTONE REACHED" label (bold)
- Title text in stronger color

### Milestone titles

- M1: "Entity legally constituted"
- M2: "Entity enabled to pay and get paid"

### Collapsible Panel

- Small toggle button in the top-right corner of the sidebar (chevron icon pointing right to collapse, left to expand)
- When collapsed: panel hides completely, a small floating pill button appears at the top-right of the main content area showing stage dots + overall progress to re-open
- When expanded: sidebar appears at its standard width (~208px / `w-52`)
- Default state: expanded
- Collapse state stored in React `useState` (no persistence needed)

## Behavior

### Stage progression

- Stage 1 active at start
- Stage 2 unlocks when Stage 1 tasks are complete (details filled, members added, board set up)
- Stage 3 unlocks after M1 is reached (AoA + Minutes signed)
- If user does not configure multisig, Stage 3 shows "No multisig needed" and auto-completes (see "No-multisig case" above)

### Card expansion

- Only the active stage shows its task list
- Completed stages collapse to header-only (checkmark + name + "Done" badge)
- Locked stages show just header + milestone preview (dimmed)

### Overall progress counter

- Denominator = total user tasks across all visible stages
- Numerator = completed tasks
- The count adjusts if multisig is declined (fewer tasks)

## Naming Changes

- Header bar title: "Swiss Association Incorporation" → "Self Incorporation Flow"
- Header bar subtitle: keep "Non-profit Verein · Art. 60–79 ZGB"
- Sidebar header: "Progress" → "SELF INCORPORATION FLOW"
- Left nav header: "Incorporation Steps" stays (these are the wizard steps, not stages)

## Files to Modify

| File | Change |
|------|--------|
| `editors/swiss-association/components/WizardLayout.tsx` | Replace right sidebar with new ProgressSidebar component; add collapse toggle; update header title |
| `editors/swiss-association/components/ProgressSidebar.tsx` | New component: stage cards, milestones, collapse behavior |
| `editors/swiss-association/editor.tsx` | Update progress data computation to match 3-stage model; pass milestone states |

## Out of Scope

- Left sidebar step navigation (stays as-is)
- Step content/forms (stays as-is)
- Document model changes (no schema or reducer changes)
- Counsel/Provider pool tasks (future work)
- Signature lifecycle state machine (future work)
