import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "Word required" }, { status: 400 });
  }

  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  const data = await response.json();
  const entry = data[0];

  const definition = entry.meanings?.[0]?.definitions?.[0]?.definition || null;
  const synonyms = entry.meanings?.[0]?.synonyms?.slice(0, 5) || [];
  const antonyms = entry.meanings?.[0]?.antonyms?.slice(0, 5) || [];

  return NextResponse.json({ definition, synonyms, antonyms });
}