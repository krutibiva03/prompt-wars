import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-cyber-border/60 bg-cyber-bg/90 mt-16 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-slate-300 font-semibold">PROMPT WARS</span>
          <span className="text-slate-600">|</span>
          <span>Educational AI Cybersecurity Simulation & Guardrail Benchmark</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 max-w-md text-center md:text-right">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Safety Disclaimer: All credentials, tokens, and payloads are 100% synthetic fictional data. Built purely for education and defensive research.
          </span>
        </div>
      </div>
    </footer>
  );
};
