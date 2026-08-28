import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RichTextEditor from './RichTextEditor';

const runMock = vi.fn();
const chainMock = vi.fn();

const buildChain = () => {
  const chain: Record<string, unknown> = {};
  const methods = [
    'focus',
    'toggleBold',
    'toggleItalic',
    'toggleStrike',
    'toggleHeading',
    'toggleBulletList',
    'toggleOrderedList',
    'toggleBlockquote',
    'extendMarkRange',
    'setLink',
    'unsetLink',
    'undo',
    'redo',
  ];

  methods.forEach((method) => {
    chain[method] = vi.fn(() => chain);
  });

  chain.run = runMock;

  return chain;
};

let mockEditor: Record<string, unknown> | null;
let isActiveResult = false;
let canUndo = true;
let canRedo = true;
let currentHTML = '<p>Hello world</p>';
let onUpdateCallback: ((args: { editor: unknown }) => void) | null = null;

vi.mock('@tiptap/react', () => ({
  useEditor: (options: {
    onUpdate?: (args: { editor: unknown }) => void;
  }) => {
    onUpdateCallback = options.onUpdate ?? null;
    return mockEditor;
  },
  EditorContent: () => <div data-testid="editor-content" />,
}));

vi.mock('@tiptap/starter-kit', () => ({ default: {} }));
vi.mock('@tiptap/extension-link', () => ({
  default: { configure: vi.fn(() => ({})) },
}));

const createMockEditor = () => ({
  getHTML: vi.fn(() => currentHTML),
  isActive: vi.fn(() => isActiveResult),
  getAttributes: vi.fn(() => ({ href: '' })),
  chain: vi.fn(() => {
    chainMock();
    return buildChain();
  }),
  can: vi.fn(() => ({
    undo: vi.fn(() => canUndo),
    redo: vi.fn(() => canRedo),
  })),
  commands: {
    setContent: vi.fn(),
  },
  setEditable: vi.fn(),
});

describe('RichTextEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isActiveResult = false;
    canUndo = true;
    canRedo = true;
    currentHTML = '<p>Hello world</p>';
    onUpdateCallback = null;
    mockEditor = createMockEditor();
  });

  it('shows a loading state when the editor is not ready', () => {
    mockEditor = null;

    render(<RichTextEditor content="" onChange={vi.fn()} />);

    expect(screen.getByText('Loading editor...')).toBeInTheDocument();
  });

  it('renders the toolbar and editor content once ready', () => {
    render(<RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />);

    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Strikethrough')).toBeInTheDocument();
    expect(screen.getByTitle('Heading')).toBeInTheDocument();
    expect(screen.getByTitle('Bullet list')).toBeInTheDocument();
    expect(screen.getByTitle('Numbered list')).toBeInTheDocument();
    expect(screen.getByTitle('Quote')).toBeInTheDocument();
    expect(screen.getByTitle('Add link')).toBeInTheDocument();
    expect(screen.getByTitle('Undo')).toBeInTheDocument();
    expect(screen.getByTitle('Redo')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('calls onChange with the new HTML when the editor updates', () => {
    const handleChange = vi.fn();

    render(<RichTextEditor content="<p>Hello world</p>" onChange={handleChange} />);

    onUpdateCallback?.({ editor: mockEditor });

    expect(handleChange).toHaveBeenCalledWith('<p>Hello world</p>');
  });

  it('toggles bold, italic, strike, heading, lists and blockquote', async () => {
    render(<RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />);

    await userEvent.click(screen.getByTitle('Bold'));
    await userEvent.click(screen.getByTitle('Italic'));
    await userEvent.click(screen.getByTitle('Strikethrough'));
    await userEvent.click(screen.getByTitle('Heading'));
    await userEvent.click(screen.getByTitle('Bullet list'));
    await userEvent.click(screen.getByTitle('Numbered list'));
    await userEvent.click(screen.getByTitle('Quote'));

    expect(chainMock).toHaveBeenCalled();
    expect(runMock).toHaveBeenCalled();
  });

  it('marks toolbar buttons active based on editor state', () => {
    isActiveResult = true;

    render(<RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />);

    expect(screen.getByTitle('Bold')).toHaveClass('active');
    expect(screen.getByTitle('Heading')).toHaveClass('active');
  });

  it('disables undo and redo when unavailable', () => {
    canUndo = false;
    canRedo = false;

    render(<RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />);

    expect(screen.getByTitle('Undo')).toBeDisabled();
    expect(screen.getByTitle('Redo')).toBeDisabled();
  });

  it('triggers undo and redo commands', async () => {
    render(<RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />);

    await userEvent.click(screen.getByTitle('Undo'));
    await userEvent.click(screen.getByTitle('Redo'));

    expect(chainMock).toHaveBeenCalled();
    expect(runMock).toHaveBeenCalled();
  });

  it('disables all toolbar buttons when disabled prop is true', () => {
    render(
      <RichTextEditor
        content="<p>Hello world</p>"
        onChange={vi.fn()}
        disabled
      />
    );

    expect(screen.getByTitle('Bold')).toBeDisabled();
    expect(screen.getByTitle('Add link')).toBeDisabled();
  });

  it('does nothing when addLink is clicked while disabled', async () => {
    const promptSpy = vi.spyOn(window, 'prompt');

    render(
      <RichTextEditor
        content="<p>Hello world</p>"
        onChange={vi.fn()}
        disabled
      />
    );

    await userEvent.click(screen.getByTitle('Add link'));

    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('sets a link when a URL is entered', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('https://example.com');

    render(<RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />);

    await userEvent.click(screen.getByTitle('Add link'));

    expect(chainMock).toHaveBeenCalled();
    expect(runMock).toHaveBeenCalled();
  });

  it('unsets the link when an empty URL is entered', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('   ');

    render(<RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />);

    await userEvent.click(screen.getByTitle('Add link'));

    expect(chainMock).toHaveBeenCalled();
    expect(runMock).toHaveBeenCalled();
  });

  it('does nothing when the URL prompt is cancelled', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue(null);

    render(<RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />);

    runMock.mockClear();
    chainMock.mockClear();

    await userEvent.click(screen.getByTitle('Add link'));

    expect(runMock).not.toHaveBeenCalled();
  });

  it('calls setContent when the content prop changes and differs from editor HTML', () => {
    const { rerender } = render(
      <RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />
    );

    const setContentSpy = mockEditor?.commands as { setContent: ReturnType<typeof vi.fn> };
    setContentSpy.setContent.mockClear();

    rerender(<RichTextEditor content="<p>Updated</p>" onChange={vi.fn()} />);

    expect(setContentSpy.setContent).toHaveBeenCalledWith('<p>Updated</p>', {
      emitUpdate: false,
    });
  });

  it('does not call setContent when the content prop matches the editor HTML', () => {
    render(<RichTextEditor content="<p>Hello world</p>" onChange={vi.fn()} />);

    const setContentSpy = mockEditor?.commands as { setContent: ReturnType<typeof vi.fn> };

    expect(setContentSpy.setContent).not.toHaveBeenCalled();
  });
});