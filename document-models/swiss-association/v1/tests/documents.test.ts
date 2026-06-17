import { generateMock } from "document-model";
import {
  isSwissAssociationDocument,
  markStage2DocumentSigned,
  MarkStage2DocumentSignedInputSchema,
  reducer,
  setStage2DocumentMarkdown,
  SetStage2DocumentMarkdownInputSchema,
  startStage_2,
  StartStage_2InputSchema,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("DocumentsOperations", () => {
  it("should handle startStage_2 operation", () => {
    const document = utils.createDocument();
    const input = generateMock(StartStage_2InputSchema());

    const updatedDocument = reducer(document, startStage_2(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "START_STAGE_2",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setStage2DocumentMarkdown operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetStage2DocumentMarkdownInputSchema());

    const updatedDocument = reducer(document, setStage2DocumentMarkdown(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_STAGE2_DOCUMENT_MARKDOWN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markStage2DocumentSigned operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkStage2DocumentSignedInputSchema());

    const updatedDocument = reducer(document, markStage2DocumentSigned(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_STAGE2_DOCUMENT_SIGNED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("persists REG_GA signing to regGaDocument and locks it", () => {
    const document = utils.createDocument();

    const afterMarkdown = reducer(
      document,
      setStage2DocumentMarkdown({
        documentType: "REG_GA",
        markdown: "# Regulation of the General Assembly",
      }),
    );
    const afterSigned = reducer(
      afterMarkdown,
      markStage2DocumentSigned({
        documentType: "REG_GA",
        signedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    expect(afterSigned.state.global.regGaDocument?.markdown).toBe(
      "# Regulation of the General Assembly",
    );
    expect(afterSigned.state.global.regGaDocument?.isSigned).toBe(true);
    expect(afterSigned.state.global.regGaDocument?.signedAt).toBe(
      "2026-06-15T10:00:00.000Z",
    );
    expect(afterSigned.state.global.regGaDocument?.isLocked).toBe(true);
    // REG_GA must NOT leak into the MPA slot (the old else-branch target)
    expect(afterSigned.state.global.mpaDocument).toBeNull();
  });

  it("signing only REG_GA does not set incorporationCompletedAt", () => {
    const document = utils.createDocument();

    const afterSigned = reducer(
      document,
      markStage2DocumentSigned({
        documentType: "REG_GA",
        signedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    expect(afterSigned.state.global.incorporationCompletedAt).toBeNull();
  });

  it("signing REG_GA after AoA (minutes still pending) does not set incorporationCompletedAt", () => {
    const document = utils.createDocument();

    const afterAoa = reducer(
      document,
      markStage2DocumentSigned({
        documentType: "AOA",
        signedAt: "2026-06-15T09:00:00.000Z",
      }),
    );
    const afterRegGa = reducer(
      afterAoa,
      markStage2DocumentSigned({
        documentType: "REG_GA",
        signedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    expect(afterRegGa.state.global.incorporationCompletedAt).toBeNull();
  });

  it("does not overwrite REG_GA markdown once signed and locked", () => {
    const document = utils.createDocument();

    const signed = reducer(
      reducer(
        document,
        setStage2DocumentMarkdown({
          documentType: "REG_GA",
          markdown: "original",
        }),
      ),
      markStage2DocumentSigned({
        documentType: "REG_GA",
        signedAt: "2026-06-15T10:00:00.000Z",
      }),
    );
    const afterEdit = reducer(
      signed,
      setStage2DocumentMarkdown({
        documentType: "REG_GA",
        markdown: "changed",
      }),
    );

    expect(afterEdit.state.global.regGaDocument?.markdown).toBe("original");
  });

  it("persists DISSOLUTION_RESOLUTION signing to its own slot and locks it", () => {
    const document = utils.createDocument();

    const afterMd = reducer(
      document,
      setStage2DocumentMarkdown({
        documentType: "DISSOLUTION_RESOLUTION",
        markdown: "# Dissolution",
      }),
    );
    const afterSigned = reducer(
      afterMd,
      markStage2DocumentSigned({
        documentType: "DISSOLUTION_RESOLUTION",
        signedAt: "2026-06-17T10:00:00.000Z",
      }),
    );

    expect(afterSigned.state.global.dissolutionResolutionDocument?.markdown).toBe(
      "# Dissolution",
    );
    expect(afterSigned.state.global.dissolutionResolutionDocument?.isSigned).toBe(
      true,
    );
    expect(afterSigned.state.global.dissolutionResolutionDocument?.isLocked).toBe(
      true,
    );
    expect(afterSigned.state.global.mpaDocument).toBeNull();
    expect(afterSigned.state.global.incorporationCompletedAt).toBeNull();
  });
});
