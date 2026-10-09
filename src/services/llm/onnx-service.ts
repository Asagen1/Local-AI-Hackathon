import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import { WordPieceTokenizer } from './tokenizer';

interface Entity {
  word: string;
  entity: string;
  score: number;
  index: number;
}

// Label mapping from config.json
const LABEL_MAP: Record<number, string> = {
  0: 'O',       // Outside
  1: 'B-PER',   // Begin Person
  2: 'I-PER',   // Inside Person
  3: 'B-ORG',   // Begin Organization
  4: 'I-ORG',   // Inside Organization
  5: 'B-LOC',   // Begin Location
  6: 'I-LOC',   // Inside Location
  7: 'B-MISC',  // Begin Miscellaneous
  8: 'I-MISC',  // Inside Miscellaneous
};

class ONNXNERService {
  private session: InferenceSession | null = null;
  private tokenizer: WordPieceTokenizer | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      console.log('ONNX service already initialized');
      return;
    }
    
    console.log('Initializing ONNX NER service...');
    const startTime = Date.now();
    
    try {
      // Load tokenizer
      console.log('Loading tokenizer...');
      this.tokenizer = new WordPieceTokenizer();
      await this.tokenizer.loadVocab();
      console.log(`Tokenizer loaded (vocab size: ${this.tokenizer.getVocabSize()})`);
      
      // Load ONNX model
      console.log('Loading ONNX model...');
      const modelAsset = Asset.fromModule(require('../../../assets/models/model_int8.onnx'));
      await modelAsset.downloadAsync();
      
      if (!modelAsset.localUri) {
        throw new Error('Failed to load model asset');
      }
      
      console.log('Creating ONNX session from:', modelAsset.localUri);
      this.session = await InferenceSession.create(modelAsset.localUri);
      
      this.isInitialized = true;
      const elapsed = Date.now() - startTime;
      console.log(`ONNX NER service initialized successfully in ${elapsed}ms`);
    } catch (error) {
      console.error('Failed to initialize ONNX service:', error);
      throw error;
    }
  }

  async extractName(text: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        console.log('Service not initialized, initializing now...');
        await this.initialize();
      }

      if (!this.session || !this.tokenizer) {
        throw new Error('Service not properly initialized');
      }

      console.log('Extracting name from:', text.substring(0, 100));
      const startTime = Date.now();

      // Tokenize input
      const inputIds = this.tokenizer.tokenize(text);
      const attentionMask = new Array(inputIds.length).fill(1);
      
      console.log(`Tokenized into ${inputIds.length} tokens`);
      
      // Create tensors with BigInt64Array for int64 type
      const inputIdsTensor = new Tensor(
        'int64',
        BigInt64Array.from(inputIds.map(id => BigInt(id))),
        [1, inputIds.length]
      );
      const attentionMaskTensor = new Tensor(
        'int64',
        BigInt64Array.from(attentionMask.map(m => BigInt(m))),
        [1, attentionMask.length]
      );
      
      // Run inference
      const feeds = {
        input_ids: inputIdsTensor,
        attention_mask: attentionMaskTensor
      };
      
      console.log('Running ONNX inference...');
      const inferenceStart = Date.now();
      const results = await this.session.run(feeds);
      const inferenceTime = Date.now() - inferenceStart;
      console.log(`Inference completed in ${inferenceTime}ms`);
      
      // Get logits output
      const logits = results.logits;
      if (!logits || !logits.data) {
        throw new Error('Invalid model output');
      }
      
      // Process predictions
      const tokens = this.tokenizer.decode(inputIds);
      const entities = this.extractEntities(logits.data as Float32Array, tokens, inputIds.length);
      
      console.log(`Found ${entities.length} entities`);
      
      // Find PERSON entities
      const personEntities = entities.filter(e => 
        e.entity === 'B-PER' || e.entity === 'I-PER'
      );
      
      if (personEntities.length > 0) {
        const name = this.combinePersonEntities(personEntities);
        const elapsed = Date.now() - startTime;
        console.log(`Extracted name: "${name}" in ${elapsed}ms`);
        return name;
      }
      
      console.log('No person entities found, using regex fallback');
      return this.regexFallback(text);
      
    } catch (error) {
      console.error('ONNX extraction failed:', error);
      return this.regexFallback(text);
    }
  }
  private extractEntities(logits: Float32Array, tokens: string[], seqLen: number): Entity[] {
    const entities: Entity[] = [];
    const numLabels = 9; // Based on our LABEL_MAP
    
    // logits shape is [1, seq_len, num_labels]
    // Skip [CLS] at position 0 and [SEP] at position seqLen-1
    for (let i = 1; i < seqLen - 1; i++) {
      const startIdx = i * numLabels;
      const scores: number[] = [];
      
      // Extract scores for this token
      for (let j = 0; j < numLabels; j++) {
        scores.push(logits[startIdx + j]);
      }
      
      // Apply softmax and find max
      const expScores = scores.map(s => Math.exp(s));
      const sumExp = expScores.reduce((a, b) => a + b, 0);
      const probabilities = expScores.map(s => s / sumExp);
      
      const maxProb = Math.max(...probabilities);
      const predictedLabel = probabilities.indexOf(maxProb);
      
      // Only keep non-O (Outside) predictions
      if (predictedLabel !== 0 && maxProb > 0.5) {
        entities.push({
          word: tokens[i],
          entity: LABEL_MAP[predictedLabel],
          score: maxProb,
          index: i
        });
      }
    }
    
    return entities;
  }

  private combinePersonEntities(entities: Entity[]): string {
    if (entities.length === 0) return 'Unknown Patient';
    
    // Group consecutive person tokens
    const names: string[] = [];
    let currentName: string[] = [];
    
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      
      if (entity.entity === 'B-PER') {
        // Start of a new person
        if (currentName.length > 0) {
          names.push(this.cleanTokens(currentName));
        }
        currentName = [entity.word];
      } else if (entity.entity === 'I-PER') {
        // Continuation of person
        currentName.push(entity.word);
      }
    }
    
    // Add the last name
    if (currentName.length > 0) {
      names.push(this.cleanTokens(currentName));
    }
    
    // Return the first person name found
    if (names.length > 0) {
      return names[0];
    }
    
    return 'Unknown Patient';
  }

  private cleanTokens(tokens: string[]): string {
    // Join tokens and remove WordPiece ## markers
    let name = tokens.join(' ').replace(/##/g, '');
    
    // Capitalize first letter of each word
    name = name.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    
    return name.trim();
  }

  private regexFallback(text: string): string {
    console.log('Using regex fallback for name extraction');
    
    const patterns = [
      /(?:patient|pt\.?)\s+(?:name\s+(?:is\s+)?)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
      /(?:my name is|I'm|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /(?:this is|called|named)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        console.log(`Regex matched: "${match[1]}"`);
        return match[1].trim();
      }
    }
    
    console.log('No name found via regex');
    return 'Unknown Patient';
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const onnxService = new ONNXNERService();

