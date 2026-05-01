"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function BookDetail() {
  const router = useRouter();
  const params = useParams();
  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagesRead, setPagesRead] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [quoteImage, setQuoteImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [note, setNote] = useState({
    chapter: "",
    takeaway: "",
    key_ideas: "",
    quote: "",
    new_word: "",
  });

  useEffect(() => {
    if (params?.id) {
      fetchBook();
      fetchNotes();
    }
  }, [params]);

  async function fetchBook() {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error) console.error(error);
    else setBook(data);
    setLoading(false);
  }

  async function fetchNotes() {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("book_id", params.id)
      .order("chapter", { ascending: true, nullsFirst: false });
    if (error) console.error(error);
    else setNotes(data);
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

  async function saveNote() {
    if (!note.takeaway) return;
    setSavingNote(true);

    let quoteImageUrl = null;

    // Upload image if selected
    if (quoteImage) {
      setUploadingImage(true);
      const fileName = `${params.id}/${Date.now()}-${quoteImage.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("quote-images")
        .upload(fileName, quoteImage);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("quote-images")
          .getPublicUrl(fileName);
        quoteImageUrl = urlData.publicUrl;
      }
      setUploadingImage(false);
    }

    const { error } = await supabase
      .from("notes")
      .insert([{
        book_id: params.id,
        chapter: note.chapter ? parseInt(note.chapter) : null,
        takeaway: note.takeaway,
        key_ideas: note.key_ideas || null,
        quote: note.quote || null,
        quote_image_url: quoteImageUrl,
        new_word: note.new_word || null,
      }]);

    if (!error) {
      setNote({ chapter: "", takeaway: "", key_ideas: "", quote: "", new_word: "" });
      setQuoteImage(null);
      setShowNoteForm(false);
      fetchNotes();
    }
    setSavingNote(false);
  }

  async function deleteNote(noteId) {
    const confirmed = window.confirm("Delete this note?");
    if (!confirmed) return;
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);
    if (!error) fetchNotes();
  }

  if (loading) return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <p className="text-gray-500 text-sm">Loading book...</p>
    </main>
  );

  if (!book) return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <button onClick={() => router.push("/")} className="text-gray-500 text-sm mb-4">← Back</button>
      <p className="text-gray-500 text-sm">Book not found.</p>
    </main>
  );

  const percent = book.pages > 0
    ? Math.round((book.read / book.pages) * 100) : 0;

  return (
    <main className="max-w-sm mx-auto px-4 py-6">

      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="text-gray-500 text-sm mb-6 flex items-center gap-1 hover:text-amber-500 transition-colors"
      >
        ← Back to shelf
      </button>

      {/* Book Title */}
      <h1 className="text-xl font-medium text-white mb-1">{book.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{book.author}</p>

      {/* Progress Card */}
      <div className="border border-gray-800 rounded-xl p-4 mb-4 bg-gray-900">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Progress</p>
          <span className="text-amber-500 font-medium text-sm">{percent}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full mb-2">
          <div
            className="h-2 bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right">{book.read} / {book.pages} pages</p>
      </div>

      {/* Log Pages */}
      <div className="border border-gray-800 rounded-xl p-4 mb-6 bg-gray-900">
        <p className="text-sm font-medium text-white mb-1">Log Today's Reading</p>
        <p className="text-xs text-gray-500 mb-3">Enter total pages read so far</p>
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

      {/* Notes Section Header */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Notes ({notes.length})
        </p>
        <button
          onClick={() => setShowNoteForm(!showNoteForm)}
          className="text-xs text-amber-500 hover:text-amber-400"
        >
          {showNoteForm ? "Cancel" : "+ Add Note"}
        </button>
      </div>

      {/* Note Form */}
      {showNoteForm && (
        <div className="border border-amber-800 rounded-xl p-4 mb-4 bg-gray-900">

          <input
            type="number"
            placeholder="Chapter number (optional)"
            value={note.chapter}
            onChange={e => setNote({ ...note, chapter: e.target.value })}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500"
          />

          <textarea
            placeholder="One-line takeaway *"
            value={note.takeaway}
            onChange={e => setNote({ ...note, takeaway: e.target.value })}
            rows={2}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500 resize-none"
          />

          <textarea
            placeholder="Key ideas"
            value={note.key_ideas}
            onChange={e => setNote({ ...note, key_ideas: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500 resize-none"
          />

          <input
            type="text"
            placeholder="Quote from this section"
            value={note.quote}
            onChange={e => setNote({ ...note, quote: e.target.value })}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500"
          />
          {/* Quote Image Upload */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Or upload quote image</p>
            <label className="block w-full border border-dashed border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:border-amber-700 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={e => setQuoteImage(e.target.files[0])}
                className="hidden"
              />
              {quoteImage ? (
                <span className="text-xs text-amber-500">{quoteImage.name}</span>
              ) : (
                <span className="text-xs text-gray-600">📷 Tap to upload image</span>
              )}
            </label>
            {quoteImage && (
              <img
                src={URL.createObjectURL(quoteImage)}
                alt="Quote preview"
                className="mt-2 rounded-lg w-full object-cover max-h-40"
              />
            )}
          </div>
          <input
            type="text"
            placeholder="New word learned"
            value={note.new_word}
            onChange={e => setNote({ ...note, new_word: e.target.value })}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500"
          />

          <button
            onClick={saveNote}
            disabled={savingNote || !note.takeaway}
            className="w-full py-2 rounded-lg bg-amber-500 text-black text-sm font-medium disabled:opacity-50"
          >
            {savingNote ? "Saving..." : "Save Note"}
          </button>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 && !showNoteForm && (
        <p className="text-gray-600 text-sm text-center py-6">
          No notes yet. Add your first one.
        </p>
      )}

      {notes.map(n => (
        <div key={n.id} className="border border-gray-800 rounded-xl p-4 mb-3 bg-gray-900 relative">

          {/* Delete Note Button */}
          <button
            onClick={() => deleteNote(n.id)}
            className="absolute top-3 right-3 text-gray-600 hover:text-red-400 transition-colors text-lg"
          >
            ×
          </button>

          {n.chapter && (
            <span className="text-xs bg-amber-950 text-amber-400 px-2 py-1 rounded-full mb-3 inline-block">
              Chapter {n.chapter}
            </span>
          )}
          <p className="text-sm font-medium text-white mb-2 pr-6">{n.takeaway}</p>
          {n.key_ideas && <p className="text-xs text-gray-400 mb-2">💡 {n.key_ideas}</p>}
          {n.quote && <p className="text-xs text-gray-400 italic mb-2">"{n.quote}"</p>}
          {n.quote_image_url && (
            <img
              src={n.quote_image_url}
              alt="Quote"
              className="mt-2 rounded-lg w-full object-cover max-h-48 cursor-pointer"
              onClick={() => window.open(n.quote_image_url, '_blank')}
            />
          )}
          {n.new_word && (
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
              📖 {n.new_word}
            </span>
          )}
        </div>
      ))}

    </main>
  );
}