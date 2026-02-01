/**
 * Chunkers utility module
 * Contains all text splitting/chunking implementations for ChunkViz
 */

import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
  TokenTextSplitter
} from "@langchain/textsplitters";

// Extended splitters that preserve whitespace for visualization
class RecursiveCharacterTextSplitterExt extends RecursiveCharacterTextSplitter {
  joinDocs(docs, separator) {
    return docs.join(separator);
  }
}

class CharacterTextSplitterExt extends CharacterTextSplitter {
  joinDocs(docs, separator) {
    return docs.join(separator);
  }
}

class TokenTextSplitterExt extends TokenTextSplitter {
  joinDocs(docs, separator) {
    return docs.join(separator);
  }
}

/**
 * Simple sentence splitter that respects sentence boundaries
 * Uses regex to detect sentence endings (. ! ?) followed by space or newline
 */
class SentenceSplitter {
  constructor({ chunkSize = 1000, chunkOverlap = 0 }) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  splitText(text) {
    // Split on sentence boundaries while keeping the delimiter
    const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])\s*\n+/g;
    const sentences = text.split(sentenceRegex).filter(s => s.length > 0);

    const chunks = [];
    let currentChunk = '';
    let overlapBuffer = [];

    for (const sentence of sentences) {
      // If adding this sentence would exceed chunk size
      if (currentChunk.length + sentence.length > this.chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk);

        // Calculate overlap from previous sentences
        if (this.chunkOverlap > 0) {
          let overlapText = '';
          for (let i = overlapBuffer.length - 1; i >= 0; i--) {
            if (overlapText.length + overlapBuffer[i].length <= this.chunkOverlap) {
              overlapText = overlapBuffer[i] + overlapText;
            } else {
              break;
            }
          }
          currentChunk = overlapText + sentence;
        } else {
          currentChunk = sentence;
        }
        overlapBuffer = [sentence];
      } else {
        currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
        overlapBuffer.push(sentence);

        // Keep overlap buffer limited
        while (overlapBuffer.join(' ').length > this.chunkOverlap * 2 && overlapBuffer.length > 1) {
          overlapBuffer.shift();
        }
      }
    }

    // Don't forget the last chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  async createDocuments(texts) {
    const allChunks = [];
    for (const text of texts) {
      const chunks = this.splitText(text);
      for (const chunk of chunks) {
        allChunks.push({ pageContent: chunk });
      }
    }
    return allChunks;
  }
}

/**
 * Splitter types and their configurations
 */
export const SPLITTER_CATEGORIES = {
  basic: {
    label: 'Basic Splitters',
    splitters: {
      characterSplitter: {
        label: 'Character Splitter',
        description: 'Splits text by character count',
        supportsOverlap: true,
        language: null,
        defaultTextKey: 'prose'
      },
      tokenSplitter: {
        label: 'Token Splitter',
        description: 'Splits text by token count (tiktoken)',
        supportsOverlap: true,
        language: null,
        defaultTextKey: 'prose'
      },
      sentenceSplitter: {
        label: 'Sentence Splitter',
        description: 'Splits text at sentence boundaries',
        supportsOverlap: true,
        language: null,
        defaultTextKey: 'prose'
      }
    }
  },
  recursive: {
    label: 'Recursive Splitters',
    splitters: {
      recursiveCharacter: {
        label: 'Recursive Character',
        description: 'Recursively splits using multiple separators',
        supportsOverlap: true,
        language: null,
        defaultTextKey: 'prose'
      }
    }
  },
  codeLanguages: {
    label: 'Code Languages',
    splitters: {
      recursiveJS: {
        label: 'JavaScript',
        description: 'Optimized for JavaScript/TypeScript',
        supportsOverlap: true,
        language: 'js',
        defaultTextKey: 'javascript'
      },
      recursivePython: {
        label: 'Python',
        description: 'Optimized for Python',
        supportsOverlap: true,
        language: 'python',
        defaultTextKey: 'python'
      },
      recursiveGo: {
        label: 'Go',
        description: 'Optimized for Go',
        supportsOverlap: true,
        language: 'go',
        defaultTextKey: 'go'
      },
      recursiveRust: {
        label: 'Rust',
        description: 'Optimized for Rust',
        supportsOverlap: true,
        language: 'rust',
        defaultTextKey: 'rust'
      },
      recursiveJava: {
        label: 'Java',
        description: 'Optimized for Java',
        supportsOverlap: true,
        language: 'java',
        defaultTextKey: 'java'
      },
      recursiveCpp: {
        label: 'C++',
        description: 'Optimized for C++',
        supportsOverlap: true,
        language: 'cpp',
        defaultTextKey: 'cpp'
      },
      recursivePhp: {
        label: 'PHP',
        description: 'Optimized for PHP',
        supportsOverlap: true,
        language: 'php',
        defaultTextKey: 'php'
      },
      recursiveRuby: {
        label: 'Ruby',
        description: 'Optimized for Ruby',
        supportsOverlap: true,
        language: 'ruby',
        defaultTextKey: 'ruby'
      },
      recursiveScala: {
        label: 'Scala',
        description: 'Optimized for Scala',
        supportsOverlap: true,
        language: 'scala',
        defaultTextKey: 'scala'
      },
      recursiveSwift: {
        label: 'Swift',
        description: 'Optimized for Swift',
        supportsOverlap: true,
        language: 'swift',
        defaultTextKey: 'swift'
      }
    }
  },
  markup: {
    label: 'Markup Languages',
    splitters: {
      recursiveMarkdown: {
        label: 'Markdown',
        description: 'Optimized for Markdown documents',
        supportsOverlap: true,
        language: 'markdown',
        defaultTextKey: 'markdown'
      },
      recursiveHtml: {
        label: 'HTML',
        description: 'Optimized for HTML documents',
        supportsOverlap: true,
        language: 'html',
        defaultTextKey: 'html'
      },
      recursiveLatex: {
        label: 'LaTeX',
        description: 'Optimized for LaTeX documents',
        supportsOverlap: true,
        language: 'latex',
        defaultTextKey: 'latex'
      }
    }
  }
};

/**
 * Get a flat map of all splitter configurations
 */
export function getSplitterConfig(splitterId) {
  for (const category of Object.values(SPLITTER_CATEGORIES)) {
    if (category.splitters[splitterId]) {
      return category.splitters[splitterId];
    }
  }
  return null;
}

/**
 * Get all splitter IDs as a flat array
 */
export function getAllSplitterIds() {
  const ids = [];
  for (const category of Object.values(SPLITTER_CATEGORIES)) {
    ids.push(...Object.keys(category.splitters));
  }
  return ids;
}

/**
 * Main chunking function
 * @param {string} text - Text to chunk
 * @param {string} splitterId - ID of the splitter to use
 * @param {number} chunkSize - Size of each chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {Promise<string[]>} Array of chunk strings
 */
export async function chunkText(text, splitterId, chunkSize, overlap) {
  if (!text) {
    return [];
  }

  const config = getSplitterConfig(splitterId);
  if (!config) {
    console.warn(`Unknown splitter: ${splitterId}, falling back to character splitter`);
    return chunkWithCharacterSplitter(text, chunkSize, overlap);
  }

  // Route to appropriate chunking function
  if (splitterId === 'characterSplitter') {
    return chunkWithCharacterSplitter(text, chunkSize, overlap);
  } else if (splitterId === 'tokenSplitter') {
    return chunkWithTokenSplitter(text, chunkSize, overlap);
  } else if (splitterId === 'sentenceSplitter') {
    return chunkWithSentenceSplitter(text, chunkSize, overlap);
  } else if (splitterId === 'recursiveCharacter' || config.language) {
    return chunkWithRecursiveSplitter(text, chunkSize, overlap, config.language);
  }

  // Fallback
  return chunkWithCharacterSplitter(text, chunkSize, overlap);
}

async function chunkWithCharacterSplitter(text, chunkSize, overlap) {
  const splitter = new CharacterTextSplitterExt({
    separator: "",
    chunkSize,
    chunkOverlap: overlap,
    keepSeparator: true
  });

  const documents = await splitter.createDocuments([text]);
  return documents.map(doc => doc.pageContent);
}

async function chunkWithTokenSplitter(text, chunkSize, overlap) {
  try {
    const splitter = new TokenTextSplitterExt({
      chunkSize,
      chunkOverlap: overlap
    });

    const documents = await splitter.createDocuments([text]);
    return documents.map(doc => doc.pageContent);
  } catch (error) {
    console.warn('Token splitter failed, falling back to character splitter:', error);
    return chunkWithCharacterSplitter(text, chunkSize, overlap);
  }
}

async function chunkWithSentenceSplitter(text, chunkSize, overlap) {
  const splitter = new SentenceSplitter({
    chunkSize,
    chunkOverlap: overlap
  });

  const documents = await splitter.createDocuments([text]);
  return documents.map(doc => doc.pageContent);
}

async function chunkWithRecursiveSplitter(text, chunkSize, overlap, language) {
  let splitter;

  if (language) {
    try {
      splitter = RecursiveCharacterTextSplitterExt.fromLanguage(language, {
        chunkSize,
        chunkOverlap: overlap,
        keepSeparator: true
      });
    } catch (error) {
      console.warn(`Language '${language}' not supported, using generic recursive splitter:`, error);
      splitter = new RecursiveCharacterTextSplitterExt({
        chunkSize,
        chunkOverlap: overlap,
        keepSeparator: true
      });
    }
  } else {
    splitter = new RecursiveCharacterTextSplitterExt({
      chunkSize,
      chunkOverlap: overlap,
      keepSeparator: true
    });
  }

  const documents = await splitter.createDocuments([text]);
  return documents.map(doc => doc.pageContent);
}

/**
 * Reconstruct chunks with overlap metadata for visualization
 * @param {string[]} chunks - Array of chunk strings
 * @param {number} chunkOverlap - Overlap size
 * @returns {Array} Chunk data with metadata
 */
export function reconstructChunks(chunks, chunkOverlap) {
  const chunkData = [];
  let currentStartIndex = 0;

  chunks.forEach((chunk, index) => {
    const isLastChunk = index === chunks.length - 1;
    const startIndex = currentStartIndex;
    const endIndex = startIndex + chunk.length;

    chunkData.push({
      id: index + 1,
      startIndex,
      endIndex,
      text: chunk,
      overlapWithNext: isLastChunk ? 0 : chunkOverlap
    });

    currentStartIndex = endIndex - (isLastChunk ? 0 : chunkOverlap);
  });

  return chunkData;
}

/**
 * Generate highlighted HTML from chunks for visualization
 * @param {Array} chunks - Chunk data with metadata
 * @returns {string} HTML string with highlighted chunks
 */
export function highlightChunks(chunks) {
  let highlightedText = '';
  const colors = ['#70d6ff', '#e9ff70', '#ff9770', '#ffd670', '#ff70a6'];

  chunks.forEach((chunk, index) => {
    let uniquePart, overlapPart;

    if (index === 0) {
      uniquePart = chunk.text.slice(0, chunk.text.length - chunk.overlapWithNext);
      overlapPart = chunk.text.slice(chunk.text.length - chunk.overlapWithNext);
    } else if (index !== chunks.length - 1) {
      const prevOverlap = chunks[index - 1].overlapWithNext;
      uniquePart = chunk.text.slice(prevOverlap, chunk.text.length - chunk.overlapWithNext);
      overlapPart = chunk.text.slice(chunk.text.length - chunk.overlapWithNext);
    } else {
      const prevOverlap = chunks[index - 1]?.overlapWithNext || 0;
      uniquePart = chunk.text.slice(prevOverlap);
      overlapPart = '';
    }

    const color = colors[index % colors.length];
    const highlightedChunk = `<span style="background: ${color}">${escapeHtml(uniquePart)}</span>`;
    highlightedText += highlightedChunk;

    if (overlapPart) {
      highlightedText += `<span class="overlap">${escapeHtml(overlapPart)}</span>`;
    }
  });

  return highlightedText;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export { SentenceSplitter };
