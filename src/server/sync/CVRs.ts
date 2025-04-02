export type ReplicacheCVREntries = Record<string, number>;
export type ReplicacheCVR = Record<string, ReplicacheCVREntries>;
const cvrCache = new Map<string, ReplicacheCVR>();

export interface CVRs {
  get(id: string): Promise<ReplicacheCVR | undefined>;
  save(id: string, cvr: ReplicacheCVR): Promise<void>;
}

export class CVRsAdapter implements CVRs {
  async get(id: string): Promise<ReplicacheCVR | undefined> {
    return cvrCache.get(id);
  }

  async save(id: string, cvr: ReplicacheCVR): Promise<void> {
    cvrCache.set(id, cvr);
  }
}

export type ReplicacheCVREntryDiff = {
  puts: string[];
  dels: string[];
};
export type ReplicacheCVRDiff = Record<string, ReplicacheCVREntryDiff>;
export const diffCVR = (prev: ReplicacheCVR, next: ReplicacheCVR) => {
  const r: ReplicacheCVRDiff = {};
  const names = [...new Set([...Object.keys(prev), ...Object.keys(next)])];
  for (const name of names) {
    const prevEntries = prev[name] ?? {};
    const nextEntries = next[name] ?? {};
    r[name] = {
      puts: Object.keys(nextEntries).filter(
        (id) =>
          prevEntries[id] === undefined || prevEntries[id] < nextEntries[id],
      ),
      dels: Object.keys(prevEntries).filter(
        (id) => nextEntries[id] === undefined,
      ),
    };
  }
  return r;
};
export const isCVRDiffEmpty = (diff: ReplicacheCVRDiff) =>
  Object.values(diff).every((e) => e.puts.length === 0 && e.dels.length === 0);
