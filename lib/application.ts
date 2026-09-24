import "server-only";
import { randomBytes } from "node:crypto";
import type { Answers } from "./intake";
import { digest, readRecord, writeRecord } from "./receipt-store";
export type Application = {
  id: string;
  answers: Answers;
  submittedAt: string;
  qualified: boolean;
  reason: string | null;
  hash: string;
  leadId?: string | null;
  synced?: boolean;
  receiptToken: string;
  created?: boolean;
};
export const applicationKey = (id: string) => `applications/${id}`;
export async function getApplication(id: string) {
  return readRecord<Application>(applicationKey(id));
}
export async function applicationFromToken(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const pointer = await readRecord<{ id: string }>(`sessions/${digest(token)}`);
  if (!pointer) return null;
  const receipt = await getApplication(pointer.value.id);
  if (
    !receipt ||
    Date.now() - Date.parse(receipt.value.submittedAt) > 7 * 86400000
  )
    return null;
  return receipt;
}
export async function issueToken(id: string) {
  const token = randomBytes(32).toString("hex");
  await writeRecord(`sessions/${digest(token)}`, { id });
  return token;
}
