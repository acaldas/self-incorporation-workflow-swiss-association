import type { SwissAssociationDissolutionOperations } from "document-models/swiss-association/v1";

export const swissAssociationDissolutionOperations: SwissAssociationDissolutionOperations =
  {
    setDissolutionDetailsOperation(state, action) {
      if (!state.dissolution) {
        state.dissolution = {
          dissolutionDate: null,
          resolutionForm: null,
          assetRecipient: null,
          executingPersons: null,
          remainingAssetsSummary: null,
        };
      }
      if (action.input.dissolutionDate)
        state.dissolution.dissolutionDate = action.input.dissolutionDate;
      if (action.input.resolutionForm)
        state.dissolution.resolutionForm = action.input.resolutionForm;
      if (action.input.assetRecipient)
        state.dissolution.assetRecipient = action.input.assetRecipient;
      if (action.input.executingPersons)
        state.dissolution.executingPersons = action.input.executingPersons;
      if (action.input.remainingAssetsSummary)
        state.dissolution.remainingAssetsSummary =
          action.input.remainingAssetsSummary;
    },
  };
