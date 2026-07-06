/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddContributorAgreementInput,
  MarkContributorAgreementSignedInput,
  RemoveContributorAgreementInput,
  SetContributorAgreementMarkdownInput,
  UpdateContributorAgreementInput,
} from "../types.js";

export type AddContributorAgreementAction = Action & {
  type: "ADD_CONTRIBUTOR_AGREEMENT";
  input: AddContributorAgreementInput;
};
export type UpdateContributorAgreementAction = Action & {
  type: "UPDATE_CONTRIBUTOR_AGREEMENT";
  input: UpdateContributorAgreementInput;
};
export type RemoveContributorAgreementAction = Action & {
  type: "REMOVE_CONTRIBUTOR_AGREEMENT";
  input: RemoveContributorAgreementInput;
};
export type SetContributorAgreementMarkdownAction = Action & {
  type: "SET_CONTRIBUTOR_AGREEMENT_MARKDOWN";
  input: SetContributorAgreementMarkdownInput;
};
export type MarkContributorAgreementSignedAction = Action & {
  type: "MARK_CONTRIBUTOR_AGREEMENT_SIGNED";
  input: MarkContributorAgreementSignedInput;
};

export type SwissAssociationContributorsAction =
  | AddContributorAgreementAction
  | UpdateContributorAgreementAction
  | RemoveContributorAgreementAction
  | SetContributorAgreementMarkdownAction
  | MarkContributorAgreementSignedAction;
