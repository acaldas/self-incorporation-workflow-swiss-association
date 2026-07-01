import { gql } from "graphql-tag";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = gql`
  type Query {
    """
    Phase 1 connectivity test. Sends the given text to the Anthropic Messages
    API server-side and returns Claude's one-sentence summary (or a clear error
    string on failure). No product logic yet.
    """
    assessPurpose(text: String!): String
  }
`;
