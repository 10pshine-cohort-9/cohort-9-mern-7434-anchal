import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  type Note,
} from '../services/notes.service';
import {
  LogOut,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';


const Dashboard = () => {
  const { user, logout } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes();
        setNotes(data);
      } catch {
        setError('Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleCreateNote = async (event: React.FormEvent) => {
    event.preventDefault();

    const isContentEmpty = !content.replace(/<(.|\n)*?>/g, '').trim();

    if (!title.trim() || isContentEmpty) {
      setError('Title and content are required');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (editingNote) {
        const updatedNote = await updateNote(
          editingNote.id,
          title,
          content
        );

        setNotes((currentNotes) =>
          currentNotes.map((note) =>
            note.id === updatedNote.id ? updatedNote : note
          )
        );
      } else {
        const newNote = await createNote(title, content);

        setNotes((currentNotes) => [
          newNote,
          ...currentNotes,
        ]);
      }

      setError('');
      setTitle('');
      setContent('');
      setEditingNote(null);
      setIsCreateNoteOpen(false);
    } catch {
      setError(
        editingNote
          ? 'Failed to update note'
          : 'Failed to create note'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this note? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    if (deletingIds.has(id)) {
      return;
    }

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      setError('');

      await deleteNote(id);

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== id)
      );
    } catch {
      setError('Failed to delete note');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setError('');
    setIsCreateNoteOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setError('');
    setIsCreateNoteOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsCreateNoteOpen(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-card">

        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Workspace</p>

            <h1>
              Welcome back
              {user?.name ? `, ${user.name}` : ''}.
            </h1>

            <p className="dashboard-subtitle">
              {notes.length > 0
                ? `You have ${notes.length} note${notes.length === 1 ? '' : 's'
                } saved.`
                : 'Capture your thoughts, ideas, and to-dos in one place.'}
            </p>
          </div>

          <div className="dashboard-actions">
            <button
              type="button"
              className="primary-button"
              disabled={loading}
              onClick={openCreateModal}
            >
              <Plus size={18} />
              Create Note
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={logout}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="notes-list">
            <div className="note-skeleton" />
            <div className="note-skeleton" />
            <div className="note-skeleton" />
          </div>
        )}

        {!loading && !error && notes.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <StickyNote size={28} />
            </div>

            <h3>No notes yet</h3>

            <p>
              Create your first note to get started.
            </p>
          </div>
        )}

        {!loading && !error && notes.length > 0 && (
          <div className="notes-list">
            {notes.map((note) => (
              <article
                className="note-card"
                key={note.id}
              >
                <div className="note-card-content">
                  <h2>{note.title}</h2>

                  <div
                    className="note-rich-content"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(note.content),
                    }}
                  />
                </div>

                <div className="note-actions">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => openEditModal(note)}
                    disabled={deletingIds.has(note.id)}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="icon-button danger"
                    disabled={deletingIds.has(note.id)}
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 size={15} />

                    {deletingIds.has(note.id)
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {isCreateNoteOpen && (
          <div
            className="modal-overlay"
            onClick={closeModal}
          >
            <div
              className="note-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <p className="eyebrow">
                    {editingNote
                      ? 'Edit note'
                      : 'New note'}
                  </p>

                  <h2>
                    {editingNote
                      ? 'Edit your note'
                      : 'Create a new note'}
                  </h2>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  <X size={18} />
                </button>
              </div>

              <form
                className="note-form"
                onSubmit={handleCreateNote}
              >
                <div className="form-field">
                  <label htmlFor="note-title">
                    Title
                  </label>

                  <input
                    id="note-title"
                    type="text"
                    placeholder="Note title"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>
                    Content
                  </label>

                  <div className="rich-editor">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      placeholder="Write your note..."
                      readOnly={isSubmitting}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : editingNote
                        ? 'Save Changes'
                        : 'Add Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;