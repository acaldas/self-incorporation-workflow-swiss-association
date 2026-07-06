import { generateMock } from "document-model";
import {
  addContributorAgreement,
  AddContributorAgreementInputSchema,
  isSwissAssociationDocument,
  markContributorAgreementSigned,
  MarkContributorAgreementSignedInputSchema,
  reducer,
  removeContributorAgreement,
  RemoveContributorAgreementInputSchema,
  setContributorAgreementMarkdown,
  SetContributorAgreementMarkdownInputSchema,
  updateContributorAgreement,
  UpdateContributorAgreementInputSchema,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("ContributorsOperations", () => {
  it("should handle addContributorAgreement operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddContributorAgreementInputSchema());

    const updatedDocument = reducer(document, addContributorAgreement(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_CONTRIBUTOR_AGREEMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateContributorAgreement operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateContributorAgreementInputSchema());

    const updatedDocument = reducer(
      document,
      updateContributorAgreement(input),
    );

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_CONTRIBUTOR_AGREEMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeContributorAgreement operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveContributorAgreementInputSchema());

    const updatedDocument = reducer(
      document,
      removeContributorAgreement(input),
    );

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_CONTRIBUTOR_AGREEMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setContributorAgreementMarkdown operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetContributorAgreementMarkdownInputSchema());

    const updatedDocument = reducer(
      document,
      setContributorAgreementMarkdown(input),
    );

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_CONTRIBUTOR_AGREEMENT_MARKDOWN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markContributorAgreementSigned operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkContributorAgreementSignedInputSchema());

    const updatedDocument = reducer(
      document,
      markContributorAgreementSigned(input),
    );

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_CONTRIBUTOR_AGREEMENT_SIGNED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should not crash when a legacy document has no contributorAgreements array", () => {
    const document = utils.createDocument();
    // Simulate a document instance created before this collection field existed:
    // its runtime state has no value for it, despite the non-null schema type.
    delete (document.state.global as { contributorAgreements?: unknown })
      .contributorAgreements;

    const updatedDocument = reducer(
      document,
      addContributorAgreement({
        id: "contrib-legacy-1",
        contractorIsEntity: false,
        termType: "FIXED_DATE",
      }),
    );

    // The guard coerces to [] first, so the op records cleanly (no error) and
    // the agreement lands.
    expect(updatedDocument.operations.global[0].error).toBeUndefined();
    expect(updatedDocument.state.global.contributorAgreements).toHaveLength(1);
    expect(updatedDocument.state.global.contributorAgreements[0].id).toBe(
      "contrib-legacy-1",
    );
  });
});
