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
  message?: string;
  data: Note[];
}

interface NoteResponse {
  success: boolean;
  message?: string;
  data: Note;
}

interface ExportResponse {
  success: boolean;
  message?: string;
  data: {
    exportedAt: string;
    notes: Note[];
  };
}

interface ImportNote {
  title: string;
  content: string;
  isPinned?: boolean;
}

export const getNotes = async (
  search = '',
  filter: 'all' | 'recent' | 'oldest' = 'all'
): Promise<NotesResponse> => {
  const response = await api.get<NotesResponse>('/notes', {
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
  const response = await api.get<NoteResponse>(`/notes/${id}`);

  return response.data;
};

export const createNote = async (
  data: {
    title: string;
    content: string;
  }
): Promise<NoteResponse> => {
  const response = await api.post<NoteResponse>(
    '/notes',
    data
  );

  return response.data;
};

export const updateNote = async (
  id: string,
  data: {
    title: string;
    content: string;
  }
): Promise<NoteResponse> => {
  const response = await api.put<NoteResponse>(
    `/notes/${id}`,
    data
  );

  return response.data;
};

export const deleteNote = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/notes/${id}`);

  return response.data;
};

export const togglePinNote = async (
  id: string
): Promise<NoteResponse> => {
  const response = await api.patch<NoteResponse>(
    `/notes/${id}/pin`
  );

  return response.data;
};

export const exportNotes = async (): Promise<ExportResponse> => {
  const response = await api.get<ExportResponse>(
    '/notes/export'
  );

  return response.data;
};

export const importNotes = async (
  notes: ImportNote[]
): Promise<Note[]> => {
  const response = await api.post<{
    success: boolean;
    message?: string;
    data: Note[];
  }>('/notes/import', {
    notes,
  });

  return response.data.data;
};