"use client";
import { useState } from "react";

export default function Home() {
  const [books, setBooks] = useState([
    { id: 1, title: "Atomic Habits", author: "James Clear", pages: 320, read: 214 },
    { id: 2, title: "Deep Work", author: "Cal Newport", pages: 296, read: 82 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newPages, setNewPages] = useState("");

  function addBook() {
    if (!newTitle || !newPages) return;
    const book = {
      id: books.length + 1,
      title: newTitle,
      author: newAuthor,
      pages: parseInt(newPages),
      read: 0,
    };
    setBooks([...books, book]);
    setNewTitle("");
    setNewAuthor("");
    setNewPages("");
    setShowForm(false);
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium">
          Read<span className="text-amber-500">Pulse</span>
        </h1>
        <span className="text-sm bg-amber-950 text-amber-400 px-3 py-1 rounded-full">
          🔥 7 day streak
        </span>
      </div>

      {/* Section Label */}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
        Currently Reading
      </p>

      {/* Book Cards */}
      {books.map(book => (
        <div key={book.id} className="border border-gray-800 rounded-xl p-4 mb-3 bg-gray-900">
          <p className="font-medium text-sm text-white">{book.title}</p>
          <p className="text-xs text-gray-500 mb-3">{book.author}</p>
          <div className="h-1 bg-gray-800 rounded-full mb-2">
            <div
              className="h-1 bg-amber-500 rounded-full"
              style={{ width: `${Math.round((book.read / book.pages) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-amber-500 font-medium">
              {Math.round((book.read / book.pages) * 100)}%
            </span>
            <span className="text-gray-500">{book.read}/{book.pages} pages</span>
          </div>
        </div>
      ))}

      {/* Add Book Form */}
      {showForm && (
        <div className="border border-gray-800 rounded-xl p-4 mb-3 bg-gray-900">
          <p className="text-sm font-medium text-white mb-3">New Book</p>
          <input
            type="text"
            placeholder="Book title *"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-2 outline-none border border-gray-700 focus:border-amber-500"
          />
          <input
            type="text"
            placeholder="Author"
            value={newAuthor}
            onChange={e => setNewAuthor(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-2 outline-none border border-gray-700 focus:border-amber-500"
          />
          <input
            type="number"
            placeholder="Total pages *"
            value={newPages}
            onChange={e => setNewPages(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-gray-700 focus:border-amber-500"
          />
          <div className="flex gap-2">
            <button
              onClick={addBook}
              className="flex-1 py-2 rounded-lg bg-amber-500 text-black text-sm font-medium"
            >
              Add Book
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full mt-2 py-3 rounded-xl border border-amber-800 text-amber-500 text-sm font-medium hover:bg-amber-950 transition-colors"
      >
        + Add a Book
      </button>

    </main>
  );
}