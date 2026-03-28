"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, Upload, PieChart, Info, Menu, X } from "lucide-react";
import gsap from "gsap";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      gsap.to(sidebarRef.current, { x: 0, duration: 0.5, ease: "power3.out" });
    } else {
      gsap.to(sidebarRef.current, { x: "-100%", duration: 0.5, ease: "power3.in" });
    }
  }, [isOpen]);

  const links = [
    { href: "/", label: "Home", icon: BookOpen },
    { href: "/predict", label: "Predict Genre", icon: Search },
    { href: "/upload", label: "Upload Book", icon: Upload },
    { href: "/insights", label: "Insights", icon: PieChart },
    { href: "/about", label: "About", icon: Info },
  ];

  return (
    <>
      {/* Mobile / Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#2c1e16] text-[#d4af37] rounded-md border border-[#d4af37]/30 hover:bg-[#1a120d] transition-colors"
        aria-label="Open navigation"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Panel */}
      <div 
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full w-64 bg-[#110e0c] border-r border-[#d4af37]/30 z-50 flex flex-col -translate-x-full shadow-2xl"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")', backgroundBlendMode: 'overlay' }}
      >
        <div className="p-4 flex justify-between items-center border-b border-[#d4af37]/20">
          <h2 className="font-serif text-2xl gold-text font-bold leading-tight">Genre<br/>Whisper</h2>
          <button onClick={() => setIsOpen(false)} className="text-[#d4af37] hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-8 px-4 flex flex-col gap-4">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 ${active ? 'bg-[#2c1e16] text-[#d4af37] border border-[#d4af37]/50 shadow-inner' : 'text-[#e6dfcc] hover:bg-[#2c1e16]/50 hover:text-[#d4af37]'}`}
              >
                <Icon size={20} className={active ? "text-[#d4af37]" : "opacity-70"} />
                <span className="font-serif tracking-wide">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-6 text-xs text-center text-[#e6dfcc]/40 font-sans border-t border-[#d4af37]/20">
          <p>NLP Foundations<br/>Final Project</p>
        </div>
      </div>
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
