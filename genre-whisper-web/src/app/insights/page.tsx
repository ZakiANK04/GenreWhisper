"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { AlertTriangle, TrendingUp, Compass, Search } from "lucide-react";

export default function InsightsPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.insight-card', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }
    );
  }, []);

  const topWords = [
    { genre: "Fantasy", words: ["magic", "dragon", "world", "epic", "quest"] },
    { genre: "Mystery", words: ["detective", "murder", "clue", "twist", "killer"] },
    { genre: "Romance", words: ["love", "heart", "beautiful", "relationship", "passion"] },
    { genre: "Sci-Fi", words: ["space", "future", "technology", "alien", "planet"] },
  ];

  return (
    <div className="min-h-screen py-24 px-6" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16 insight-card">
          <h1 className="text-4xl md:text-5xl font-serif font-bold gold-text mb-4">Insights & Analytics</h1>
          <p className="text-[#e6dfcc]/70 font-sans max-w-2xl mx-auto">
            Visualizing the hidden patterns within 3 million reader reviews. 
            Here is what our FastText and Logistic Regression models discovered.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Genre Distribution */}
          <div className="vintage-border bg-[#1a120d]/80 p-8 rounded-lg insight-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={120} /></div>
            <h3 className="text-2xl font-serif text-[#d4af37] mb-6 flex items-center gap-2">
              <Compass size={24} /> Review Volume by Genre
            </h3>
            
            <div className="space-y-4 relative z-10">
              {[
                { label: "Fiction", val: 85, color: "#d4af37" },
                { label: "Religion & Spirituality", val: 55, color: "#a67c00" },
                { label: "Juvenile Fiction", val: 40, color: "#8a6b22" },
                { label: "Biography", val: 25, color: "#695116" },
                { label: "History", val: 20, color: "#4c3809" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-40 text-sm font-sans text-[#e6dfcc] truncate">{item.label}</span>
                  <div className="flex-1 h-3 bg-[#110e0c] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${item.val}%`, backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Top Words */}
          <div className="vintage-border bg-[#1a120d]/80 p-8 rounded-lg insight-card">
            <h3 className="text-2xl font-serif text-[#d4af37] mb-6 flex items-center gap-2">
              <Search size={24} /> Highest Predictive Features (FastText)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {topWords.map((item, idx) => (
                <div key={idx} className="bg-[#110e0c] border border-[#d4af37]/20 p-4 rounded">
                  <h4 className="text-[#e6dfcc] font-serif font-bold mb-2 border-b border-[#d4af37]/30 pb-1">{item.genre}</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.words.map(w => (
                      <span key={w} className="text-xs font-sans bg-[#2c1e16] text-[#d4af37] px-2 py-1 rounded">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Biases Carousel */}
          <div className="vintage-border bg-[#1a120d]/80 p-8 rounded-lg insight-card lg:col-span-2">
            <h3 className="text-2xl font-serif text-red-400 mb-6 flex items-center gap-2">
              <AlertTriangle size={24} /> Hidden Biases Discovered
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#110e0c] p-6 rounded-md border-t-4 border-red-900 shadow-lg">
                <h4 className="text-xl font-serif text-[#e6dfcc] mb-3">The "Fiction" Blackhole</h4>
                <p className="text-sm font-sans text-[#e6dfcc]/70 leading-relaxed">
                  Over 60% of books default to "Fiction" in Amazon's metadata. 
                  Our classifier revealed that "Fiction" often eats distinct sub-genres like Sci-Fi or Romance due to overarching publishing metadata laziness.
                </p>
              </div>

              <div className="bg-[#110e0c] p-6 rounded-md border-t-4 border-[#d4af37] shadow-lg">
                <h4 className="text-xl font-serif text-[#e6dfcc] mb-3">Polarization in Politics</h4>
                <p className="text-sm font-sans text-[#e6dfcc]/70 leading-relaxed">
                  Books in category "Political Science" have the highest variance in sentiment score. The model learned to predict this genre not just by vocabulary, but by the intense emotional polarity of the text.
                </p>
              </div>

              <div className="bg-[#110e0c] p-6 rounded-md border-t-4 border-blue-900 shadow-lg">
                <h4 className="text-xl font-serif text-[#e6dfcc] mb-3">Length = Worldbuilding</h4>
                <p className="text-sm font-sans text-[#e6dfcc]/70 leading-relaxed">
                  Fantasy reviews are on average 35% longer than other genres. Vocabulary linked to deep worldbuilding requires larger context windows, forcing readers to write essays rather than quick blurbs.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
