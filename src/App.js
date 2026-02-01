import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { defaultTexts, getDefaultText } from './defaultText.js';
import {
  SPLITTER_CATEGORIES,
  getSplitterConfig,
  chunkText,
  reconstructChunks,
  highlightChunks
} from './chunkers.js';

const MAX_TEXT_LENGTH = 100000;

function App() {
  const [text, setText] = useState(defaultTexts.prose);
  const [chunkSize, setChunkSize] = useState(200);
  const [overlap, setOverlap] = useState(0);
  const [highlightedText, setHighlightedText] = useState('');
  const [splitter, setSplitter] = useState('characterSplitter');
  const [rawChunks, setRawChunks] = useState([]);
  const [maxOverlap, setMaxOverlap] = useState(90);

  // Update max overlap when chunk size changes
  useEffect(() => {
    const newMaxOverlap = Math.floor(chunkSize * 0.45);
    setMaxOverlap(newMaxOverlap);
    if (overlap > newMaxOverlap) {
      setOverlap(newMaxOverlap);
    }
  }, [chunkSize, overlap]);

  // Update default text when splitter changes
  useEffect(() => {
    const config = getSplitterConfig(splitter);
    if (!config) return;

    const currentDefaultTexts = Object.values(defaultTexts);
    if (currentDefaultTexts.includes(text)) {
      setText(getDefaultText(config.defaultTextKey));
    }
  }, [splitter, text]);

  const handleTextChange = (event) => {
    let newText = event.target.value;
    if (newText.length > MAX_TEXT_LENGTH) {
      alert(`Error: Text cannot be longer than ${MAX_TEXT_LENGTH} characters. It will be trimmed.`);
      newText = newText.substring(0, MAX_TEXT_LENGTH);
    }
    setText(newText);
  };

  const handleChunkSizeChange = (event) => {
    const newChunkSize = Number(event.target.value);
    if (newChunkSize > overlap * 2) {
      setChunkSize(newChunkSize);
    }
  };

  const handleOverlapChange = (event) => {
    const newOverlap = Number(event.target.value);
    if (newOverlap <= chunkSize * 0.5) {
      setOverlap(newOverlap);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target.result);
      reader.readAsText(file);
    }
  };

  const renderTextWithHighlights = useCallback(async () => {
    const chunks = await chunkText(text, splitter, chunkSize, overlap);
    setRawChunks(chunks);
    const reconstructedChunks = reconstructChunks(chunks, overlap);
    return highlightChunks(reconstructedChunks);
  }, [text, chunkSize, overlap, splitter]);

  useEffect(() => {
    (async () => {
      const result = await renderTextWithHighlights();
      setHighlightedText(result);
    })();
  }, [renderTextWithHighlights]);

  const config = getSplitterConfig(splitter);
  const supportsOverlap = config?.supportsOverlap ?? true;

  const chunks = rawChunks || [];
  const totalChars = chunks.reduce((a, b) => a + b.length, 0);
  const avgChunkSize = chunks.length > 0
    ? (totalChars / chunks.length).toFixed(1)
    : '0';

  return (
    <div className="App">
      <h1>ChunkViz v0.2</h1>
      <p>
        Want to learn more about AI Engineering Patterns? Join me on{' '}
        <a href="https://x.com/GregKamradt" target="_blank" rel="noopener noreferrer">Twitter</a>
        {' '}or{' '}
        <a href="https://mail.gregkamradt.com/signup" target="_blank" rel="noopener noreferrer">Newsletter</a>.
      </p>
      <hr style={{ width: '50%', margin: 'auto' }} />
      <p>Language Models do better when they're focused.</p>
      <p>One strategy is to pass a relevant subset (chunk) of your full data. There are many ways to chunk text.</p>
      <p>This is a tool to understand different chunking/splitting strategies.</p>
      <p><a href='#explanation'>Explain like I'm 5...</a></p>

      <div className='textArea'>
        <textarea value={text} onChange={handleTextChange} rows={10} cols={50} />
        <div className='uploadButtonArea'>
          <label htmlFor="file-upload" className="custom-file-upload">
            <span style={{ borderRadius: '5px', padding: '5px', fontSize: '12px', backgroundColor: '#d1dcff' }}>
              Upload .txt
            </span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div>
        <div className="splitter-selector">
          <label>
            Splitter:
            <select value={splitter} onChange={(e) => setSplitter(e.target.value)}>
              {Object.entries(SPLITTER_CATEGORIES).map(([categoryKey, category]) => (
                <optgroup key={categoryKey} label={category.label}>
                  {Object.entries(category.splitters).map(([splitterKey, splitterConfig]) => (
                    <option key={splitterKey} value={splitterKey}>
                      {splitterConfig.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          {config?.description && (
            <span className="splitter-description"> - {config.description}</span>
          )}
        </div>

        <div className="slider-container">
          <label>
            <span style={{ display: 'inline-block', paddingRight: '10px' }}>Chunk Size:</span>
            <input
              type="number"
              min="1"
              max="2000"
              value={chunkSize}
              style={{ width: '50px' }}
              onChange={handleChunkSizeChange}
            />
            <input
              type="range"
              min="1"
              max="2000"
              value={chunkSize}
              onChange={handleChunkSizeChange}
            />
          </label>
        </div>

        <div className="slider-container">
          <label style={{ opacity: supportsOverlap ? 1 : 0.5 }}>
            <span style={{ display: 'inline-block', paddingRight: '10px' }}>Chunk Overlap:</span>
            <input
              type="number"
              min="0"
              max={maxOverlap}
              value={overlap}
              style={{ width: '50px' }}
              onChange={handleOverlapChange}
              disabled={!supportsOverlap}
            />
            <input
              type="range"
              min="0"
              max={maxOverlap}
              value={overlap}
              onChange={handleOverlapChange}
              disabled={!supportsOverlap}
            />
          </label>
        </div>

        <div className="stats">
          <div>Total Characters: {totalChars}</div>
          <div>Number of chunks: {chunks.length}</div>
          <div>Average chunk size: {avgChunkSize}</div>
        </div>
      </div>

      <div className="chunked-text">
        <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
      </div>

      <hr style={{ width: '75%', marginTop: '15px' }} />

      <div id='info_box'>
        <h3 id="explanation">What's going on here?</h3>
        <p>
          Language Models have context windows. This is the length of text that they can process in a single pass.
          <br />
          Although context lengths are getting larger, it has been shown that language models increase performance
          on tasks when they are given less (but more relevant) information.
        </p>
        <p>
          But which relevant subset of data do you pick? This is easy when a human is doing it by hand,
          but turns out it is difficult to instruct a computer to do this.
        </p>
        <p>
          One common way to do this is by chunking, or subsetting, your large data into smaller pieces.
          In order to do this you need to pick a chunk strategy.
        </p>
        <p>Pick different chunking strategies above to see how they impact the text, add your own text if you'd like.</p>
        <p>
          You'll see different colors that represent different chunks.{' '}
          <span style={{ background: "#ff70a6" }}>This could be chunk 1. </span>
          <span style={{ background: "#70d6ff" }}>This could be chunk 2, </span>
          <span style={{ background: "#e9ff70" }}>sometimes a chunk will change i</span>
          <span style={{ background: "#ffd670" }}>n the middle of a sentence (this isn't great). </span>
          <span style={{ background: "#ff9770" }}>If any chunks have overlapping text, those will appear in green.</span>
        </p>

        <h4>Available Splitter Types</h4>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li><b>Character Splitter</b>: Splits text by character count</li>
          <li><b>Token Splitter</b>: Splits by token count (using tiktoken tokenizer)</li>
          <li><b>Sentence Splitter</b>: Respects sentence boundaries when splitting</li>
          <li><b>Recursive Character</b>: Recursively splits using multiple separators</li>
          <li><b>Language-specific</b>: Optimized for code in various programming languages</li>
        </ul>

        <p><b>Chunk Size</b>: The target length (in characters or tokens) of your chunks</p>
        <p><b>Chunk Overlap (Green)</b>: The amount of overlap between sequential chunks</p>
        <p>
          <b>Notes:</b> *Some splitters trim whitespace which may cause text to appear differently.
          *Overlap is locked at &lt;50% of chunk size.
        </p>
        <p>
          For implementations of text splitters, view LangChain (
          <a href="https://python.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/character_text_splitter" target="_blank" rel="noopener noreferrer">py</a>,{' '}
          <a href="https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/character_text_splitter" target="_blank" rel="noopener noreferrer">js</a>
          ) & Llama Index (
          <a href="https://docs.llamaindex.ai/en/stable/api/llama_index.node_parser.SentenceSplitter.html#llama_index.node_parser.SentenceSplitter" target="_blank" rel="noopener noreferrer">py</a>,{' '}
          <a href="https://ts.llamaindex.ai/modules/low_level/node_parser" target="_blank" rel="noopener noreferrer">js</a>
          )
        </p>
        <p>
          MIT License,{' '}
          <a href="https://github.com/gkamradt/ChunkViz" target="_blank" rel="noopener noreferrer">Open Sourced</a>,
          PRs Welcome
        </p>
        <p>Made with love by <a href="https://twitter.com/GregKamradt" target="_blank" rel="noopener noreferrer">Greg Kamradt</a></p>
      </div>
    </div>
  );
}

export default App;
