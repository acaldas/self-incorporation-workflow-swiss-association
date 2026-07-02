import { gql } from "graphql-tag";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = gql`
  """
  Informational, automated assessment of whether a described purpose reads as
  primarily IDEAL / non-commercial (a good structural fit for a Swiss Verein)
  vs. primarily ECONOMIC gain for members. Not legal advice.
  """
  type PurposeAssessment {
    "One of: likely_ideal | unclear_consult_counsel | likely_economic"
    verdict: String!
    "Short, informative explanation against the ideell/wirtschaftlich axis."
    explanation: String!
    "Relevant factors noted by the check."
    considerations: [String!]!
  }

  type Query {
    assessPurpose(text: String!): PurposeAssessment!
  }
`;
