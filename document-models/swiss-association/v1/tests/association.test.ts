import { generateMock } from "document-model";
import {
  isSwissAssociationDocument,
  reducer,
  setAssociationName,
  SetAssociationNameInputSchema,
  setAssociationSeat,
  SetAssociationSeatInputSchema,
  setFiscalDetails,
  SetFiscalDetailsInputSchema,
  setFoundingDate,
  SetFoundingDateInputSchema,
  setPurpose,
  SetPurposeInputSchema,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("AssociationOperations", () => {
  it("should handle setAssociationName operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetAssociationNameInputSchema());

    const updatedDocument = reducer(document, setAssociationName(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_ASSOCIATION_NAME",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setAssociationSeat operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetAssociationSeatInputSchema());

    const updatedDocument = reducer(document, setAssociationSeat(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_ASSOCIATION_SEAT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setFoundingDate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFoundingDateInputSchema(), {
      foundingDate: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, setFoundingDate(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FOUNDING_DATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setFiscalDetails operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFiscalDetailsInputSchema());

    const updatedDocument = reducer(document, setFiscalDetails(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FISCAL_DETAILS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setPurpose operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetPurposeInputSchema());

    const updatedDocument = reducer(document, setPurpose(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PURPOSE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
