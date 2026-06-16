import type {
  AssociationMember,
  SwissAssociationState,
} from "../../gen/types.js";

function normalizedRepresentative(value: string | null | undefined) {
  return value ?? null;
}

function membersAreEqual(a: AssociationMember, b: AssociationMember) {
  return (
    a.id === b.id &&
    a.type === b.type &&
    a.name === b.name &&
    a.nationalityOrCountry === b.nationalityOrCountry &&
    a.residenceOrCity === b.residenceOrCity &&
    normalizedRepresentative(a.representative) ===
      normalizedRepresentative(b.representative)
  );
}

export function computeIsPersonalunion(
  foundingMembers: AssociationMember[] | null | undefined,
  boardMembers: AssociationMember[] | null | undefined,
) {
  const safeFoundingMembers = foundingMembers ?? [];
  const safeBoardMembers = boardMembers ?? [];

  if (safeFoundingMembers.length !== safeBoardMembers.length) return false;

  const boardMembersById = new Map(
    safeBoardMembers.map((member) => [member.id, member]),
  );

  return safeFoundingMembers.every((foundingMember) => {
    const matchingBoardMember = boardMembersById.get(foundingMember.id);
    return matchingBoardMember
      ? membersAreEqual(foundingMember, matchingBoardMember)
      : false;
  });
}

export function updatePersonalunionFlag(state: SwissAssociationState) {
  state.isPersonalunion = computeIsPersonalunion(
    state.members,
    state.boardMembers,
  );
}
