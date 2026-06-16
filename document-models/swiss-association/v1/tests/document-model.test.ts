/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsSwissAssociationDocument,
  assertIsSwissAssociationState,
  initialGlobalState,
  initialLocalState,
  isSwissAssociationDocument,
  isSwissAssociationState,
  swissAssociationDocumentType,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("SwissAssociation Document Model", () => {
  it("should create a new SwissAssociation document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(swissAssociationDocumentType);
  });

  it("should create a new SwissAssociation document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isSwissAssociationDocument(document)).toBe(true);
    expect(isSwissAssociationState(document.state)).toBe(true);
  });
  it("should reject a document that is not a SwissAssociation document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsSwissAssociationDocument(wrongDocumentType)).toThrow();
      expect(isSwissAssociationDocument(wrongDocumentType)).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });
  const wrongState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongState.state.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isSwissAssociationState(wrongState.state)).toBe(false);
    expect(assertIsSwissAssociationState(wrongState.state)).toThrow();
    expect(isSwissAssociationDocument(wrongState)).toBe(false);
    expect(assertIsSwissAssociationDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isSwissAssociationState(wrongInitialState.state)).toBe(false);
    expect(assertIsSwissAssociationState(wrongInitialState.state)).toThrow();
    expect(isSwissAssociationDocument(wrongInitialState)).toBe(false);
    expect(assertIsSwissAssociationDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isSwissAssociationDocument(missingIdInHeader)).toBe(false);
    expect(assertIsSwissAssociationDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isSwissAssociationDocument(missingNameInHeader)).toBe(false);
    expect(assertIsSwissAssociationDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isSwissAssociationDocument(missingCreatedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsSwissAssociationDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(
      isSwissAssociationDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsSwissAssociationDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
