import type { SwissAssociationContributorsOperations } from "document-models/swiss-association/v1";
import {
  ContributorAgreementNotFoundError,
  DuplicateContributorAgreementError,
} from "../../gen/contributors/error.js";
import type { ContributorAgreement } from "../../gen/types.js";

function defaultGeneratedDocument() {
  return {
    markdown: null,
    isSigned: false,
    signedAt: null,
    isLocked: false,
  };
}

function findAgreement(
  state: { contributorAgreements: ContributorAgreement[] },
  id: string,
): ContributorAgreement {
  const agreement = state.contributorAgreements.find((a) => a.id === id);
  if (!agreement)
    throw new ContributorAgreementNotFoundError(
      `Contributor agreement ${id} not found`,
    );
  return agreement;
}

export const swissAssociationContributorsOperations: SwissAssociationContributorsOperations =
  {
    addContributorAgreementOperation(state, action) {
      if (state.contributorAgreements.some((a) => a.id === action.input.id))
        throw new DuplicateContributorAgreementError(
          `Contributor agreement ${action.input.id} already exists`,
        );
      state.contributorAgreements.push({
        id: action.input.id,
        contractorIsEntity: action.input.contractorIsEntity,
        termType: action.input.termType,
        contractorName: action.input.contractorName || null,
        contractorNationality: action.input.contractorNationality || null,
        contractorAddress: action.input.contractorAddress || null,
        entityName: action.input.entityName || null,
        entityType: action.input.entityType || null,
        entityJurisdiction: action.input.entityJurisdiction || null,
        role: action.input.role || null,
        contractDate: action.input.contractDate || null,
        workStartDate: action.input.workStartDate || null,
        workEndDate: action.input.workEndDate || null,
        terminationNoticePeriod: action.input.terminationNoticePeriod || null,
        sowNumber: action.input.sowNumber || null,
        services: action.input.services || null,
        fteHours: action.input.fteHours || null,
        compensation: action.input.compensation || null,
        denominationType: action.input.denominationType || null,
        denominationCurrency: action.input.denominationCurrency || null,
        generatedDocument: null,
      });
    },
    updateContributorAgreementOperation(state, action) {
      const agreement = findAgreement(state, action.input.id);
      if (
        action.input.contractorIsEntity !== undefined &&
        action.input.contractorIsEntity !== null
      )
        agreement.contractorIsEntity = action.input.contractorIsEntity;
      if (action.input.termType) agreement.termType = action.input.termType;
      if (action.input.contractorName)
        agreement.contractorName = action.input.contractorName;
      if (action.input.contractorNationality)
        agreement.contractorNationality = action.input.contractorNationality;
      if (action.input.contractorAddress)
        agreement.contractorAddress = action.input.contractorAddress;
      if (action.input.entityName)
        agreement.entityName = action.input.entityName;
      if (action.input.entityType)
        agreement.entityType = action.input.entityType;
      if (action.input.entityJurisdiction)
        agreement.entityJurisdiction = action.input.entityJurisdiction;
      if (action.input.role) agreement.role = action.input.role;
      if (action.input.contractDate)
        agreement.contractDate = action.input.contractDate;
      if (action.input.workStartDate)
        agreement.workStartDate = action.input.workStartDate;
      if (action.input.workEndDate)
        agreement.workEndDate = action.input.workEndDate;
      if (action.input.terminationNoticePeriod)
        agreement.terminationNoticePeriod =
          action.input.terminationNoticePeriod;
      if (action.input.sowNumber) agreement.sowNumber = action.input.sowNumber;
      if (action.input.services) agreement.services = action.input.services;
      if (action.input.fteHours) agreement.fteHours = action.input.fteHours;
      if (action.input.compensation)
        agreement.compensation = action.input.compensation;
      if (action.input.denominationType)
        agreement.denominationType = action.input.denominationType;
      if (action.input.denominationCurrency)
        agreement.denominationCurrency = action.input.denominationCurrency;
    },
    removeContributorAgreementOperation(state, action) {
      const idx = state.contributorAgreements.findIndex(
        (a) => a.id === action.input.id,
      );
      if (idx === -1)
        throw new ContributorAgreementNotFoundError(
          `Contributor agreement ${action.input.id} not found`,
        );
      state.contributorAgreements.splice(idx, 1);
    },
    setContributorAgreementMarkdownOperation(state, action) {
      const agreement = findAgreement(state, action.input.id);
      if (!agreement.generatedDocument)
        agreement.generatedDocument = defaultGeneratedDocument();
      if (agreement.generatedDocument.isLocked) return;
      agreement.generatedDocument.markdown = action.input.markdown;
    },
    markContributorAgreementSignedOperation(state, action) {
      const agreement = findAgreement(state, action.input.id);
      if (!agreement.generatedDocument)
        agreement.generatedDocument = defaultGeneratedDocument();
      if (agreement.generatedDocument.isLocked) return;
      agreement.generatedDocument.isSigned = true;
      agreement.generatedDocument.signedAt = action.input.signedAt;
      agreement.generatedDocument.isLocked = true;
    },
  };
