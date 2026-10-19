export type Medication = {
  id: string;
  name: string;
  dose: string;
  instructions?: string;
  description: string;
  icon: 'pill' | 'water';
};

export type Routine = {
  id: string;
  title: string;
  window: string;
  /** Time the dose is due, shown on the dose screen. */
  dueAt: string;
  icon: 'sunrise' | 'sun' | 'moon';
  medications: Medication[];
};

export const routines: Routine[] = [
  {
    id: 'morning',
    title: 'Morning Routine',
    window: '8:00 AM - 12:00 PM',
    dueAt: '8:00 AM',
    icon: 'sunrise',
    medications: [
      { id: 'lisinopril', name: 'Lisinopril', dose: '10mg', instructions: 'With food', description: 'Lowers blood pressure. Take with breakfast.', icon: 'pill' },
      { id: 'metformin', name: 'Metformin', dose: '500mg', instructions: 'Before meal', description: 'Reduces blood sugar levels. Take with a full glass of water.', icon: 'water' },
    ],
  },
  {
    id: 'afternoon',
    title: 'Afternoon',
    window: '12:00 PM - 5:00 PM',
    dueAt: '12:00 PM',
    icon: 'sun',
    medications: [{ id: 'atorvastatin', name: 'Atorvastatin', dose: '20mg', description: 'Lowers cholesterol. Take at the same time each day.', icon: 'pill' }],
  },
  {
    id: 'evening',
    title: 'Evening',
    window: '5:00 PM - 9:00 PM',
    dueAt: '5:00 PM',
    icon: 'moon',
    medications: [
      { id: 'amlodipine', name: 'Amlodipine', dose: '5mg', description: 'Controls blood pressure. Can be taken with or without food.', icon: 'pill' },
      { id: 'metformin-pm', name: 'Metformin', dose: '500mg', description: 'Reduces blood sugar levels. Take with a full glass of water.', icon: 'water' },
    ],
  },
];
