import { loadParameters } from '@/utils/storage';

export type Chart = {
  id: string;
  patientName: string;
  parameters: Record<string, string>;
  notes: string;
  createdAt: string;
};

export async function generateChart(transcript: string): Promise<Chart> {
  // Load configured parameters
  const configuredParams = loadParameters() || [];
  
  // TODO: Phase 6 - send `transcript` + configuredParams to your SLM
  // For now, initialize all parameters as empty (to be filled by LLM)
  const parameters: Record<string, string> = {};
  configuredParams.forEach(param => {
    parameters[param.label] = '';
  });

  // Simple regex to extract a name as placeholder
  const nameMatch = transcript.match(/(?:my name is|I'm|I am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  const extractedName = nameMatch ? nameMatch[1] : 'Unknown Patient';
  
  // Set the name in parameters if it exists
  const nameParam = configuredParams.find(p => p.label.toLowerCase() === 'name');
  if (nameParam) {
    parameters[nameParam.label] = extractedName;
  }

  await new Promise((r) => setTimeout(r, 1500));
  
  return {
    id: Date.now().toString(),
    patientName: extractedName,
    parameters,
    notes: transcript,
    createdAt: new Date().toISOString(),
  };
}