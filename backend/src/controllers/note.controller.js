const noteService = require('../services/note.service');

const MAX_IMPORT_NOTES = 100;

const createNoteController = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const note = await noteService.createNote({
      title,
      content,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const getNotesController = async (req, res, next) => {
  try {
    const { search = '', filter = 'all' } = req.query;

    const allowedFilters = ['all', 'recent', 'oldest'];

    if (
      typeof search !== 'string' ||
      typeof filter !== 'string' ||
      !allowedFilters.includes(filter)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filter. Use all, recent, or oldest.',
      });
    }

    const notes = await noteService.getNotes(req.user.id, {
      search,
      filter,
    });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

const getNoteByIdController = async (req, res, next) => {
  try {
    const note = await noteService.getNoteById(
      req.params.id,
      req.user.id
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const updateNoteController = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const note = await noteService.updateNote(
      req.params.id,
      req.user.id,
      {
        title,
        content,
      }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNoteController = async (req, res, next) => {
  try {
    const note = await noteService.deleteNote(
      req.params.id,
      req.user.id
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const togglePinNoteController = async (req, res, next) => {
  try {
    const note = await noteService.togglePinNote(
      req.params.id,
      req.user.id
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      message: note.isPinned
        ? 'Note pinned successfully'
        : 'Note unpinned successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const exportNotesController = async (req, res, next) => {
  try {
    const notes = await noteService.exportNotes(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        notes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const importNotesController = async (req, res, next) => {
  try {
    const { notes } = req.body;

    if (!Array.isArray(notes)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid import format. Expected a notes array.',
      });
    }

    if (notes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No notes found in the import data',
      });
    }

    if (notes.length > MAX_IMPORT_NOTES) {
      return res.status(400).json({
        success: false,
        message: `Import cannot contain more than ${MAX_IMPORT_NOTES} notes`,
      });
    }

    for (const note of notes) {
      if (!note || typeof note !== 'object' || Array.isArray(note)) {
        return res.status(400).json({
          success: false,
          message: 'Each note must have a valid title and content',
        });
      }

      if (
        typeof note.title !== 'string' ||
        !note.title.trim() ||
        typeof note.content !== 'string' ||
        !note.content.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Each note must have a valid title and content',
        });
      }

      if (
        note.isPinned !== undefined &&
        typeof note.isPinned !== 'boolean'
      ) {
        return res.status(400).json({
          success: false,
          message: 'isPinned must be a boolean',
        });
      }
    }

    const importedNotes = await noteService.importNotes(
      req.user.id,
      notes
    );

    res.status(201).json({
      success: true,
      message: `${importedNotes.length} note(s) imported successfully`,
      data: importedNotes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNoteController,
  getNotesController,
  getNoteByIdController,
  updateNoteController,
  deleteNoteController,
  togglePinNoteController,
  exportNotesController,
  importNotesController,
};