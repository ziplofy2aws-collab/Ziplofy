import React from 'react';

interface TextEditorToolbarProps {
  variant?: 'default' | 'privacy';
}

const TextEditorToolbar: React.FC<TextEditorToolbarProps> = ({ variant = 'default' }) => {
  if (variant === 'privacy') {
    return (
      <div className="flex gap-1 border-b border-gray-200 p-2">
        <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="Paragraph">Paragraph</button>
        <button className="px-2 py-1 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded" title="Bold">B</button>
        <button className="px-2 py-1 text-sm italic text-gray-700 hover:bg-gray-100 rounded" title="Italic">I</button>
        <button className="px-2 py-1 text-sm underline text-gray-700 hover:bg-gray-100 rounded" title="Underline">U</button>
        <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="Text color">A</button>
        <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="List">≡</button>
        <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="Link">🔗</button>
        <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="Insert image">🖼️</button>
        <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="Insert table">▦</button>
        <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="More options">⋯</button>
        <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="View HTML">&lt;/&gt;</button>
      </div>
    );
  }

  return (
    <div className="flex gap-1 border-b border-gray-200 p-2">
      <button className="px-2 py-1 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded" title="Bold">B</button>
      <button className="px-2 py-1 text-sm italic text-gray-700 hover:bg-gray-100 rounded" title="Italic">I</button>
      <button className="px-2 py-1 text-sm underline text-gray-700 hover:bg-gray-100 rounded" title="Underline">U</button>
      <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="Bulleted list">•</button>
      <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="Numbered list">1.</button>
      <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="Link">🔗</button>
      <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="Insert table">▦</button>
      <button className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded" title="More options">···</button>
    </div>
  );
};

export default TextEditorToolbar;

