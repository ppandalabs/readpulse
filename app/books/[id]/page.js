"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function BookDetail() {
  const router = useRouter();
  const params = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagesRead, setPagesRead] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (params?.id) fetchBook();
  }, [params]);

  async function fetchBook() {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error) console.error("Fetch error:", error);
    else setBook(data);
    setLoading(false);
  }

  async function logProgress() {
    if (!pagesRead) return;
    setSaving(true);
    const newRead = Math.min(parseInt(pagesRead), book.pages);
    const { error } = await supabase
      .from("books")
      .update({ read: newRead })
      .eq("id", book.id);
    if (!error) {
      setBook({ ...book, read: newRead });
      setPagesRead("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (loading) return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <p className="text-gray-500 text-sm">Loading book...</p>
    </main>
  );

  if (!book) return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <button onClick={() => router.push("/")}
        className="text-gray-500 text-sm mb-4">← Back</button>
      <p className="text-gray-500 text-sm">Book not found.</p>
    </main>
  );

  const percent = book.pages > 0
    ? Math.round((book.read / book.pages) * 100) : 0;

  return (
    <main className="max-w-sm mx-auto px-4 py-6">

      <button
        onClick={() => router.push("/")}
        className="text-gray-500 text-sm mb-6 flex items-center gap-1 hover:text-amber-500 transition-colors"
      >
        ← Back to shelf
      </button>

      <h1 className="text-xl font-medium text-white mb-1">{book.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{book.author}</p>

      <div className="border border-gray-800 rounded-xl p-4 mb-4 bg-gray-900">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
            Progress
          </p>
          <span className="text-amber-500 font-medium text-sm">{percent}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full mb-2">
          <div
            className="h-2 bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right">
          {book.read} / {book.pages} pages
        </p>
      </div>

      <div className="border border-gray-800 rounded-xl p-4 bg-gray-900">
        <p className="text-sm font-medium text-white mb-1">
          Log Today's Reading
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Enter total pages read so far
        </p>
        <input
          type="number"
          placeholder={`Current page (max ${book.pages})`}
          value={pagesRead}
          onChange={e => setPagesRead(e.target.value)}
          className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500"
        />
        <button
          onClick={logProgress}
          disabled={saving}
          className="w-full py-2 rounded-lg bg-amber-500 text-black text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Update Progress"}
        </button>
      </div>

    </main>
  );
}