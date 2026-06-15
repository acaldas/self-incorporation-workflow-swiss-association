/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  SetAssociationNameInput,
  SetAssociationSeatInput,
  SetFiscalDetailsInput,
  SetFoundingDateInput,
  SetPurposeInput,
} from "../types.js";

export type SetAssociationNameAction = Action & {
  type: "SET_ASSOCIATION_NAME";
  input: SetAssociationNameInput;
};
export type SetAssociationSeatAction = Action & {
  type: "SET_ASSOCIATION_SEAT";
  input: SetAssociationSeatInput;
};
export type SetFoundingDateAction = Action & {
  type: "SET_FOUNDING_DATE";
  input: SetFoundingDateInput;
};
export type SetFiscalDetailsAction = Action & {
  type: "SET_FISCAL_DETAILS";
  input: SetFiscalDetailsInput;
};
export type SetPurposeAction = Action & {
  type: "SET_PURPOSE";
  input: SetPurposeInput;
};

export type SwissAssociationAssociationAction =
  | SetAssociationNameAction
  | SetAssociationSeatAction
  | SetFoundingDateAction
  | SetFiscalDetailsAction
  | SetPurposeAction;
