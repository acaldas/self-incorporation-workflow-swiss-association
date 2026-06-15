/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { SwissAssociationGlobalState } from "../types.js";
import type { SetMultisigConfigAction } from "./actions.js";

export interface SwissAssociationMultisigOperations {
  setMultisigConfigOperation: (
    state: SwissAssociationGlobalState,
    action: SetMultisigConfigAction,
    dispatch?: SignalDispatch,
  ) => void;
}
