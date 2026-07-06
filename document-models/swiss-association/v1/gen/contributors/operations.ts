/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { SwissAssociationGlobalState } from "../types.js";
import type {
  AddContributorAgreementAction,
  MarkContributorAgreementSignedAction,
  RemoveContributorAgreementAction,
  SetContributorAgreementMarkdownAction,
  UpdateContributorAgreementAction,
} from "./actions.js";

export interface SwissAssociationContributorsOperations {
  addContributorAgreementOperation: (
    state: SwissAssociationGlobalState,
    action: AddContributorAgreementAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateContributorAgreementOperation: (
    state: SwissAssociationGlobalState,
    action: UpdateContributorAgreementAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeContributorAgreementOperation: (
    state: SwissAssociationGlobalState,
    action: RemoveContributorAgreementAction,
    dispatch?: SignalDispatch,
  ) => void;
  setContributorAgreementMarkdownOperation: (
    state: SwissAssociationGlobalState,
    action: SetContributorAgreementMarkdownAction,
    dispatch?: SignalDispatch,
  ) => void;
  markContributorAgreementSignedOperation: (
    state: SwissAssociationGlobalState,
    action: MarkContributorAgreementSignedAction,
    dispatch?: SignalDispatch,
  ) => void;
}
