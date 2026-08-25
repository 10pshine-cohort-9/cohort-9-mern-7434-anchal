const { expect } = require('chai');
const sinon = require('sinon');

const Note = require('../src/models/Note');
const noteService = require('../src/services/note.service');

describe('Note Service', () => {
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

      sinon.stub(Note, 'create').resolves(note);

      const result = await noteService.createNote({
        title: 'Test Note',
        content: 'Test content',
        userId: 'user-123',
      });

      expect(result).to.deep.equal(note);
      expect(Note.create.calledOnce).to.equal(true);
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
      const where = query.where;

      expect(where.userId).to.equal('user-123');

      const orSymbol = Object.getOwnPropertySymbols(where).find(
        (symbol) => symbol.toString() === 'Symbol(or)'
      );

      expect(orSymbol).to.exist;
      expect(where[orSymbol]).to.have.length(2);

      const titleCondition = where[orSymbol][0].title;
      const contentCondition = where[orSymbol][1].content;

      const titleILikeSymbol = Object.getOwnPropertySymbols(
        titleCondition
      ).find((symbol) => symbol.toString() === 'Symbol(iLike)');

      const contentILikeSymbol = Object.getOwnPropertySymbols(
        contentCondition
      ).find((symbol) => symbol.toString() === 'Symbol(iLike)');

      expect(titleILikeSymbol).to.exist;
      expect(contentILikeSymbol).to.exist;

      expect(titleCondition[titleILikeSymbol]).to.equal(
        '%meeting%'
      );

      expect(contentCondition[contentILikeSymbol]).to.equal(
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
      const createdNotes = [];

      sinon.stub(Note, 'create').callsFake(async (noteData) => {
        const note = {
          id: `note-${createdNotes.length + 1}`,
          ...noteData,
        };

        createdNotes.push(note);

        return note;
      });

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

      expect(result).to.have.length(2);

      expect(result[0].title).to.equal('Imported Note');
      expect(result[0].userId).to.equal('user-123');
      expect(result[0].isPinned).to.equal(false);

      expect(result[1].title).to.equal(
        'Pinned Imported Note'
      );
      expect(result[1].isPinned).to.equal(true);

      expect(Note.create.callCount).to.equal(2);
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