"use client";

import React from "react";
import { ShieldCheckIcon, PlayIcon } from "./icons";

export type NavTab = "overview" | "investigations" | "evidence" | "verify" | "tamper";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onRunDemo: () => void;
  isDemoRunning?: boolean;
}

export function Header({
  activeTab,
  setActiveTab,
  onRunDemo,
  isDemoRunning = false,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      {/* Top Banner with System Status */}
      <div className="border-b border-slate-800/60 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 text-slate-300">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] sm:text-[11px] font-semibold">
            System Status:
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            Evidence capture operational
          </span>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            CooL verifier operational
          </span>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            Runtime: TDX · Simulated
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRunDemo}
            disabled={isDemoRunning}
            aria-label="Run 60-second guided investigation demo"
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold transition-all shadow-sm hover:border-sky-500/50 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
          >
            <PlayIcon className="w-3 h-3 fill-current text-sky-400" />
            <span>{isDemoRunning ? "Running Demo..." : "Run Investigation Demo (60s)"}</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-sky-400 shadow-inner flex-shrink-0">
            <ShieldCheckIcon className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-mono">
                AI AuditShield
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-medium uppercase border border-slate-700">
                v2.0 · CooL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans tracking-wide">
              AI Decision Integrity & Evidence Verification Platform
            </p>
          </div>
        </div>

        {/* Responsive Tab Navigation with scroll container */}
        <nav
          className="flex items-center space-x-1 font-mono text-xs overflow-x-auto max-w-full pb-1 sm:pb-0"
          role="tablist"
          aria-label="Main investigation navigation"
        >
          <button
            role="tab"
            aria-selected={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-md transition-all font-medium flex-shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
              activeTab === "overview"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <span>Overview</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "investigations"}
            onClick={() => setActiveTab("investigations")}
            className={`px-3 py-1.5 rounded-md transition-all font-medium flex-shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
              activeTab === "investigations"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <span>Investigations</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "evidence"}
            onClick={() => setActiveTab("evidence")}
            className={`px-3 py-1.5 rounded-md transition-all font-medium flex-shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
              activeTab === "evidence"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <span>Evidence Receipt</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "verify"}
            onClick={() => setActiveTab("verify")}
            className={`px-3 py-1.5 rounded-md transition-all font-medium flex-shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
              activeTab === "verify"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <span>Verification Center</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "tamper"}
            onClick={() => setActiveTab("tamper")}
            className={`px-3 py-1.5 rounded-md transition-all font-medium flex-shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none ${
              activeTab === "tamper"
                ? "bg-rose-950/60 text-rose-300 border border-rose-800/80 shadow-sm"
                : "text-slate-400 hover:text-rose-300 hover:bg-slate-900/60"
            }`}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" aria-hidden="true" />
            <span>Tamper Lab</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
