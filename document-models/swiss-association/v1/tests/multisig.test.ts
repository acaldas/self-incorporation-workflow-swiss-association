import { generateMock } from "document-model";
import {
  isSwissAssociationDocument,
  reducer,
  setMultisigConfig,
  SetMultisigConfigInputSchema,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("MultisigOperations", () => {
  it("should handle setMultisigConfig operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetMultisigConfigInputSchema());

    const updatedDocument = reducer(document, setMultisigConfig(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_MULTISIG_CONFIG",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
