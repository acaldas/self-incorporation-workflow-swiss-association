import { generateMock } from "document-model";
import {
  addNote,
  AddNoteInputSchema,
  advancePhase,
  AdvancePhaseInputSchema,
  isSwissAssociationDocument,
  reducer,
  updatePhaseStatus,
  UpdatePhaseStatusInputSchema,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("WorkflowOperations", () => {
  it("should handle updatePhaseStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdatePhaseStatusInputSchema());

    const updatedDocument = reducer(document, updatePhaseStatus(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_PHASE_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle advancePhase operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AdvancePhaseInputSchema());

    const updatedDocument = reducer(document, advancePhase(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADVANCE_PHASE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addNote operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddNoteInputSchema());

    const updatedDocument = reducer(document, addNote(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_NOTE");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
