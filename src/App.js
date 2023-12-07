import React, { useState, useEffect } from 'react';
import './App.css';
import defaultText from './defaultText.js';

function App() {
  const [text, setText] = useState(defaultText);
  const [chunkSize, setChunkSize] = useState(10);
  const [chunkCount, setChunkCount] = useState(0);
  const [averageSize, setAverageSize] = useState(0);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSliderChange = (event) => {
    setChunkSize(Number(event.target.value));
  };

  const simpleCharacterSplitter = ({ text, parameters }) => {
    const [chunkSize] = parameters;
    let result = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.substring(i, i + chunkSize);
      result.push(chunk);
    }
    return result;
  };

  useEffect(() => {
    let totalSize = 0;
    let count = 0;
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.substring(i, i + chunkSize);
      totalSize += chunk.length;
      count++;
    }
    setChunkCount(count);
    setAverageSize(count > 0 ? totalSize / count : 0);
  }, [text, chunkSize]);

  const getChunkedText = () => {
    let result = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.substring(i, i + chunkSize);
      const key = `chunk-${i}`;
      const style = { backgroundColor: `hsl(${(i/chunkSize) * 60}, 70%, 80%)` };
      result.push(<span key={key} style={style}>{chunk}</span>);
    }
    return result;
  };

  return (
    <div className="App">
      <h1>chunk viz v0.1</h1>
      <textarea value={text} onChange={handleTextChange} rows={10} cols={50} />
      <div>
        <label>
          Chunk Size: {chunkSize}
          <input type="range" min="1" max="500" value={chunkSize} onChange={handleSliderChange} />
        </label>
      </div>
      <div>
        Number of Chunks: {chunkCount}, Average Size: {averageSize.toFixed(0)}
      </div>
      <div className="chunked-text">
        {getChunkedText()}
      </div>
    </div>
  );
}

export default App;