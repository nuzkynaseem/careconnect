export type Medication = {
  id: string;
  name: string;
  dose: string;
  instructions?: string;
  icon: 'pill' | 'water';
};

export type Routine = {
  id: string;
  title: string;
  window: string;
  icon: 'sunrise' | 'sun' | 'moon';
  medications: Medication[];
};

export const routines: Routine[] = [
  {
    id: 'morning',
    title: 'Morning Routine',
    window: '8:00 AM - 12:00 PM',
    icon: 'sunrise',
    medications: [
      { id: 'lisinopril', name: 'Lisinopril', dose: '10mg', instructions: 'With food', icon: 'pill' },
      { id: 'metformin', name: 'Metformin', dose: '500mg', instructions: 'Before meal', icon: 'water' },
    ],
  },
  {
    id: 'afternoon',
    title: 'Afternoon',
    window: '12:00 PM - 5:00 PM',
    icon: 'sun',
    medications: [{ id: 'atorvastatin', name: 'Atorvastatin', dose: '20mg', icon: 'pill' }],
  },
  {
    id: 'evening',
    title: 'Evening',
    window: '5:00 PM - 9:00 PM',
    icon: 'moon',
    medications: [
      { id: 'amlodipine', name: 'Amlodipine', dose: '5mg', icon: 'pill' },
      { id: 'metformin-pm', name: 'Metformin', dose: '500mg', icon: 'water' },
    ],
  },
];
