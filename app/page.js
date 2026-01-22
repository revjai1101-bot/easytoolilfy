"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [inputNote, setInputNote] = useState("");
  const [outputNote, setOutputNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("tech_support");
  const [savedNotes, setSavedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load saved data on mount
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
        
        {/* History Sidebar */}
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

        {/* Main Application Area */}
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
            {/* Input Section */}
            <div className="flex flex-col h-full">
              <label className="mb-2 text-gray-400 text-sm font-semibold">1. Paste Rough Notes</label>
              <textarea
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none outline-none transition"
                placeholder="- user cant login&#10;- tried reset password&#10;- error 503..."
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
              />
            </div>

            {/* Result Section */}
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

          {/* User Documentation & Guide */}
          <article className="mt-24 border-t border-gray-800 pt-12 max-w-5xl mx-auto text-gray-300">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">The Documentation Academy</h2>
              <p className="text-xl text-gray-400">Mastering the Art of Technical Communication</p>
            </div>

            {/* Glossary Section */}
            <div className="mb-16 bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="flex items-baseline gap-4 mb-4">
                <h3 className="text-3xl font-bold text-white">note refine</h3>
                <span className="text-gray-500 italic text-xl">verb</span>
              </div>
              <p className="text-lg leading-relaxed text-gray-200 border-l-4 border-blue-500 pl-6 mb-6">
                The process of using Large Language Models (LLMs) to transform unstructured, shorthand, or "messy" input text into professional, standardized documentation suitable for business environments.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Synonyms</h4>
                    <p className="text-white">Text Polishing, Automated Reporting, AI Summarization, Ticket Scrubbing.</p>
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Antonyms</h4>
                    <p className="text-white">Brain Dumps, Shorthand, Rough Drafts, Unstructured Data.</p>
                 </div>
              </div>
            </div>

            {/* Educational Resources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white border-b border-blue-500 pb-2 inline-block">1. The Clarity Crisis</h3>
                <p className="text-sm leading-relaxed">
                  In System Support and QA, "clarity" is not a luxury; it is a requirement. A vague bug report like "Login isn't working" can waste hours of developer time. NoteRefiner forces structure onto chaos, ensuring that every report contains the vital "Who, What, Where, and How."
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white border-b border-green-500 pb-2 inline-block">2. The "Bus Factor"</h3>
                <p className="text-sm leading-relaxed">
                  If only one person knows how to fix the server, your company has a high "Bus Factor" risk. By converting your mental notes into a searchable <strong>Knowledge Base Article</strong>, you democratize information. NoteRefiner helps you leave a paper trail that anyone can follow.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white border-b border-purple-500 pb-2 inline-block">3. Professionalism</h3>
                <p className="text-sm leading-relaxed">
                  Sending an email full of typos and lowercase letters damages your professional reputation. Our <strong>Professional Email</strong> mode acts as a safeguard, ensuring that even your quickest updates sound measured, polite, and corporate-ready.
                </p>
              </div>
            </div>

            {/* Best Practices Guide */}
            <div className="mb-16">
               <h3 className="text-2xl font-bold text-white mb-6">Best Practices for Technical Notes</h3>
               <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-700 text-gray-300 text-sm uppercase">
                        <th className="p-4">Component</th>
                        <th className="p-4">Why it is Critical</th>
                        <th className="p-4">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-sm">
                      <tr>
                        <td className="p-4 font-bold text-white">Action Items</td>
                        <td className="p-4">Without a clear owner and deadline, tasks are forgotten.</td>
                        <td className="p-4 text-green-400">"John to restart SQL Service by 3 PM."</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white">Steps to Reproduce</td>
                        <td className="p-4">Developers cannot fix what they cannot see.</td>
                        <td className="p-4 text-green-400">"1. Open App. 2. Click Login. 3. See Error 500."</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white">Environment</td>
                        <td className="p-4">Bugs often only appear on specific OS or Browsers.</td>
                        <td className="p-4 text-green-400">"Windows 11, Chrome Version 120."</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white">Severity</td>
                        <td className="p-4">Helps management prioritize resources.</td>
                        <td className="p-4 text-red-400">"Critical - Production Down."</td>
                      </tr>
                    </tbody>
                  </table>
               </div>
            </div>

            {/* Feature Overview */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-white mb-8">Understanding the Modes</h3>
              
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                   <div className="w-full md:w-1/3">
                      <h4 className="text-lg font-bold text-blue-400 mb-2">IT Ticket Log</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">For: QA, Support, DevOps</p>
                   </div>
                   <div className="w-full md:w-2/3">
                      <p className="text-sm mb-2">
                        This mode is designed to feed directly into systems like <strong>Jira, ServiceNow, or Zendesk</strong>. It takes a stream of consciousness description of a bug and breaks it down into the industry-standard structure: Summary, Description, Environment, and Steps to Reproduce.
                      </p>
                      <p className="text-sm text-gray-400 italic">"Use this when you find a bug but don't want to spend 15 minutes formatting the ticket."</p>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 border-t border-gray-700 pt-8">
                   <div className="w-full md:w-1/3">
                      <h4 className="text-lg font-bold text-green-400 mb-2">Meeting Minutes</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">For: PMs, Scrum Masters</p>
                   </div>
                   <div className="w-full md:w-2/3">
                      <p className="text-sm mb-2">
                        Meeting notes are often messy and chronological. This mode ignores the timeline and focuses on the <strong>outcome</strong>. It extracts key decisions and assigns action items to specific people.
                      </p>
                      <p className="text-sm text-gray-400 italic">"Use this after a Daily Standup or Client Sync to send a quick summary email."</p>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 border-t border-gray-700 pt-8">
                   <div className="w-full md:w-1/3">
                      <h4 className="text-lg font-bold text-purple-400 mb-2">Knowledge Base Article</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">For: Tech Writers, Onboarding</p>
                   </div>
                   <div className="w-full md:w-2/3">
                      <p className="text-sm mb-2">
                        When you solve a difficult problem, you should document it. This mode creates a "Problem > Solution" article suitable for Confluence or Notion. It focuses on clarity and searchability.
                      </p>
                      <p className="text-sm text-gray-400 italic">"Use this to document the solution to a recurring server error."</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-gray-800/50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
              <div className="space-y-6">
                <div>
                   <h4 className="text-white font-bold mb-2">How accurate is the AI refinement?</h4>
                   <p className="text-sm text-gray-400">NoteRefiner uses advanced Generative AI models (Gemini 2.5 Flash / Gemma 3) which are specifically tuned for code and technical language. While it is highly accurate, we always recommend reviewing the output—especially for critical IP addresses or financial data—before publishing.</p>
                </div>
                <div>
                   <h4 className="text-white font-bold mb-2">Does this work for coding languages?</h4>
                   <p className="text-sm text-gray-400">Yes. If you paste a snippet of Python or SQL error logs into the "IT Ticket" or "KB Article" mode, the AI will recognize the code, format it into a Markdown code block, and separate it from the descriptive text.</p>
                </div>
                <div>
                   <h4 className="text-white font-bold mb-2">Can I save my notes?</h4>
                   <p className="text-sm text-gray-400">Yes. Clicking "Save to History" stores your refined notes in your browser's Local Storage. This means your data stays on your device and is not saved to our cloud database, ensuring your privacy.</p>
                </div>
              </div>
            </div>

          </article>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-950 text-center text-gray-500 text-sm py-8 border-t border-gray-800">
        <div className="flex justify-center gap-6 mb-4">
          <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition">Terms of Service</a>
          <a href="/contact" className="hover:text-white transition">Contact Us</a>
        </div>
        <p>&copy; {new Date().getFullYear()} NoteRefiner. All rights reserved. | <span className="text-gray-600">Built for Engineers, by Engineers.</span></p>
      </footer>
    </div>
  );
}
