import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import RichTextEditor from '../components/RichTextEditor';
import { useAuth } from '../context/AuthContext';

import {
  createNote,
  deleteNote,
  exportNotes,
  getNotes,
  importNotes,
  togglePinNote,
  updateNote,
  type Note,
} from '../services/note.service';

type Filter = 'all' | 'recent' | 'oldest';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getNotes(search, filter);
      setNotes(response.data);
    } catch {
      setError('Unable to load your notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotes();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filter]);

  const openCreateEditor = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setError('');
    setShowEditor(true);
  };

  const openEditEditor = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setError('');
    setShowEditor(true);
  };

  const closeEditor = () => {
    if (saving) return;

    setShowEditor(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    const plainTextContent = content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    if (!title.trim() || !plainTextContent) {
      setError('Title and content are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingNote) {
        await updateNote(editingNote.id, {
          title: title.trim(),
          content,
        });
      } else {
        await createNote({
          title: title.trim(),
          content,
        });
      }

      closeEditor();
      await loadNotes();
    } catch {
      setError('Unable to save the note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this note?'
    );

    if (!confirmed) return;

    try {
      setError('');
      await deleteNote(id);
      await loadNotes();
    } catch {
      setError('Unable to delete the note.');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      setError('');
      await togglePinNote(id);
      await loadNotes();
    } catch {
      setError('Unable to update the note.');
    }
  };

  const handleExport = async () => {
    try {
      setError('');

      const response = await exportNotes();

      const blob = new Blob(
        [JSON.stringify(response.data, null, 2)],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'notes-export.json';

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch {
      setError('Unable to export notes.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setError('');

      if (!file.name.toLowerCase().endsWith('.json')) {
        throw new Error('Only JSON files are supported.');
      }

      const text = await file.text();
      const data = JSON.parse(text);

      if (!data || !Array.isArray(data.notes)) {
        throw new Error('Invalid import format.');
      }

      if (data.notes.length === 0) {
        throw new Error('No notes found.');
      }

      const validNotes = data.notes.every(
        (note: unknown) => {
          if (!note || typeof note !== 'object') {
            return false;
          }

          const item = note as Record<string, unknown>;

          return (
            typeof item.title === 'string' &&
            item.title.trim().length > 0 &&
            typeof item.content === 'string' &&
            item.content.trim().length > 0 &&
            (
              item.isPinned === undefined ||
              typeof item.isPinned === 'boolean'
            )
          );
        }
      );

      if (!validNotes) {
        throw new Error('Invalid note data.');
      }

      await importNotes(data.notes);
      await loadNotes();
    } catch (importError) {
      console.error('Import failed:', importError);
      setError(
        'Unable to import notes. Check the JSON file format.'
      );
    } finally {
      event.target.value = '';
    }
  };

  return (
    <main className="notes-page">
      <header className="notes-header">
        <div>
          <p className="eyebrow">Workspace</p>

          <h1>
            Welcome back{user?.name ? `, ${user.name}` : ''}.
          </h1>

          <p className="notes-subtitle">
            Keep your thoughts organized in one place.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={logout}
        >
          Sign out
        </button>
      </header>

      <section className="notes-toolbar">
        <div className="search-wrapper">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <button
            className="secondary-button"
            onClick={handleImportClick}
          >
            Import
          </button>

          <button
            className="secondary-button"
            onClick={handleExport}
            disabled={notes.length === 0}
          >
            Export
          </button>

          <button
            className="primary-button create-button"
            onClick={openCreateEditor}
          >
            + New Note
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          hidden
        />
      </section>

      <section className="notes-filters">
        {(['all', 'recent', 'oldest'] as Filter[]).map((item) => (
          <button
            key={item}
            className={
              filter === item
                ? 'filter-button active'
                : 'filter-button'
            }
            onClick={() => setFilter(item)}
          >
            {item === 'all'
              ? 'All Notes'
              : item === 'recent'
                ? 'Recent'
                : 'Oldest'}
          </button>
        ))}
      </section>

      {error && (
        <div className="notes-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="notes-empty">
          <p>Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="notes-empty">
          <div className="empty-icon">✦</div>

          <h2>
            {search ? 'No notes found' : 'No notes yet'}
          </h2>

          <p>
            {search
              ? 'Try a different search term.'
              : 'Create your first note to get started.'}
          </p>

          {!search && (
            <button
              className="primary-button empty-button"
              onClick={openCreateEditor}
            >
              Create your first note
            </button>
          )}
        </div>
      ) : (
        <section className="notes-grid">
          {notes.map((note) => (
            <article
              className={`note-card ${
                note.isPinned ? 'pinned' : ''
              }`}
              key={note.id}
            >
              <div className="note-card-top">
                <div>
                  {note.isPinned && (
                    <span className="pin-label">
                      📌 Pinned
                    </span>
                  )}

                  <h2>{note.title}</h2>
                </div>

                <button
                  className="icon-button"
                  title={
                    note.isPinned
                      ? 'Unpin note'
                      : 'Pin note'
                  }
                  onClick={() =>
                    handleTogglePin(note.id)
                  }
                >
                  {note.isPinned ? '★' : '☆'}
                </button>
              </div>

              <div
                className="note-content"
                dangerouslySetInnerHTML={{
                  __html: note.content,
                }}
              />

              <div className="note-card-footer">
                <span>
                  {new Date(
                    note.updatedAt
                  ).toLocaleDateString()}
                </span>

                <div className="note-actions">
                  <button
                    className="text-button"
                    onClick={() =>
                      openEditEditor(note)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="text-button danger"
                    onClick={() =>
                      handleDelete(note.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {showEditor && (
        <div className="modal-backdrop">
          <div className="note-editor">
            <div className="editor-header">
              <div>
                <p className="eyebrow">
                  {editingNote
                    ? 'Edit note'
                    : 'New note'}
                </p>

                <h2>
                  {editingNote
                    ? 'Update your note'
                    : 'Create a note'}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={closeEditor}
                disabled={saving}
                aria-label="Close editor"
              >
                ×
              </button>
            </div>

            <label htmlFor="note-title">
              Title
            </label>

            <input
              id="note-title"
              className="editor-input"
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              disabled={saving}
            />

            <label htmlFor="note-content">
              Content
            </label>

            <RichTextEditor
              content={content}
              onChange={setContent}
              disabled={saving}
            />

            <div className="editor-actions">
              <button
                className="secondary-button"
                onClick={closeEditor}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingNote
                    ? 'Update Note'
                    : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;