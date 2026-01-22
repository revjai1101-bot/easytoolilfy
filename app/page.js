"use client";
import { useState, useEffect } from "react";
import Image from "next/image"; // Required for your workflow.jpg

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
          {/* THE AUTHORITY CONTENT SECTION (MASSIVE)                  */}
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
                The technical process of transforming unstructured data (logs, shorthand, brain dumps) into standardized, compliant documentation using Natural Language Processing (NLP). This aligns with ISO 9001 quality management standards for record-keeping and is a cornerstone of modern DevOps practices.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                 <div className="bg-gray-900 p-5 rounded-lg">
                    <h4 className="text-blue-400 font-bold mb-3">Core Applications</h4>
                    <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li><strong>Incident Post-Mortems:</strong> Structuring root cause analysis for SRE teams.</li>
                        <li><strong>Change Management:</strong> Documenting RFCs and system updates to prevent rollback failure.</li>
                        <li><strong>Knowledge Transfer:</strong> Creating wiki entries for team on-boarding and shift handovers.</li>
                    </ul>
                 </div>
                 <div className="bg-gray-900 p-5 rounded-lg">
                    <h4 className="text-red-400 font-bold mb-3">Risk Mitigation</h4>
                    <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li><strong>Ambiguity Reduction:</strong> Eliminating vague terms like "system is slow" which delay resolution.</li>
                        <li><strong>Standardization:</strong> Ensuring all shifts (APAC, EMEA, US) report issues identically.</li>
                        <li><strong>Searchability:</strong> Creating indexable keywords for future retrieval in Knowledge Bases.</li>
                    </ul>
                 </div>
              </div>
            </div>

            {/* 2. SYSTEM ARCHITECTURE (VISUAL DIAGRAM) */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-8">System Architecture</h3>
               <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-center flex-col items-center">
                  <Image 
                    src="/workflow.jpg" 
                    alt="NoteRefiner Workflow Diagram" 
                    width={800} 
                    height={400} 
                    className="rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-400 mt-4 italic">Figure 1: High-Level Data Processing Flow using Generative AI</p>
               </div>
            </div>

            {/* 3. VIDEO LEARNING CENTER (UPDATED WITH WORKING VIDEOS) */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-6">Video Learning Center</h3>
               <p className="mb-8 text-gray-400">Master the art of technical communication with these curated resources from industry leaders like Google and leading universities.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Video 1: Google Cloud Tech (Official) */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                     <div className="aspect-w-16 aspect-h-9 mb-4">
                        <iframe 
                           className="w-full h-64 rounded-lg"
                           src="https://www.youtube.com/embed/uTEL8LpG15I" 
                           title="What is SRE?"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                        ></iframe>
                     </div>
                     <h4 className="text-lg font-bold text-white mb-2">What is Site Reliability Engineering?</h4>
                     <p className="text-sm text-gray-400">Google's official introduction to SRE principles and why documentation is critical for uptime.</p>
                  </div>

                  {/* Video 2: Google Developers (Official) */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                     <div className="aspect-w-16 aspect-h-9 mb-4">
                        <iframe 
                           className="w-full h-64 rounded-lg"
                           src="https://www.youtube.com/embed/JgNi5tW9cTE" 
                           title="Technical Writing for Developers"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                        ></iframe>
                     </div>
                     <h4 className="text-lg font-bold text-white mb-2">Technical Writing for Developers</h4>
                     <p className="text-sm text-gray-400">A crash course from Google Developers on writing clear, concise engineering logs.</p>
                  </div>
               </div>
            </div>

            {/* 4. HISTORY OF TECH WRITING */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-6">Chapter 1: The Evolution of Technical Writing</h3>
               <p className="mb-6 leading-relaxed">
                  The history of technical documentation mirrors the history of engineering itself. In the early days of computing (the Mainframe Era), documentation was often written by dedicated scribes on physical paper. As we moved into the Agile era, the philosophy shifted to "Working software over comprehensive documentation" (Agile Manifesto, 2001).
               </p>
               <p className="mb-6 leading-relaxed">
                  However, the "No Docs" movement created a massive technical debt crisis. In the modern DevOps era (2015-Present), we have realized that <strong>Communication is Infrastructure</strong>. Code that is not documented is code that cannot be maintained. NoteRefiner represents the next evolutionary step: <strong>Documentation as Code</strong>, generated automatically by AI to keep pace with rapid CI/CD deployment cycles.
               </p>
            </div>

            {/* 5. COGNITIVE LOAD THEORY */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-6">Chapter 2: Cognitive Load Theory in Engineering</h3>
               <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/2">
                    <p className="mb-4 leading-relaxed">
                        John Sweller's Cognitive Load Theory (1988) explains why bad notes are dangerous. The human brain has a limited "Working Memory." When an engineer reads a messy log like <em>"server broken maybe db issue idk,"</em> their brain wastes energy decoding the text instead of solving the problem.
                    </p>
                    <p className="leading-relaxed">
                        This is called "Extraneous Cognitive Load." NoteRefiner eliminates this load. By formatting the text into a standard <strong>Problem &gt; Analysis &gt; Solution</strong> structure, the tool reduces mental friction, allowing the engineer to enter a "Flow State" faster.
                    </p>
                  </div>
                  <div className="w-full md:w-1/2 bg-gray-800 p-6 rounded-lg border border-gray-700">
                     <h4 className="text-lg font-bold text-white mb-3">Miller's Law Application</h4>
                     <p className="text-sm text-gray-400 mb-4">
                        Miller's Law states the average person can only hold 7 (plus or minus 2) items in their working memory.
                     </p>
                     <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                        <li><strong>Messy Note:</strong> Contains 20+ unrelated facts scattered randomly. (Overloads memory)</li>
                        <li><strong>Refined Note:</strong> Groups facts into 3 clear headers: Issue, Logs, Fix. (Fits in memory)</li>
                     </ul>
                  </div>
               </div>
            </div>

            {/* 6. CASE STUDIES (EXPANDED) */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-500 pl-4">Chapter 3: Case Studies of Failure</h3>
               <p className="mb-8 text-gray-400">History is filled with expensive disasters caused not by bad code, but by bad communication. These stories highlight why tools like NoteRefiner are critical for mission-critical environments.</p>
               
               <div className="space-y-6">
                  {/* Story 1 */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-500 transition">
                     <h4 className="text-xl font-bold text-white mb-2">1. The Mars Climate Orbiter ($327M Loss)</h4>
                     <p className="text-sm text-gray-400 mb-4 italic">September 1999</p>
                     <p className="text-sm leading-relaxed mb-4">
                        NASA lost a $327 million spacecraft because of a simple documentation error. One engineering team used <strong>Metric units</strong> (Newtons) while another used <strong>Imperial units</strong> (Pounds-force) in their software specifications. 
                     </p>
                     <p className="text-sm font-bold text-red-400">
                        The Lesson: Standardized formats save lives (and millions of dollars). Ambiguity in units or error codes is unacceptable in engineering.
                     </p>
                  </div>

                  {/* Story 2 */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-500 transition">
                     <h4 className="text-xl font-bold text-white mb-2">2. The Knight Capital Glitch ($440M Loss)</h4>
                     <p className="text-sm text-gray-400 mb-4 italic">August 2012</p>
                     <p className="text-sm leading-relaxed mb-4">
                        In just 45 minutes, Knight Capital Group lost $440 million due to a failed deployment. An engineer forgot to copy new code to one of the eight servers because the <strong>deployment manual was outdated</strong> and unstructured.
                     </p>
                     <p className="text-sm font-bold text-red-400">
                        The Lesson: Checklists and clear "Steps to Reproduce" are not optional. They must be generated accurately every time.
                     </p>
                  </div>

                  {/* Story 3 */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-500 transition">
                     <h4 className="text-xl font-bold text-white mb-2">3. The AWS S3 Outage (Typo Disaster)</h4>
                     <p className="text-sm text-gray-400 mb-4 italic">February 2017</p>
                     <p className="text-sm leading-relaxed mb-4">
                        A massive portion of the internet went down because an Amazon engineer made a typo while entering a command to debug a billing system. He intended to remove a small number of servers but accidentally removed a massive set of foundational systems.
                     </p>
                     <p className="text-sm font-bold text-red-400">
                        The Lesson: Precise documentation of commands and "Double Check" protocols are vital. NoteRefiner helps isolate commands in code blocks to prevent copy-paste errors.
                     </p>
                  </div>
               </div>
            </div>

            {/* 7. ITIL & ITSM FRAMEWORKS */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-6">Chapter 4: ITIL Framework Compliance</h3>
               <p className="mb-6 leading-relaxed">
                  The Information Technology Infrastructure Library (ITIL) is the global standard for IT Service Management (ITSM). NoteRefiner is designed to help organizations adhere to <strong>ITIL v4</strong> practices, specifically in the Service Operation lifecycle.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-800">
                       <h4 className="font-bold text-blue-400 mb-2">Incident Management</h4>
                       <p className="text-sm text-gray-300">ITIL requires strict recording of incidents. Our tool ensures every ticket includes a categorization, prioritization, and resolution timestamp.</p>
                   </div>
                   <div className="bg-green-900/20 p-6 rounded-lg border border-green-800">
                       <h4 className="font-bold text-green-400 mb-2">Problem Management</h4>
                       <p className="text-sm text-gray-300">Distinguishing between an "Incident" (one-time event) and a "Problem" (root cause) requires clear notes. We help document the Known Error Database (KEDB).</p>
                   </div>
                   <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-800">
                       <h4 className="font-bold text-purple-400 mb-2">Knowledge Management</h4>
                       <p className="text-sm text-gray-300">The goal of ITIL is to shift knowledge "Left"—making it available to Level 1 support. Our KB Article mode creates artifacts for the Service Desk.</p>
                   </div>
               </div>
            </div>

            {/* 8. STATISTICS & FACTS */}
            <div className="mb-20 bg-gray-800/50 p-8 rounded-xl border border-gray-700">
               <h3 className="text-2xl font-bold text-white mb-8 text-center">Chapter 5: The ROI of Documentation</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                     <div className="text-4xl font-black text-blue-400 mb-2">19%</div>
                     <p className="text-sm text-gray-300">of a knowledge worker's week is spent just <strong>searching</strong> for information and reading internal docs (Source: McKinsey).</p>
                  </div>
                  <div>
                     <div className="text-4xl font-black text-blue-400 mb-2">$5k</div>
                     <p className="text-sm text-gray-300">is the estimated annual cost per employee due to productivity loss from "Knowledge Barriers" and poor documentation.</p>
                  </div>
                  <div>
                     <div className="text-4xl font-black text-blue-400 mb-2">40%</div>
                     <p className="text-sm text-gray-300">of IT incidents are caused by <strong>Change Management</strong> errors, often due to poor handover notes (Source: Gartner).</p>
                  </div>
               </div>
            </div>

            {/* 9. SOFT SKILLS: EMPATHY */}
            <div className="mb-20">
               <h3 className="text-2xl font-bold text-white mb-6">Chapter 6: Writing as Empathy</h3>
               <div className="bg-gray-800 p-8 rounded-xl border-l-4 border-yellow-500">
                   <p className="mb-4 leading-relaxed text-gray-200">
                       Software engineering is often seen as a solitary pursuit, but documentation is an act of empathy. When you write a clear, concise log, you are being kind to:
                   </p>
                   <ul className="list-decimal list-inside space-y-3 text-gray-300">
                       <li><strong>Your Future Self:</strong> Who will be woken up at 3 AM six months from now to fix this exact same bug.</li>
                       <li><strong>Your Teammates:</strong> Who won't have to disturb you on your vacation to ask where the config file is.</li>
                       <li><strong>Your Users:</strong> Who get their service restored faster because the root cause was identified quickly.</li>
                   </ul>
                   <p className="mt-6 font-bold text-white">NoteRefiner is not just a formatting tool; it is an empathy engine for technical teams.</p>
               </div>
            </div>

            {/* 10. CAREER RESOURCES */}
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

            {/* 11. FAQ */}
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
              <div className="space-y-6">
                <div>
                   <h4 className="text-white font-bold mb-2">How accurate is the AI refinement?</h4>
                   <p className="text-sm text-gray-400">NoteRefiner uses advanced Generative AI models (Gemini 2.5 Flash / Gemma 3) which are specifically tuned for code and technical language.</p>
                </div>
                <div>
                   <h4 className="text-white font-bold mb-2">Does this work for coding languages?</h4>
                   <p className="text-sm text-gray-400">Yes. If you paste a snippet of Python or SQL error logs, the AI will recognize the code and format it into a Markdown code block.</p>
                </div>
                <div>
                   <h4 className="text-white font-bold mb-2">Is this compliant with Data Privacy?</h4>
                   <p className="text-sm text-gray-400">Yes. We do not store your input text on our servers. The text is processed in real-time and returned to your browser.</p>
                </div>
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
