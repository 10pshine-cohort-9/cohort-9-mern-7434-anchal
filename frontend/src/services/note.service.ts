import api from './api';

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesResponse {
  success: boolean;
  data: Note[];
}

interface NoteResponse {
  success: boolean;
  message?: string;
  data: Note;
}

interface ExportResponse {
  success: boolean;
  data: {
    exportedAt: string;
    notes: Note[];
  };
}

export const getNotes = async (
  search = '',
  filter = 'all'
): Promise<NotesResponse> => {
  const response = await api.get('/notes', {
    params: {
      search,
      filter,
    },
  });

  return response.data;
};

export const getNoteById = async (
  id: string
): Promise<NoteResponse> => {
  const response = await api.get(`/notes/${id}`);

  return response.data;
};

export const createNote = async (data: {
  title: string;
  content: string;
}): Promise<NoteResponse> => {
  const response = await api.post('/notes', data);

  return response.data;
};

export const updateNote = async (
  id: string,
  data: {
    title: string;
    content: string;
  }
): Promise<NoteResponse> => {
  const response = await api.put(`/notes/${id}`, data);

  return response.data;
};

export const deleteNote = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/notes/${id}`);

  return response.data;
};

export const togglePinNote = async (
  id: string
): Promise<NoteResponse> => {
  const response = await api.patch(`/notes/${id}/pin`);

  return response.data;
};

export const exportNotes = async (): Promise<ExportResponse> => {
  const response = await api.get('/notes/export');

  return response.data;
};

export const importNotes = async (
  notes: Array<{
    title: string;
    content: string;
    isPinned?: boolean;
  }>
): Promise<NoteResponse[]> => {
  const response = await api.post('/notes/import', {
    notes,
  });

  return response.data.data;
};