"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [inputNote, setInputNote] = useState("");
  const [outputNote, setOutputNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("tech_support");
  const [savedNotes, setSavedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("my_tech_notes");
    if (data) setSavedNotes(JSON.parse(data));
  }, []);

  async function handleRefine() {
    if (!inputNote) return;
    setLoading(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: inputNote, mode: mode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOutputNote(data.output);
    } catch (error) {
      alert("Error generating note. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!outputNote) return;
    const newNote = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      original: inputNote,
      refined: outputNote,
      type: mode
    };
    const updatedNotes = [newNote, ...savedNotes];
    setSavedNotes(updatedNotes);
    localStorage.setItem("my_tech_notes", JSON.stringify(updatedNotes));
    alert("Saved to History!");
  }

  function handleDelete(id) {
    const updatedNotes = savedNotes.filter(note => note.id !== id);
    setSavedNotes(updatedNotes);
    localStorage.setItem("my_tech_notes", JSON.stringify(updatedNotes));
  }

  const filteredNotes = savedNotes.filter(note => 
    note.refined.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.original.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <main className="flex-1 flex flex-col md:flex-row">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-1/4 bg-gray-800 border-r border-gray-700 p-4 flex flex-col h-[500px] md:h-auto">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Saved Logs</h2>
          <input 
            type="text" 
            placeholder="Search history..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded p-2 mb-4 text-sm text-white focus:border-blue-500 outline-none"
          />
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredNotes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-10">No notes found.</p>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id} className="bg-gray-700 p-3 rounded hover:bg-gray-600 transition cursor-pointer group relative">
                  <div onClick={() => { setOutputNote(note.refined); setInputNote(note.original); }}>
                    <p className="text-xs text-blue-300 font-bold uppercase mb-1">{note.type} • {note.date}</p>
                    <p className="text-sm text-gray-200 line-clamp-2">{note.refined}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                  >✕</button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* MAIN TOOL AREA */}
        <section className="flex-1 p-6 md:p-10 overflow-y-auto">
          <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">NoteRefiner<span className="text-blue-500">.ai</span></h1>
              <p className="text-gray-400 text-sm">Professional AI Formatting Tool</p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-300">Mode:</label>
              <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value)}
                className="bg-gray-800 border border-gray-600 p-2 rounded text-sm text-white focus:border-blue-500 outline-none"
              >
                <option value="tech_support">IT Ticket Log</option>
                <option value="email">Professional Email</option>
                <option value="meeting_minutes">Meeting Minutes</option>
                <option value="kb_article">Knowledge Base Article</option>
              </select>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
            {/* INPUT */}
            <div className="flex flex-col h-full">
              <label className="mb-2 text-gray-400 text-sm font-semibold">1. Paste Rough Notes</label>
              <textarea
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none outline-none transition"
                placeholder="- user cant login&#10;- tried reset password&#10;- error 503..."
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
              />
            </div>

            {/* OUTPUT */}
            <div className="flex flex-col h-full">
              <label className="mb-2 text-gray-400 text-sm font-semibold">2. AI Refined Output</label>
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-200 overflow-auto whitespace-pre-wrap shadow-inner">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-blue-400 animate-pulse">
                    Processing your text...
                  </div>
                ) : (
                  outputNote || <span className="text-gray-600">Result will appear here...</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRefine}
              disabled={loading || !inputNote}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Refining..." : "✨ Generate Professional Text"}
            </button>
            <button
              onClick={handleSave}
              disabled={!outputNote}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Save to History
            </button>
          </div>

          {/* --- NEW "DICTIONARY STYLE" CONTENT SECTION --- */}
          <article className="mt-24 border-t border-gray-800 pt-12 max-w-5xl mx-auto text-gray-300">
            
            {/* 1. DEFINITION SECTION */}
            <div className="mb-12">
              <div className="flex items-baseline gap-4 mb-4">
                <h2 className="text-4xl font-bold text-white">note refine</h2>
                <span className="text-gray-500 italic text-xl">verb</span>
              </div>
              <p className="text-xl leading-relaxed text-gray-200 border-l-4 border-blue-500 pl-4">
                The process of converting unstructured, shorthand, or messy text into professional, grammatically correct documentation using Artificial Intelligence.
              </p>
            </div>

            {/* 2. SYNONYMS & RELATED FORMATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Synonyms (Use Cases)</h3>
                <ul className="space-y-3 text-sm">
                  <li><strong className="text-blue-400">Meeting Minutes:</strong> A structured written record of a meeting, including attendees, decisions made, and action items.</li>
                  <li><strong className="text-blue-400">IT Ticket Logs:</strong> Technical documentation describing a system error, steps to reproduce, and resolution status (Jira/ServiceNow).</li>
                  <li><strong className="text-blue-400">Executive Summaries:</strong> A short document that summarizes a longer report or proposal for management.</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Antonyms (What it fixes)</h3>
                <ul className="space-y-3 text-sm">
                  <li><strong className="text-red-400">Brain Dumps:</strong> Unfiltered, disorganized thoughts written down quickly without structure.</li>
                  <li><strong className="text-red-400">Shorthand:</strong> Abbreviated writing that is often difficult for others to understand (e.g., "svr down pls fix").</li>
                  <li><strong className="text-red-400">Drafts:</strong> Preliminary versions of documents that contain typos and grammatical errors.</li>
                </ul>
              </div>
            </div>

            {/* 3. EXAMPLES IN CONTEXT */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-6">Examples of Note Refining</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-700 p-4 rounded bg-gray-900/50">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Before (Raw Input)</span>
                  <p className="mt-2 font-mono text-sm text-gray-400">"bob said api 500 error on login page, need sarah to check db logs by 5pm today"</p>
                </div>
                <div className="border border-blue-900/50 p-4 rounded bg-blue-900/10">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">After (Refined Output)</span>
                  <div className="mt-2 text-sm text-gray-200">
                    <p><strong>Issue:</strong> API 500 Error detected on Login Page.</p>
                    <p className="mt-1"><strong>Action Item:</strong> Sarah to investigate database logs.</p>
                    <p className="mt-1"><strong>Deadline:</strong> Today at 5:00 PM.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. HISTORY & TECH */}
            <div className="bg-gray-800 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-4">Did You Know?</h3>
              <p className="mb-4 leading-relaxed">
                <strong>The Cost of Bad Documentation:</strong> Studies show that IT professionals spend up to 20% of their work week looking for information or clarifying poorly written instructions. This "knowledge loss" costs companies thousands of dollars per employee every year.
              </p>
              <p className="leading-relaxed">
                <strong>How It Works:</strong> NoteRefiner uses Large Language Models (LLMs) trained on millions of technical documents. Unlike a simple spell-checker, the AI understands the <em>context</em> of your notes—distinguishing between a server IP address and a phone number, or recognizing that "Urgent" means a high-priority ticket.
              </p>
            </div>

          </article>
          {/* --- END DICTIONARY SECTION --- */}

        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-gray-950 text-center text-gray-500 text-sm py-8 border-t border-gray-800">
        <div className="flex justify-center gap-6 mb-4">
          <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition">Terms of Service</a>
          <a href="/contact" className="hover:text-white transition">Contact Us</a>
        </div>
        <p>&copy; {new Date().getFullYear()} NoteRefiner. All rights reserved.</p>
      </footer>
    </div>
  );
}
