/**
 * Browser-side client for the purpose-assessment subgraph.
 *
 * This ONLY issues a GraphQL request to the server-side subgraph — it never
 * imports the Anthropic SDK and never sees the API key (those live server-side
 * in subgraphs/purpose-assessment/lib.ts). Informational only, never blocking.
 *
 * Dev endpoint = the local Switchboard GraphQL, the same URL that works in the
 * playground. TODO(prod): derive this from the connected reactor/switchboard
 * URL instead of hardcoding.
 */
const SWITCHBOARD_GRAPHQL_URL = "http://localhost:4001/graphql";

export interface PurposeAssessment {
  verdict: string;
  explanation: string;
  considerations: string[];
}

const FALLBACK: PurposeAssessment = {
  verdict: "unclear_consult_counsel",
  explanation:
    "The automated check couldn't run. Please confirm with qualified Swiss counsel.",
  considerations: [],
};

const QUERY =
  "query Assess($text: String!) { assessPurpose(text: $text) { verdict explanation considerations } }";

export async function assessPurpose(text: string): Promise<PurposeAssessment> {
  try {
    const res = await fetch(SWITCHBOARD_GRAPHQL_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { text } }),
    });
    const json: unknown = await res.json();
    return extractAssessment(json) ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
}

function extractAssessment(json: unknown): PurposeAssessment | null {
  if (typeof json !== "object" || json === null) return null;
  const data = (json as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) return null;
  const value = (data as { assessPurpose?: unknown }).assessPurpose;
  if (typeof value !== "object" || value === null) return null;

  const obj = value as Record<string, unknown>;
  if (typeof obj.verdict !== "string" || typeof obj.explanation !== "string") {
    return null;
  }
  const considerations = Array.isArray(obj.considerations)
    ? obj.considerations.filter((c): c is string => typeof c === "string")
    : [];
  return {
    verdict: obj.verdict,
    explanation: obj.explanation,
    considerations,
  };
}
