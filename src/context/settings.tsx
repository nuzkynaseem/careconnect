import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type SettingsContextValue = {
  /** Shows the Emergency button on the dashboard. */
  sosEnabled: boolean;
  setSosEnabled: (enabled: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [sosEnabled, setSosEnabled] = useState(true);
  const value = useMemo(() => ({ sosEnabled, setSosEnabled }), [sosEnabled]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
