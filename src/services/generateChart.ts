import { loadParameters } from '@/utils/storage';
import { llmService } from './llm';

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
  
  // Initialize all parameters as empty
  const parameters: Record<string, string> = {};
  configuredParams.forEach(param => {
    parameters[param.label] = '';
  });

  // Extract patient name using ONNX NER model
  console.log('Extracting patient name using ONNX model...');
  let extractedName: string;
  try {
    extractedName = await llmService.extractName(transcript);
    console.log('ONNX extracted name:', extractedName);
  } catch (error) {
    console.error('LLM extraction failed:', error);
    extractedName = 'Unknown Patient';
  }
  
  // Set the name in parameters if it exists
  const nameParam = configuredParams.find(p => p.label.toLowerCase() === 'name');
  if (nameParam) {
    parameters[nameParam.label] = extractedName;
  }
  
  return {
    id: Date.now().toString(),
    patientName: extractedName,
    parameters,
    notes: transcript,
    createdAt: new Date().toISOString(),
  };
}