const { Note } = require('../models');

const createNote = async ({ title, content, userId }) => {
    const note = await Note.create({
        title,
        content,
        userId,
    });

    return note;
};

const getNotes = async (userId) => {
    const notes = await Note.findAll({
        where: {
            userId,
        },
        order: [['createdAt', 'DESC']]
    });
    return notes;
};

const getNoteById = async (noteId, userId) => {
    const note = await Note.findOne({
        where: {
            id: noteId,
            userId,
        },
    });
    return note;
};
const updateNote = async (noteId, userId, { title, content }) => {
    const note = await Note.findOne({
        where: {
            id: noteId,
            userId,
        },
    });
    if (!note) {
        return null;
    }
    await note.update({
        title,
        content,
    });
    return note;
};

const deleteNote = async(noteId,userId)=>{
    const note = await Note.findOne({
        where: {
            id:noteId,
            userId,
        },
    });
    if(!note){
        return null;
    }
    await note.destroy();
    return note;
};

module.exports = {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
};
