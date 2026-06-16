/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  SwissAssociationAction,
  SwissAssociationDocument,
} from "document-models/swiss-association/v1";
import {
  assertIsSwissAssociationDocument,
  isSwissAssociationDocument,
} from "./gen/document-schema.js";

/** Hook to get a SwissAssociation document by its id */
export function useSwissAssociationDocumentById(
  documentId: string | null | undefined,
):
  | [SwissAssociationDocument, DocumentDispatch<SwissAssociationAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isSwissAssociationDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected SwissAssociation document */
export function useSelectedSwissAssociationDocument(): [
  SwissAssociationDocument,
  DocumentDispatch<SwissAssociationAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsSwissAssociationDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all SwissAssociation documents in the selected drive */
export function useSwissAssociationDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isSwissAssociationDocument);
}

/** Hook to get all SwissAssociation documents in the selected folder */
export function useSwissAssociationDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isSwissAssociationDocument);
}
