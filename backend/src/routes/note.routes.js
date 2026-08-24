const express = require('express');
const { body } = require('express-validator');

const authenticateUser = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validation.middleware');

const {
    createNoteController,
    getNotesController,
    getNoteByIdController,
    updateNoteController,
    deleteNoteController,
} = require('../controllers/note.controller');

const router = express.Router();

router.post(
    '/',
    authenticateUser,
    [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required'),

        body('content')
            .trim()
            .notEmpty()
            .withMessage('Content is required'),
    ],
    validateRequest,
    createNoteController
);

router.get(
    '/',
    authenticateUser,
    getNotesController
);

router.get(
    '/:id',
    authenticateUser,
    getNoteByIdController
);

router.put(
    '/:id',
    authenticateUser,
    [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required'),

        body('content')
            .trim()
            .notEmpty()
            .withMessage('Content is required'),
    ],
    validateRequest,
    updateNoteController
);

router.delete(
    '/:id',
    authenticateUser,
    deleteNoteController
);

module.exports = router;