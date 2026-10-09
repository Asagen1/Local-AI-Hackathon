import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

interface TokenizerConfig {
  version: string;
  truncation: {
    max_length: number;
  };
  added_tokens: Array<{
    id: number;
    content: string;
  }>;
  model?: {
    vocab?: Record<string, number>;
  };
}

export class WordPieceTokenizer {
  private vocab: Map<string, number> = new Map();
  private idToToken: Map<number, string> = new Map();
  private readonly CLS_TOKEN = '[CLS]';
  private readonly SEP_TOKEN = '[SEP]';
  private readonly PAD_TOKEN = '[PAD]';
  private readonly UNK_TOKEN = '[UNK]';
  private unkTokenId = 100;
  private clsTokenId = 101;
  private sepTokenId = 102;

  async loadVocab() {
    try {
      console.log('Loading tokenizer...');
      const tokenizerAsset = Asset.fromModule(require('../../../assets/models/tokenizer.json'));
      await tokenizerAsset.downloadAsync();
      
      if (!tokenizerAsset.localUri) {
        throw new Error('Failed to load tokenizer asset');
      }
      
      const tokenizerText = await FileSystem.readAsStringAsync(tokenizerAsset.localUri);
      const tokenizerConfig: TokenizerConfig = JSON.parse(tokenizerText);
      
      // Build vocab from tokenizer config
      // The tokenizer.json contains the vocab in the model section
      if (tokenizerConfig.model && 'vocab' in tokenizerConfig.model) {
        const vocabObj = tokenizerConfig.model.vocab as Record<string, number>;
        Object.entries(vocabObj).forEach(([token, id]) => {
          this.vocab.set(token, id);
          this.idToToken.set(id, token);
        });
      } else {
        // If vocab is not in model, try to extract from the file structure
        // Tokenizer.json sometimes has vocab as a separate field
        const tokenizerData = JSON.parse(tokenizerText);
        if (tokenizerData.vocab) {
          Object.entries(tokenizerData.vocab).forEach(([token, id]) => {
            this.vocab.set(token, id as number);
            this.idToToken.set(id as number, token);
          });
        }
      }
      
      console.log(`Loaded tokenizer with ${this.vocab.size} tokens`);
      
      // Verify special tokens
      if (!this.vocab.has(this.UNK_TOKEN)) {
        console.warn('UNK token not found in vocab');
      }
      
    } catch (error) {
      console.error('Failed to load tokenizer:', error);
      throw error;
    }
  }

  tokenize(text: string): number[] {
    const tokens = [this.CLS_TOKEN];
    
    // Simple whitespace tokenization + WordPiece
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    for (const word of words) {
      const wordTokens = this.tokenizeWord(word.toLowerCase());
      tokens.push(...wordTokens);
    }
    
    tokens.push(this.SEP_TOKEN);
    
    // Convert tokens to IDs
    return tokens.map(token => this.vocab.get(token) ?? this.unkTokenId);
  }

  private tokenizeWord(word: string): string[] {
    // Check if the whole word is in vocab
    if (this.vocab.has(word)) {
      return [word];
    }

    const tokens: string[] = [];
    let start = 0;
    
    while (start < word.length) {
      let end = word.length;
      let found = false;
      
      // Try to find the longest matching subword
      while (start < end) {
        let substr = word.substring(start, end);
        
        // Add ## prefix for subwords (not at start of word)
        if (start > 0) {
          substr = '##' + substr;
        }
        
        if (this.vocab.has(substr)) {
          tokens.push(substr);
          found = true;
          start = end;
          break;
        }
        end--;
      }
      
      if (!found) {
        // If no subword found, use UNK token
        tokens.push(this.UNK_TOKEN);
        break;
      }
    }
    
    return tokens;
  }

  decode(ids: number[]): string[] {
    return ids.map(id => this.idToToken.get(id) ?? this.UNK_TOKEN);
  }

  getVocabSize(): number {
    return this.vocab.size;
  }
}
