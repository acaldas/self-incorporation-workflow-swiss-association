/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentModelUtils, PHBaseState, Reducer } from "document-model";
import {
  baseCreateDocument,
  baseLoadFromInputVersioned,
  baseSaveToFileHandle,
  createBaseState,
} from "document-model";
import { swissAssociationUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsSwissAssociationDocument,
  assertIsSwissAssociationState,
  isSwissAssociationDocument,
  isSwissAssociationState,
} from "./document-schema.js";
import { swissAssociationDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  SwissAssociationGlobalState,
  SwissAssociationLocalState,
  SwissAssociationPHState,
} from "./types.js";

export const initialGlobalState: SwissAssociationGlobalState = {
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
  meetingIsOnline: null,
  meetingVenue: null,
  counselName: null,
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
  contributorAgreements: [],
};
export const initialLocalState: SwissAssociationLocalState = {};

export const utils: DocumentModelUtils<SwissAssociationPHState> = {
  fileExtension: "phsa",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(
      utils.createState,
      state,
      swissAssociationDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: swissAssociationUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isSwissAssociationState(state);
  },
  assertIsStateOfType(state) {
    return assertIsSwissAssociationState(state);
  },
  isDocumentOfType(document) {
    return isSwissAssociationDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsSwissAssociationDocument(document);
  },
};
