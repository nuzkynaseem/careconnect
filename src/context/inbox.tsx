import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { initialInbox, type AccessLevel, type InboxItem, type Person } from '@/data/inbox';
import { initialCareTeam, people, type PersonId } from '@/data/people';

export type Resolution = 'accepted' | 'declined' | 'listened' | 'done' | 'deleted';

export type CareTeamMember = Person & { access: AccessLevel };

export type Reply = { id: string; text: string; sentAt: Date };

type InboxContextValue = {
  items: InboxItem[];
  resolutions: Record<string, Resolution>;
  unread: InboxItem[];
  past: InboxItem[];
  careTeam: CareTeamMember[];
  replies: Record<string, Reply[]>;
  resolve: (itemId: string, resolution: Resolution) => void;
  acceptInvite: (itemId: string, access: AccessLevel) => void;
  sendReply: (itemId: string, text: string) => void;
};

const InboxContext = createContext<InboxContextValue | null>(null);

export function InboxProvider({ children }: { children: ReactNode }) {
  const [resolutions, setResolutions] = useState<Record<string, Resolution>>({});
  const [team, setTeam] = useState(initialCareTeam);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});

  const value = useMemo<InboxContextValue>(() => {
    const resolve = (itemId: string, resolution: Resolution) =>
      setResolutions((prev) => ({ ...prev, [itemId]: resolution }));
    const visible = initialInbox.filter((item) => resolutions[item.id] !== 'deleted');

    return {
      items: initialInbox,
      resolutions,
      unread: visible.filter((item) => !resolutions[item.id]),
      past: visible.filter((item) => resolutions[item.id]),
      careTeam: team.map(({ id, access }) => ({ ...people[id], access })),
      replies,
      resolve,
      acceptInvite: (itemId, access) => {
        const item = initialInbox.find((i) => i.id === itemId);
        if (item?.kind !== 'invite') return;
        const id = item.from.id as PersonId;
        setTeam((prev) =>
          prev.some((m) => m.id === id)
            ? prev.map((m) => (m.id === id ? { id, access } : m))
            : [...prev, { id, access }],
        );
        resolve(itemId, 'accepted');
      },
      sendReply: (itemId, text) =>
        setReplies((prev) => ({
          ...prev,
          [itemId]: [
            ...(prev[itemId] ?? []),
            { id: `${Date.now()}`, text, sentAt: new Date() },
          ],
        })),
    };
  }, [resolutions, team, replies]);

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error('useInbox must be used inside InboxProvider');
  return ctx;
}
