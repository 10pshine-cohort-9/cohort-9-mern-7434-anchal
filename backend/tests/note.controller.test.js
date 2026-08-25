const { expect } = require('chai');
const sinon = require('sinon');

const noteService = require('../src/services/note.service');
const {
  createNoteController,
  getNotesController,
  getNoteByIdController,
  updateNoteController,
  deleteNoteController,
  togglePinNoteController,
  exportNotesController,
  importNotesController,
} = require('../src/controllers/note.controller');

describe('Note Controllers', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: {
        id: 'user-123',
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };

    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createNoteController', () => {
    it('should create a note successfully', async () => {
      const note = {
        id: 'note-123',
        title: 'Test Note',
        content: 'Test content',
        userId: 'user-123',
      };

      req.body = {
        title: 'Test Note',
        content: 'Test content',
      };

      sinon.stub(noteService, 'createNote').resolves(note);

      await createNoteController(req, res, next);

      expect(res.status.calledWith(201)).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: true,
        message: 'Note created successfully',
        data: note,
      });

      expect(next.called).to.equal(false);
    });
  });

  describe('getNotesController', () => {
    it('should return notes successfully', async () => {
      const notes = [
        {
          id: 'note-123',
          title: 'Test Note',
          content: 'Test content',
        },
      ];

      sinon.stub(noteService, 'getNotes').resolves(notes);

      await getNotesController(req, res, next);

      expect(res.status.calledWith(200)).to.equal(true);

      expect(noteService.getNotes.calledWith('user-123', {
        search: '',
        filter: 'all',
      })).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: true,
        data: notes,
      });
    });

    it('should search notes successfully', async () => {
      const notes = [
        {
          id: 'note-123',
          title: 'Meeting Notes',
          content: 'Project meeting',
        },
      ];

      req.query = {
        search: 'meeting',
        filter: 'all',
      };

      sinon.stub(noteService, 'getNotes').resolves(notes);

      await getNotesController(req, res, next);

      expect(noteService.getNotes.calledWith('user-123', {
        search: 'meeting',
        filter: 'all',
      })).to.equal(true);

      expect(res.status.calledWith(200)).to.equal(true);
      expect(res.json.firstCall.args[0].data).to.deep.equal(notes);
    });

    it('should apply oldest filter', async () => {
      sinon.stub(noteService, 'getNotes').resolves([]);

      req.query = {
        filter: 'oldest',
      };

      await getNotesController(req, res, next);

      expect(noteService.getNotes.calledWith('user-123', {
        search: '',
        filter: 'oldest',
      })).to.equal(true);

      expect(res.status.calledWith(200)).to.equal(true);
    });

    it('should reject invalid filter', async () => {
      req.query = {
        filter: 'invalid',
      };

      await getNotesController(req, res, next);

      expect(res.status.calledWith(400)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: false,
        message: 'Invalid filter. Use all, recent, or oldest.',
      });
    });
  });

  describe('getNoteByIdController', () => {
    it('should return note successfully', async () => {
      const note = {
        id: 'note-123',
        title: 'Test Note',
        content: 'Test content',
        userId: 'user-123',
      };

      req.params.id = 'note-123';

      sinon.stub(noteService, 'getNoteById').resolves(note);

      await getNoteByIdController(req, res, next);

      expect(noteService.getNoteById.calledWith(
        'note-123',
        'user-123'
      )).to.equal(true);

      expect(res.status.calledWith(200)).to.equal(true);
      expect(res.json.firstCall.args[0].data).to.deep.equal(note);
    });

    it('should return 404 when note does not exist', async () => {
      req.params.id = 'missing-note';

      sinon.stub(noteService, 'getNoteById').resolves(null);

      await getNoteByIdController(req, res, next);

      expect(res.status.calledWith(404)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: false,
        message: 'Note not found',
      });
    });
  });

  describe('updateNoteController', () => {
    it('should update note successfully', async () => {
      const note = {
        id: 'note-123',
        title: 'Updated Note',
        content: 'Updated content',
        userId: 'user-123',
      };

      req.params.id = 'note-123';
      req.body = {
        title: 'Updated Note',
        content: 'Updated content',
      };

      sinon.stub(noteService, 'updateNote').resolves(note);

      await updateNoteController(req, res, next);

      expect(noteService.updateNote.calledWith(
        'note-123',
        'user-123',
        {
          title: 'Updated Note',
          content: 'Updated content',
        }
      )).to.equal(true);

      expect(res.status.calledWith(200)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: true,
        message: 'Note updated successfully',
        data: note,
      });
    });

    it('should return 404 when note does not exist', async () => {
      req.params.id = 'missing-note';

      req.body = {
        title: 'Updated Note',
        content: 'Updated content',
      };

      sinon.stub(noteService, 'updateNote').resolves(null);

      await updateNoteController(req, res, next);

      expect(res.status.calledWith(404)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: false,
        message: 'Note not found',
      });
    });
  });

  describe('deleteNoteController', () => {
    it('should delete note successfully', async () => {
      req.params.id = 'note-123';

      sinon.stub(noteService, 'deleteNote').resolves({
        id: 'note-123',
      });

      await deleteNoteController(req, res, next);

      expect(noteService.deleteNote.calledWith(
        'note-123',
        'user-123'
      )).to.equal(true);

      expect(res.status.calledWith(200)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: true,
        message: 'Note deleted successfully',
      });
    });

    it('should return 404 when note does not exist', async () => {
      req.params.id = 'missing-note';

      sinon.stub(noteService, 'deleteNote').resolves(null);

      await deleteNoteController(req, res, next);

      expect(res.status.calledWith(404)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: false,
        message: 'Note not found',
      });
    });
  });

  describe('togglePinNoteController', () => {
    it('should pin a note successfully', async () => {
      req.params.id = 'note-123';

      const note = {
        id: 'note-123',
        isPinned: true,
      };

      sinon.stub(noteService, 'togglePinNote').resolves(note);

      await togglePinNoteController(req, res, next);

      expect(res.status.calledWith(200)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: true,
        message: 'Note pinned successfully',
        data: note,
      });
    });

    it('should unpin a note successfully', async () => {
      req.params.id = 'note-123';

      const note = {
        id: 'note-123',
        isPinned: false,
      };

      sinon.stub(noteService, 'togglePinNote').resolves(note);

      await togglePinNoteController(req, res, next);

      expect(res.status.calledWith(200)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: true,
        message: 'Note unpinned successfully',
        data: note,
      });
    });

    it('should return 404 when note does not exist', async () => {
      req.params.id = 'missing-note';

      sinon.stub(noteService, 'togglePinNote').resolves(null);

      await togglePinNoteController(req, res, next);

      expect(res.status.calledWith(404)).to.equal(true);
    });
  });

  describe('exportNotesController', () => {
    it('should export notes successfully', async () => {
      const notes = [
        {
          title: 'Exported Note',
          content: 'Export content',
          isPinned: false,
        },
      ];

      sinon.stub(noteService, 'exportNotes').resolves(notes);

      await exportNotesController(req, res, next);

      expect(noteService.exportNotes.calledWith(
        'user-123'
      )).to.equal(true);

      expect(res.status.calledWith(200)).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.success).to.equal(true);
      expect(response.data.notes).to.deep.equal(notes);
      expect(response.data.exportedAt).to.be.a('string');
    });
  });

  describe('importNotesController', () => {
    it('should import notes successfully', async () => {
      const notes = [
        {
          title: 'Imported Note',
          content: 'Imported content',
          isPinned: false,
        },
      ];

      const importedNotes = [
        {
          id: 'note-123',
          ...notes[0],
          userId: 'user-123',
        },
      ];

      req.body = { notes };

      sinon.stub(noteService, 'importNotes').resolves(importedNotes);

      await importNotesController(req, res, next);

      expect(noteService.importNotes.calledWith(
        'user-123',
        notes
      )).to.equal(true);

      expect(res.status.calledWith(201)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: true,
        message: '1 note(s) imported successfully',
        data: importedNotes,
      });
    });

    it('should reject invalid import format', async () => {
      req.body = {
        notes: 'invalid',
      };

      await importNotesController(req, res, next);

      expect(res.status.calledWith(400)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: false,
        message: 'Invalid import format. Expected a notes array.',
      });
    });

    it('should reject empty notes array', async () => {
      req.body = {
        notes: [],
      };

      await importNotesController(req, res, next);

      expect(res.status.calledWith(400)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: false,
        message: 'No notes found in the import data',
      });
    });

    it('should reject invalid note data', async () => {
      req.body = {
        notes: [
          {
            title: '',
            content: 'Some content',
          },
        ],
      };

      await importNotesController(req, res, next);

      expect(res.status.calledWith(400)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: false,
        message: 'Each note must have a valid title and content',
      });
    });

    it('should reject invalid isPinned value', async () => {
      req.body = {
        notes: [
          {
            title: 'Test',
            content: 'Content',
            isPinned: 'true',
          },
        ],
      };

      await importNotesController(req, res, next);

      expect(res.status.calledWith(400)).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        success: false,
        message: 'isPinned must be a boolean',
      });
    });
  });

  describe('Error Handling', () => {
    it('should pass service errors to next middleware', async () => {
      const error = new Error('Database operation failed');

      sinon.stub(noteService, 'getNotes').rejects(error);

      await getNotesController(req, res, next);

      expect(next.calledOnce).to.equal(true);
      expect(next.firstCall.args[0]).to.equal(error);
    });
  });
});