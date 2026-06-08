import type { Editor } from '@tiptap/react';

export type ApplyRichTextLinkInput = {
  text: string;
  href: string;
  openInNewTab: boolean;
};

export function readRichTextLinkEditorState(editor: Editor): {
  text: string;
  href: string;
  openInNewTab: boolean;
} {
  const { from, to, empty } = editor.state.selection;
  const attrs = editor.getAttributes('link');
  const href = String(attrs.href ?? '').trim();
  const openInNewTab = attrs.target === '_blank';
  const selectedText = empty ? '' : editor.state.doc.textBetween(from, to, '');
  return {
    text: selectedText,
    href,
    openInNewTab,
  };
}

export function applyRichTextLink(editor: Editor, input: ApplyRichTextLinkInput): void {
  const { text, href, openInNewTab } = input;
  const target = openInNewTab ? '_blank' : null;
  const rel = openInNewTab ? 'noopener noreferrer' : null;
  const { from, to, empty } = editor.state.selection;

  if (!empty) {
    const selected = editor.state.doc.textBetween(from, to, '');
    if (text !== selected) {
      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent({
          type: 'text',
          text,
          marks: [{ type: 'link', attrs: { href, target, rel } }],
        })
        .run();
      return;
    }
    editor.chain().focus().setLink({ href, target, rel }).run();
    return;
  }

  editor
    .chain()
    .focus()
    .insertContent({
      type: 'text',
      text,
      marks: [{ type: 'link', attrs: { href, target, rel } }],
    })
    .run();
}
