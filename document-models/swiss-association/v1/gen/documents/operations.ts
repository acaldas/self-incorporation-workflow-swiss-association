/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { SwissAssociationGlobalState } from "../types.js";
import type {
  MarkStage2DocumentSignedAction,
  SetStage2DocumentMarkdownAction,
  StartStage_2Action,
} from "./actions.js";

export interface SwissAssociationDocumentsOperations {
  startStage_2Operation: (
    state: SwissAssociationGlobalState,
    action: StartStage_2Action,
    dispatch?: SignalDispatch,
  ) => void;
  setStage2DocumentMarkdownOperation: (
    state: SwissAssociationGlobalState,
    action: SetStage2DocumentMarkdownAction,
    dispatch?: SignalDispatch,
  ) => void;
  markStage2DocumentSignedOperation: (
    state: SwissAssociationGlobalState,
    action: MarkStage2DocumentSignedAction,
    dispatch?: SignalDispatch,
  ) => void;
}
