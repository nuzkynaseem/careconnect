import { people, type Person } from './people';

export type { AccessLevel, Person } from './people';

export type InboxItem =
  | {
      id: string;
      kind: 'invite';
      title: string;
      subtitle: string;
      from: Person;
      /** Shown under the name on the invitation screen. */
      message: string;
    }
  | {
      id: string;
      kind: 'voice-note';
      title: string;
      subtitle: string;
      from: Person;
      transcript: string;
      /** Length of the recording, in seconds. */
      duration: number;
      sentAt: string;
    }
  | {
      id: string;
      kind: 'reminder';
      title: string;
      subtitle: string;
      medId: string;
    };

export const initialInbox: InboxItem[] = [
  {
    id: 'invite-john',
    kind: 'invite',
    title: 'John Doe wants to join',
    subtitle: 'Care team invite',
    from: people.john,
    message: 'Wants to help you with your pills',
  },
  {
    id: 'invite-smith',
    kind: 'invite',
    title: 'Dr. Smith Appointment',
    subtitle: 'Request for check-up on Tuesday',
    from: people.smith,
    message: 'Requested a check-up on Tuesday and would like to see your medications',
  },
  {
    id: 'voice-sarah',
    kind: 'voice-note',
    title: 'Message from Sarah',
    subtitle: 'Received 2 hours ago',
    from: people.sarah,
    transcript: "Don't forget to take your heart medication with lunch today, Dad!",
    duration: 45,
    sentAt: 'Sent today at 10:30 AM',
  },
  {
    id: 'reminder-afternoon',
    kind: 'reminder',
    title: 'Afternoon Medication',
    subtitle: 'Atorvastatin - 20mg',
    medId: 'atorvastatin',
  },
];
