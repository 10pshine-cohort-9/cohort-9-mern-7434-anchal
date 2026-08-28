const { expect } = require('chai');
const sinon = require('sinon');
const { Op } = require('sequelize');
const Note = require('../src/models/Note');
const sequelize = require('../src/config/database');
const noteService = require('../src/services/note.service');

describe('Note Service', function () {
  this.timeout(5000);

  afterEach(() => {
    sinon.restore();
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const note = {
        id: 'note-123',
        title: 'Test Note',
        content: 'Test content',
        userId: 'user-123',
      };

      const createStub = sinon.stub(Note, 'create').resolves(note);

      const result = await noteService.createNote({
        title: 'Test Note',
        content: 'Test content',
        userId: 'user-123',
      });

      expect(result).to.deep.equal(note);
      expect(createStub.calledOnce).to.equal(true);
    });
  });

  describe('getNotes', () => {
    it('should return user notes', async () => {
      const notes = [
        {
          id: 'note-1',
          title: 'First Note',
          userId: 'user-123',
        },
      ];

      const findAllStub = sinon.stub(Note, 'findAll').resolves(notes);

      const result = await noteService.getNotes('user-123');

      expect(result).to.deep.equal(notes);
      expect(findAllStub.calledOnce).to.equal(true);

      const query = findAllStub.firstCall.args[0];

      expect(query.where.userId).to.equal('user-123');
    });

    it('should search notes by title or content', async () => {
      const findAllStub = sinon.stub(Note, 'findAll').resolves([]);

      await noteService.getNotes('user-123', {
        search: 'meeting',
      });

      expect(findAllStub.calledOnce).to.equal(true);

      const query = findAllStub.firstCall.args[0];

      expect(query.where.userId).to.equal('user-123');

      expect(query.where[Op.or]).to.have.length(2);

      expect(query.where[Op.or][0].title[Op.iLike]).to.equal(
        '%meeting%'
      );

      expect(query.where[Op.or][1].content[Op.iLike]).to.equal(
        '%meeting%'
      );
    });

    it('should sort notes by oldest when filter is oldest', async () => {
      const findAllStub = sinon.stub(Note, 'findAll').resolves([]);

      await noteService.getNotes('user-123', {
        filter: 'oldest',
      });

      const query = findAllStub.firstCall.args[0];

      expect(query.order).to.deep.equal([
        ['createdAt', 'ASC'],
      ]);
    });

    it('should sort all notes with pinned notes first', async () => {
      const findAllStub = sinon.stub(Note, 'findAll').resolves([]);

      await noteService.getNotes('user-123', {
        filter: 'all',
      });

      const query = findAllStub.firstCall.args[0];

      expect(query.order).to.deep.equal([
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC'],
      ]);
    });
  });

  describe('getNoteById', () => {
    it('should return a note belonging to the user', async () => {
      const note = {
        id: 'note-123',
        title: 'Test Note',
        userId: 'user-123',
      };

      const findOneStub = sinon.stub(Note, 'findOne').resolves(note);

      const result = await noteService.getNoteById(
        'note-123',
        'user-123'
      );

      expect(result).to.deep.equal(note);
      expect(findOneStub.calledOnce).to.equal(true);

      const query = findOneStub.firstCall.args[0];

      expect(query.where).to.deep.equal({
        id: 'note-123',
        userId: 'user-123',
      });
    });

    it('should return null when note does not exist', async () => {
      sinon.stub(Note, 'findOne').resolves(null);

      const result = await noteService.getNoteById(
        'missing-note',
        'user-123'
      );

      expect(result).to.equal(null);
    });
  });

  describe('updateNote', () => {
    it('should update an existing note', async () => {
      const note = {
        id: 'note-123',
        title: 'Old Title',
        content: 'Old content',
        update: sinon.stub().resolves(),
      };

      sinon.stub(Note, 'findOne').resolves(note);

      const result = await noteService.updateNote(
        'note-123',
        'user-123',
        {
          title: 'New Title',
          content: 'New content',
        }
      );

      expect(note.update.calledOnce).to.equal(true);

      expect(note.update.firstCall.args[0]).to.deep.equal({
        title: 'New Title',
        content: 'New content',
      });

      expect(result).to.equal(note);
    });

    it('should return null when note does not exist', async () => {
      sinon.stub(Note, 'findOne').resolves(null);

      const result = await noteService.updateNote(
        'missing-note',
        'user-123',
        {
          title: 'New Title',
          content: 'New content',
        }
      );

      expect(result).to.equal(null);
    });
  });

  describe('deleteNote', () => {
    it('should delete an existing note', async () => {
      const note = {
        id: 'note-123',
        destroy: sinon.stub().resolves(),
      };

      sinon.stub(Note, 'findOne').resolves(note);

      const result = await noteService.deleteNote(
        'note-123',
        'user-123'
      );

      expect(note.destroy.calledOnce).to.equal(true);
      expect(result).to.equal(note);
    });

    it('should return null when note does not exist', async () => {
      sinon.stub(Note, 'findOne').resolves(null);

      const result = await noteService.deleteNote(
        'missing-note',
        'user-123'
      );

      expect(result).to.equal(null);
    });
  });

  describe('togglePinNote', () => {
    it('should pin an unpinned note', async () => {
      const note = {
        id: 'note-123',
        isPinned: false,
        update: sinon.stub().resolves(),
      };

      sinon.stub(Note, 'findOne').resolves(note);

      const result = await noteService.togglePinNote(
        'note-123',
        'user-123'
      );

      expect(note.update.calledOnce).to.equal(true);

      expect(note.update.firstCall.args[0]).to.deep.equal({
        isPinned: true,
      });

      expect(result).to.equal(note);
    });

    it('should unpin a pinned note', async () => {
      const note = {
        id: 'note-123',
        isPinned: true,
        update: sinon.stub().resolves(),
      };

      sinon.stub(Note, 'findOne').resolves(note);

      const result = await noteService.togglePinNote(
        'note-123',
        'user-123'
      );

      expect(note.update.calledOnce).to.equal(true);

      expect(note.update.firstCall.args[0]).to.deep.equal({
        isPinned: false,
      });

      expect(result).to.equal(note);
    });
  });

  describe('exportNotes', () => {
    it('should export notes for the user', async () => {
      const notes = [
        {
          title: 'Exported Note',
          content: 'Export content',
          isPinned: false,
        },
      ];

      const findAllStub = sinon.stub(Note, 'findAll').resolves(notes);

      const result = await noteService.exportNotes('user-123');

      expect(result).to.deep.equal(notes);
      expect(findAllStub.calledOnce).to.equal(true);

      const query = findAllStub.firstCall.args[0];

      expect(query.where).to.deep.equal({
        userId: 'user-123',
      });
    });
  });

  describe('importNotes', () => {
    it('should import multiple notes for the user', async () => {
      const firstNote = {
        id: 'note-1',
        title: 'Imported Note',
        content: 'Imported content',
        isPinned: false,
        userId: 'user-123',
      };

      const secondNote = {
        id: 'note-2',
        title: 'Pinned Imported Note',
        content: 'Pinned content',
        isPinned: true,
        userId: 'user-123',
      };

      const transaction = {
        commit: sinon.stub().resolves(),
        rollback: sinon.stub().resolves(),
      };

      const transactionStub = sinon
        .stub(sequelize, 'transaction')
        .callsFake(async (callback) => callback(transaction));

      const createStub = sinon
        .stub(Note, 'create')
        .onFirstCall()
        .resolves(firstNote)
        .onSecondCall()
        .resolves(secondNote);

      const notes = [
        {
          title: 'Imported Note',
          content: 'Imported content',
          isPinned: false,
        },
        {
          title: 'Pinned Imported Note',
          content: 'Pinned content',
          isPinned: true,
        },
      ];

      const result = await noteService.importNotes(
        'user-123',
        notes
      );

      expect(result).to.deep.equal([
        firstNote,
        secondNote,
      ]);

      expect(transactionStub.calledOnce).to.equal(true);
      expect(createStub.callCount).to.equal(2);

      expect(createStub.firstCall.args[0]).to.deep.equal({
        title: 'Imported Note',
        content: 'Imported content',
        isPinned: false,
        userId: 'user-123',
      });

      expect(createStub.firstCall.args[1]).to.deep.equal({
        transaction,
      });

      expect(createStub.secondCall.args[0]).to.deep.equal({
        title: 'Pinned Imported Note',
        content: 'Pinned content',
        isPinned: true,
        userId: 'user-123',
      });

      expect(createStub.secondCall.args[1]).to.deep.equal({
        transaction,
      });
    });
  });


  describe('Error Handling', () => {
    it('should throw a database error when create fails', async () => {
      sinon
        .stub(Note, 'create')
        .rejects(new Error('Connection failed'));

      try {
        await noteService.createNote({
          title: 'Test',
          content: 'Content',
          userId: 'user-123',
        });

        throw new Error('Expected service to throw');
      } catch (error) {
        expect(error.message).to.equal(
          'Database operation failed: Connection failed'
        );

        expect(error.cause).to.be.instanceOf(Error);
      }
    });
  });
});