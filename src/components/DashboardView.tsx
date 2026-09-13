"use client";

import React, { useState } from "react";
import { DecisionRecord } from "@/lib/types";
import {
  ShieldCheckIcon,
  ActivityIcon,
  LockIcon,
  PlayIcon,
  CheckIcon,
  ArrowRightIcon,
  TerminalIcon,
  SparklesIcon,
} from "./icons";

interface DashboardViewProps {
  decisions: DecisionRecord[];
  selectedDecision: DecisionRecord | null;
  onSelectDecision: (decision: DecisionRecord) => void;
  onNavigateTab: (tab: "investigations" | "evidence" | "verify" | "tamper") => void;
  onRefreshDecisions: () => Promise<void>;
  onCreateCustomDecision: (params: {
    applicationId: string;
    creditScore: number;
    debtToIncome: number;
    requestedAmount: number;
  }) => Promise<void>;
  isLoading: boolean;
}

export function DashboardView({
  decisions,
  selectedDecision,
  onSelectDecision,
  onNavigateTab,
  onRefreshDecisions,
  onCreateCustomDecision,
  isLoading,
}: DashboardViewProps) {
  const [showSimModal, setShowSimModal] = useState(false);
  const [applicantId, setApplicantId] = useState("A-9042");
  const [creditScore, setCreditScore] = useState(720);
  const [dti, setDti] = useState(0.28);
  const [requestedAmount, setRequestedAmount] = useState(15000);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreateCustomDecision({
        applicationId: applicantId.trim() || `A-${Math.floor(1000 + Math.random() * 9000)}`,
        creditScore: Number(creditScore),
        debtToIncome: Number(dti),
        requestedAmount: Number(requestedAmount),
      });
      setShowSimModal(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Platform Hero Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 md:p-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-950/70 border border-sky-800 text-[11px] font-mono text-sky-400">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Cryptographic Observability & Tamper-Evident Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Investigate AI decisions. Verify the evidence. Detect tampering.
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            When an automated AI credit decision is disputed or audited, reconstruct what happened
            and prove that the model execution evidence has not been altered — verified offline against
            salted SHA-256 commitments without exposing plaintext inputs in the CooL receipt.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (decisions.length > 0) {
                  onSelectDecision(decisions[0]);
                  onNavigateTab("investigations");
                }
              }}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-sky-600/20"
            >
              <span>Investigate Case #{selectedDecision?.id || "A-4821"}</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowSimModal(true)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs font-mono transition-all border border-slate-700 flex items-center gap-2"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Simulate New AI Decision</span>
            </button>
          </div>
        </div>

        {/* Primary User Journey Guide */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <h3 className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-3">
            Primary Investigation Flow
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
            {[
              { num: "01", label: "Select Decision", desc: "Case A-4821" },
              { num: "02", label: "Investigate", desc: "Timeline & Causality" },
              { num: "03", label: "Evidence", desc: "Inspect Salted Hashes" },
              { num: "04", label: "Verify", desc: "7 Domains Offline" },
              { num: "05", label: "Tamper Lab", desc: "Simulate Attack" },
              { num: "06", label: "Detect Evidence Tampering", desc: "Integrity Failure" },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="text-[10px] text-sky-400 font-bold">{step.num}</div>
                <div className="text-slate-200 font-semibold mt-1">{step.label}</div>
                <div className="text-[11px] text-slate-500">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>DECISIONS LOGGED</span>
            <ActivityIcon className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{decisions.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">RFC 6962 transparency tree</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>VERIFICATION STATUS</span>
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-200 mt-2">Verification available</div>
          <div className="text-[11px] text-slate-500 mt-1">Run the CooL verifier for a live result</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CRYPTOGRAPHIC SUITE</span>
            <LockIcon className="w-4 h-4 text-sky-400" />
          </div>
            <div className="text-sm font-bold text-slate-200 mt-2">ML-DSA-65 + Ed25519</div>
            <div className="text-[11px] text-slate-500 mt-1">Hybrid: post-quantum + classical</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ATTESTATION PLANE</span>
            <span className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-400 mt-2">Simulated TDX</div>
          <div className="text-[11px] text-slate-500 mt-1">Explicitly reported as simulated</div>
        </div>
      </div>

      {/* Main Section: AI Decision Investigations */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight font-mono">
              AI Decision Investigations
            </h2>
            <p className="text-xs text-slate-400">
              Select an execution record to inspect timeline, verify cryptographic receipt, or test tampering resilience.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefreshDecisions()}
              disabled={isLoading}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-mono transition-colors"
              title="Refresh decisions"
            >
              <TerminalIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Decisions Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
          {decisions.map((item) => {
            const isSelected = selectedDecision?.id === item.id;
            const isApproved = item.caseInfo.decision === "APPROVED";
            const isManual = item.caseInfo.decision === "MANUAL_REVIEW";

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-900 border-sky-500/60 shadow-lg shadow-sky-950/40 ring-1 ring-sky-500/20"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                        CASE ID
                      </span>
                      <span className="text-base font-bold text-white tracking-wide">
                        #{item.caseInfo.applicationId}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold border ${
                        isApproved
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                          : isManual
                          ? "bg-amber-950/80 text-amber-400 border-amber-800"
                          : "bg-rose-950/80 text-rose-400 border-rose-800"
                      }`}
                    >
                      {item.caseInfo.decision}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                    <div>
                      <span className="text-slate-500 text-[10px] block">AMOUNT</span>
                      <span className="text-slate-200 font-semibold text-sm">
                        {item.caseInfo.amount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">MODEL</span>
                      <span className="text-slate-300 truncate block text-xs">
                        {item.caseInfo.model}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">VERSION</span>
                      <span className="text-slate-300 text-xs">{item.caseInfo.version}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">POLICY</span>
                      <span className="text-slate-300 text-xs truncate block">
                        {item.caseInfo.policy}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="text-slate-500">Evidence:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckIcon className="w-3 h-3 text-emerald-400" />
                      VERIFICATION AVAILABLE
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 truncate">
                    Record ID: <span className="text-slate-400">{item.recordId}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectDecision(item);
                      onNavigateTab("investigations");
                    }}
                    className="flex-1 py-2 px-3 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Investigate</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectDecision(item);
                      onNavigateTab("tamper");
                    }}
                    className="py-2 px-3 rounded bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 text-xs font-medium transition-all"
                    title="Tamper Lab test"
                  >
                    Tamper
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulation Modal Drawer */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Simulate Deterministic AI Loan Decision</h3>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Application / Case ID</label>
                <input
                  type="text"
                  value={applicantId}
                  onChange={(e) => setApplicantId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Credit Score (300-850)</label>
                  <input
                    type="number"
                    value={creditScore}
                    min="300"
                    max="850"
                    onChange={(e) => setCreditScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">&ge;680 = APPROVED</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Debt-to-Income (DTI)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={dti}
                    min="0.05"
                    max="0.99"
                    onChange={(e) => setDti(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">&le;0.38 = APPROVED</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Requested Loan Amount ($)</label>
                <input
                  type="number"
                  value={requestedAmount}
                  step="500"
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400">
                Model: <span className="text-sky-400">acme/credit-scorer@2026.06.0</span> | Policy:{" "}
                <span className="text-sky-400">lending-policy-v4</span>
                <p className="mt-1 text-slate-500">
                  This execution will automatically invoke the real CooL SDK record() API, deriving
                  hybrid post-quantum keys and building an RFC 6962 transparency log entry.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold disabled:opacity-50"
                >
                  {creating ? "Sealing Evidence..." : "Execute & Record Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
