import { CooL, verifyEvidence, formatVerdict, type Verdict, type Evidence } from "cool-nwc";

// Global singleton pattern to prevent client duplication during Fast Refresh or route invocations
const globalForCool = globalThis as unknown as {
  coolClient?: CooL;
};

export function getCoolClient(): CooL {
  if (!globalForCool.coolClient) {
    globalForCool.coolClient = new CooL({
      applicationId: "ai-auditshield",
    });
  }
  return globalForCool.coolClient;
}

export { verifyEvidence, formatVerdict };
export type { Verdict, Evidence };
