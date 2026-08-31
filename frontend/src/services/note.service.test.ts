import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  exportNotes,
  importNotes,
} from './note.service';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('note.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getNotes fetches notes with search and filter params', async () => {
    const mockData = { success: true, data: [] };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await getNotes('hello', 'recent');

    expect(api.get).toHaveBeenCalledWith('/notes', {
      params: { search: 'hello', filter: 'recent' },
    });
    expect(result).toEqual(mockData);
  });

  it('getNotes uses default params when none provided', async () => {
    const mockData = { success: true, data: [] };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    await getNotes();

    expect(api.get).toHaveBeenCalledWith('/notes', {
      params: { search: '', filter: 'all' },
    });
  });

  it('getNoteById fetches a single note by id', async () => {
    const mockData = { success: true, data: { id: '1' } };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await getNoteById('1');

    expect(api.get).toHaveBeenCalledWith('/notes/1');
    expect(result).toEqual(mockData);
  });

  it('createNote posts new note data', async () => {
    const mockData = { success: true, data: { id: '1' } };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await createNote({ title: 'T', content: 'C' });

    expect(api.post).toHaveBeenCalledWith('/notes', { title: 'T', content: 'C' });
    expect(result).toEqual(mockData);
  });

  it('updateNote puts updated note data', async () => {
    const mockData = { success: true, data: { id: '1' } };
    (api.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await updateNote('1', { title: 'T2', content: 'C2' });

    expect(api.put).toHaveBeenCalledWith('/notes/1', { title: 'T2', content: 'C2' });
    expect(result).toEqual(mockData);
  });

  it('deleteNote deletes a note by id', async () => {
    const mockData = { success: true, message: 'Deleted' };
    (api.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await deleteNote('1');

    expect(api.delete).toHaveBeenCalledWith('/notes/1');
    expect(result).toEqual(mockData);
  });

  it('togglePinNote patches the pin status', async () => {
    const mockData = { success: true, data: { id: '1', isPinned: true } };
    (api.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await togglePinNote('1');

    expect(api.patch).toHaveBeenCalledWith('/notes/1/pin');
    expect(result).toEqual(mockData);
  });

  it('exportNotes fetches exported notes', async () => {
    const mockData = { success: true, data: { exportedAt: 'now', notes: [] } };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await exportNotes();

    expect(api.get).toHaveBeenCalledWith('/notes/export');
    expect(result).toEqual(mockData);
  });

  it('importNotes posts notes and returns the imported data', async () => {
    const notesToImport = [{ title: 'T', content: 'C' }];
    const mockData = {
      success: true,
      data: [{ id: '1', title: 'T', content: 'C', isPinned: false, userId: 'u1', createdAt: '', updatedAt: '' }],
    };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await importNotes(notesToImport);

    expect(api.post).toHaveBeenCalledWith('/notes/import', { notes: notesToImport });
    expect(result).toEqual(mockData.data);
  });
});