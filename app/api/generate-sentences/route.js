import { NextResponse } from "next/server";

export async function POST(request) {
  const { word, context } = await request.json();

  if (!word) {
    return NextResponse.json({ error: "Word is required" }, { status: 400 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Generate exactly 3 short, natural sentences using the word "${word}" in everyday conversation or professional life. ${context ? `Context: "${context}"` : ""}
        
Return ONLY a JSON array of 3 strings. No explanation, no markdown.
Example: ["Sentence one.", "Sentence two.", "Sentence three."]`
      }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text.trim();
  const sentences = JSON.parse(text);
  return NextResponse.json({ sentences });
}