// Browser client for the purpose-assessment subgraph (no SDK/API key here).
// Endpoint is resolved from the document's remote drive; degrades gracefully.
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

export async function assessPurpose(
  text: string,
  endpoint: string | undefined,
): Promise<PurposeAssessment> {
  if (!endpoint) return FALLBACK;
  try {
    const res = await fetch(endpoint, {
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
