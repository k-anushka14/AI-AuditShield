"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DecisionRecord, TamperResponse, VerificationResponse } from "@/lib/types";
import type { Evidence } from "cool-nwc";
import { Header, NavTab } from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { InvestigationView } from "@/components/InvestigationView";
import { EvidenceReceiptView } from "@/components/EvidenceReceiptView";
import { VerificationCenterView } from "@/components/VerificationCenterView";
import { TamperLabView } from "@/components/TamperLabView";
import { DemoTourModal } from "@/components/DemoTourModal";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<DecisionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Shared verification & tampering state across tabs and demo tour
  const [sharedVerdict, setSharedVerdict] = useState<VerificationResponse | null>(null);
  const [sharedTamperResult, setSharedTamperResult] = useState<TamperResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTampering, setIsTampering] = useState(false);

  // Fetch decisions on mount
  const loadDecisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/decisions");
      if (res.ok) {
        const data = await res.json();
        const list: DecisionRecord[] = data.decisions || [];
        setDecisions(list);
        if (list.length > 0) {
          setSelectedDecision((prev) => (prev ? list.find((d) => d.id === prev.id) || list[0] : list[0]));
        }
      }
    } catch (err) {
      console.error("Failed to load decisions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  // Reset state when decision changes
  const handleSelectDecision = (decision: DecisionRecord) => {
    setSelectedDecision(decision);
    setSharedVerdict(null);
    setSharedTamperResult(null);
  };

  // Shared execution of verify
  const handleRunVerify = async (evidenceToVerify?: Evidence) => {
    const ev = evidenceToVerify || selectedDecision?.evidence;
    if (!ev) return null;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence: ev }),
      });
      if (res.ok) {
        const data = await res.json();
        setSharedVerdict(data);
        return data;
      }
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
    return null;
  };

  // Shared execution of tamper
  const handleRunTamper = async (
    mutationType: "metadata_hash" | "corrupt_signature" | "signature_key" = "metadata_hash"
  ) => {
    if (!selectedDecision) return null;
    setIsTampering(true);
    try {
      const res = await fetch("/api/tamper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDecision.id,
          mutationType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSharedTamperResult(data);
        return data;
      }
    } catch (err) {
      console.error("Tampering simulation failed:", err);
    } finally {
      setIsTampering(false);
    }
    return null;
  };

  // Create custom deterministic decision
  const handleCreateCustomDecision = async (params: {
    applicationId: string;
    creditScore: number;
    debtToIncome: number;
    requestedAmount: number;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        const newRecord: DecisionRecord = data.decision;
        setDecisions((prev) => [newRecord, ...prev]);
        handleSelectDecision(newRecord);
        setActiveTab("investigations");
      }
    } catch (err) {
      console.error("Failed to create decision:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDemo={() => setIsTourOpen(true)}
        isDemoRunning={isTourOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {activeTab === "overview" && (
          <DashboardView
            decisions={decisions}
            selectedDecision={selectedDecision}
            onSelectDecision={handleSelectDecision}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onRefreshDecisions={loadDecisions}
            onCreateCustomDecision={handleCreateCustomDecision}
            isLoading={isLoading}
          />
        )}

        {activeTab === "investigations" && (
          <InvestigationView
            decision={selectedDecision}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "evidence" && (
          <EvidenceReceiptView
            decision={selectedDecision}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "verify" && (
          <VerificationCenterView
            decision={selectedDecision}
            verdictData={sharedVerdict}
            isVerifying={isVerifying}
            onRunVerify={handleRunVerify}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "tamper" && (
          <TamperLabView
            decision={selectedDecision}
            tamperResult={sharedTamperResult}
            isSimulating={isTampering}
            onRunTamper={handleRunTamper}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* 60-Second Guided Demo Modal */}
      <DemoTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        decision={selectedDecision}
        onSelectTab={(tab) => setActiveTab(tab)}
        onTriggerVerify={() => handleRunVerify()}
        onTriggerTamper={() => handleRunTamper("metadata_hash")}
      />

      {/* Enterprise Security Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 font-mono text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-slate-300 font-semibold">
              AI AuditShield · Enterprise AI Decision Integrity Platform
            </div>
            <p className="text-slate-500 font-sans max-w-xl text-[11px] leading-relaxed">
              CooL proves evidence integrity and execution authenticity. It does NOT prove that an AI
              decision is fair, correct, or safe. Local execution runtime is simulated TDX.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>cool-nwc v3.0</span>
            </span>
            <span>|</span>
            <span>ML-DSA-65 (FIPS 204)</span>
            <span>|</span>
            <span>RFC 6962 Log</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
