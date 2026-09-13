"use client";

import React, { useState } from "react";
import { DecisionRecord, TamperResponse, VerificationResponse, VerificationStatus } from "@/lib/types";
import {
  ShieldAlertIcon,
  ShieldCheckIcon,
  BugIcon,
  XIcon,
  CheckIcon,
  RefreshCwIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  LockIcon,
} from "./icons";

type AttackType = "metadata_hash" | "corrupt_signature" | "signature_key";

interface TamperLabViewProps {
  decision: DecisionRecord | null;
  tamperResult: TamperResponse | null;
  isSimulating: boolean;
  onRunTamper: (mutationType?: AttackType) => Promise<TamperResponse | null>;
  onNavigateTab: (tab: "overview" | "investigations" | "evidence" | "verify" | "tamper") => void;
}

interface AttackOption {
  id: AttackType;
  title: string;
  shortLabel: string;
  description: string;
  threatScenario: string;
}

const ATTACK_OPTIONS: AttackOption[] = [
  {
    id: "metadata_hash",
    title: "1. Modify Metadata Commitment",
    shortLabel: "Metadata Commitment Attack",
    description:
      "Flips the final hex character of event.metadata_hash commitment. The verifier should report binding and signature failures.",
    threatScenario:
      "Simulates an adversary attempting to alter the model version, policy ID, or execution timestamp after decision generation.",
  },
  {
    id: "corrupt_signature",
    title: "2. Corrupt Hybrid Signature",
    shortLabel: "Signature Corruption Attack",
    description:
      "Mutates the raw ML-DSA-65 signature payload. Fails the hybrid signature check while leaving binding commitments intact.",
    threatScenario:
      "Simulates an attacker altering one signature field without access to the signing key. The local runtime is simulated, not hardware-attested.",
  },
  {
    id: "signature_key",
    title: "3. Change Signer Key",
    shortLabel: "Signer Impersonation Attack",
    description:
      "Replaces the key_id with an unauthorized attacker key identity. Fails signature verification against the embedded key directory.",
    threatScenario:
      "Simulates an untrusted rogue system or unauthorized subagent attempting to sign off on an AI loan approval.",
  },
];

export function TamperLabView({ decision, tamperResult, isSimulating, onRunTamper, onNavigateTab }: TamperLabViewProps) {
  const [selectedAttack, setSelectedAttack] = useState<AttackType>("metadata_hash");

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

  const handleSimulateTamper = () => onRunTamper(selectedAttack);

  const origVerdict = tamperResult?.originalVerdict;
  const tampVerdict = tamperResult?.tamperedVerdict;
  const mutationDetails = tamperResult?.mutationDetails;

  const getCheckStatus = (
    verdict: VerificationResponse | undefined,
    domain: string
  ): VerificationStatus | "not_run" => verdict?.checks[domain]?.status || "not_run";

  const renderCheckStatus = (verdict: VerificationResponse | undefined, domain: string) => {
    const status = getCheckStatus(verdict, domain);
    if (status === "pass") {
      return <span className="text-emerald-400 font-bold inline-flex items-center gap-1 text-[11px]"><CheckIcon className="w-3.5 h-3.5" />PASS</span>;
    }
    if (status === "fail") {
      return <span className="text-rose-400 font-bold inline-flex items-center gap-1 text-[11px]"><XIcon className="w-3.5 h-3.5" />FAIL</span>;
    }
    if (status === "simulated") {
      return <span className="text-amber-400 font-bold text-[11px]">~ SIMULATED</span>;
    }
    return <span className="text-slate-500 font-bold text-[11px]">NOT RUN</span>;
  };

  return (
    <div className="space-y-8 animate-fadeIn font-mono">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab("investigations")}
            className="hover:text-white transition-colors"
          >
            Case #{decision.caseInfo.applicationId}
          </button>
          <span>/</span>
          <span className="text-rose-400 font-bold">Tamper Lab</span>
        </div>

        <button
          onClick={() => onNavigateTab("verify")}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span>Back to Verification Center</span>
          <ArrowRightIcon className="w-3 h-3" />
        </button>
      </div>

      {/* Hero Header */}
      <div className="rounded-xl border border-rose-900/60 bg-gradient-to-r from-slate-950 via-rose-950/20 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-[11px] text-rose-400 font-semibold mb-2">
              <BugIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Adversarial Evidence Testing</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              TAMPER LAB
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-sans">
              &ldquo;See what happens when evidence is altered.&rdquo;
            </p>
          </div>

          <button
            onClick={handleSimulateTamper}
            disabled={isSimulating}
            className="px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg shadow-rose-950/50 disabled:opacity-50"
          >
            <RefreshCwIcon className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
            <span>{isSimulating ? "Running Forensic Verification..." : "Simulate Tampering"}</span>
          </button>
        </div>

        {/* 3 Predefined Attack Selectors */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">
            Select Predefined Attack Vector:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ATTACK_OPTIONS.map((atk) => {
              const isSelected = selectedAttack === atk.id;
              return (
                <button
                  key={atk.id}
                  onClick={() => setSelectedAttack(atk.id)}
                  className={`p-4 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500/30 text-white"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className="space-y-1.5">
                    <span
                      className={`text-xs font-bold block ${
                        isSelected ? "text-rose-400" : "text-slate-300"
                      }`}
                    >
                      {atk.title}
                    </span>
                    <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                      {atk.threatScenario}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Target: {atk.shortLabel}</span>
                    <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-rose-400" : "bg-slate-700"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparative Verdict Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Comparative Cryptographic Verdict
          </h2>
          <span className="text-xs text-slate-500 font-sans">
            Independent offline verification before vs after tampering
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: ORIGINAL EVIDENCE */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ORIGINAL EVIDENCE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                {origVerdict ? "VERIFIED BY CooL" : "VERIFICATION AVAILABLE"}
              </span>
            </div>

            {/* Original Verdict Banner */}
            <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-black text-emerald-400 tracking-wider">
                  {origVerdict ? (origVerdict.ok ? "RESULT: VERIFIED" : "RESULT: FAILED") : "READY FOR INTEGRITY TEST"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {origVerdict ? `ok: ${origVerdict.ok}` : "Run an attack to verify this receipt"}
              </span>
            </div>

            {/* Domain List (Original) */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Binding</span>
                <span className="text-emerald-400 font-bold inline-flex items-center gap-1 text-[11px]">
                  {renderCheckStatus(origVerdict, "binding")}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Signature</span>
                <span className="text-emerald-400 font-bold inline-flex items-center gap-1 text-[11px]">
                  {renderCheckStatus(origVerdict, "signature")}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Inclusion</span>
                <span className="text-emerald-400 font-bold inline-flex items-center gap-1 text-[11px]">
                  {renderCheckStatus(origVerdict, "inclusion")}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Attestation</span>
                {renderCheckStatus(origVerdict, "attestation")}
              </div>
            </div>

            <div className="p-3 bg-slate-900/40 rounded border border-slate-800 text-[10px] text-slate-500">
              Digest: <span className="text-slate-400 truncate block">{decision.digest}</span>
            </div>
          </div>

          {/* RIGHT: TAMPERED EVIDENCE */}
          <div className="rounded-xl border border-rose-900/70 bg-slate-950/80 p-6 space-y-4 shadow-lg shadow-rose-950/20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                {tampVerdict ? "TAMPERED EVIDENCE" : "INTEGRITY TEST"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-700">
                {tampVerdict ? "ALTERED RECORD" : "READY"}
              </span>
            </div>

            {/* Tampered Verdict Banner */}
            <div className={`p-4 rounded-lg border flex items-center justify-between ${tampVerdict ? "bg-rose-950/40 border-rose-800/80" : "bg-slate-900/60 border-slate-800"}`}>
              <div className="flex items-center gap-3">
                {tampVerdict ? <ShieldAlertIcon className="w-5 h-5 text-rose-400" /> : <LockIcon className="w-5 h-5 text-slate-400" />}
                <span className={`text-lg font-black tracking-wider ${tampVerdict ? "text-rose-400" : "text-slate-300"}`}>
                  {tampVerdict ? (tampVerdict.ok ? "RESULT: VERIFIED" : "RESULT: FAILED") : "READY FOR INTEGRITY TEST"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                {tampVerdict ? `ok: ${tampVerdict.ok}` : "No mutation executed"}
              </span>
            </div>

            {/* Domain List (Tampered) */}
            <div className="space-y-2 text-xs">
              {(["binding", "signature", "inclusion", "attestation"] as const).map((domain) => (
                <div key={domain} className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300 font-semibold capitalize">{domain}</span>
                  {renderCheckStatus(tampVerdict, domain)}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900/40 rounded border border-rose-950 text-[10px] text-rose-400">
              Active Attack: <span className="text-white font-bold">{selectedAttack}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Field Mutation Diff Inspector */}
      {mutationDetails && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Cryptographic Mutation Diff
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Target: {mutationDetails.targetField}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900/70 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block mb-1">ORIGINAL VALUE (BEFORE)</span>
              <code className="text-emerald-400 text-xs break-all block font-mono">
                {String(mutationDetails.originalValue)}
              </code>
            </div>

            <div className="p-3 bg-rose-950/30 rounded border border-rose-900/60">
              <span className="text-rose-400 text-[10px] block mb-1">TAMPERED VALUE (MUTATED)</span>
              <code className="text-rose-300 text-xs break-all block font-mono">
                {String(mutationDetails.tamperedValue)}
              </code>
            </div>

              <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {mutationDetails.description}
            </p>
          </div>
        </div>
      )}

      {/* WHY DID IT FAIL? Forensic Analysis Section */}
      <div className="rounded-xl border border-rose-900/80 bg-rose-950/20 p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
          <AlertTriangleIcon className="w-4 h-4 text-rose-400" />
          <span>Why Did It Fail? — Forensic Diagnostic</span>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-sans block">
            Actual failure reasons returned by the real CooL verifier engine:
          </span>

          {tampVerdict?.reasons && tampVerdict.reasons.length > 0 ? (
            <ul className="space-y-2 text-xs">
              {tampVerdict.reasons.map((reason: string, idx: number) => (
                <li
                  key={idx}
                  className="p-3 rounded bg-slate-950/80 border border-rose-900/80 text-rose-300 font-mono flex items-start gap-2"
                >
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 rounded bg-slate-950/80 border border-slate-800 text-slate-400 text-xs font-sans">
              Click <span className="text-white font-bold">&ldquo;Simulate Tampering&rdquo;</span> above to
              run the live attack vector and extract real verification failure diagnostics.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-rose-900/40 text-xs text-slate-400 font-sans leading-relaxed">
          <strong className="text-slate-200">Integrity finding:</strong>
          &ldquo;The evidence no longer matches the cryptographic binding created when the decision was recorded.&rdquo;
          Because the signature covers the canonical CBOR encoding of the event core and commitment hash, this test
          demonstrates that the receipt integrity check detects the mutation.
        </div>
      </div>
    </div>
  );
}
