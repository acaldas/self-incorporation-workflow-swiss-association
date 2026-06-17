/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import { SetDissolutionDetailsInputSchema } from "../schema/zod.js";
import type { SetDissolutionDetailsInput } from "../types.js";
import type { SetDissolutionDetailsAction } from "./actions.js";

export const setDissolutionDetails = (input: SetDissolutionDetailsInput) =>
  createAction<SetDissolutionDetailsAction>(
    "SET_DISSOLUTION_DETAILS",
    { ...input },
    undefined,
    SetDissolutionDetailsInputSchema,
    "global",
  );
