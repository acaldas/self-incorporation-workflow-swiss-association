/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { SwissAssociationGlobalState } from "../types.js";
import type {
  SetAssociationNameAction,
  SetAssociationSeatAction,
  SetFiscalDetailsAction,
  SetFoundingDateAction,
  SetPurposeAction,
} from "./actions.js";

export interface SwissAssociationAssociationOperations {
  setAssociationNameOperation: (
    state: SwissAssociationGlobalState,
    action: SetAssociationNameAction,
    dispatch?: SignalDispatch,
  ) => void;
  setAssociationSeatOperation: (
    state: SwissAssociationGlobalState,
    action: SetAssociationSeatAction,
    dispatch?: SignalDispatch,
  ) => void;
  setFoundingDateOperation: (
    state: SwissAssociationGlobalState,
    action: SetFoundingDateAction,
    dispatch?: SignalDispatch,
  ) => void;
  setFiscalDetailsOperation: (
    state: SwissAssociationGlobalState,
    action: SetFiscalDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
  setPurposeOperation: (
    state: SwissAssociationGlobalState,
    action: SetPurposeAction,
    dispatch?: SignalDispatch,
  ) => void;
}
