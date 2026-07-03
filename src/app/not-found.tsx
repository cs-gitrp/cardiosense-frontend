"use client";
import Link from "next/link";
import { Heart, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 relative">
      
      {/* Background glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-rose-200/10 blur-[120px] pointer-events-none" />

      <div className="space-y-6 max-w-md relative z-10">
        
        {/* Broken beating heart animation */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-500/5 rounded-full scale-100 animate-pulse duration-1000" />
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 0.96, 1.04, 0.96, 1.04, 1] 
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full bg-white border border-rose-100 shadow-xl flex items-center justify-center"
          >
            <Heart size={32} className="text-text-subtle" />
          </motion.div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-4xl text-text">Prognosis Misplaced</h1>
          <p className="text-xs text-text-muted leading-relaxed">
            The screening report or system settings URL you are trying to visit does not exist or has been archived.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link href="/" className="px-4 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold text-text hover:bg-surface-2 transition-colors flex items-center gap-1.5">
            <ArrowLeft size={13} />
            Back Home
          </Link>
          
          <Link href="/dashboard" className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 shadow-md shadow-rose-600/5 transition-all flex items-center gap-1.5">
            <Home size={13} />
            Dashboard
          </Link>
        </div>

      </div>

    </div>
  );
}
