import { generateMock } from "document-model";
import {
  isSwissAssociationDocument,
  reducer,
  setDissolutionDetails,
  SetDissolutionDetailsInputSchema,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("DissolutionOperations", () => {
  it("sets dissolution details", () => {
    const document = utils.createDocument();

    const updated = reducer(
      document,
      setDissolutionDetails({
        dissolutionDate: "2026-06-17T00:00:00.000Z",
        resolutionForm: "WRITTEN",
        assetRecipient: "Some Foundation",
        executingPersons: "Alice, Bob",
        remainingAssetsSummary: "CHF 0 after transfers",
      }),
    );

    const d = updated.state.global.dissolution;
    expect(d?.dissolutionDate).toBe("2026-06-17T00:00:00.000Z");
    expect(d?.resolutionForm).toBe("WRITTEN");
    expect(d?.assetRecipient).toBe("Some Foundation");
    expect(d?.executingPersons).toBe("Alice, Bob");
    expect(d?.remainingAssetsSummary).toBe("CHF 0 after transfers");
  });

  it("merges partial updates without clobbering prior fields", () => {
    const document = utils.createDocument();

    const first = reducer(
      document,
      setDissolutionDetails({ assetRecipient: "Foundation A" }),
    );
    const second = reducer(
      first,
      setDissolutionDetails({ dissolutionDate: "2026-07-01T00:00:00.000Z" }),
    );

    expect(second.state.global.dissolution?.assetRecipient).toBe(
      "Foundation A",
    );
    expect(second.state.global.dissolution?.dissolutionDate).toBe(
      "2026-07-01T00:00:00.000Z",
    );
  });

  it("should handle setDissolutionDetails operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetDissolutionDetailsInputSchema());

    const updatedDocument = reducer(document, setDissolutionDetails(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_DISSOLUTION_DETAILS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
