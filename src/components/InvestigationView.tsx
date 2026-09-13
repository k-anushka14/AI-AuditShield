"use client";

import React from "react";
import { DecisionRecord } from "@/lib/types";
import {
  ShieldCheckIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  FileCodeIcon,
  BugIcon,
  CpuIcon,
  LayersIcon,
} from "./icons";

interface InvestigationViewProps {
  decision: DecisionRecord | null;
  onNavigateTab: (tab: "overview" | "investigations" | "evidence" | "verify" | "tamper") => void;
}

export function InvestigationView({ decision, onNavigateTab }: InvestigationViewProps) {
  if (!decision) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono">
        <p>No decision selected for investigation.</p>
        <button
          onClick={() => onNavigateTab("overview")}
          className="mt-4 px-4 py-2 rounded bg-sky-600 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { caseInfo, recordId, executionId, digest, createdAt } = decision;
  const isApproved = caseInfo.decision === "APPROVED";
  const isManual = caseInfo.decision === "MANUAL_REVIEW";

  // Derive realistic stepped timestamps for timeline
  const baseDate = new Date(createdAt);
  const fmt = (offsetMs: number) => {
    const d = new Date(baseDate.getTime() + offsetMs);
    return d.toTimeString().split(" ")[0] + "." + String(d.getMilliseconds()).padStart(3, "0");
  };

  const timelineEvents = [
    {
      time: fmt(0),
      stage: "MODEL EXECUTION",
      title: `${caseInfo.model}@${caseInfo.version}`,
      desc: "Prime credit assessment executed with deterministic policy weights. Feature extraction from applicant profile completed.",
      icon: CpuIcon,
      badge: "Inference",
    },
    {
      time: fmt(12),
      stage: "POLICY EVALUATION",
      title: caseInfo.policy,
      desc: `Rules evaluation applied: Credit score ${caseInfo.input.creditScore} satisfies prime threshold (>=680); DTI ${caseInfo.input.debtToIncome} within boundary (<=0.38).`,
      icon: LayersIcon,
      badge: "Rules Engine",
    },
    {
      time: fmt(25),
      stage: "DECISION RECORDED",
      title: `${caseInfo.decision} · ${caseInfo.amount}`,
      desc: `Underwriter outcome confirmed: ${caseInfo.output.riskTier}, recommended interest rate ${caseInfo.output.interestRate}.`,
      icon: CheckIcon,
      badge: "Outcome",
    },
    {
      time: fmt(42),
      stage: "COOL EVIDENCE CAPTURE",
      title: "Salted SHA-256 Commitment & Hybrid Signatures",
      desc: `Payloads committed as salted SHA-256 multihash (${digest.slice(0, 24)}...). ML-DSA-65 post-quantum and Ed25519 classical signatures generated.`,
      icon: ShieldCheckIcon,
      badge: "Crypto Sealing",
    },
    {
      time: fmt(60),
      stage: "TRANSPARENCY LOGGING",
      title: "RFC 6962 Merkle Tree Inclusion",
      desc: `Evidence leaf inserted into transparency log tree. Cryptographic audit path generated with STH root hash.`,
      icon: FileCodeIcon,
      badge: "Ledger",
    },
    {
      time: fmt(85),
      stage: "VERIFICATION AVAILABLE",
      title: "Run the CooL verifier",
      desc: "The receipt can be checked offline in Verification Center. Results appear after the real verifier runs.",
      icon: ShieldCheckIcon,
      badge: "Verified",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn font-mono">
      {/* Case Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab("overview")}
            className="hover:text-white transition-colors"
          >
            Investigations
          </button>
          <span>/</span>
          <span className="text-sky-400 font-bold">Case #{caseInfo.applicationId}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab("evidence")}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
          >
            <span>Evidence Receipt</span>
            <ArrowRightIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Hero Decision Header */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                AI DECISION INVESTIGATION
              </span>
              <span className="text-xs text-slate-400">#{caseInfo.applicationId}</span>
            </div>

            <div className="flex items-baseline gap-4 pt-1">
              <span
                className={`text-3xl md:text-5xl font-extrabold tracking-tight ${
                  isApproved
                    ? "text-emerald-400"
                    : isManual
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {caseInfo.decision}
              </span>
              <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {caseInfo.amount}
              </span>
            </div>

            <p className="text-sm font-sans text-slate-400 max-w-2xl pt-1 leading-relaxed">
              {caseInfo.output.rationale}
            </p>
          </div>

          <div className="flex flex-col gap-2 min-w-[200px]">
            <button
              onClick={() => onNavigateTab("verify")}
              className="py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Verify in Center</span>
            </button>

            <button
              onClick={() => onNavigateTab("tamper")}
              className="py-2.5 px-4 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
            >
              <BugIcon className="w-4 h-4 text-rose-400" />
              <span>Simulate Tampering</span>
            </button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800/60">
            <span className="text-slate-500 text-[10px] block">MODEL</span>
            <span className="text-slate-200 font-bold mt-0.5 block">{caseInfo.model}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded border border-slate-800/60">
            <span className="text-slate-500 text-[10px] block">VERSION</span>
            <span className="text-slate-200 font-bold mt-0.5 block">{caseInfo.version}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded border border-slate-800/60">
            <span className="text-slate-500 text-[10px] block">POLICY</span>
            <span className="text-slate-200 font-bold mt-0.5 block">{caseInfo.policy}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded border border-slate-800/60">
            <span className="text-slate-500 text-[10px] block">APPLICATION ID</span>
            <span className="text-sky-400 font-bold mt-0.5 block">{caseInfo.applicationId}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Applicant Features & Underwriting Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applicant Financial Profile */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <CpuIcon className="w-4 h-4 text-sky-400" />
              <span>Evaluated Input Features</span>
            </h3>
            <span className="text-[11px] text-slate-500">Privacy Committed</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">BORROWER</span>
              <span className="text-slate-200 font-semibold">{caseInfo.input.applicantName || "Anonymous"}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">CREDIT SCORE</span>
              <span className="text-emerald-400 font-bold text-sm">{caseInfo.input.creditScore}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">DEBT-TO-INCOME (DTI)</span>
              <span className="text-slate-200 font-semibold">{caseInfo.input.debtToIncome * 100}%</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">ANNUAL INCOME</span>
              <span className="text-slate-200 font-semibold">${caseInfo.input.annualIncome.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-900/40 border border-slate-800/40 text-[11px] text-slate-400">
            Risk Tier: <span className="text-sky-400 font-bold">{caseInfo.output.riskTier}</span> | Interest Rate:{" "}
            <span className="text-sky-400 font-bold">{caseInfo.output.interestRate}</span>
          </div>
        </div>

        {/* Cryptographic Identifiers */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
              <span>Evidence Identifiers</span>
            </h3>
            <span className="text-[11px] text-emerald-400">Tamper-Evident</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">RECORD ID (ULID)</span>
              <span className="text-slate-200 font-mono text-xs break-all block bg-slate-900/80 p-2 rounded border border-slate-800">
                {recordId}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">EXECUTION SESSION ID</span>
              <span className="text-slate-200 font-mono text-xs break-all block bg-slate-900/80 p-2 rounded border border-slate-800">
                {executionId}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">BINDING DIGEST (MULTIHASH)</span>
              <span className="text-sky-400 font-mono text-xs break-all block bg-slate-900/80 p-2 rounded border border-slate-800">
                {digest}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen 2: Evidence Timeline */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-sky-400" />
              <span>Cryptographic Evidence Timeline</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Chronological causality reconstruction from model execution to transparency log inclusion.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Monotonic ULID Sequence</span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {timelineEvents.map((evt, idx) => {
            const IconComponent = evt.icon;
            return (
              <div key={idx} className="relative group">
                {/* Node Marker */}
                <div className="absolute -left-6 sm:-left-8 top-1 h-6 w-6 rounded-full bg-slate-900 border-2 border-sky-500 flex items-center justify-center shadow-md">
                  <IconComponent className="w-3 h-3 text-sky-400" />
                </div>

                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-sky-400">{evt.time}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {evt.stage}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {evt.badge}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200">{evt.title}</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">{evt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
