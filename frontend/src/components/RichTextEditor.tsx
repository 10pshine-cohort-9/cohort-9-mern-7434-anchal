import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

const RichTextEditor = ({
  content,
  onChange,
  disabled = false,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();

    if (currentContent !== content) {
      editor.commands.setContent(content || '', {
        emitUpdate: false,
      });
    }
  }, [editor, content]);

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return (
      <div className="editor-textarea">
        Loading editor...
      </div>
    );
  }

  const addLink = () => {
    if (disabled) return;

    const previousUrl = editor.getAttributes('link').href;

    const url = window.prompt(
      'Enter URL',
      previousUrl || 'https://'
    );

    if (url === null) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: trimmedUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
      })
      .run();
  };

  return (
    <div className="rich-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className={
            editor.isActive('bold')
              ? 'toolbar-button active'
              : 'toolbar-button'
          }
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          disabled={disabled}
          title="Bold"
        >
          B
        </button>

        <button
          type="button"
          className={
            editor.isActive('italic')
              ? 'toolbar-button active'
              : 'toolbar-button'
          }
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          disabled={disabled}
          title="Italic"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          className={
            editor.isActive('strike')
              ? 'toolbar-button active'
              : 'toolbar-button'
          }
          onClick={() =>
            editor.chain().focus().toggleStrike().run()
          }
          disabled={disabled}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <span className="toolbar-divider" />

        <button
          type="button"
          className={
            editor.isActive('heading', { level: 2 })
              ? 'toolbar-button active'
              : 'toolbar-button'
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
          disabled={disabled}
          title="Heading"
        >
          H
        </button>

        <button
          type="button"
          className={
            editor.isActive('bulletList')
              ? 'toolbar-button active'
              : 'toolbar-button'
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          disabled={disabled}
          title="Bullet list"
        >
          •
        </button>

        <button
          type="button"
          className={
            editor.isActive('orderedList')
              ? 'toolbar-button active'
              : 'toolbar-button'
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          disabled={disabled}
          title="Numbered list"
        >
          1.
        </button>

        <button
          type="button"
          className="toolbar-button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
          disabled={disabled}
          title="Quote"
        >
          “
        </button>

        <span className="toolbar-divider" />

        <button
          type="button"
          className={
            editor.isActive('link')
              ? 'toolbar-button active'
              : 'toolbar-button'
          }
          onClick={addLink}
          disabled={disabled}
          title="Add link"
        >
          Link
        </button>

        <button
          type="button"
          className="toolbar-button"
          onClick={() =>
            editor.chain().focus().undo().run()
          }
          disabled={
            disabled || !editor.can().undo()
          }
          title="Undo"
        >
          ↶
        </button>

        <button
          type="button"
          className="toolbar-button"
          onClick={() =>
            editor.chain().focus().redo().run()
          }
          disabled={
            disabled || !editor.can().redo()
          }
          title="Redo"
        >
          ↷
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;