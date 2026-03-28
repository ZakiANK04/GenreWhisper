"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Sparkles, Loader2, Feather, AlertTriangle } from "lucide-react";

type PredictionResponse = {
  genre: string;
  conf: number;
  explanation: string;
  top3: { g: string; c: number }[];
  tokenCount: number;
};

export default function PredictPage() {
  const [review, setReview] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  const handlePredict = async () => {
    if (!review.trim()) return;
    setIsPredicting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Prediction failed.");
      }

      setResult(payload);

      setTimeout(() => {
        gsap.fromTo(resultRef.current,
          { y: 50, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" }
        );
        gsap.fromTo(".fake-cover",
          { rotationY: -90, opacity: 0, x: -50 },
          { rotationY: 0, opacity: 1, x: 0, duration: 1.2, ease: "power3.out", stagger: 0.2 }
        );
      }, 50);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prediction failed.";
      setError(message);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen py-24 px-6 relative" ref={containerRef}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Input */}
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold gold-text mb-4">Whisper to the Model</h1>
            <p className="text-[#e6dfcc]/70 font-sans">
              Paste an Amazon book review below. Our FastText embeddings will process the semantic signature of the text, and the Logistic Regression model will unveil its hidden genre.
            </p>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/40 to-[#2c1e16] rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <textarea 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write or paste a book review here...&#10;&#10;E.g., 'An incredible journey through a dystopian wasteland, focusing on the sheer will of the human spirit...'"
              className="relative w-full h-[350px] p-6 bg-[#1a120d] border border-[#d4af37]/30 rounded-lg text-[#e6dfcc] font-serif resize-none focus:outline-none focus:border-[#d4af37] shadow-inner transition-colors leading-relaxed"
              style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")', backgroundBlendMode: 'overlay' }}
            />
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#d4af37]/50" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#d4af37]/50" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#d4af37]/50" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#d4af37]/50" />
          </div>

          <button 
            onClick={handlePredict}
            disabled={isPredicting || !review.trim()}
            className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#8a6b22] text-[#110e0c] font-bold font-serif text-lg rounded-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-3 relative overflow-hidden"
          >
            {isPredicting ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Consulting the Oracle...</span>
                {/* Ink Drip Pseudo-element animation could go here, handled by GSAP or CSS */}
                <div className="absolute inset-0 bg-black/10 animate-pulse" />
              </>
            ) : (
              <>
                <Feather size={24} />
                <span>Whisper the Genre</span>
              </>
            )}
          </button>

          {error && (
            <div className="border border-red-500/30 bg-red-950/30 text-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-400" />
              <p className="font-sans text-sm leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Right Side: Results */}
        <div className="relative min-h-[400px] flex items-center justify-center">
          {!result && !isPredicting && (
            <div className="text-center opacity-30 flex flex-col items-center">
              <Sparkles size={48} className="mb-4 text-[#d4af37]" />
              <p className="font-serif italic font-xl box-border">Awaiting your words...</p>
            </div>
          )}

          <div 
            ref={resultRef}
            className={`w-full absolute inset-0 transition-all ${result ? 'pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          >
            {result && (
              <div className="w-full h-full flex items-center">
                <div className="vintage-border bg-[#1a120d]/90 p-8 rounded-lg w-full shadow-2xl backdrop-blur-md relative">
                  
                  {/* Genre Badge */}
                  <div className="text-center mb-8 relative z-10">
                    <span className="text-sm font-sans text-[#e6dfcc]/60 uppercase tracking-widest">Predicted Genre</span>
                    <h2 className="text-5xl font-serif font-bold gold-text mt-2 drop-shadow-md">
                      {result.genre}
                    </h2>
                    <div className="inline-block mt-3 px-3 py-1 bg-green-900/30 text-green-400 border border-green-500/30 rounded-full font-sans text-sm">
                      {result.conf}% Confidence
                    </div>
                  </div>

                  {/* Explanation Card */}
                  <div className="bg-[#110e0c]/80 border border-[#d4af37]/20 p-5 rounded font-sans text-[#e6dfcc]/80 mb-8 italic text-center text-lg leading-relaxed shadow-inner">
                    "{result.explanation}"
                  </div>

                  <div className="mb-6 text-center">
                    <span className="text-xs uppercase tracking-[0.25em] text-[#e6dfcc]/45 font-sans">
                      Clean Tokens Processed: {result.tokenCount}
                    </span>
                  </div>

                  {/* Top 3 Probabilities + Fake Cover Map */}
                  <div className="grid grid-cols-2 gap-6 items-end">
                    <div>
                      <h4 className="font-serif text-[#d4af37] mb-3 text-sm uppercase">Top Probabilities</h4>
                      <div className="space-y-3">
                        {result.top3.map((t, i) => (
                          <div key={i} className="flex flex-col">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-sans text-[#e6dfcc]">{t.g}</span>
                              <span className="font-sans text-[#d4af37]">{t.c}%</span>
                            </div>
                            <div className="w-full h-1 bg-[#2c1e16] rounded-full overflow-hidden">
                              <div className="h-full bg-[#d4af37]" style={{ width: `${t.c}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Materialized Fake Book Cover */}
                    <div className="flex justify-end">
                      <div className="fake-cover w-32 h-48 bg-gradient-to-br from-[#4e342e] to-[#2c1e16] rounded-r-md border-l-4 border-[#1a120d] shadow-2xl relative transform perspective-1000 rotate-y-12">
                        <div className="absolute inset-2 border border-[#d4af37]/50 rounded-sm p-2 flex flex-col justify-center items-center text-center">
                          <span className="text-[10px] text-[#d4af37] uppercase tracking-widest block font-serif">A Tale of</span>
                          <span className="text-lg text-white font-serif mt-1 shadow-black drop-shadow-lg leading-tight">{result.genre}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
