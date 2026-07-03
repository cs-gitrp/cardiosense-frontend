"use client";
import { Heart } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
      
      {/* Pulse Heart Indicator */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-ping duration-1000" />
        <div className="w-12 h-12 rounded-full bg-white border border-rose-100 shadow-md flex items-center justify-center relative z-10">
          <Heart size={20} className="text-risk-high animate-heart-float" style={{ fill: "rgba(244, 63, 94, 0.1)" }} />
        </div>
      </div>

      {/* Skeletons block */}
      <div className="w-full max-w-md space-y-3">
        <div className="h-4 w-3/4 bg-surface-3 animate-pulse rounded-md mx-auto" />
        <div className="h-3 w-1/2 bg-surface-2 animate-pulse rounded-md mx-auto" />
        
        <div className="pt-6 grid grid-cols-3 gap-3">
          <div className="h-16 bg-surface-2 animate-pulse rounded-xl" />
          <div className="h-16 bg-surface-2 animate-pulse rounded-xl" />
          <div className="h-16 bg-surface-2 animate-pulse rounded-xl" />
        </div>
      </div>

    </div>
  );
}
