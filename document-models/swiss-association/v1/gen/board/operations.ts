/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { SwissAssociationGlobalState } from "../types.js";
import type {
  AddBoardMemberAction,
  CopyFoundingMembersToBoardAction,
  RemoveBoardMemberAction,
  SetMeetingRolesAction,
  UpdateBoardMemberAction,
} from "./actions.js";

export interface SwissAssociationBoardOperations {
  addBoardMemberOperation: (
    state: SwissAssociationGlobalState,
    action: AddBoardMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateBoardMemberOperation: (
    state: SwissAssociationGlobalState,
    action: UpdateBoardMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeBoardMemberOperation: (
    state: SwissAssociationGlobalState,
    action: RemoveBoardMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
  copyFoundingMembersToBoardOperation: (
    state: SwissAssociationGlobalState,
    action: CopyFoundingMembersToBoardAction,
    dispatch?: SignalDispatch,
  ) => void;
  setMeetingRolesOperation: (
    state: SwissAssociationGlobalState,
    action: SetMeetingRolesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
