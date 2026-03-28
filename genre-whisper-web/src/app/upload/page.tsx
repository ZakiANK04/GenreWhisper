"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { UploadCloud, FileText, CheckCircle2, Database, Loader2, AlertTriangle } from "lucide-react";

type UploadResult = {
  title: string;
  genre: string;
  reviewsAnalyzed: number;
  sentiment: string;
  confidence: number;
  tokenCount: number;
  top3: { genre: string; confidence: number }[];
};

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [stats, setStats] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1, ease: "power3.out" });
    const existing = JSON.parse(sessionStorage.getItem("genrewhisper_dataset") || "[]");
    setStats(existing.length);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload-analyze", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Upload analysis failed.");
      }

      setResult(payload);
      gsap.fromTo(".result-card", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload analysis failed.";
      setError(message);
      setFile(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddToDataset = () => {
    const existing = JSON.parse(sessionStorage.getItem("genrewhisper_dataset") || "[]");
    existing.push(result);
    sessionStorage.setItem("genrewhisper_dataset", JSON.stringify(existing));
    setStats(existing.length);
    setFile(null);
    setResult(null);
    
    // Quick flash animation
    gsap.fromTo(".stat-badge", { scale: 1.5, color: "#fff" }, { scale: 1, color: "#d4af37", duration: 1 });
  };

  return (
    <div className="min-h-screen py-24 px-6 relative flex flex-col items-center" ref={containerRef}>
      
      <div className="absolute top-8 right-8 flex items-center gap-3 vintage-border bg-[#1a120d]/80 px-4 py-2 rounded-full">
        <Database size={18} className="text-[#d4af37]" />
        <span className="text-sm font-sans text-[#e6dfcc]">Session Dataset: <strong className="stat-badge text-[#d4af37] text-lg transition-colors">{stats}</strong> books</span>
      </div>

      <div className="w-full max-w-3xl text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-text mb-4">Contribute to the Archive</h1>
        <p className="text-[#e6dfcc]/70 font-sans text-lg">
          Upload raw book metadata and reviews (.txt, .json, .csv, .pdf). Our model will extract key insights and categorize the tome.
        </p>
      </div>

      <div 
        className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] mb-8 relative overflow-hidden ${dragActive ? 'border-[#d4af37] bg-[#d4af37]/10 scale-[1.02]' : 'border-[#d4af37]/30 bg-[#1a120d]/50 hover:border-[#d4af37]/60'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".txt,.csv,.json,.pdf,application/pdf" 
          onChange={handleChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {!file ? (
          <>
            <UploadCloud size={64} className="text-[#d4af37] mb-6 animate-bounce" />
            <h3 className="text-2xl font-serif font-bold text-[#e6dfcc] mb-2">Drag & Drop Manuscripts</h3>
         <p className="text-[#e6dfcc]/50 font-sans">or click anywhere to browse local archives</p>
          </>
        ) : analyzing ? (
          <div className="flex flex-col items-center z-20">
            <Loader2 size={48} className="text-[#d4af37] animate-spin mb-4" />
            <p className="font-serif text-[#e6dfcc] text-xl animate-pulse">Extracting Lexical Features...</p>
          </div>
        ) : result ? (
          <div className="result-card z-20 w-full bg-[#110e0c] vintage-border p-6 rounded-lg text-left">
             <div className="flex items-start justify-between mb-4 border-b border-[#d4af37]/20 pb-4">
               <div>
                  <h4 className="text-[#d4af37] font-serif text-2xl font-bold">{result.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText size={14} className="text-[#e6dfcc]/50" />
                    <span className="text-[#e6dfcc]/60 text-sm font-sans">{result.reviewsAnalyzed} reviews processed</span>
                  </div>
               </div>
               <div className="px-3 py-1 bg-green-900/40 text-green-400 border border-green-500/30 rounded-full font-serif text-sm flex items-center gap-2">
                 <CheckCircle2 size={14}/> {result.confidence}% Match
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#1a120d] p-3 rounded border border-[#d4af37]/10">
                  <span className="text-xs text-[#e6dfcc]/50 uppercase tracking-widest block mb-1">Inferred Genre</span>
                  <span className="text-[#d4af37] font-serif text-lg">{result.genre}</span>
                </div>
                <div className="bg-[#1a120d] p-3 rounded border border-[#d4af37]/10">
                  <span className="text-xs text-[#e6dfcc]/50 uppercase tracking-widest block mb-1">Overall Sentiment</span>
                  <span className="text-[#e6dfcc] font-serif text-lg">{result.sentiment}</span>
                </div>
             </div>

             <div className="mb-6 bg-[#1a120d] p-3 rounded border border-[#d4af37]/10">
               <span className="text-xs text-[#e6dfcc]/50 uppercase tracking-widest block mb-1">Processed Tokens</span>
               <span className="text-[#d4af37] font-serif text-lg">{result.tokenCount}</span>
             </div>
             
             <button 
               onClick={handleAddToDataset}
               className="w-full py-3 bg-[#d4af37] text-[#110e0c] font-bold font-sans rounded hover:bg-[#f3e5ab] transition-colors relative z-20 hover:scale-[1.02]"
             >
               Add to Local Dataset
             </button>
          </div>
        ) : error ? (
          <div className="z-20 w-full bg-red-950/50 border border-red-500/30 p-6 rounded-lg text-left flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-200 font-serif text-xl mb-2">Upload Analysis Failed</h4>
              <p className="text-red-100/80 font-sans text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        ) : null}
      </div>

    </div>
  );
}
