import axios from 'axios';
import api from './api';

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ServiceError {
  message: string;
  status?: number;
}

const normalizeError = (error: unknown): ServiceError => {
  if (axios.isAxiosError(error)) {
    return {
      message:
        error.response?.data?.message ||
        error.message ||
        'Something went wrong',
      status: error.response?.status,
    };
  }

  return {
    message: 'Something went wrong',
  };
};

export const getNotes = async (): Promise<Note[]> => {
  try {
    const response = await api.get<ApiResponse<Note[]>>('/notes');
    return response.data.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const createNote = async (
  title: string,
  content: string
): Promise<Note> => {
  try {
    const response = await api.post<ApiResponse<Note>>('/notes', {
      title,
      content,
    });

    return response.data.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const updateNote = async (
  id: string,
  title: string,
  content: string
): Promise<Note> => {
  try {
    const response = await api.put<ApiResponse<Note>>(`/notes/${id}`, {
      title,
      content,
    });

    return response.data.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  try {
    await api.delete(`/notes/${id}`);
  } catch (error) {
    throw normalizeError(error);
  }
};