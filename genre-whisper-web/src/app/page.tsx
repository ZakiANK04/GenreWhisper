"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import ThreeDBook from "@/components/ThreeDBook";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-elem", {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.2
      });
    }, contentRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden" ref={contentRef}>
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#2c1e16]/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl min-h-screen flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-6 pt-20 pb-10">
        
        {/* Left Content */}
        <div className="flex-1 lg:basis-[44%] text-center md:text-left z-10">
          <div className="hero-elem inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d4af37]/30 bg-[#2c1e16]/50 mb-6 backdrop-blur-sm">
            <Sparkles size={16} className="text-[#d4af37]" />
            <span className="text-sm font-sans text-[#e6dfcc]">NLP Foundations Final Project</span>
          </div>
          
          <h1 className="hero-elem text-6xl md:text-8xl font-serif font-bold mb-6 gold-text leading-tight drop-shadow-lg">
            GenreWhisper
          </h1>
          
          <p className="hero-elem text-xl md:text-2xl font-serif text-[#e6dfcc]/90 mb-8 max-w-xl italic border-l-4 border-[#d4af37]/50 pl-6 shadow-sm">
            "Unveiling Hidden Genres from the Whispers of Readers"
          </p>
          
          <p className="hero-elem text-base md:text-lg text-[#e6dfcc]/70 mb-10 max-w-lg leading-relaxed font-sans">
            Can reader reviews alone predict a book's true category? 
            Discover how semantic embeddings and machine learning map the hidden taxonomy of literature directly from the browser.
          </p>
          
          <div className="hero-elem flex flex-wrap gap-4 items-center justify-center md:justify-start">
            <Link 
              href="/predict" 
              className="px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#8a6b22] text-[#110e0c] font-bold font-sans rounded-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              Try the Model <ArrowRight size={20} />
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 bg-transparent text-[#d4af37] border border-[#d4af37] font-bold font-sans rounded-sm hover:bg-[#2c1e16]/50 transition-colors"
            >
              See the Research
            </Link>
          </div>
        </div>

        {/* Right 3D Book */}
        <div className="hero-elem flex-1 lg:basis-[56%] w-full h-[360px] md:h-full min-h-[480px] lg:min-h-[820px] relative z-0 md:-mb-10 lg:-mb-16 lg:-mr-8">
           <ThreeDBook />
        </div>
      </div>
      
      {/* Mini Demo Card Corner */}
      <div className="hero-elem absolute bottom-12 right-12 z-20 hidden lg:block">
        <div className="vintage-border bg-[#1a120d]/80 backdrop-blur-md p-6 rounded-md w-80 shadow-2xl relative overflow-hidden group">
          <div className="page-curl group-hover:w-[60px] group-hover:h-[60px]"></div>
          <h3 className="font-serif text-[#d4af37] mb-2 font-bold flex justify-between">
            Live Analysis <span className="animate-pulse text-green-400">●</span>
          </h3>
          <p className="text-sm font-sans text-[#e6dfcc]/80 italic mb-4">
            "An epic journey through the stars with brilliant pacing..."
          </p>
          <div className="flex justify-between items-center bg-[#110e0c] p-3 rounded border border-[#d4af37]/20">
            <span className="font-sans text-xs text-[#e6dfcc]/60">Predicted Genre:</span>
            <span className="font-serif text-[#110e0c] font-bold bg-[#d4af37] px-2 py-1 rounded-sm text-sm">Science Fiction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
