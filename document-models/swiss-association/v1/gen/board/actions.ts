/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddBoardMemberInput,
  CopyFoundingMembersToBoardInput,
  RemoveBoardMemberInput,
  SetMeetingRolesInput,
  UpdateBoardMemberInput,
} from "../types.js";

export type AddBoardMemberAction = Action & {
  type: "ADD_BOARD_MEMBER";
  input: AddBoardMemberInput;
};
export type UpdateBoardMemberAction = Action & {
  type: "UPDATE_BOARD_MEMBER";
  input: UpdateBoardMemberInput;
};
export type RemoveBoardMemberAction = Action & {
  type: "REMOVE_BOARD_MEMBER";
  input: RemoveBoardMemberInput;
};
export type CopyFoundingMembersToBoardAction = Action & {
  type: "COPY_FOUNDING_MEMBERS_TO_BOARD";
  input: CopyFoundingMembersToBoardInput;
};
export type SetMeetingRolesAction = Action & {
  type: "SET_MEETING_ROLES";
  input: SetMeetingRolesInput;
};

export type SwissAssociationBoardAction =
  | AddBoardMemberAction
  | UpdateBoardMemberAction
  | RemoveBoardMemberAction
  | CopyFoundingMembersToBoardAction
  | SetMeetingRolesAction;
