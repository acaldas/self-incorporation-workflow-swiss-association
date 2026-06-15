/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  SetAssociationNameInputSchema,
  SetAssociationSeatInputSchema,
  SetFiscalDetailsInputSchema,
  SetFoundingDateInputSchema,
  SetPurposeInputSchema,
} from "../schema/zod.js";
import type {
  SetAssociationNameInput,
  SetAssociationSeatInput,
  SetFiscalDetailsInput,
  SetFoundingDateInput,
  SetPurposeInput,
} from "../types.js";
import type {
  SetAssociationNameAction,
  SetAssociationSeatAction,
  SetFiscalDetailsAction,
  SetFoundingDateAction,
  SetPurposeAction,
} from "./actions.js";

export const setAssociationName = (input: SetAssociationNameInput) =>
  createAction<SetAssociationNameAction>(
    "SET_ASSOCIATION_NAME",
    { ...input },
    undefined,
    SetAssociationNameInputSchema,
    "global",
  );

export const setAssociationSeat = (input: SetAssociationSeatInput) =>
  createAction<SetAssociationSeatAction>(
    "SET_ASSOCIATION_SEAT",
    { ...input },
    undefined,
    SetAssociationSeatInputSchema,
    "global",
  );

export const setFoundingDate = (input: SetFoundingDateInput) =>
  createAction<SetFoundingDateAction>(
    "SET_FOUNDING_DATE",
    { ...input },
    undefined,
    SetFoundingDateInputSchema,
    "global",
  );

export const setFiscalDetails = (input: SetFiscalDetailsInput) =>
  createAction<SetFiscalDetailsAction>(
    "SET_FISCAL_DETAILS",
    { ...input },
    undefined,
    SetFiscalDetailsInputSchema,
    "global",
  );

export const setPurpose = (input: SetPurposeInput) =>
  createAction<SetPurposeAction>(
    "SET_PURPOSE",
    { ...input },
    undefined,
    SetPurposeInputSchema,
    "global",
  );
