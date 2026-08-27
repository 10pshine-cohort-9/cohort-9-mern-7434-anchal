const Note = require('../models/Note');

const handleDatabaseError = (error) => {
  throw new Error(`Database operation failed: ${error.message}`, {
    cause: error,
  });
};

const createNote = async ({ title, content, userId }) => {
  try {
    const note = await Note.create({
      title,
      content,
      userId,
    });

    return note;
  } catch (error) {
    handleDatabaseError(error);
  }
};

const getNotes = async (userId) => {
  try {
    const notes = await Note.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });

    return notes;
  } catch (error) {
    handleDatabaseError(error);
  }
};

const getNoteById = async (noteId, userId) => {
  try {
    const note = await Note.findOne({
      where: {
        id: noteId,
        userId,
      },
    });

    return note;
  } catch (error) {
    handleDatabaseError(error);
  }
};

const updateNote = async (noteId, userId, { title, content }) => {
  try {
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
  } catch (error) {
    handleDatabaseError(error);
  }
};

const deleteNote = async (noteId, userId) => {
  try {
    const note = await Note.findOne({
      where: {
        id: noteId,
        userId,
      },
    });

    if (!note) {
      return null;
    }

    await note.destroy();

    return note;
  } catch (error) {
    handleDatabaseError(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};