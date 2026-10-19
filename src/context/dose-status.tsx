import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type DoseStatus =
  | { kind: 'taken'; at: Date }
  | { kind: 'skipped'; at: Date }
  | { kind: 'snoozed'; until: Date };

type DoseStatusContextValue = {
  statuses: Record<string, DoseStatus>;
  markTaken: (medId: string) => void;
  skip: (medId: string) => void;
  snooze: (medId: string, minutes: number) => void;
  reset: (medId: string) => void;
};

const DoseStatusContext = createContext<DoseStatusContextValue | null>(null);

export function DoseStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, DoseStatus>>({});

  const set = useCallback(
    (medId: string, status: DoseStatus) => setStatuses((prev) => ({ ...prev, [medId]: status })),
    [],
  );

  const value = useMemo<DoseStatusContextValue>(
    () => ({
      statuses,
      markTaken: (medId) => set(medId, { kind: 'taken', at: new Date() }),
      skip: (medId) => set(medId, { kind: 'skipped', at: new Date() }),
      snooze: (medId, minutes) =>
        set(medId, { kind: 'snoozed', until: new Date(Date.now() + minutes * 60_000) }),
      reset: (medId) =>
        setStatuses((prev) => {
          const { [medId]: _removed, ...rest } = prev;
          return rest;
        }),
    }),
    [statuses, set],
  );

  return <DoseStatusContext.Provider value={value}>{children}</DoseStatusContext.Provider>;
}

export function useDoseStatus() {
  const ctx = useContext(DoseStatusContext);
  if (!ctx) throw new Error('useDoseStatus must be used inside DoseStatusProvider');
  return ctx;
}
