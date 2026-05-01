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
  const [user, setUser] = useState(null);

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

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { error } = await supabase
      .from("books")
      .insert([{
        title: newTitle,
        author: newAuthor,
        pages: parseInt(newPages),
        read: 0,
        status: "reading",
        user_id: userId,        // ← add this line
      }]);

    if (!error) {
      setNewTitle(""); setNewAuthor(""); setNewPages("");
      setShowForm(false); fetchBooks();
    }
  }

  async function deleteBook(bookId) {
    const confirmed = window.confirm("Delete this book? All notes will be deleted too.");
    if (!confirmed) return;

    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (!error) fetchBooks();
  }
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium">
          Read<span className="text-amber-500">Pulse</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/vocabulary")}
            className="text-sm text-amber-500 border border-amber-800 px-3 py-1 rounded-full hover:bg-amber-950 transition-colors"
          >
            📖 Words
          </button>
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </div>
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
          className="border border-gray-800 rounded-xl p-4 mb-3 bg-gray-900 relative"
        >
          {/* Delete Button */}
          <button
            onClick={e => { e.stopPropagation(); deleteBook(book.id); }}
            className="absolute top-3 right-3 text-gray-600 hover:text-red-400 transition-colors text-lg"
          >
            ×
          </button>

          {/* Card Content — make clickable */}
          <div
            onClick={() => router.push(`/books/${book.id}`)}
            className="cursor-pointer"
          >
            <p className="font-medium text-sm text-white pr-6">{book.title}</p>
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