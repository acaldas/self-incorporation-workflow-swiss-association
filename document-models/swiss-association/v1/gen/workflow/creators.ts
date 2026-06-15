/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddNoteInputSchema,
  AdvancePhaseInputSchema,
  UpdatePhaseStatusInputSchema,
} from "../schema/zod.js";
import type {
  AddNoteInput,
  AdvancePhaseInput,
  UpdatePhaseStatusInput,
} from "../types.js";
import type {
  AddNoteAction,
  AdvancePhaseAction,
  UpdatePhaseStatusAction,
} from "./actions.js";

export const updatePhaseStatus = (input: UpdatePhaseStatusInput) =>
  createAction<UpdatePhaseStatusAction>(
    "UPDATE_PHASE_STATUS",
    { ...input },
    undefined,
    UpdatePhaseStatusInputSchema,
    "global",
  );

export const advancePhase = (input: AdvancePhaseInput) =>
  createAction<AdvancePhaseAction>(
    "ADVANCE_PHASE",
    { ...input },
    undefined,
    AdvancePhaseInputSchema,
    "global",
  );

export const addNote = (input: AddNoteInput) =>
  createAction<AddNoteAction>(
    "ADD_NOTE",
    { ...input },
    undefined,
    AddNoteInputSchema,
    "global",
  );
