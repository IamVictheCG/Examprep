"use server";

export async function generateExplanation(
  questionText: string,
  wrongAnswer: string,
  correctAnswer: string,
  examName: string
): Promise<string> {
  const prompt = `You are an exam prep assistant for ${examName}.
A student answered this question incorrectly.

Question: ${questionText}
Student's answer: ${wrongAnswer}
Correct answer: ${correctAnswer}

In 2-3 short paragraphs, explain:
1. Why the student's answer is incorrect
2. Why the correct answer is right
3. The key concept they should review

Be direct, clear, and educational.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":    "application/json",
      "x-api-key":       process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages:   [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const json = await response.json() as {
    content: { type: string; text: string }[];
  };

  return json.content.find((c) => c.type === "text")?.text ?? "";
}
