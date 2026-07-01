/**
 * Phase 1 connectivity test — proves the editor -> subgraph -> Anthropic -> back
 * pipe works end to end. This runs SERVER-SIDE only (inside the Switchboard /
 * reactor-api Node process); the API key is read from process.env and is never
 * shipped to the browser/editor.
 *
 * There is no product logic here yet — just a trivial "summarize in one
 * sentence" call. The real assessment prompt comes in a later phase.
 */
import Anthropic from "@anthropic-ai/sdk";

export async function assessPurpose(text: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return "Error: ANTHROPIC_API_KEY is not set in the server environment.";
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Summarize this text in one sentence: ${text}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    return textBlock?.text ?? "Error: the model returned no text content.";
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return `Error calling the Anthropic API: ${detail}`;
  }
}
