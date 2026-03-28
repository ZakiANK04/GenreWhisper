"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PlayCircle, FileCode2, FolderGit2 } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.about-elem', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="min-h-screen py-24 px-6 flex items-center justify-center relative" ref={containerRef}>
      <div className="max-w-4xl w-full bg-[#1a120d]/80 p-12 rounded-xl vintage-border backdrop-blur-md shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-12 about-elem flex flex-col items-center">
          <div className="inline-block px-3 py-1 border border-[#d4af37]/30 rounded-full bg-[#110e0c] text-[#e6dfcc] text-xs font-sans tracking-widest uppercase mb-6">
            Module Final Project
          </div>
          <h1 className="text-5xl font-serif font-bold gold-text mb-4">The Making of GenreWhisper</h1>
          <p className="text-[#e6dfcc]/80 font-sans text-lg italic max-w-xl">
            "An excavation of literary taxonomy using Natural Language Processing, FastText embeddings, and Logistic Regression on 3 Million Amazon Reviews."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          <div className="bg-[#110e0c]/80 border border-[#d4af37]/20 p-8 rounded-lg text-center hover:border-[#d4af37]/50 transition-colors about-elem group">
            <FileCode2 size={48} className="text-[#d4af37] mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-serif text-[#e6dfcc] mb-3">Google Colab</h3>
            <p className="text-[#e6dfcc]/60 font-sans text-sm mb-6 h-16">
              Dive into the data science pipeline. Contains full EDA, spaCy tokenization, FastText vectorization, and class weight mitigation.
            </p>
            <Link href="https://colab.research.google.com/" target="_blank" className="inline-block px-6 py-2 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#110e0c] font-bold rounded transition-colors font-sans w-full">
              View Notebook Source
            </Link>
          </div>

          <div className="bg-[#110e0c]/80 border border-[#d4af37]/20 p-8 rounded-lg text-center hover:border-red-500/50 transition-colors about-elem group">
            <PlayCircle size={48} className="text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-serif text-[#e6dfcc] mb-3">Video Presentation</h3>
            <p className="text-[#e6dfcc]/60 font-sans text-sm mb-6 h-16">
              A 5-minute TED-style walkthrough of the research question, dataset bias findings, and a live demonstration of Next.js ONNX inference.
            </p>
            <Link href="https://youtube.com/" target="_blank" className="inline-block px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded transition-colors font-sans w-full">
              Watch on YouTube
            </Link>
          </div>

        </div>

        <div className="text-center pt-8 border-t border-[#d4af37]/20 about-elem">
          <p className="text-[#e6dfcc]/50 font-sans text-sm mb-4">
            Built with Next.js 14, Tailwind CSS, GSAP 3, Three.js, and ONNX Runtime Web.
          </p>
          <a href="https://github.com/" target="_blank" className="inline-flex items-center justify-center gap-2 text-[#e6dfcc]/70 hover:text-[#d4af37] transition-colors border border-transparent hover:border-[#d4af37]/30 px-4 py-2 rounded-full">
            <FolderGit2 size={18} /> View Source Code on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
