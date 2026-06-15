/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { SwissAssociationAction } from "./actions.js";
import type { SwissAssociationState as SwissAssociationGlobalState } from "./schema/types.js";

type SwissAssociationLocalState = Record<PropertyKey, never>;

type SwissAssociationPHState = PHBaseState & {
  global: SwissAssociationGlobalState;
  local: SwissAssociationLocalState;
};
type SwissAssociationDocument = PHDocument<SwissAssociationPHState>;

export * from "./schema/types.js";

export type {
  SwissAssociationAction,
  SwissAssociationDocument,
  SwissAssociationGlobalState,
  SwissAssociationLocalState,
  SwissAssociationPHState,
};
