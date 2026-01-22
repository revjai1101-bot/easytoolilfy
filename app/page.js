"use client";
import { useState, useEffect } from "react";
import Image from "next/image"; // Import Next.js Image component

export default function Home() {
  const [inputNote, setInputNote] = useState("");
  const [outputNote, setOutputNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("tech_support");
  const [savedNotes, setSavedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load saved data from local storage
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
        
        {/* Left Sidebar: History & Logs */}
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

        {/* Right Main Area: Tool Interface */}
        <section className="flex-1 p-6 md:p-10 overflow-y-auto">
          <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">NoteRefiner<span className="text-blue-500">.ai</span></h1>
              <p className="text-gray-400 text-sm">Enterprise Documentation Assistant</p>
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
            {/* Input Area */}
            <div className="flex flex-col h-full">
              <label className="mb-2 text-gray-400 text-sm font-semibold">1. Rough Input</label>
              <textarea
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none outline-none transition"
                placeholder="- user cant login&#10;- tried reset password&#10;- error 503..."
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
              />
            </div>

            {/* Output Area */}
            <div className="flex flex-col h-full">
              <label className="mb-2 text-gray-400 text-sm font-semibold">2. Refined Documentation</label>
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
              {loading ? "Refining..." : "✨ Generate Documentation"}
            </button>
            <button
              onClick={handleSave}
              disabled={!outputNote}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Save to Logs
            </button>
          </div>

          {/* ======================================================== */}
          {/* THE KNOWLEDGE HUB (Text + Video)                         */}
          {/* ======================================================== */}
          <article className="mt-24 border-t border-gray-800 pt-16 max-w-6xl mx-auto text-gray-300">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Documentation Standards & Best Practices</h2>
              <p className="text-xl text-gray-400">The Comprehensive Whitepaper for System Engineers</p>
            </div>

            {/* 1. KEY CONCEPTS & DEFINITION */}
            <div className="mb-20 bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">
              <div className="flex items-baseline gap-4 mb-4">
                <h3 className="text-3xl font-bold text-white">note refine</h3>
                <span className="text-gray-500 italic text-xl">verb</span>
              </div>
              <p className="text-lg leading-relaxed text-gray-200 border-l-4 border-blue-500 pl-6 mb-6">
                The technical process of transforming unstructured data (logs, shorthand, brain dumps) into standardized, compliant documentation using Natural Language Processing (NLP). This aligns with ISO 9001 quality management standards for record-keeping.
              </p>
            </div>

            {/* NEW: VIDEO LEARNING CENTER */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-6">Video Learning Center</h3>
               <p className="mb-8 text-gray-400">Master the art of technical communication with these curated resources from industry leaders.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Video 1: Google SRE */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                     <div className="aspect-w-16 aspect-h-9 mb-4">
                        <iframe 
                           className="w-full h-64 rounded-lg"
                           src="https://www.youtube.com/embed/ciUP1g_9dTA" 
                           title="SRE at Google"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                        ></iframe>
                     </div>
                     <h4 className="text-lg font-bold text-white mb-2">Google SRE: The Role of Documentation</h4>
                     <p className="text-sm text-gray-400">Learn how Google Site Reliability Engineers use documentation to prevent system outages.</p>
                  </div>

                  {/* Video 2: Technical Writing */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                     <div className="aspect-w-16 aspect-h-9 mb-4">
                        <iframe 
                           className="w-full h-64 rounded-lg"
                           src="https://www.youtube.com/embed/N2zK3sAtr-4" 
                           title="Technical Writing Course"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                        ></iframe>
                     </div>
                     <h4 className="text-lg font-bold text-white mb-2">Technical Writing for Developers</h4>
                     <p className="text-sm text-gray-400">A crash course in writing clear, concise, and professional engineering logs.</p>
                  </div>
               </div>
            </div>

            {/* 2. REAL WORLD STORIES */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-500 pl-4">Case Studies: The Cost of Poor Documentation</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Story 1 */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-500 transition">
                     <h4 className="text-xl font-bold text-white mb-2">The Mars Climate Orbiter ($327M Loss)</h4>
                     <p className="text-sm text-gray-400 mb-4 italic">September 1999</p>
                     <p className="text-sm leading-relaxed mb-4">
                        NASA lost a $327 million spacecraft because of a simple documentation error. One engineering team used <strong>Metric units</strong> (Newtons) while another used <strong>Imperial units</strong> (Pounds-force). 
                     </p>
                  </div>

                  {/* Story 2 */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-500 transition">
                     <h4 className="text-xl font-bold text-white mb-2">The Knight Capital Glitch ($440M Loss)</h4>
                     <p className="text-sm text-gray-400 mb-4 italic">August 2012</p>
                     <p className="text-sm leading-relaxed mb-4">
                        In just 45 minutes, Knight Capital Group lost $440 million due to a failed deployment. An engineer forgot to copy new code because the <strong>deployment manual was outdated</strong>.
                     </p>
                  </div>
               </div>
            </div>

            {/* NEW: VISUAL WORKFLOW DIAGRAM (CSS Based - No Image File Needed) */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-8">How NoteRefiner Works (Architecture)</h3>
               <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                  
                  {/* Step 1 */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 w-full relative">
                     <div className="text-4xl mb-4">🧠</div>
                     <h4 className="font-bold text-white">1. Input</h4>
                     <p className="text-sm text-gray-400">Messy Notes</p>
                     {/* Arrow for Desktop */}
                     <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl">➔</div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-blue-900/40 p-6 rounded-lg border border-blue-500 w-full relative">
                     <div className="text-4xl mb-4">⚙️</div>
                     <h4 className="font-bold text-blue-300">2. Processing</h4>
                     <p className="text-sm text-blue-200">Gemma-3 AI Engine</p>
                     <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl">➔</div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-green-900/40 p-6 rounded-lg border border-green-500 w-full">
                     <div className="text-4xl mb-4">📄</div>
                     <h4 className="font-bold text-green-300">3. Output</h4>
                     <p className="text-sm text-green-200">Standardized Docs</p>
                  </div>
               </div>
            </div>

            {/* 3. STATISTICS & FACTS */}
            <div className="mb-20 bg-gray-800/50 p-8 rounded-xl border border-gray-700">
               <h3 className="text-2xl font-bold text-white mb-8 text-center">The ROI of Documentation</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                     <div className="text-4xl font-black text-blue-400 mb-2">19%</div>
                     <p className="text-sm text-gray-300">of a knowledge worker's week is spent just <strong>searching</strong> for information.</p>
                  </div>
                  <div>
                     <div className="text-4xl font-black text-blue-400 mb-2">$5k</div>
                     <p className="text-sm text-gray-300">annual cost per employee due to productivity loss from "Knowledge Barriers".</p>
                  </div>
                  <div>
                     <div className="text-4xl font-black text-blue-400 mb-2">40%</div>
                     <p className="text-sm text-gray-300">of IT incidents are caused by <strong>Change Management</strong> errors.</p>
                  </div>
               </div>
            </div>

            {/* 4. ITIL FRAMEWORKS */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-6">ITIL Framework Compliance</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-800">
                       <h4 className="font-bold text-blue-400 mb-2">Incident Management</h4>
                       <p className="text-sm text-gray-300">ITIL requires strict recording of incidents. Our tool ensures every ticket includes a categorization and prioritization.</p>
                   </div>
                   <div className="bg-green-900/20 p-6 rounded-lg border border-green-800">
                       <h4 className="font-bold text-green-400 mb-2">Problem Management</h4>
                       <p className="text-sm text-gray-300">Distinguishing between an "Incident" (one-time event) and a "Problem" (root cause) requires clear notes.</p>
                   </div>
                   <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-800">
                       <h4 className="font-bold text-purple-400 mb-2">Knowledge Management</h4>
                       <p className="text-sm text-gray-300">The goal of ITIL is to shift knowledge "Left"—making it available to Level 1 support.</p>
                   </div>
               </div>
            </div>

            {/* 5. CAREER GROWTH RESOURCES */}
            <div className="mb-20">
              <h3 className="text-2xl font-bold text-white mb-8 border-b border-gray-700 pb-4">Career Growth Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="https://grow.google/certificates/it-support/" target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition h-full flex flex-col">
                    <div className="text-blue-500 font-bold text-lg mb-2 group-hover:underline">Google IT Support Cert &rarr;</div>
                    <p className="text-sm text-gray-400 flex-1">Master the fundamentals of IT troubleshooting and standard documentation practices.</p>
                  </div>
                </a>
                <a href="https://aws.amazon.com/certification/certified-cloud-practitioner/" target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-orange-500 transition h-full flex flex-col">
                    <div className="text-orange-500 font-bold text-lg mb-2 group-hover:underline">AWS Cloud Practitioner &rarr;</div>
                    <p className="text-sm text-gray-400 flex-1">Learn the cloud terminology required for accurate server logging and reporting.</p>
                  </div>
                </a>
                <a href="https://www.comptia.org/certifications/network" target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-500 transition h-full flex flex-col">
                    <div className="text-red-500 font-bold text-lg mb-2 group-hover:underline">CompTIA Network+ &rarr;</div>
                    <p className="text-sm text-gray-400 flex-1">Understand the networking protocols (TCP/IP, DNS) cited in technical logs.</p>
                  </div>
                </a>
              </div>
            </div>

          </article>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-950 text-center text-gray-500 text-sm py-10 border-t border-gray-800">
        <div className="flex justify-center gap-8 mb-6">
          <a href="/privacy" className="hover:text-white transition underline decoration-gray-700 underline-offset-4">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition underline decoration-gray-700 underline-offset-4">Terms of Service</a>
          <a href="/contact" className="hover:text-white transition underline decoration-gray-700 underline-offset-4">Contact Support</a>
        </div>
        <p>&copy; {new Date().getFullYear()} NoteRefiner. All rights reserved.</p>
        <p className="text-xs mt-2 text-gray-600">Optimized for System Support & QA Engineering workflows.</p>
      </footer>
    </div>
  );
}
