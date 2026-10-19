import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type AccessLevel = 'view' | 'edit';

export type Person = {
  id: string;
  name: string;
  /** How the person is referred to in sentences, e.g. "John" or "Dr. Smith". */
  shortName: string;
  /** Name shown on care team cards, e.g. "Son John". */
  cardName: string;
  /** Family relationship or job, e.g. "Son" or "Doctor". */
  relation: string;
  /** Their role on the care team, shown under their name. */
  role: string;
  roleColor: string;
  initials: string;
  color: string;
  phone: string;
  badge: keyof typeof MaterialCommunityIcons.glyphMap;
};

export const people = {
  smith: {
    id: 'smith',
    cardName: 'Dr. Smith',
    name: 'Dr. Smith',
    shortName: 'Dr. Smith',
    relation: 'Doctor',
    role: 'Primary Doctor',
    roleColor: '#4C86FF',
    initials: 'DS',
    color: '#4A9A7A',
    phone: '+12175550142',
    badge: 'stethoscope',
  },
  ratched: {
    id: 'ratched',
    cardName: 'Nurse Ratched',
    name: 'Nurse Ratched',
    shortName: 'Nurse Ratched',
    relation: 'Nurse',
    role: 'Visiting Nurse',
    roleColor: '#4C86FF',
    initials: 'NR',
    color: '#5B6BC9',
    phone: '+12175550175',
    badge: 'medical-bag',
  },
  john: {
    id: 'john',
    cardName: 'Son John',
    name: 'John Doe',
    shortName: 'John',
    relation: 'Son',
    role: 'Emergency',
    roleColor: '#FF5A52',
    initials: 'JD',
    color: '#3B6FD8',
    phone: '+12175550118',
    badge: 'asterisk',
  },
  sarah: {
    id: 'sarah',
    cardName: 'Sarah',
    name: 'Sarah',
    shortName: 'Sarah',
    relation: 'Daughter',
    role: 'Daily Check-in',
    roleColor: '#B57BFF',
    initials: 'S',
    color: '#C9735B',
    phone: '+12175550193',
    badge: 'heart',
  },
} satisfies Record<string, Person>;

export type PersonId = keyof typeof people;

/** Called first in an emergency. */
export const primaryContactId: PersonId = 'sarah';

/** Care team before any invites are accepted. */
export const initialCareTeam: { id: PersonId; access: AccessLevel }[] = [
  { id: 'smith', access: 'view' },
  { id: 'ratched', access: 'view' },
  { id: 'sarah', access: 'edit' },
];

export const patient = {
  name: 'Arthur Dent',
  firstName: 'Arthur',
  age: 84,
  careId: '8392-1029',
  initials: 'AD',
  color: '#7C8798',
  homeAddress: '123 Maple Street, Springfield, IL 62704',
  profileUrl: 'https://careconnect.app/id/8392-1029',
};
