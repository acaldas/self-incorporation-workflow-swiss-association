/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating SwissAssociationDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  SwissAssociationDocument,
  SwissAssociationGlobalState,
  SwissAssociationLocalState,
  SwissAssociationPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): SwissAssociationGlobalState {
  return {
    nameEn: null,
    nameDe: null,
    seatCity: "Zug",
    seatCanton: "Canton Zug",
    registeredAddress: null,
    foundingDate: null,
    fiscalYearEnd: "31 December",
    membershipFee: "none",
    primaryLanguage: "EN",
    purposeEn: null,
    purposeDe: null,
    members: [],
    boardMembers: null,
    isPersonalunion: null,
    chairName: null,
    chairRole: null,
    secretaryName: null,
    secretaryRole: null,
    multisig: null,
    stage2Started: null,
    aoaDocument: null,
    foundingMinutesDocument: null,
    mpaDocument: null,
    regGaDocument: null,
    dissolution: null,
    dissolutionResolutionDocument: null,
    incorporationCompletedAt: null,
    currentPhase: 1,
    phases: [
      {
        id: "phase-1",
        phaseNumber: 1,
        name: "Pre-Incorporation",
        status: "IN_PROGRESS",
        documentsGenerated: false,
        documentsSigned: false,
        completedDate: null,
      },
      {
        id: "phase-2",
        phaseNumber: 2,
        name: "Founding Meeting",
        status: "LOCKED",
        documentsGenerated: false,
        documentsSigned: false,
        completedDate: null,
      },
      {
        id: "phase-3",
        phaseNumber: 3,
        name: "Multisig Setup",
        status: "LOCKED",
        documentsGenerated: false,
        documentsSigned: false,
        completedDate: null,
      },
    ],
    languageClauseNeedsUpdate: true,
    belowRecommendedMemberCount: null,
    registeredAddressConfirmed: null,
    customNotes: [],
  };
}

export function defaultLocalState(): SwissAssociationLocalState {
  return {};
}

export function defaultPHState(): SwissAssociationPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<SwissAssociationGlobalState>,
): SwissAssociationGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<SwissAssociationLocalState>,
): SwissAssociationLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as SwissAssociationLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<SwissAssociationGlobalState>,
  localState?: Partial<SwissAssociationLocalState>,
): SwissAssociationPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a SwissAssociationDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createSwissAssociationDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<SwissAssociationGlobalState>;
    local?: Partial<SwissAssociationLocalState>;
  }>,
): SwissAssociationDocument {
  const document = utils.createDocument(
    state
      ? createState(
          createBaseState(state.auth, state.document),
          state.global,
          state.local,
        )
      : undefined,
  );

  return document;
}
