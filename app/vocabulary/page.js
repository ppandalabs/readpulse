"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Vocabulary() {
  const router = useRouter();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newContext, setNewContext] = useState("");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("list");
  const [flashIndex, setFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [generatingFor, setGeneratingFor] = useState(null);

  useEffect(() => { fetchWords(); }, []);

  async function fetchWords() {
    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setWords(data);
    setLoading(false);
  }

  async function fetchDictionary(word) {
    try {
      const res = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function saveWord() {
    if (!newWord.trim()) return;
    setSaving(true);

    const dict = await fetchDictionary(newWord.trim());

    const { error } = await supabase
      .from("vocabulary")
      .insert([{
        word: newWord.trim(),
        context: newContext.trim() || null,
        definition: dict?.definition || null,
        synonyms: dict?.synonyms || [],
        antonyms: dict?.antonyms || [],
        ai_sentences: [],
      }]);

    if (!error) {
      setNewWord("");
      setNewContext("");
      setShowForm(false);
      fetchWords();
    }
    setSaving(false);
  }

  async function generateSentences(wordItem) {
    setGeneratingFor(wordItem.id);
    try {
      const res = await fetch("/api/generate-sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: wordItem.word,
          context: wordItem.context,
        }),
      });
      const { sentences } = await res.json();
      await supabase
        .from("vocabulary")
        .update({ ai_sentences: sentences })
        .eq("id", wordItem.id);
      fetchWords();
    } catch (err) {
      console.error("Generation error:", err);
    }
    setGeneratingFor(null);
  }

  const currentWord = words[flashIndex];

  return (
    <main className="max-w-sm mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/")}
          className="text-gray-500 text-sm hover:text-amber-500 transition-colors">
          ←
        </button>
        <h1 className="text-xl font-medium text-white">Vocabulary</h1>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full ml-auto">
          {words.length} words
        </span>
      </div>

      {/* View Toggle */}
      {words.length > 0 && (
        <div className="flex bg-gray-900 rounded-xl p-1 mb-6">
          <button onClick={() => setView("list")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "list" ? "bg-amber-500 text-black" : "text-gray-400"}`}>
            List
          </button>
          <button onClick={() => { setView("flashcard"); setFlashIndex(0); setFlipped(false); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "flashcard" ? "bg-amber-500 text-black" : "text-gray-400"}`}>
            Flashcards
          </button>
        </div>
      )}

      {/* Flashcard View */}
      {view === "flashcard" && words.length > 0 && currentWord && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 text-center mb-4">
            {flashIndex + 1} of {words.length}
          </p>
          <div onClick={() => setFlipped(!flipped)}
            className="border border-gray-800 rounded-xl p-6 bg-gray-900 cursor-pointer min-h-64 flex flex-col items-center justify-center text-center mb-4">
            {!flipped ? (
              <>
                <p className="text-2xl font-medium text-white mb-2">{currentWord.word}</p>
                <p className="text-xs text-gray-600">tap to reveal</p>
              </>
            ) : (
              <div className="w-full text-left">
                {/* Definition */}
                {currentWord.definition && (
                  <div className="mb-3">
                    <p className="text-xs text-amber-500 font-medium mb-1">Definition</p>
                    <p className="text-sm text-gray-300">{currentWord.definition}</p>
                  </div>
                )}

                {/* Synonyms */}
                {currentWord.synonyms?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-amber-500 font-medium mb-1">Synonyms</p>
                    <div className="flex flex-wrap gap-1">
                      {currentWord.synonyms.map((s, i) => (
                        <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Antonyms */}
                {currentWord.antonyms?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-amber-500 font-medium mb-1">Antonyms</p>
                    <div className="flex flex-wrap gap-1">
                      {currentWord.antonyms.map((a, i) => (
                        <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full line-through decoration-gray-600">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Sentences */}
                {currentWord.ai_sentences?.length > 0 ? (
                  <div>
                    <p className="text-xs text-amber-500 font-medium mb-1">Use it like this</p>
                    {currentWord.ai_sentences.map((s, i) => (
                      <p key={i} className="text-sm text-gray-300 mb-2">{i + 1}. {s}</p>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); generateSentences(currentWord); }}
                    disabled={generatingFor === currentWord.id}
                    className="text-sm text-amber-500 border border-amber-800 px-4 py-2 rounded-lg disabled:opacity-50 w-full">
                    {generatingFor === currentWord.id ? "Generating..." : "✨ Generate Sentences"}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setFlashIndex(Math.max(0, flashIndex - 1)); setFlipped(false); }}
              disabled={flashIndex === 0}
              className="flex-1 py-2 rounded-lg border border-gray-800 text-gray-400 text-sm disabled:opacity-30">
              ← Previous
            </button>
            <button
              onClick={() => { setFlashIndex(Math.min(words.length - 1, flashIndex + 1)); setFlipped(false); }}
              disabled={flashIndex === words.length - 1}
              className="flex-1 py-2 rounded-lg border border-gray-800 text-gray-400 text-sm disabled:opacity-30">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <>
          {loading && <p className="text-gray-500 text-sm text-center py-8">Loading...</p>}
          {!loading && words.length === 0 && !showForm && (
            <p className="text-gray-600 text-sm text-center py-8">No words yet.</p>
          )}
          {words.map(w => (
            <div key={w.id} className="border border-gray-800 rounded-xl p-4 mb-3 bg-gray-900">
              <p className="text-base font-medium text-white mb-1">{w.word}</p>

              {w.definition && (
                <p className="text-xs text-gray-400 mb-2">{w.definition}</p>
              )}

              {w.synonyms?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-gray-600">≈</span>
                  {w.synonyms.map((s, i) => (
                    <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              )}

              {w.context && (
                <p className="text-xs text-gray-500 italic mb-2">"{w.context}"</p>
              )}

              {w.ai_sentences?.length > 0 ? (
                <div className="mt-2 border-t border-gray-800 pt-2">
                  <p className="text-xs text-amber-500 mb-1 font-medium">Use it like this:</p>
                  {w.ai_sentences.map((s, i) => (
                    <p key={i} className="text-xs text-gray-400 mb-1">{i + 1}. {s}</p>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => generateSentences(w)}
                  disabled={generatingFor === w.id}
                  className="text-xs text-amber-500 border border-amber-800 px-3 py-1 rounded-full disabled:opacity-50 mt-1">
                  {generatingFor === w.id ? "Generating..." : "✨ Generate Sentences"}
                </button>
              )}
            </div>
          ))}
        </>
      )}

      {/* Add Word Form */}
      {showForm && (
        <div className="border border-amber-800 rounded-xl p-4 mb-3 bg-gray-900">
          <p className="text-sm font-medium text-white mb-3">New Word</p>
          <input type="text" placeholder="Word *" value={newWord}
            onChange={e => setNewWord(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500" />
          <textarea placeholder="Where did you encounter it? (optional)" value={newContext}
            onChange={e => setNewContext(e.target.value)} rows={2}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500 resize-none" />
          <p className="text-xs text-gray-600 mb-3">
            Definition and synonyms are fetched automatically
          </p>
          <div className="flex gap-2">
            <button onClick={saveWord} disabled={saving || !newWord.trim()}
              className="flex-1 py-2 rounded-lg bg-amber-500 text-black text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Save Word"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setShowForm(true)}
        className="w-full mt-2 py-3 rounded-xl border border-amber-800 text-amber-500 text-sm font-medium hover:bg-amber-950 transition-colors">
        + Add a Word
      </button>

    </main>
  );
}