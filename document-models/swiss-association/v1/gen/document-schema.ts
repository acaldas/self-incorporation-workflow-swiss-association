/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { swissAssociationDocumentType } from "./document-type.js";
import { SwissAssociationStateSchema } from "./schema/zod.js";
import type {
  SwissAssociationDocument,
  SwissAssociationPHState,
} from "./types.js";

/** Schema for validating the header object of a SwissAssociation document */
export const SwissAssociationDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(swissAssociationDocumentType),
  });

/** Schema for validating the state object of a SwissAssociation document */
export const SwissAssociationPHStateSchema = BaseDocumentStateSchema.extend({
  global: SwissAssociationStateSchema(),
});

export const SwissAssociationDocumentSchema = z.object({
  header: SwissAssociationDocumentHeaderSchema,
  state: SwissAssociationPHStateSchema,
  initialState: SwissAssociationPHStateSchema,
});

/** Simple helper function to check if a state object is a SwissAssociation document state object */
export function isSwissAssociationState(
  state: unknown,
): state is SwissAssociationPHState {
  return SwissAssociationPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a SwissAssociation document state object */
export function assertIsSwissAssociationState(
  state: unknown,
): asserts state is SwissAssociationPHState {
  SwissAssociationPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a SwissAssociation document */
export function isSwissAssociationDocument(
  document: unknown,
): document is SwissAssociationDocument {
  return SwissAssociationDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a SwissAssociation document */
export function assertIsSwissAssociationDocument(
  document: unknown,
): asserts document is SwissAssociationDocument {
  SwissAssociationDocumentSchema.parse(document);
}
