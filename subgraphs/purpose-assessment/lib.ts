/**
 * Server-side purpose assessment. Runs inside Switchboard / reactor-api; reads
 * the API key from process.env and never ships it to the browser.
 *
 * This is an INFORMATIONAL check, not legal advice. It describes a stated
 * purpose against one Swiss-law axis — ideal/non-commercial (ideeller Zweck)
 * vs. primarily economic gain for members — and defaults to "consult counsel"
 * under any uncertainty. It never decides for the user or prescribes a vehicle.
 */
import Anthropic from "@anthropic-ai/sdk";

export interface PurposeAssessment {
  verdict: string;
  explanation: string;
  considerations: string[];
}

const VALID_VERDICTS = [
  "likely_ideal",
  "unclear_consult_counsel",
  "likely_economic",
];

const SYSTEM_PROMPT = `You assess whether a described organizational purpose is a structural fit for a Swiss association (Verein), along ONE axis only: primarily IDEAL / non-commercial purpose (ideeller Zweck) vs. primarily ECONOMIC gain for members.

Apply Swiss law precisely:
- A Verein (Art. 60 ZGB) requires an IDEAL / non-commercial PURPOSE (ideeller Zweck). This constrains the PURPOSE — it does NOT require the association to avoid commercial activity.
- A Verein CAN operate a commercial business (Art. 61 ZGB) in service of its ideal purpose. Earning revenue, even substantial revenue, is NOT disqualifying.
- The bright line: a Verein must NOT exist PRIMARILY to generate profit for DISTRIBUTION TO MEMBERS. When the primary aim is economic gain distributed to members, other legal forms (e.g. a cooperative / Genossenschaft, or a company) are the fitting vehicles.
- So decide: is the described purpose primarily IDEAL (with any commercial activity secondary and in service of that purpose), or primarily ECONOMIC gain for members?

Choose exactly one verdict:
- "likely_ideal": the purpose clearly reads as ideal / public-good; commercial activity is absent or plausibly secondary and in service of the purpose.
- "unclear_consult_counsel": ambiguous, mixed, thin, or not clearly determinable from the description. This is the DEFAULT whenever the fit is not clearly ideal. The explanation must say it cannot be determined from the description and to consult qualified Swiss counsel.
- "likely_economic": the purpose reads as primarily economic gain / profit distribution to members. The explanation describes WHY against the ideell/wirtschaftlich axis. It MAY note that primarily-economic aims typically use other legal forms, but must NEVER instruct the user to use a specific form and must NEVER give legal advice.

Tone: informative and descriptive — never advisory, directive, or judgmental. You DESCRIBE the purpose against the legal axis; you do not decide for the user or recommend a specific vehicle as a directive. For anything not clearly ideal, point to professional counsel.

Respond with ONLY a JSON object (no prose, no markdown, no code fences):
{"verdict": "likely_ideal" | "unclear_consult_counsel" | "likely_economic", "explanation": "1-3 informative sentences, ending by pointing to qualified Swiss counsel for anything not clearly ideal", "considerations": ["2-4 short factors, e.g. presence/absence of commercial activity, whether profit distribution to members is implied, key ambiguities"]}`;

function consultCounsel(explanation: string): PurposeAssessment {
  return {
    verdict: "unclear_consult_counsel",
    explanation,
    considerations: [],
  };
}

// The model is instructed to return bare JSON, but strip a ``` / ```json fence
// defensively before parsing.
function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  return fenced ? fenced[1].trim() : trimmed;
}

export async function assessPurpose(text: string): Promise<PurposeAssessment> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return consultCounsel(
      "The automated check could not run (server not configured). Please confirm with qualified Swiss counsel.",
    );
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `Assess this stated purpose:\n\n${text}` },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const raw = textBlock?.text ?? "";
    const parsed: unknown = JSON.parse(stripCodeFences(raw));

    if (typeof parsed !== "object" || parsed === null) {
      return consultCounsel(
        "The automated check returned an unexpected result. Please confirm with qualified Swiss counsel.",
      );
    }
    const obj = parsed as Record<string, unknown>;

    const verdict =
      typeof obj.verdict === "string" && VALID_VERDICTS.includes(obj.verdict)
        ? obj.verdict
        : "unclear_consult_counsel";
    const explanation =
      typeof obj.explanation === "string" && obj.explanation.trim()
        ? obj.explanation
        : "The automated check could not determine a clear result. Please confirm with qualified Swiss counsel.";
    const considerations = Array.isArray(obj.considerations)
      ? obj.considerations.filter((c): c is string => typeof c === "string")
      : [];

    return { verdict, explanation, considerations };
  } catch {
    return consultCounsel(
      "The automated check couldn't run. Please confirm with qualified Swiss counsel.",
    );
  }
}
