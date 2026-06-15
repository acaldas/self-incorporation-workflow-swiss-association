/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddNoteInput,
  AdvancePhaseInput,
  UpdatePhaseStatusInput,
} from "../types.js";

export type UpdatePhaseStatusAction = Action & {
  type: "UPDATE_PHASE_STATUS";
  input: UpdatePhaseStatusInput;
};
export type AdvancePhaseAction = Action & {
  type: "ADVANCE_PHASE";
  input: AdvancePhaseInput;
};
export type AddNoteAction = Action & { type: "ADD_NOTE"; input: AddNoteInput };

export type SwissAssociationWorkflowAction =
  | UpdatePhaseStatusAction
  | AdvancePhaseAction
  | AddNoteAction;
