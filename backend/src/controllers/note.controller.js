const { createNote, getNotes, getNoteById, updateNote, deleteNote, } = require('../services/note.service');

const createNoteController = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const note = await createNote({ title, content, userId: req.user.id });
        res.status(201).json
            ({
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
        const notes = await getNotes(req.user.id);
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
        const note = await getNoteById(req.params.id, req.user.id);
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
        const note = await updateNote(req.params.id, req.user.id, { title, content });
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
        const note = await deleteNote(
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


module.exports = {
    createNoteController,
    getNotesController,
    getNoteByIdController,
    updateNoteController,
    deleteNoteController,
};