import api from './api';

export interface Note {
    id: string;
    title: string;
    content: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export const getNotes = async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data.data;
};

export const createNote = async (
    title: string,
    content: string
): Promise<Note> => {
    const response = await api.post('/notes', { title, content });
    return response.data.data;
};

export const updateNote= async(
    id:string,
    title:string,
    content:string
): Promise<Note> =>{
    const response = await api.put(`/notes/${id}`,{
        title,content,
    });
    return response.data.data;
}

export const deleteNote = async (id: string) : Promise<void> => {
    await api.delete(`/notes/${id}`);
};