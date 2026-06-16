import { generateMock } from "document-model";
import {
  addBoardMember,
  AddBoardMemberInputSchema,
  copyFoundingMembersToBoard,
  CopyFoundingMembersToBoardInputSchema,
  isSwissAssociationDocument,
  reducer,
  removeBoardMember,
  RemoveBoardMemberInputSchema,
  setMeetingRoles,
  SetMeetingRolesInputSchema,
  updateBoardMember,
  UpdateBoardMemberInputSchema,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("BoardOperations", () => {
  it("should handle addBoardMember operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddBoardMemberInputSchema());

    const updatedDocument = reducer(document, addBoardMember(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_BOARD_MEMBER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateBoardMember operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateBoardMemberInputSchema());

    const updatedDocument = reducer(document, updateBoardMember(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_BOARD_MEMBER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeBoardMember operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveBoardMemberInputSchema());

    const updatedDocument = reducer(document, removeBoardMember(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_BOARD_MEMBER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle copyFoundingMembersToBoard operation", () => {
    const document = utils.createDocument();
    const input = generateMock(CopyFoundingMembersToBoardInputSchema());

    const updatedDocument = reducer(
      document,
      copyFoundingMembersToBoard(input),
    );

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "COPY_FOUNDING_MEMBERS_TO_BOARD",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setMeetingRoles operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetMeetingRolesInputSchema());

    const updatedDocument = reducer(document, setMeetingRoles(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_MEETING_ROLES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
