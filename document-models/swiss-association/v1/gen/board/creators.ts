/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddBoardMemberInputSchema,
  CopyFoundingMembersToBoardInputSchema,
  RemoveBoardMemberInputSchema,
  SetMeetingRolesInputSchema,
  UpdateBoardMemberInputSchema,
} from "../schema/zod.js";
import type {
  AddBoardMemberInput,
  CopyFoundingMembersToBoardInput,
  RemoveBoardMemberInput,
  SetMeetingRolesInput,
  UpdateBoardMemberInput,
} from "../types.js";
import type {
  AddBoardMemberAction,
  CopyFoundingMembersToBoardAction,
  RemoveBoardMemberAction,
  SetMeetingRolesAction,
  UpdateBoardMemberAction,
} from "./actions.js";

export const addBoardMember = (input: AddBoardMemberInput) =>
  createAction<AddBoardMemberAction>(
    "ADD_BOARD_MEMBER",
    { ...input },
    undefined,
    AddBoardMemberInputSchema,
    "global",
  );

export const updateBoardMember = (input: UpdateBoardMemberInput) =>
  createAction<UpdateBoardMemberAction>(
    "UPDATE_BOARD_MEMBER",
    { ...input },
    undefined,
    UpdateBoardMemberInputSchema,
    "global",
  );

export const removeBoardMember = (input: RemoveBoardMemberInput) =>
  createAction<RemoveBoardMemberAction>(
    "REMOVE_BOARD_MEMBER",
    { ...input },
    undefined,
    RemoveBoardMemberInputSchema,
    "global",
  );

export const copyFoundingMembersToBoard = (
  input: CopyFoundingMembersToBoardInput,
) =>
  createAction<CopyFoundingMembersToBoardAction>(
    "COPY_FOUNDING_MEMBERS_TO_BOARD",
    { ...input },
    undefined,
    CopyFoundingMembersToBoardInputSchema,
    "global",
  );

export const setMeetingRoles = (input: SetMeetingRolesInput) =>
  createAction<SetMeetingRolesAction>(
    "SET_MEETING_ROLES",
    { ...input },
    undefined,
    SetMeetingRolesInputSchema,
    "global",
  );
