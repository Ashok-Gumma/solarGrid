import React from 'react';

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Soft Ambient Floating Orbs */}
      <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-red-500/10 blur-3xl animate-pulse duration-1000" />
      <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse duration-700" />
      <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl animate-pulse duration-1000" />

      {/* Floating Particle Dots */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-12 left-10 h-2.5 w-2.5 rounded-full bg-red-400/40 animate-ping duration-1000" />
        <div className="absolute top-1/4 left-1/3 h-1.5 w-1.5 rounded-full bg-white/70 animate-bounce" />
        <div className="absolute top-1/2 right-1/4 h-2 w-2 rounded-full bg-emerald-400/50 animate-pulse" />
        <div className="absolute top-2/3 left-1/5 h-3 w-3 rounded-full bg-amber-400/30 blur-xs animate-bounce" />
        <div className="absolute bottom-24 right-1/3 h-2 w-2 rounded-full bg-red-400/50 animate-ping duration-700" />
        <div className="absolute bottom-1/4 left-1/2 h-1.5 w-1.5 rounded-full bg-white/80" />
      </div>
    </div>
  );
}
