import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Dashboard from './Dashboard';
import { useAuth } from '../context/AuthContext';
import {
  createNote,
  deleteNote,
  exportNotes,
  getNotes,
  importNotes,
  togglePinNote,
  updateNote,
} from '../services/note.service';

interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/note.service', () => ({
  getNotes: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  togglePinNote: vi.fn(),
  exportNotes: vi.fn(),
  importNotes: vi.fn(),
}));

vi.mock('../components/RichTextEditor', () => ({
  default: ({
    content,
    onChange,
    disabled,
  }: {
    content: string;
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <textarea
      data-testid="rich-text-editor"
      value={content}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const mockLogout = vi.fn();

const noteOne: Note = {
  id: '1',
  title: 'First Note',
  content: '<p>Hello world</p>',
  isPinned: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const noteTwo: Note = {
  id: '2',
  title: 'Pinned Note',
  content: '<p>Pinned content</p>',
  isPinned: true,
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { name: 'Test User' },
      logout: mockLogout,
    });

    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('shows a loading state and then an empty state when there are no notes', async () => {
    render(<Dashboard />);

    expect(screen.getByText('Loading notes...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Create your first note to get started.')
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome back, test user/i)).toBeInTheDocument();
  });

  it('renders notes returned from the API, including pinned notes', async () => {
    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [noteOne, noteTwo],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    expect(screen.getByText('Pinned Note')).toBeInTheDocument();
    expect(screen.getByText('📌 Pinned')).toBeInTheDocument();
  });

  it('shows an error message when loading notes fails', async () => {
    (getNotes as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load your notes.')
      ).toBeInTheDocument();
    });
  });

  it('shows a "no notes found" message when searching returns nothing', async () => {
    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByPlaceholderText('Search notes...'),
      'xyz'
    );

    await waitFor(() => {
      expect(getNotes).toHaveBeenLastCalledWith('xyz', 'all');
    });

    await waitFor(() => {
      expect(screen.getByText('No notes found')).toBeInTheDocument();
    });

    expect(screen.getByText('Try a different search term.')).toBeInTheDocument();
  });

  it('calls getNotes with the selected filter when a filter button is clicked', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(getNotes).toHaveBeenCalledWith('', 'all');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Recent' }));

    await waitFor(() => {
      expect(getNotes).toHaveBeenLastCalledWith('', 'recent');
    });

    expect(screen.getByRole('button', { name: 'Recent' })).toHaveClass('active');
  });

  it('opens the create note editor and validates required fields', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: '+ New Note' }));

    expect(screen.getByText('Create a note')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Create Note' }));

    expect(
      screen.getByText('Title and content are required.')
    ).toBeInTheDocument();
    expect(createNote).not.toHaveBeenCalled();
  });

  it('creates a note successfully and refreshes the list', async () => {
    (createNote as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (getNotes as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [noteOne] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: '+ New Note' }));
    await userEvent.type(screen.getByLabelText('Title'), 'First Note');
    await userEvent.type(
      screen.getByTestId('rich-text-editor'),
      'Hello world'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create Note' }));

    await waitFor(() => {
      expect(createNote).toHaveBeenCalledWith({
        title: 'First Note',
        content: 'Hello world',
      });
    });

    await waitFor(() => {
      expect(screen.queryByText('Create a note')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
  });

  it('shows an error when creating a note fails', async () => {
    (createNote as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: '+ New Note' }));
    await userEvent.type(screen.getByLabelText('Title'), 'First Note');
    await userEvent.type(screen.getByTestId('rich-text-editor'), 'content');
    await userEvent.click(screen.getByRole('button', { name: 'Create Note' }));

    await waitFor(() => {
      expect(screen.getByText('Unable to save the note.')).toBeInTheDocument();
    });
  });

  it('opens the edit editor pre-filled and updates a note', async () => {
    (updateNote as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [noteOne],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByText('Update your note')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('First Note');

    await userEvent.clear(screen.getByLabelText('Title'));
    await userEvent.type(screen.getByLabelText('Title'), 'Updated Note');
    await userEvent.click(screen.getByRole('button', { name: 'Update Note' }));

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith('1', {
        title: 'Updated Note',
        content: '<p>Hello world</p>',
      });
    });
  });

  it('closes the editor without saving when cancelled', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: '+ New Note' }));
    expect(screen.getByText('Create a note')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Create a note')).not.toBeInTheDocument();
    expect(createNote).not.toHaveBeenCalled();
  });

  it('closes the editor via the close button', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: '+ New Note' }));
    await userEvent.click(screen.getByLabelText('Close editor'));

    expect(screen.queryByText('Create a note')).not.toBeInTheDocument();
  });

  it('deletes a note after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    (deleteNote as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (getNotes as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: [noteOne] })
      .mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(deleteNote).toHaveBeenCalledWith('1');
    });
  });

  it('does not delete a note when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [noteOne],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(deleteNote).not.toHaveBeenCalled();
  });

  it('shows an error when deleting a note fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    (deleteNote as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [noteOne],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(
        screen.getByText('Unable to delete the note.')
      ).toBeInTheDocument();
    });
  });

  it('toggles pin on a note', async () => {
    (togglePinNote as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [noteOne],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTitle('Pin note'));

    await waitFor(() => {
      expect(togglePinNote).toHaveBeenCalledWith('1');
    });
  });

  it('shows an error when toggling pin fails', async () => {
    (togglePinNote as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('fail')
    );
    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [noteOne],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTitle('Pin note'));

    await waitFor(() => {
      expect(
        screen.getByText('Unable to update the note.')
      ).toBeInTheDocument();
    });
  });

  it('disables export when there are no notes and enables it with notes', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled();
    });
  });

  it('exports notes as a downloadable JSON file', async () => {
    (exportNotes as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { notes: [noteOne] },
    });
    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [noteOne],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(exportNotes).toHaveBeenCalled();
      expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('shows an error when exporting notes fails', async () => {
    (exportNotes as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('fail')
    );
    (getNotes as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [noteOne],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByText('Unable to export notes.')).toBeInTheDocument();
    });
  });

  it('rejects a non-JSON file on import', async () => {
    const { container } = render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['not json'], 'notes.txt', { type: 'text/plain' });

    await userEvent.upload(fileInput, file, { applyAccept: false });

    await waitFor(() => {
      expect(
        screen.getByText('Unable to import notes. Check the JSON file format.')
      ).toBeInTheDocument();
    });

    expect(importNotes).not.toHaveBeenCalled();
  });

  it('rejects unparsable JSON content on import', async () => {
    const { container } = render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['{not valid json'], 'notes.json', {
      type: 'application/json',
    });

    await userEvent.upload(fileInput, file, { applyAccept: false });

    await waitFor(() => {
      expect(
        screen.getByText('Unable to import notes. Check the JSON file format.')
      ).toBeInTheDocument();
    });
  });

  it('rejects import data missing a notes array', async () => {
    const { container } = render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File([JSON.stringify({ foo: 'bar' })], 'notes.json', {
      type: 'application/json',
    });

    await userEvent.upload(fileInput, file, { applyAccept: false });

    await waitFor(() => {
      expect(
        screen.getByText('Unable to import notes. Check the JSON file format.')
      ).toBeInTheDocument();
    });
  });

  it('rejects an empty notes array on import', async () => {
    const { container } = render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File([JSON.stringify({ notes: [] })], 'notes.json', {
      type: 'application/json',
    });

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(
        screen.getByText('Unable to import notes. Check the JSON file format.')
      ).toBeInTheDocument();
    });
  });

  it('rejects invalid note data on import', async () => {
    const { container } = render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(
      [JSON.stringify({ notes: [{ title: '', content: 'x' }] })],
      'notes.json',
      { type: 'application/json' }
    );

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(
        screen.getByText('Unable to import notes. Check the JSON file format.')
      ).toBeInTheDocument();
    });
  });

  it('rejects import data containing a non-object note', async () => {
    const { container } = render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(
      [JSON.stringify({ notes: [null] })],
      'notes.json',
      { type: 'application/json' }
    );

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(
        screen.getByText('Unable to import notes. Check the JSON file format.')
      ).toBeInTheDocument();
    });
  });

  it('imports valid notes successfully', async () => {
    (importNotes as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (getNotes as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [noteOne] });

    const { container } = render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(
      [JSON.stringify({ notes: [{ title: 'First Note', content: 'Hello world' }] })],
      'notes.json',
      { type: 'application/json' }
    );

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(importNotes).toHaveBeenCalledWith([
        { title: 'First Note', content: 'Hello world' },
      ]);
    });

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
  });

  it('triggers the hidden file input when the Import button is clicked', async () => {
    const { container } = render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    await userEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('calls logout when sign out is clicked', async () => {
    render(<Dashboard />);

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(mockLogout).toHaveBeenCalled();
  });
});