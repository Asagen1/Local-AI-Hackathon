export type Chart = {
  id: string;
  patientName: string;
  parameters: Record<string, string>;
  notes: string;
  createdAt: string;
};

export async function generateChart(transcript: string): Promise<Chart> {
  // TODO: send `transcript` + the saved parameter list to your SLM
  await new Promise((r) => setTimeout(r, 1500));
  return {
    id: Date.now().toString(),
    patientName: 'Amanda',
    parameters: { Name: 'Amanda', Age: '', Sex: '', 'Contact no.': '' },
    notes: transcript,
    createdAt: new Date().toISOString(),
  };
}