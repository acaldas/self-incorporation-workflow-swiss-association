/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddContributorAgreementInputSchema,
  MarkContributorAgreementSignedInputSchema,
  RemoveContributorAgreementInputSchema,
  SetContributorAgreementMarkdownInputSchema,
  UpdateContributorAgreementInputSchema,
} from "../schema/zod.js";
import type {
  AddContributorAgreementInput,
  MarkContributorAgreementSignedInput,
  RemoveContributorAgreementInput,
  SetContributorAgreementMarkdownInput,
  UpdateContributorAgreementInput,
} from "../types.js";
import type {
  AddContributorAgreementAction,
  MarkContributorAgreementSignedAction,
  RemoveContributorAgreementAction,
  SetContributorAgreementMarkdownAction,
  UpdateContributorAgreementAction,
} from "./actions.js";

export const addContributorAgreement = (input: AddContributorAgreementInput) =>
  createAction<AddContributorAgreementAction>(
    "ADD_CONTRIBUTOR_AGREEMENT",
    { ...input },
    undefined,
    AddContributorAgreementInputSchema,
    "global",
  );

export const updateContributorAgreement = (
  input: UpdateContributorAgreementInput,
) =>
  createAction<UpdateContributorAgreementAction>(
    "UPDATE_CONTRIBUTOR_AGREEMENT",
    { ...input },
    undefined,
    UpdateContributorAgreementInputSchema,
    "global",
  );

export const removeContributorAgreement = (
  input: RemoveContributorAgreementInput,
) =>
  createAction<RemoveContributorAgreementAction>(
    "REMOVE_CONTRIBUTOR_AGREEMENT",
    { ...input },
    undefined,
    RemoveContributorAgreementInputSchema,
    "global",
  );

export const setContributorAgreementMarkdown = (
  input: SetContributorAgreementMarkdownInput,
) =>
  createAction<SetContributorAgreementMarkdownAction>(
    "SET_CONTRIBUTOR_AGREEMENT_MARKDOWN",
    { ...input },
    undefined,
    SetContributorAgreementMarkdownInputSchema,
    "global",
  );

export const markContributorAgreementSigned = (
  input: MarkContributorAgreementSignedInput,
) =>
  createAction<MarkContributorAgreementSignedAction>(
    "MARK_CONTRIBUTOR_AGREEMENT_SIGNED",
    { ...input },
    undefined,
    MarkContributorAgreementSignedInputSchema,
    "global",
  );
