import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { DecisionRecord } from "./types";

// In-memory cache as primary fast store
const memoryStore = new Map<string, DecisionRecord>();

function getStoragePath(): string {
  // Use /tmp for serverless/Vercel or OS temp if in restricted environment, or local .data
  const isVercel = Boolean(process.env.VERCEL);
  if (isVercel) {
    return path.join(os.tmpdir(), "ai-auditshield-decisions.json");
  }
  const localDir = path.resolve(process.cwd(), ".data");
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {
      return path.join(os.tmpdir(), "ai-auditshield-decisions.json");
    }
  }
  return path.join(localDir, "decisions.json");
}

function loadFromDisk(): void {
  try {
    const filePath = getStoragePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const list = JSON.parse(data) as DecisionRecord[];
      for (const record of list) {
        memoryStore.set(record.id, record);
        if (record.recordId) memoryStore.set(record.recordId, record);
      }
    }
  } catch {
    // Non-fatal if disk reading fails
  }
}

function persistToDisk(): void {
  try {
    const filePath = getStoragePath();
    // Unique records by record.id
    const unique = Array.from(
      new Map(Array.from(memoryStore.values()).map((r) => [r.id, r])).values()
    );
    fs.writeFileSync(filePath, JSON.stringify(unique, null, 2), "utf-8");
  } catch {
    // Non-fatal in read-only filesystems
  }
}

// Initial hydration from disk
loadFromDisk();

export async function saveDecision(record: DecisionRecord): Promise<void> {
  memoryStore.set(record.id, record);
  if (record.recordId) {
    memoryStore.set(record.recordId, record);
  }
  persistToDisk();
}

export async function getDecision(id: string): Promise<DecisionRecord | null> {
  if (memoryStore.has(id)) {
    return memoryStore.get(id) || null;
  }
  // Try case-insensitive or searching by recordId/executionId
  for (const record of memoryStore.values()) {
    if (
      record.id.toLowerCase() === id.toLowerCase() ||
      record.recordId === id ||
      record.executionId === id
    ) {
      return record;
    }
  }
  return null;
}

export async function getAllDecisions(): Promise<DecisionRecord[]> {
  const unique = Array.from(
    new Map(Array.from(memoryStore.values()).map((r) => [r.id, r])).values()
  );
  return unique.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function clearStore(): Promise<void> {
  memoryStore.clear();
  try {
    const filePath = getStoragePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore
  }
}
