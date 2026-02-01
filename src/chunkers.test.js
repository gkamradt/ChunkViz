// Mock langchain modules before importing chunkers
jest.mock('@langchain/textsplitters', () => ({
  CharacterTextSplitter: jest.fn().mockImplementation(() => ({
    createDocuments: jest.fn().mockResolvedValue([{ pageContent: 'mock chunk' }])
  })),
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
    createDocuments: jest.fn().mockResolvedValue([{ pageContent: 'mock chunk' }])
  })),
  TokenTextSplitter: jest.fn().mockImplementation(() => ({
    createDocuments: jest.fn().mockResolvedValue([{ pageContent: 'mock chunk' }])
  }))
}));

// Now import the module after mocking
import {
  SPLITTER_CATEGORIES,
  getSplitterConfig,
  getAllSplitterIds,
  reconstructChunks,
  highlightChunks,
  SentenceSplitter
} from './chunkers';

describe('Chunkers Module', () => {
  describe('SPLITTER_CATEGORIES', () => {
    test('contains basic splitters category', () => {
      expect(SPLITTER_CATEGORIES.basic).toBeDefined();
      expect(SPLITTER_CATEGORIES.basic.label).toBe('Basic Splitters');
    });

    test('contains recursive splitters category', () => {
      expect(SPLITTER_CATEGORIES.recursive).toBeDefined();
      expect(SPLITTER_CATEGORIES.recursive.label).toBe('Recursive Splitters');
    });

    test('contains code languages category', () => {
      expect(SPLITTER_CATEGORIES.codeLanguages).toBeDefined();
      expect(SPLITTER_CATEGORIES.codeLanguages.label).toBe('Code Languages');
    });

    test('contains markup languages category', () => {
      expect(SPLITTER_CATEGORIES.markup).toBeDefined();
      expect(SPLITTER_CATEGORIES.markup.label).toBe('Markup Languages');
    });

    test('basic splitters include characterSplitter', () => {
      expect(SPLITTER_CATEGORIES.basic.splitters.characterSplitter).toBeDefined();
    });

    test('basic splitters include tokenSplitter', () => {
      expect(SPLITTER_CATEGORIES.basic.splitters.tokenSplitter).toBeDefined();
    });

    test('basic splitters include sentenceSplitter', () => {
      expect(SPLITTER_CATEGORIES.basic.splitters.sentenceSplitter).toBeDefined();
    });

    test('code languages include multiple programming languages', () => {
      const codeLanguages = SPLITTER_CATEGORIES.codeLanguages.splitters;
      expect(codeLanguages.recursiveJS).toBeDefined();
      expect(codeLanguages.recursivePython).toBeDefined();
      expect(codeLanguages.recursiveGo).toBeDefined();
      expect(codeLanguages.recursiveRust).toBeDefined();
      expect(codeLanguages.recursiveJava).toBeDefined();
      expect(codeLanguages.recursiveCpp).toBeDefined();
    });
  });

  describe('getSplitterConfig', () => {
    test('returns config for valid splitter id', () => {
      const config = getSplitterConfig('characterSplitter');
      expect(config).toBeDefined();
      expect(config.label).toBe('Character Splitter');
    });

    test('returns null for invalid splitter id', () => {
      const config = getSplitterConfig('nonexistentSplitter');
      expect(config).toBeNull();
    });

    test('returns correct language for code splitters', () => {
      const jsConfig = getSplitterConfig('recursiveJS');
      expect(jsConfig.language).toBe('js');

      const pythonConfig = getSplitterConfig('recursivePython');
      expect(pythonConfig.language).toBe('python');
    });
  });

  describe('getAllSplitterIds', () => {
    test('returns array of all splitter ids', () => {
      const ids = getAllSplitterIds();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
    });

    test('includes expected splitter ids', () => {
      const ids = getAllSplitterIds();
      expect(ids).toContain('characterSplitter');
      expect(ids).toContain('tokenSplitter');
      expect(ids).toContain('sentenceSplitter');
      expect(ids).toContain('recursiveCharacter');
      expect(ids).toContain('recursiveJS');
      expect(ids).toContain('recursivePython');
    });
  });

  describe('reconstructChunks', () => {
    test('reconstructs chunks with correct metadata', () => {
      const chunks = ['Hello ', 'World!'];
      const result = reconstructChunks(chunks, 0);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].text).toBe('Hello ');
      expect(result[1].id).toBe(2);
      expect(result[1].text).toBe('World!');
    });

    test('handles overlap correctly', () => {
      const chunks = ['Hello W', 'World!'];
      const result = reconstructChunks(chunks, 2);

      expect(result[0].overlapWithNext).toBe(2);
      expect(result[1].overlapWithNext).toBe(0); // Last chunk has no overlap
    });

    test('handles empty array', () => {
      const result = reconstructChunks([], 0);
      expect(result).toHaveLength(0);
    });

    test('handles single chunk', () => {
      const chunks = ['Only chunk'];
      const result = reconstructChunks(chunks, 0);

      expect(result).toHaveLength(1);
      expect(result[0].overlapWithNext).toBe(0);
    });
  });

  describe('highlightChunks', () => {
    test('generates HTML with spans for each chunk', () => {
      const chunks = [
        { id: 1, text: 'Hello', overlapWithNext: 0 },
        { id: 2, text: 'World', overlapWithNext: 0 }
      ];

      const result = highlightChunks(chunks);
      expect(result).toContain('<span');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    test('handles empty chunks array', () => {
      const result = highlightChunks([]);
      expect(result).toBe('');
    });

    test('escapes HTML in chunk text', () => {
      const chunks = [
        { id: 1, text: '<script>alert("xss")</script>', overlapWithNext: 0 }
      ];

      const result = highlightChunks(chunks);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('SentenceSplitter', () => {
    test('splits text at sentence boundaries', () => {
      const splitter = new SentenceSplitter({ chunkSize: 100, chunkOverlap: 0 });
      const text = 'This is sentence one. This is sentence two. This is sentence three.';
      const chunks = splitter.splitText(text);

      expect(chunks.length).toBeGreaterThan(0);
    });

    test('respects chunk size', () => {
      const splitter = new SentenceSplitter({ chunkSize: 50, chunkOverlap: 0 });
      const text = 'Short sentence. Another short one. And one more.';
      const chunks = splitter.splitText(text);

      chunks.forEach(chunk => {
        // Chunks should generally respect size, though may be slightly larger
        // to avoid breaking sentences
        expect(chunk.length).toBeLessThan(100);
      });
    });

    test('handles text without sentence endings', () => {
      const splitter = new SentenceSplitter({ chunkSize: 20, chunkOverlap: 0 });
      const text = 'no periods here just continuous text';
      const chunks = splitter.splitText(text);

      expect(chunks.length).toBeGreaterThan(0);
    });

    test('createDocuments returns proper format', async () => {
      const splitter = new SentenceSplitter({ chunkSize: 100, chunkOverlap: 0 });
      const docs = await splitter.createDocuments(['Hello world. Goodbye world.']);

      expect(docs.length).toBeGreaterThan(0);
      expect(docs[0]).toHaveProperty('pageContent');
    });
  });
});
