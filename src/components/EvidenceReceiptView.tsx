"use client";

import React, { useState } from "react";
import { DecisionRecord } from "@/lib/types";
import {
  ShieldCheckIcon,
  CopyIcon,
  CheckCheckIcon,
  LockIcon,
  CpuIcon,
  FileCodeIcon,
  TerminalIcon,
  ArrowRightIcon,
} from "./icons";

interface EvidenceReceiptViewProps {
  decision: DecisionRecord | null;
  onNavigateTab: (tab: "overview" | "investigations" | "evidence" | "verify" | "tamper") => void;
}

export function EvidenceReceiptView({ decision, onNavigateTab }: EvidenceReceiptViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showWire, setShowWire] = useState(false);

  if (!decision) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono">
        <p>No decision selected. Please select a case from the dashboard.</p>
        <button
          onClick={() => onNavigateTab("overview")}
          className="mt-4 px-4 py-2 rounded bg-sky-600 text-white text-xs font-semibold"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { recordId, executionId, digest, evidence, caseInfo } = decision;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const keyId =
    (evidence?.record as any)?.signature?.key_id ||
    (evidence?.keys as any)?.directory?.[0]?.key_id ||
    "cool-key-dstack-simulated";

  const treeSize = evidence?.inclusion?.tree_size ?? 1;
  const leafIndex = evidence?.inclusion?.leaf_index ?? 0;
  const auditPathLength = evidence?.inclusion?.audit_path?.length ?? 0;

  return (
    <div className="space-y-8 animate-fadeIn font-mono">
      {/* Header Breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab("investigations")}
            className="hover:text-white transition-colors"
          >
            Case #{caseInfo.applicationId}
          </button>
          <span>/</span>
          <span className="text-sky-400 font-bold">Evidence Receipt</span>
        </div>

        <button
          onClick={() => onNavigateTab("verify")}
          className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
        >
          <span>Verify in Center</span>
          <ArrowRightIcon className="w-3 h-3" />
        </button>
      </div>

      {/* Screen Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-sky-400" />
          <span>Cryptographic Evidence Receipt</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Self-contained, offline-verifiable execution receipt conforming to the{" "}
          <span className="font-mono text-sky-400">cool.receipt.v2</span> standard.
        </p>
      </div>

      {/* Visually Prominent Privacy Callout */}
      <div className="p-4 md:p-5 rounded-xl border border-emerald-800/80 bg-emerald-950/20 text-xs font-sans space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
          <LockIcon className="w-4 h-4 text-emerald-400" />
          <span>Privacy-Preserving Execution Proof</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          &ldquo;Sensitive inputs and outputs are not stored in the CooL receipt. CooL records salted
          cryptographic commitments.&rdquo;
        </p>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Applicant name, income, credit score, and financial features are hashed with per-event salts
          using SHA-256 multihashes. The receipt allows any auditor to verify execution integrity
          without ever storing or leaking PII.
        </p>
      </div>

      {/* Cryptographic Fields Grid */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            RECEIPT ENVELOPE DETAILS
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-400">
            schema: cool.receipt.v2
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* BINDING HASH */}
          <div className="p-4 bg-slate-900/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-bold tracking-wider">BINDING HASH</span>
              <button
                onClick={() => handleCopy(digest, "binding")}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                {copiedField === "binding" ? (
                  <>
                    <CheckCheckIcon className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-sky-400 text-[11px] break-all select-all">
              {digest}
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Cryptographic commitment over canonical CBOR encoding of the execution event core.
            </p>
          </div>

          {/* SIGNATURE */}
          <div className="p-4 bg-slate-900/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-bold tracking-wider">
                SIGNATURE ALGORITHM
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                Post-Quantum Hybrid
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-white text-xs font-bold">
              ML-DSA-65 + Ed25519
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Dual signing: NIST FIPS 204 post-quantum lattice signature combined with Ed25519.
            </p>
          </div>

          {/* RECORD ID */}
          <div className="p-4 bg-slate-900/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-bold tracking-wider">RECORD ID</span>
              <button
                onClick={() => handleCopy(recordId, "recordId")}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                {copiedField === "recordId" ? (
                  <>
                    <CheckCheckIcon className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-slate-200 text-xs break-all select-all">
              {recordId}
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Monotonic ULID uniquely identifying this execution receipt in the ledger.
            </p>
          </div>

          {/* EXECUTION ID */}
          <div className="p-4 bg-slate-900/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-bold tracking-wider">EXECUTION ID</span>
              <button
                onClick={() => handleCopy(executionId, "executionId")}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                {copiedField === "executionId" ? (
                  <>
                    <CheckCheckIcon className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-slate-200 text-xs break-all select-all">
              {executionId}
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Session correlation ID binding multi-step decisions to a single execution context.
            </p>
          </div>

          {/* KEY ID */}
          <div className="p-4 bg-slate-900/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-bold tracking-wider">KEY IDENTIFIER</span>
              <button
                onClick={() => handleCopy(keyId, "keyId")}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                {copiedField === "keyId" ? (
                  <>
                    <CheckCheckIcon className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-slate-200 text-xs break-all select-all">
              {keyId}
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Public verification key embedded directly in the receipt envelope key directory.
            </p>
          </div>

          {/* RUNTIME */}
          <div className="p-4 bg-slate-900/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-bold tracking-wider">RUNTIME ENCLAVE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                SIMULATED
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-white font-bold">Intel TDX</span>
              <span className="text-amber-400 font-bold">Mode: Simulated</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Local plane simulator. Honestly reported as simulated — not hardware attestation.
            </p>
          </div>

          {/* TRANSPARENCY INCLUSION */}
          <div className="p-4 bg-slate-900/70 rounded-lg border border-slate-800 space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-bold tracking-wider">
                TRANSPARENCY LOG INCLUSION
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                RFC 6962 Merkle Tree
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block">LEAF INDEX</span>
                <span className="text-white font-bold text-sm">#{leafIndex}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block">LOG TREE SIZE</span>
                <span className="text-white font-bold text-sm">{treeSize} entries</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block">AUDIT PATH DEPTH</span>
                <span className="text-sky-400 font-bold text-sm">{auditPathLength} hashes</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Cryptographic Merkle inclusion proof enables verification that this execution record was
              appended to an append-only, tamper-evident transparency log.
            </p>
          </div>
        </div>

        {/* Wire Inspector Toggle */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setShowWire(!showWire)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <FileCodeIcon className="w-4 h-4 text-sky-400" />
            <span>{showWire ? "Hide Raw Wire JSON" : "Inspect Raw Evidence Envelope (JSON)"}</span>
          </button>

          {showWire && (
            <div className="mt-3 relative">
              <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-96 font-mono leading-relaxed">
                {JSON.stringify(evidence, null, 2)}
              </pre>
              <button
                onClick={() => handleCopy(JSON.stringify(evidence, null, 2), "wire")}
                className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
              >
                {copiedField === "wire" ? "Copied" : "Copy JSON"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
