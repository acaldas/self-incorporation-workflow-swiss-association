/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  MarkStage2DocumentSignedInputSchema,
  SetStage2DocumentMarkdownInputSchema,
  StartStage_2InputSchema,
} from "../schema/zod.js";
import type {
  MarkStage2DocumentSignedInput,
  SetStage2DocumentMarkdownInput,
  StartStage_2Input,
} from "../types.js";
import type {
  MarkStage2DocumentSignedAction,
  SetStage2DocumentMarkdownAction,
  StartStage_2Action,
} from "./actions.js";

export const startStage_2 = (input: StartStage_2Input) =>
  createAction<StartStage_2Action>(
    "START_STAGE_2",
    { ...input },
    undefined,
    StartStage_2InputSchema,
    "global",
  );

export const setStage2DocumentMarkdown = (
  input: SetStage2DocumentMarkdownInput,
) =>
  createAction<SetStage2DocumentMarkdownAction>(
    "SET_STAGE2_DOCUMENT_MARKDOWN",
    { ...input },
    undefined,
    SetStage2DocumentMarkdownInputSchema,
    "global",
  );

export const markStage2DocumentSigned = (
  input: MarkStage2DocumentSignedInput,
) =>
  createAction<MarkStage2DocumentSignedAction>(
    "MARK_STAGE2_DOCUMENT_SIGNED",
    { ...input },
    undefined,
    MarkStage2DocumentSignedInputSchema,
    "global",
  );
