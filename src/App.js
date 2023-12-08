import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import { defaultProse, defaultJS, defaultPython, defaultMarkdown } from './defaultText.js';
import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from "langchain/text_splitter";

class RecursiveCharacterTextSplitter_ext extends RecursiveCharacterTextSplitter {
  joinDocs(docs, separator) {
    // LangChain trims chunks, we don't want that for visuals!
    return docs.join(separator);
  }
}

class CharacterTextSplitter_ext extends CharacterTextSplitter {
  joinDocs(docs, separator) {
    // LangChain trims chunks, we don't want that for visuals!
    return docs.join(separator);
  }
}

const highlightChunks = (chunks) => {
  let highlightedText = '';
  const colors = ['#70d6ff', '#e9ff70', '#ff9770', '#ffd670', '#ff70a6'];

  console.log("Processed Chunks", chunks);
  chunks.forEach((chunk, index) => {
    let uniquePart, overlapPart;

    if (index === 0) {
      uniquePart = chunk.text.slice(0, chunk.text.length - chunk.overlapWithNext);
      overlapPart = chunk.text.slice(chunk.text.length - chunk.overlapWithNext);
    } else if (index !== chunks.length - 1) {
      uniquePart = chunk.text.slice(chunk.overlapWithNext, chunk.text.length - chunk.overlapWithNext);
      overlapPart = chunk.text.slice(chunk.text.length - chunk.overlapWithNext, chunk.text.overlapWithNext);
    } else { // It's the last chunk
      uniquePart = chunk.text.slice(chunk.overlapWithNext);
      overlapPart = ''; // There's no overlap with the next chunk
    }

    // Generate a pseudo-random color for each unique part using HSL
    const color = colors[index % colors.length];

    const highlightedChunk = `<span style="background: ${color}">${uniquePart}</span>`;
    highlightedText += highlightedChunk;

    // Add overlap part only if it's not the last chunk
    if (overlapPart) {
      highlightedText += `<span class="overlap">${overlapPart}</span>`;
    }
  });
  return highlightedText;
};

function App() {
  const [text, setText] = useState(defaultProse);
  const [chunkSize, setChunkSize] = useState(25);
  const [overlap, setOverlap] = useState(4);
  const [highlightedText, setHighlightedText] = useState('');
  const [splitter, setSplitter] = useState('characterSplitter');
  const [rawChunks, setRawChunks] = useState([]);

  const MAX_TEXT_LENGTH = 100000; // Define your maximum text length

  const splitterOptions = useMemo(() => ({
    'characterSplitter': {
      label: 'Character Splitter 🦜️🔗',
      language: null,
      chunk_overlap_ind: true,
      defaultText: defaultProse
    },
    'recursiveCharacterTextSplitter': {
      label: 'Recursive Character Text Splitter 🦜️🔗',
      language: null,
      chunk_overlap_ind: false,
      defaultText: defaultProse
    },
    'recursiveCharacterTextSplitterJS': {
      label: 'Recursive Character Text Splitter - JS 🦜️🔗',
      language: 'js',
      chunk_overlap_ind: false,
      defaultText: defaultJS
    },
    'recursiveCharacterTextSplitterPython': {
      label: 'Recursive Character Text Splitter - Python 🦜️🔗',
      language: 'python',
      chunk_overlap_ind: false,
      defaultText: defaultPython
    },
    'recursiveCharacterTextSplitterMarkdown': {
      label: 'Recursive Character Text Splitter - Markdown 🦜️🔗',
      language: 'markdown',
      chunk_overlap_ind: false,
      defaultText: defaultMarkdown
    },
  }), []);

  useEffect(() => {
    if (!splitterOptions[splitter].chunk_overlap_ind) {
      setOverlap(0);
    }

    // Get all default texts
    const defaultTexts = Object.values(splitterOptions).map(option => option.defaultText) || [];

    // Check if the current text is blank or a default text
    if (text === '' || defaultTexts.includes(text)) {
      setText(splitterOptions[splitter].defaultText); // Set the default text for the selected splitter
    }
  }, [splitter, text, splitterOptions]);

  const handleTextChange = (event) => {
    let newText = event.target.value;
    if (newText.length > MAX_TEXT_LENGTH) {
      alert(`Error: Text cannot be longer than ${MAX_TEXT_LENGTH} characters. It will be trimmed to fit the limit.`);
      newText = newText.substring(0, MAX_TEXT_LENGTH);
    }
    setText(newText);
  };

  const handleChunkSizeChange = (event) => {
    let newChunkSize = Number(event.target.value);
    if (newChunkSize > overlap * 2) {
      setChunkSize(newChunkSize);
    }
  };

  const handleOverlapChange = (event) => {
    let newOverlap = Number(event.target.value);
    if (newOverlap <= chunkSize * 0.5) {
      setOverlap(newOverlap);
    }
  };

  const reconstructChunks = (chunks, chunkOverlap) => {
    let reconstructedText = [];
    let chunkData = [];
    let currentStartIndex = 0;

    chunks.forEach((chunk, index) => {
      const isLastChunk = index === chunks.length - 1;
      const startIndex = currentStartIndex; // Adjusted start index
      const endIndex = startIndex + chunk.length; // Adjusted end index

      reconstructedText.push(chunk);
      chunkData.push({
        id: index + 1,
        startIndex: startIndex,
        endIndex: endIndex,
        text: chunk,
        overlapWithNext: chunkOverlap
      });

      currentStartIndex = endIndex - (isLastChunk ? 0 : chunkOverlap); // Adjusted current start index
    });


    return chunkData;
  };

  const chunkTextSimple = async (text, chunkSize, overlap) => {
    const splitter = new CharacterTextSplitter_ext({
      separator: "",
      chunkSize: chunkSize,
      chunkOverlap: overlap,
      keepSeparator: true
    });

    const documents = await splitter.createDocuments([text]);

    let chunks = []
    for (let document of documents) {
      chunks.push(document.pageContent);
    }
    return chunks || []; // Ensure that an array is returned
  };

  const chunkTextRecursive = async (text, chunkSize, overlap, language) => {
    let splitter;
    if (language) {
      splitter = RecursiveCharacterTextSplitter_ext.fromLanguage(language, {
        chunkSize: chunkSize,
        chunkOverlap: overlap,
        keepSeparator: true
      });
    } else {
      console.log("regular recurssive", chunkSize, overlap)
      splitter = new RecursiveCharacterTextSplitter_ext({
        chunkSize: chunkSize,
        chunkOverlap: overlap,
        keepSeparator: true
      });
    }

    const documents = await splitter.createDocuments([text]);

    let chunks = []
    for (let document of documents) {
      chunks.push(document.pageContent);
    }
    return chunks;
  };

  const renderTextWithHighlights = useCallback(async () => {
    let rawChunks;
    const language = splitterOptions[splitter].language;
    if (splitter.startsWith('characterSplitter')) {
      rawChunks = await chunkTextSimple(text, chunkSize, overlap);
    } else {
      rawChunks = await chunkTextRecursive(text, chunkSize, overlap, language);
    }
    console.log("Raw Chunks From LangChain", rawChunks)
    setRawChunks(rawChunks); // Set the state variable
    const reconstructedChunks = reconstructChunks(rawChunks, overlap);
    const highlightedText = highlightChunks(reconstructedChunks);
    return highlightedText;
  }, [text, chunkSize, overlap, splitter, splitterOptions]);

  useEffect(() => {
    (async () => {
      const result = await renderTextWithHighlights();
      setHighlightedText(result);
    })();
  }, [renderTextWithHighlights]);

  console.log(chunkSize)

  return (
    <div className="App">
      <h1>ChunkViz v0.1</h1>
      <p>This is an exploratory tool to visualize how common text splitters work</p>
      <p>For implementations of text splitters, view LangChain (py, js) & Llama Index (py, js)</p>
      <textarea value={text} onChange={handleTextChange} rows={10} cols={50} />
      <div>
        <div>
          <label>
            Splitter:
            <select value={splitter} onChange={(e) => setSplitter(e.target.value)}>
              {Object.entries(splitterOptions).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Chunk Size {chunkSize}:
          <input type="range" min="1" max="2000" value={chunkSize} onChange={handleChunkSizeChange} />
        </label>
        <label>
          Overlap {overlap}:
          <input type="range" min="0" max="200" value={overlap} onChange={handleOverlapChange} disabled={!splitterOptions[splitter].chunk_overlap_ind} />
        </label>
        <div>
          Total Characters: {rawChunks.reduce((a, b) => a + b.length, 0)}
        </div>
        <div>
          Number of chunks: {rawChunks.length}
        </div>
        <div>
          Average chunk size: {(rawChunks.reduce((a, b) => a + b.length, 0) / rawChunks.length).toFixed(1)}
        </div>
      </div>
      <div className="chunked-text">
        <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
      </div>
      <p>Made with ❤️ by <a href="https://twitter.com/GregKamradt" target="_blank" rel="noopener noreferrer">Greg Kamradt</a></p>
      <p><a href="https://github.com/gkamradt" target="_blank" rel="noopener noreferrer">PRs Welcome</a></p>
    </div>
  );
}

export default App;
