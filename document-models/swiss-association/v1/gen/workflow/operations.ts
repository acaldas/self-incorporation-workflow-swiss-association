/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { SwissAssociationGlobalState } from "../types.js";
import type {
  AddNoteAction,
  AdvancePhaseAction,
  UpdatePhaseStatusAction,
} from "./actions.js";

export interface SwissAssociationWorkflowOperations {
  updatePhaseStatusOperation: (
    state: SwissAssociationGlobalState,
    action: UpdatePhaseStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  advancePhaseOperation: (
    state: SwissAssociationGlobalState,
    action: AdvancePhaseAction,
    dispatch?: SignalDispatch,
  ) => void;
  addNoteOperation: (
    state: SwissAssociationGlobalState,
    action: AddNoteAction,
    dispatch?: SignalDispatch,
  ) => void;
}
