'use client';
import { useState, useEffect } from 'react';

type Entry = {
  id: string;
  content: string;
  summary?: string;
  createdAt: string;
};

export default function HomePage() {
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);

  const fetchEntries = async () => {
    const res = await fetch('/api/entry');
    const data = await res.json();
    setEntries(data);
  };

  const handleSave = async () => {
    if (!entry.trim()) return;

    try {
      const res = await fetch('/api/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: entry }),
      });

      if (res.ok) {
        setEntry('');
        console.log('✅ Entry saved!');
        fetchEntries(); // refresh the list
      } else {
        console.error('❌ Failed to save entry');
      }
    } catch (error) {
      console.error('❌ Error saving entry:', error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <main className="flex flex-col min-h-screen items-center p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">My Journal</h1>

      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your thoughts here..."
        className="w-full max-w-xl h-48 p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Entry
      </button>

      <div className="w-full max-w-xl mt-12">
        <h2 className="text-2xl font-semibold mb-4">Previous Entries</h2>
        {entries.map((entry) => (
          <div key={entry.id} className="mb-4 p-4 border rounded shadow-sm">
            <p className="text-gray-800 mb-2">{entry.content}</p>
            {entry.summary && (
              <p className="text-sm text-green-700 italic">
                Summary: {entry.summary}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
