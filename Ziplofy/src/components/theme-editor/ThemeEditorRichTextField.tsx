import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import {
  CheckIcon,
  ChevronDownIcon,
  LinkIcon,
  ListBulletIcon,
  NumberedListIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  isRichTextEditorContentEqual,
  normalizeRichTextForEditor,
} from '../../utils/theme-editor-rich-text.util';
import { ThemeEditorInsertLinkModal } from './ThemeEditorInsertLinkModal';
import { ThemeEditorToolbarTooltip } from './ThemeEditorToolbarTooltip';
import { applyRichTextLink, readRichTextLinkEditorState } from './theme-editor-rich-text-link';

export type RichTextBlockStyle =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';

const TEXT_STYLE_MENU: { value: RichTextBlockStyle; label: string; previewClass: string }[] = [
  { value: 'paragraph', label: 'Paragraph', previewClass: 'text-[13px] font-normal text-gray-900' },
  { value: 'h1', label: 'Heading 1', previewClass: 'text-[22px] font-bold leading-tight text-gray-900' },
  { value: 'h2', label: 'Heading 2', previewClass: 'text-[18px] font-bold leading-snug text-gray-900' },
  { value: 'h3', label: 'Heading 3', previewClass: 'text-[16px] font-semibold leading-snug text-gray-900' },
  { value: 'h4', label: 'Heading 4', previewClass: 'text-[15px] font-semibold leading-snug text-gray-900' },
  { value: 'h5', label: 'Heading 5', previewClass: 'text-[14px] font-semibold text-gray-500' },
  { value: 'h6', label: 'Heading 6', previewClass: 'text-[13px] font-semibold text-gray-500' },
];

type Props = {
  id?: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (html: string) => void;
  showDynamicSource?: boolean;
};

function ToolbarButton({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded p-1 transition-colors ${
        active
          ? 'bg-[#e3e4e8] text-gray-900'
          : 'text-gray-600 hover:bg-[#ededed] hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

function readCurrentBlockStyle(editor: Editor | null): RichTextBlockStyle {
  if (!editor) return 'paragraph';
  for (const level of [1, 2, 3, 4, 5, 6] as const) {
    if (editor.isActive('heading', { level })) {
      return `h${level}` as RichTextBlockStyle;
    }
  }
  return 'paragraph';
}

function applyBlockStyle(editor: Editor, style: RichTextBlockStyle): void {
  const chain = editor.chain().focus();
  if (style === 'paragraph') {
    chain.setParagraph().run();
    return;
  }
  const level = Number(style.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6;
  chain.setHeading({ level }).run();
}

const RICH_TEXT_STYLE_MENU_Z = 10050;

function RichTextStyleDropdown({
  editor,
  current,
  onApplied,
}: {
  editor: Editor | null;
  current: RichTextBlockStyle;
  onApplied: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuHeight = 320;
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < menuHeight && rect.top > menuHeight;
    setMenuPos({
      top: openAbove ? rect.top - menuHeight - gap : rect.bottom + gap,
      left: rect.left,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const onReposition = () => updateMenuPosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const pick = (style: RichTextBlockStyle) => {
    if (!editor) return;
    applyBlockStyle(editor, style);
    setOpen(false);
    onApplied();
  };

  const toggleOpen = () => {
    setOpen((wasOpen) => {
      if (!wasOpen) updateMenuPosition();
      return !wasOpen;
    });
  };

  const menu =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              zIndex: RICH_TEXT_STYLE_MENU_Z,
            }}
            className="min-w-[220px] overflow-hidden rounded-lg border border-[#c9cccf] bg-white py-0.5 shadow-lg"
          >
            {TEXT_STYLE_MENU.map((opt, index) => (
              <React.Fragment key={opt.value}>
                {index === 1 ? <div className="border-t border-[#e1e1e1]" aria-hidden /> : null}
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={current === opt.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(opt.value)}
                  className={`flex w-full items-center gap-2 border-b border-[#e1e1e1] px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-[#f6f6f7] ${
                    current === opt.value ? 'bg-[#f6f6f7]' : ''
                  }`}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {current === opt.value ? (
                      <CheckIcon className="h-4 w-4 text-[#005bd3]" strokeWidth={2.5} />
                    ) : null}
                  </span>
                  <span className={opt.previewClass}>{opt.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title="Text style"
        aria-label="Text style"
        aria-expanded={open}
        aria-haspopup="menu"
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggleOpen}
        className={`flex h-7 items-center gap-0.5 rounded px-1.5 text-gray-700 transition-colors hover:bg-[#ededed] ${
          open ? 'bg-[#e3e4e8]' : ''
        }`}
      >
        <span className="text-[13px] font-semibold tracking-tight">Aa</span>
        <ChevronDownIcon className="h-3.5 w-3.5 text-gray-500" />
      </button>
      {menu}
    </>
  );
}

const EDITOR_CONTENT_CLASS =
  'min-h-[88px] max-w-none px-3 py-2 text-[13px] leading-relaxed text-gray-900 focus:outline-none ' +
  '[&_p]:my-1 [&_h1]:my-1 [&_h1]:text-[22px] [&_h1]:font-bold [&_h1]:leading-tight ' +
  '[&_h2]:my-1 [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:leading-snug ' +
  '[&_h3]:my-1 [&_h3]:text-[16px] [&_h3]:font-semibold ' +
  '[&_h4]:my-1 [&_h4]:text-[15px] [&_h4]:font-semibold ' +
  '[&_h5]:my-1 [&_h5]:text-[14px] [&_h5]:font-semibold [&_h5]:text-gray-500 ' +
  '[&_h6]:my-1 [&_h6]:text-[13px] [&_h6]:font-semibold [&_h6]:text-gray-500 ' +
  '[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-6 ' +
  '[&_a]:text-[#005bd3] [&_a]:underline';

export function ThemeEditorRichTextField({
  id,
  label,
  value,
  placeholder = '',
  onChange,
  showDynamicSource = true,
}: Props) {
  const [, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);
  const lastEmittedHtmlRef = useRef<string | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkModalInitial, setLinkModalInitial] = useState({
    text: '',
    href: '',
    openInNewTab: false,
  });
  const openLinkModalRef = useRef<() => void>(() => {});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: 'text-[#005bd3] underline' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: normalizeRichTextForEditor(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: EDITOR_CONTENT_CLASS,
        ...(id ? { id } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmittedHtmlRef.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const onSelection = () => bump();
    editor.on('selectionUpdate', onSelection);
    editor.on('transaction', onSelection);
    editor.on('focus', onSelection);
    editor.on('blur', onSelection);
    return () => {
      editor.off('selectionUpdate', onSelection);
      editor.off('transaction', onSelection);
      editor.off('focus', onSelection);
      editor.off('blur', onSelection);
    };
  }, [editor, bump]);

  useEffect(() => {
    if (!editor) return;
    const incoming = normalizeRichTextForEditor(value);
    const current = editor.getHTML();
    if (lastEmittedHtmlRef.current != null && isRichTextEditorContentEqual(incoming, lastEmittedHtmlRef.current)) {
      return;
    }
    if (isRichTextEditorContentEqual(incoming, current)) {
      lastEmittedHtmlRef.current = incoming;
      return;
    }
    editor.commands.setContent(incoming, { emitUpdate: false });
    lastEmittedHtmlRef.current = incoming;
  }, [editor, value]);

  const blockStyle = readCurrentBlockStyle(editor);

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').run();
    }
    setLinkModalInitial(readRichTextLinkEditorState(editor));
    setLinkModalOpen(true);
  }, [editor]);

  openLinkModalRef.current = openLinkModal;

  useEffect(() => {
    if (!editor) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openLinkModalRef.current();
      }
    };
    const el = editor.view.dom;
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [editor]);

  const handleInsertLink = useCallback(
    (result: { text: string; href: string; openInNewTab: boolean }) => {
      if (!editor) return;
      applyRichTextLink(editor, result);
      setLinkModalOpen(false);
      bump();
    },
    [editor, bump]
  );

  const runCommand = (fn: () => void) => {
    fn();
    bump();
  };

  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-gray-800">
          {label}
        </label>
        {showDynamicSource ? (
          <button
            type="button"
            title="Connect dynamic source"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <span className="sr-only">Dynamic source</span>
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
              <ellipse cx="8" cy="4" rx="6" ry="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M2 4v4c0 1.1 2.7 2 6 2s6-.9 6-2V4M2 8v4c0 1.1 2.7 2 6 2s6-.9 6-2V8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="overflow-visible rounded-lg border border-[#c9cccf] bg-white shadow-sm focus-within:border-[#005bd3] focus-within:ring-1 focus-within:ring-[#005bd3]">
        <div className="relative z-10 flex flex-wrap items-center gap-0.5 overflow-visible border-b border-[#e1e1e1] bg-[#f6f6f7] px-2 py-1">
          <button
            type="button"
            className="rounded p-1 text-violet-600 hover:bg-[#ededed]"
            title="Generate (coming soon)"
            aria-label="Generate"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
          </button>
          <RichTextStyleDropdown editor={editor} current={blockStyle} onApplied={bump} />
          <ToolbarButton
            active={editor?.isActive('bold')}
            title="Bold"
            onClick={() => runCommand(() => editor?.chain().focus().toggleBold().run())}
          >
            <span className="px-1 text-[12px] font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive('italic')}
            title="Italic"
            onClick={() => runCommand(() => editor?.chain().focus().toggleItalic().run())}
          >
            <span className="px-1 text-[12px] italic">I</span>
          </ToolbarButton>
          <ThemeEditorToolbarTooltip label="Insert link – Ctrl+K">
            <ToolbarButton active={editor?.isActive('link')} title="Insert link" onClick={openLinkModal}>
              <LinkIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
          </ThemeEditorToolbarTooltip>
          <ToolbarButton
            active={editor?.isActive('bulletList')}
            title="Bullet list"
            onClick={() => runCommand(() => editor?.chain().focus().toggleBulletList().run())}
          >
            <ListBulletIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive('orderedList')}
            title="Numbered list"
            onClick={() => runCommand(() => editor?.chain().focus().toggleOrderedList().run())}
          >
            <NumberedListIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
        <div className="overflow-hidden rounded-b-lg">
          <EditorContent editor={editor} />
        </div>
      </div>
      <ThemeEditorInsertLinkModal
        open={linkModalOpen}
        initialText={linkModalInitial.text}
        initialHref={linkModalInitial.href}
        initialOpenInNewTab={linkModalInitial.openInNewTab}
        onClose={() => setLinkModalOpen(false)}
        onInsert={handleInsertLink}
      />
    </div>
  );
}

export default ThemeEditorRichTextField;
