import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

// Mock the chunkers module to avoid issues with langchain in tests
jest.mock('./chunkers.js', () => ({
  SPLITTER_CATEGORIES: {
    basic: {
      label: 'Basic Splitters',
      splitters: {
        characterSplitter: {
          label: 'Character Splitter',
          description: 'Splits text by character count',
          supportsOverlap: true,
          language: null,
          defaultTextKey: 'prose'
        }
      }
    }
  },
  getSplitterConfig: jest.fn((id) => ({
    label: 'Character Splitter',
    description: 'Splits text by character count',
    supportsOverlap: true,
    language: null,
    defaultTextKey: 'prose'
  })),
  chunkText: jest.fn().mockResolvedValue(['chunk1', 'chunk2']),
  reconstructChunks: jest.fn((chunks) => {
    return (chunks || []).map((chunk, index) => ({
      id: index + 1,
      startIndex: index * 10,
      endIndex: (index + 1) * 10,
      text: chunk,
      overlapWithNext: 0
    }));
  }),
  highlightChunks: jest.fn((chunks) => {
    return (chunks || []).map(chunk => `<span>${chunk.text}</span>`).join('');
  })
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ChunkViz title', async () => {
    await act(async () => {
      render(<App />);
    });
    const titleElement = screen.getByText(/ChunkViz/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders textarea for text input', async () => {
    await act(async () => {
      render(<App />);
    });
    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement).toBeInTheDocument();
  });

  test('renders chunk size slider', async () => {
    await act(async () => {
      render(<App />);
    });
    const chunkSizeLabels = screen.getAllByText(/Chunk Size:/i);
    expect(chunkSizeLabels.length).toBeGreaterThan(0);
  });

  test('renders chunk overlap slider', async () => {
    await act(async () => {
      render(<App />);
    });
    const overlapLabel = screen.getByText(/Chunk Overlap:/i);
    expect(overlapLabel).toBeInTheDocument();
  });

  test('renders splitter selector', async () => {
    await act(async () => {
      render(<App />);
    });
    const splitterLabel = screen.getByText(/Splitter:/i);
    expect(splitterLabel).toBeInTheDocument();
  });

  test('renders explanation section', async () => {
    await act(async () => {
      render(<App />);
    });
    const explanationLink = screen.getByText(/Explain like I'm 5/i);
    expect(explanationLink).toBeInTheDocument();
  });

  test('renders file upload button', async () => {
    await act(async () => {
      render(<App />);
    });
    const uploadButton = screen.getByText(/Upload .txt/i);
    expect(uploadButton).toBeInTheDocument();
  });

  test('displays statistics', async () => {
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Total Characters:/i)).toBeInTheDocument();
      expect(screen.getByText(/Number of chunks:/i)).toBeInTheDocument();
      expect(screen.getByText(/Average chunk size:/i)).toBeInTheDocument();
    });
  });

  test('textarea accepts user input', async () => {
    await act(async () => {
      render(<App />);
    });
    const textareaElement = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(textareaElement, { target: { value: 'Test input text' } });
    });
    expect(textareaElement.value).toBe('Test input text');
  });

  test('chunk size input accepts numeric values', async () => {
    await act(async () => {
      render(<App />);
    });
    const inputs = screen.getAllByRole('spinbutton');
    const chunkSizeInput = inputs[0];
    await act(async () => {
      fireEvent.change(chunkSizeInput, { target: { value: '100' } });
    });
    expect(chunkSizeInput.value).toBe('100');
  });

  test('renders links to external resources', async () => {
    await act(async () => {
      render(<App />);
    });
    const twitterLink = screen.getByText('Twitter');
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/GregKamradt');
  });

  test('renders GitHub link', async () => {
    await act(async () => {
      render(<App />);
    });
    const githubLink = screen.getByText('Open Sourced');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/gkamradt/ChunkViz');
  });
});
