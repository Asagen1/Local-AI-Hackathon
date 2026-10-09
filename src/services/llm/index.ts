import { onnxService } from './onnx-service';

class LocalLLMService {
  async initialize() {
    await onnxService.initialize();
  }

  async extractName(transcript: string): Promise<string> {
    return onnxService.extractName(transcript);
  }

  isReady(): boolean {
    return onnxService.isReady();
  }
}

export const llmService = new LocalLLMService();
