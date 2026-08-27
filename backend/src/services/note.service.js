const { Op } = require('sequelize');
const sequelize = require('../config/database');
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

const getNotes = async (userId, { search = '', filter = 'all' } = {}) => {
  try {
    const where = {
      userId,
    };

    const normalizedSearch =
      typeof search === 'string' ? search.trim() : '';

    if (normalizedSearch) {
      where[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${normalizedSearch}%`,
          },
        },
        {
          content: {
            [Op.iLike]: `%${normalizedSearch}%`,
          },
        },
      ];
    }

    let order;

    if (filter === 'oldest') {
      order = [['createdAt', 'ASC']];
    } else {
      order = [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC'],
      ];
    }

    return await Note.findAll({
      where,
      order,
    });
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

const togglePinNote = async (noteId, userId) => {
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
      isPinned: !note.isPinned,
    });

    return note;
  } catch (error) {
    handleDatabaseError(error);
  }
};

const exportNotes = async (userId) => {
  try {
    const notes = await Note.findAll({
      where: {
        userId,
      },
      attributes: [
        'title',
        'content',
        'isPinned',
        'createdAt',
        'updatedAt',
      ],
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    return notes;
  } catch (error) {
    handleDatabaseError(error);
  }
};

const importNotes = async (userId, notes) => {
  try {
    return await sequelize.transaction(async (transaction) => {
      const importedNotes = [];

      for (const noteData of notes) {
        const note = await Note.create(
          {
            title: noteData.title,
            content: noteData.content,
            isPinned: noteData.isPinned ?? false,
            userId,
          },
          { transaction }
        );

        importedNotes.push(note);
      }

      return importedNotes;
    });
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
  togglePinNote,
  exportNotes,
  importNotes,
};