const express = require('express');

const authenticateUser = require('../middlewares/auth.middleware');
const { createNoteController,getNotesController,getNoteByIdController,updateNoteController, deleteNoteController,} = require('../controllers/note.controller');

const router = express.Router();

router.post(
    '/',
    authenticateUser,
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
    updateNoteController
);

router.delete(
    '/:id',
    authenticateUser,
    deleteNoteController    
);



module.exports = router;