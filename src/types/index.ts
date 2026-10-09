// Patient types
export interface Patient {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Chart types (from recording/generateChart)
export interface Chart {
  id: string;
  patientName: string;
  parameters: Record<string, string>;
  notes: string;
  createdAt: string;
}
