import type { SwissAssociationAssociationOperations } from "document-models/swiss-association/v1";

export const swissAssociationAssociationOperations: SwissAssociationAssociationOperations =
  {
    setAssociationNameOperation(state, action) {
      state.nameEn = action.input.nameEn;
      if (action.input.nameDe) state.nameDe = action.input.nameDe;
    },
    setAssociationSeatOperation(state, action) {
      state.seatCity = action.input.seatCity;
      state.seatCanton = action.input.seatCanton;
      if (action.input.registeredAddress) {
        state.registeredAddress = action.input.registeredAddress;
        state.registeredAddressConfirmed = true;
      }
    },
    setFoundingDateOperation(state, action) {
      state.foundingDate = action.input.foundingDate;
    },
    setFiscalDetailsOperation(state, action) {
      if (action.input.fiscalYearEnd)
        state.fiscalYearEnd = action.input.fiscalYearEnd;
      if (action.input.membershipFee)
        state.membershipFee = action.input.membershipFee;
      if (action.input.primaryLanguage)
        state.primaryLanguage = action.input.primaryLanguage;
    },
    setPurposeOperation(state, action) {
      state.purposeEn = action.input.purposeEn;
      if (action.input.purposeDe) state.purposeDe = action.input.purposeDe;
    },
  };
