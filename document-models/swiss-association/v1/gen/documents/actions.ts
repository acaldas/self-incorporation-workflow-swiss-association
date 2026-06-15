/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  MarkStage2DocumentSignedInput,
  SetStage2DocumentMarkdownInput,
  StartStage_2Input,
} from "../types.js";

export type StartStage_2Action = Action & {
  type: "START_STAGE_2";
  input: StartStage_2Input;
};
export type SetStage2DocumentMarkdownAction = Action & {
  type: "SET_STAGE2_DOCUMENT_MARKDOWN";
  input: SetStage2DocumentMarkdownInput;
};
export type MarkStage2DocumentSignedAction = Action & {
  type: "MARK_STAGE2_DOCUMENT_SIGNED";
  input: MarkStage2DocumentSignedInput;
};

export type SwissAssociationDocumentsAction =
  | StartStage_2Action
  | SetStage2DocumentMarkdownAction
  | MarkStage2DocumentSignedAction;
