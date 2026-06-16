import type { SwissAssociationMembersOperations } from "document-models/swiss-association/v1";
import { MemberNotFoundError } from "../../gen/members/error.js";
import { updatePersonalunionFlag } from "./personalunion.js";

export const swissAssociationMembersOperations: SwissAssociationMembersOperations =
  {
    addMemberOperation(state, action) {
      const member = {
        id: action.input.id,
        type: action.input.type,
        name: action.input.name,
        nationalityOrCountry: action.input.nationalityOrCountry,
        residenceOrCity: action.input.residenceOrCity,
        representative: action.input.representative || null,
      };
      state.members.push(member);
      state.belowRecommendedMemberCount = state.members.length < 3;
      updatePersonalunionFlag(state);
    },
    updateMemberOperation(state, action) {
      const idx = state.members.findIndex((m) => m.id === action.input.id);
      if (idx === -1)
        throw new MemberNotFoundError(`Member ${action.input.id} not found`);
      const member = state.members[idx];
      if (action.input.type) member.type = action.input.type;
      if (action.input.name) member.name = action.input.name;
      if (action.input.nationalityOrCountry)
        member.nationalityOrCountry = action.input.nationalityOrCountry;
      if (action.input.residenceOrCity)
        member.residenceOrCity = action.input.residenceOrCity;
      if (
        action.input.representative !== undefined &&
        action.input.representative !== null
      )
        member.representative = action.input.representative;
      updatePersonalunionFlag(state);
    },
    removeMemberOperation(state, action) {
      const idx = state.members.findIndex((m) => m.id === action.input.id);
      if (idx === -1)
        throw new MemberNotFoundError(`Member ${action.input.id} not found`);
      state.members.splice(idx, 1);
      state.belowRecommendedMemberCount = state.members.length < 3;
      updatePersonalunionFlag(state);
    },
  };
