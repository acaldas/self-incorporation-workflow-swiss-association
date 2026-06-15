/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import { SetMultisigConfigInputSchema } from "../schema/zod.js";
import type { SetMultisigConfigInput } from "../types.js";
import type { SetMultisigConfigAction } from "./actions.js";

export const setMultisigConfig = (input: SetMultisigConfigInput) =>
  createAction<SetMultisigConfigAction>(
    "SET_MULTISIG_CONFIG",
    { ...input },
    undefined,
    SetMultisigConfigInputSchema,
    "global",
  );
