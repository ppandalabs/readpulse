"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newPages, setNewPages] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setBooks(data);
    setLoading(false);
  }

  async function addBook() {
    if (!newTitle || !newPages) return;
    const { error } = await supabase
      .from("books")
      .insert([{
        title: newTitle,
        author: newAuthor,
        pages: parseInt(newPages),
        read: 0,
        status: "reading",
      }]);
    if (!error) {
      setNewTitle(""); setNewAuthor(""); setNewPages("");
      setShowForm(false); fetchBooks();
    }
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium">
          Read<span className="text-amber-500">Pulse</span>
        </h1>
        <span className="text-sm bg-amber-950 text-amber-400 px-3 py-1 rounded-full">
          🔥 7 day streak
        </span>
      </div>

      <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
        Currently Reading
      </p>

      {loading && <p className="text-gray-500 text-sm text-center py-8">Loading...</p>}
      {!loading && books.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-8">No books yet. Add your first one.</p>
      )}

      {books.map(book => (
        <div
          key={book.id}
          onClick={() => router.push(`/books/${book.id}`)}
          className="border border-gray-800 rounded-xl p-4 mb-3 bg-gray-900 cursor-pointer hover:border-amber-800 transition-colors"
        >
          <p className="font-medium text-sm text-white">{book.title}</p>
          <p className="text-xs text-gray-500 mb-3">{book.author}</p>
          <div className="h-1 bg-gray-800 rounded-full mb-2">
            <div
              className="h-1 bg-amber-500 rounded-full"
              style={{ width: `${book.pages > 0 ? Math.round((book.read / book.pages) * 100) : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-amber-500 font-medium">
              {book.pages > 0 ? Math.round((book.read / book.pages) * 100) : 0}%
            </span>
            <span className="text-gray-500">{book.read}/{book.pages} pages</span>
          </div>
        </div>
      ))}

      {showForm && (
        <div className="border border-gray-800 rounded-xl p-4 mb-3 bg-gray-900">
          <p className="text-sm font-medium text-white mb-3">New Book</p>
          <input type="text" placeholder="Book title *" value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-2 outline-none border border-gray-700 focus:border-amber-500" />
          <input type="text" placeholder="Author" value={newAuthor}
            onChange={e => setNewAuthor(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-2 outline-none border border-gray-700 focus:border-amber-500" />
          <input type="number" placeholder="Total pages *" value={newPages}
            onChange={e => setNewPages(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500" />
          <div className="flex gap-2">
            <button onClick={addBook}
              className="flex-1 py-2 rounded-lg bg-amber-500 text-black text-sm font-medium">
              Add Book
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
        + Add a Book
      </button>

    </main>
  );
}