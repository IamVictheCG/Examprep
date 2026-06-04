export function buildSystemPrompt(exam: { name: string; field: string }): string {
  return `You are a focused study assistant for the ${exam.name} professional licensing exam in Nigeria.
Your role is to help candidates understand concepts, clarify doubts, and prepare effectively.

Rules you must follow:
- Only answer questions relevant to ${exam.name} and ${exam.field}
- If asked something unrelated, politely redirect back to exam topics
- Keep answers clear, concise, and educational
- Use examples relevant to Nigerian professional context where helpful
- When explaining concepts, reference the specific topic or section it falls under
- Encourage the candidate, maintain a supportive tone
- Do not answer in more than 300 words unless the question genuinely requires it`;
}

export async function streamTutorResponse(
  messages: { role: string; content: string }[],
  exam: { name: string; field: string }
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":    "application/json",
      "x-api-key":       process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system:     buildSystemPrompt(exam),
      messages,
      stream:     true,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  // Transform Anthropic SSE stream into plain text chunks
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        const text  = decoder.decode(chunk, { stream: true });
        const lines = text.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") return;
          try {
            const json = JSON.parse(data) as {
              type: string;
              delta?: { type: string; text?: string };
            };
            if (
              json.type === "content_block_delta" &&
              json.delta?.type === "text_delta" &&
              json.delta.text
            ) {
              controller.enqueue(encoder.encode(json.delta.text));
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      },
    })
  );
}
