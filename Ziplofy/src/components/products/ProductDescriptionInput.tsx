import {
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3CenterLeftIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
  ListBulletIcon,
  NumberedListIcon,
  PhotoIcon,
  PlayCircleIcon,
  SparklesIcon,
  TableCellsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import CharacterCount from "@tiptap/extension-character-count";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ResizableImage from "./ResizableImageExtension";

interface ProductDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** When false, hides image upload controls (used for recovery emails). */
  enableImages?: boolean;
  /** When false, hides the templates (Sparkles) menu. */
  enableTemplates?: boolean;
}

const ICON_BTN =
  "inline-flex h-8 min-w-[2rem] shrink-0 items-center justify-center rounded-md text-sm text-gray-700 transition-colors hover:bg-gray-200/70 disabled:cursor-not-allowed disabled:opacity-35";

const ICON_BTN_ACTIVE = "bg-gray-200/90 text-gray-900";

const DROPDOWN_BTN =
  "inline-flex h-8 max-w-[11rem] items-center gap-1 rounded-md px-2 text-sm text-gray-700 transition-colors hover:bg-gray-200/70";

const MENU_PANEL =
  "absolute left-0 z-30 mt-1 min-w-[13rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg";

const TEXT_PRESETS = [
  "#111827",
  "#b91c1c",
  "#c2410c",
  "#ca8a04",
  "#15803d",
  "#0369a1",
  "#1d4ed8",
  "#6d28d9",
];

const BG_PRESETS = [
  "transparent",
  "#fef9c3",
  "#ffedd5",
  "#fee2e2",
  "#dcfce7",
  "#e0f2fe",
  "#ede9fe",
  "#f3f4f6",
];

const DESCRIPTION_TEMPLATES: Array<{
  id: string;
  name: string;
  useCase: string;
  html: string;
}> = [
  {
    id: "features-first",
    name: "Features-first",
    useCase: "Best for gadgets, accessories, and tools.",
    html: `<h2>Product Overview</h2><p>Write 1-2 lines explaining what this product does and why it matters.</p><h3>Key Features</h3><ul><li><strong>Feature 1:</strong> Add the main benefit in plain language.</li><li><strong>Feature 2:</strong> Mention speed, quality, durability, or comfort.</li><li><strong>Feature 3:</strong> Include what makes this different from alternatives.</li></ul><h3>Specifications</h3><ul><li><strong>Material:</strong> Add material details.</li><li><strong>Dimensions:</strong> Add size/fit information.</li><li><strong>Compatibility:</strong> List supported devices or use-cases.</li></ul><h3>What's in the Box</h3><ul><li>Main product</li><li>Accessory / cable / manual</li></ul>`,
  },
  {
    id: "fashion-beauty",
    name: "Fashion & beauty",
    useCase: "Best for apparel, skincare, and personal care.",
    html: `<h2>Style & Feel</h2><p>Describe the look, feel, and overall vibe customers can expect.</p><h3>Why You'll Love It</h3><ul><li>Highlight comfort, texture, or skin-friendly finish.</li><li>Mention standout design details or ingredients.</li><li>Explain where/when customers can use it.</li></ul><h3>Fit / Usage Details</h3><ul><li><strong>Fit or Type:</strong> Describe true-to-size, regular fit, etc.</li><li><strong>Care:</strong> Add wash/care/storage instructions.</li><li><strong>Suitable for:</strong> Mention skin type, season, or occasion.</li></ul><h3>Ingredients / Fabric</h3><p>List key ingredients or fabric composition and benefits.</p>`,
  },
  {
    id: "home-lifestyle",
    name: "Home & lifestyle",
    useCase: "Best for kitchen, decor, and daily-use items.",
    html: `<h2>Make Everyday Better</h2><p>Introduce how this product improves daily routines at home.</p><h3>Highlights</h3><ul><li>Describe practical daily benefit #1.</li><li>Describe practical daily benefit #2.</li><li>Mention design, finish, or space-saving advantage.</li></ul><h3>How to Use</h3><ol><li>Step 1: Start/setup instructions.</li><li>Step 2: Usage instructions for best results.</li><li>Step 3: Care/maintenance notes.</li></ol><h3>Product Details</h3><ul><li><strong>Size:</strong> Add dimensions.</li><li><strong>Material:</strong> Add build material.</li><li><strong>Ideal for:</strong> Mention room or lifestyle scenario.</li></ul>`,
  },
  {
    id: "story-led-premium",
    name: "Story-led premium",
    useCase: "Best for handcrafted, luxury, and niche brands.",
    html: `<h2>Crafted with Purpose</h2><p>Tell the product story in 2-3 lines: inspiration, maker story, or unique process.</p><h3>Signature Benefits</h3><ul><li>Benefit tied to craftsmanship or premium quality.</li><li>Benefit tied to performance and longevity.</li><li>Benefit tied to uniqueness and brand identity.</li></ul><h3>Design & Build</h3><p>Explain materials, finishes, and special production details.</p><h3>Perfect For</h3><ul><li>Gift buyers</li><li>Enthusiasts / collectors</li><li>Customers who value high-end quality</li></ul><h3>Care Guide</h3><p>Add simple care steps to help customers keep the product in top condition.</p>`,
  },
];

function getBlockPreviewClass(
  kind: "paragraph" | "blockquote" | 1 | 2 | 3 | 4 | 5 | 6
): string {
  if (kind === "paragraph") return "text-[1.05rem] font-semibold text-gray-900";
  if (kind === "blockquote") return "text-lg font-semibold text-gray-800";
  if (kind === 1) return "text-[3rem] font-bold leading-[1.1] text-gray-900";
  if (kind === 2) return "text-[2.2rem] font-bold leading-[1.15] text-gray-900";
  if (kind === 3) return "text-[1.75rem] font-bold leading-[1.2] text-gray-900";
  if (kind === 4) return "text-[1.45rem] font-bold leading-[1.25] text-gray-900";
  if (kind === 5) return "text-[1.2rem] font-semibold leading-[1.3] text-gray-900";
  return "text-[1.05rem] font-semibold leading-[1.35] text-gray-900";
}

function getBlockLabel(editor: Editor | null): string {
  if (!editor) return "Paragraph";
  if (editor.isActive("heading", { level: 1 })) return "Heading 1";
  if (editor.isActive("heading", { level: 2 })) return "Heading 2";
  if (editor.isActive("heading", { level: 3 })) return "Heading 3";
  if (editor.isActive("heading", { level: 4 })) return "Heading 4";
  if (editor.isActive("heading", { level: 5 })) return "Heading 5";
  if (editor.isActive("heading", { level: 6 })) return "Heading 6";
  if (editor.isActive("blockquote")) return "Blockquote";
  return "Paragraph";
}

const ProductDescriptionInput: React.FC<ProductDescriptionInputProps> = ({
  value,
  onChange,
  placeholder = "Describe your product...",
  enableImages = true,
  enableTemplates = true,
}) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value || "");
  const [, setToolbarTick] = useState(0);
  const [isAlignMenuOpen, setIsAlignMenuOpen] = useState(false);
  const [isBlockMenuOpen, setIsBlockMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("https://");
  const [videoEmbedDraft, setVideoEmbedDraft] = useState("");
  const [colorTab, setColorTab] = useState<"text" | "background">("text");
  const alignMenuRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const blockMenuRef = useRef<HTMLDivElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const colorMenuRef = useRef<HTMLDivElement | null>(null);
  const linkPopoverRef = useRef<HTMLDivElement | null>(null);
  const tableMenuRef = useRef<HTMLDivElement | null>(null);
  const templateMenuRef = useRef<HTMLDivElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      HorizontalRule,
      ResizableImage,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        controls: true,
        nocookie: true,
        allowFullscreen: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class:
            "relative cursor-pointer text-blue-600 underline pr-2 after:content-['🔗'] after:absolute after:-right-0.5 after:top-0 after:text-[10px] after:leading-none after:opacity-70",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] max-w-none px-4 py-3 text-sm leading-6 text-gray-900 focus:outline-none [&_.selectedCell]:relative [&_.selectedCell]:bg-blue-50/70 [&_.selectedCell]:after:pointer-events-none [&_.selectedCell]:after:absolute [&_.selectedCell]:after:inset-0 [&_.selectedCell]:after:border [&_.selectedCell]:after:border-blue-300 [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-700 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:my-3 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-snug [&_h3]:my-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-snug [&_iframe]:my-3 [&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border [&_iframe]:border-gray-200 [&_iframe]:bg-black [&_iframe]:shadow-sm [&_img]:my-3 [&_img]:block [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-gray-200 [&_img]:shadow-sm [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-900 [&_pre]:p-3 [&_pre]:text-gray-100 [&_table]:my-3 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-top [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const bump = () => setToolbarTick((n) => n + 1);
    editor.on("selectionUpdate", bump);
    editor.on("transaction", bump);
    return () => {
      editor.off("selectionUpdate", bump);
      editor.off("transaction", bump);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    const current = editor.getHTML();
    if (incoming !== current) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!isHtmlMode) {
      setHtmlValue(value || "");
    }
  }, [value, isHtmlMode]);

  const closeAllMenus = useCallback(() => {
    setIsAlignMenuOpen(false);
    setIsBlockMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsColorMenuOpen(false);
    setIsLinkPopoverOpen(false);
    setIsTableMenuOpen(false);
    setIsTemplateMenuOpen(false);
  }, []);

  useEffect(() => {
    if (
      !isAlignMenuOpen &&
      !isBlockMenuOpen &&
      !isMoreMenuOpen &&
      !isColorMenuOpen &&
      !isLinkPopoverOpen &&
      !isTableMenuOpen &&
      !isTemplateMenuOpen
    )
      return;
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (alignMenuRef.current?.contains(t)) return;
      if (blockMenuRef.current?.contains(t)) return;
      if (moreMenuRef.current?.contains(t)) return;
      if (colorMenuRef.current?.contains(t)) return;
      if (linkPopoverRef.current?.contains(t)) return;
      if (tableMenuRef.current?.contains(t)) return;
      if (templateMenuRef.current?.contains(t)) return;
      closeAllMenus();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    isAlignMenuOpen,
    isBlockMenuOpen,
    isMoreMenuOpen,
    isColorMenuOpen,
    isLinkPopoverOpen,
    isTableMenuOpen,
    isTemplateMenuOpen,
    closeAllMenus,
  ]);

  const openLinkPopover = () => {
    if (!editor) return;
    const selectedLink = (editor.getAttributes("link").href as string) || "";
    setLinkDraft(selectedLink || "https://");
    setIsLinkPopoverOpen((v) => !v);
    setIsAlignMenuOpen(false);
    setIsBlockMenuOpen(false);
    setIsColorMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsTableMenuOpen(false);
    setIsTemplateMenuOpen(false);
  };

  const applyDescriptionTemplate = (templateHtml: string) => {
    if (!editor) return;
    editor.commands.setContent(templateHtml);
    setHtmlValue(templateHtml);
    setIsHtmlMode(false);
    closeAllMenus();
  };

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
    setIsBlockMenuOpen(false);
    setIsAlignMenuOpen(false);
    setIsColorMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsLinkPopoverOpen(false);
    setIsTableMenuOpen(false);
    setIsTemplateMenuOpen(false);
  };

  const handleInsertVideo = () => {
    const snippet = videoEmbedDraft.trim();
    if (!editor || !snippet) return;
    const iframeSrcMatch = snippet.match(/src=["']([^"']+)["']/i);
    const pastedValue = iframeSrcMatch?.[1] || snippet;

    // Accept iframe embed snippets or plain YouTube links.
    const toWatchUrl = (input: string) => {
      try {
        const url = new URL(input);
        if (url.hostname.includes("youtu.be")) {
          const id = url.pathname.replace("/", "");
          return id ? `https://www.youtube.com/watch?v=${id}` : input;
        }
        if (url.pathname.includes("/embed/")) {
          const id = url.pathname.split("/embed/")[1]?.split("/")[0];
          return id ? `https://www.youtube.com/watch?v=${id}` : input;
        }
        return input;
      } catch {
        return input;
      }
    };

    const candidateUrl = toWatchUrl(pastedValue);
    const isYouTubeUrl =
      candidateUrl.includes("youtube.com") || candidateUrl.includes("youtu.be");

    if (!isYouTubeUrl) return;

    editor
      .chain()
      .focus()
      .setYoutubeVideo({
        src: candidateUrl,
        width: 640,
        height: 360,
      })
      .run();
    setIsVideoModalOpen(false);
    setVideoEmbedDraft("");
  };

  const handlePickImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    if (!file.type.startsWith("image/")) return;

    const dataReader = new FileReader();
    dataReader.onload = () => {
      const dataUrl = dataReader.result as string;
      const probe = new window.Image();
      probe.onload = () => {
        const maxStartWidth = 640;
        const naturalW = probe.naturalWidth || maxStartWidth;
        const naturalH = probe.naturalHeight || 360;
        const ratio = naturalH / naturalW;
        const startW = Math.min(maxStartWidth, naturalW);
        const startH = Math.max(80, Math.round(startW * ratio));

        editor
          .chain()
          .focus()
          .setImage({
            src: dataUrl,
            width: `${startW}px`,
            height: `${startH}px`,
          })
          .run();
      };
      probe.src = dataUrl;
    };
    dataReader.readAsDataURL(file);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkDraft.trim();
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setIsLinkPopoverOpen(false);
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsLinkPopoverOpen(false);
  };

  const ToolbarDivider = () => (
    <div className="mx-1 hidden h-6 w-px shrink-0 bg-gray-200 sm:block" aria-hidden />
  );

  const setTextAlign = (alignment: "left" | "center" | "right" | "justify") => {
    editor?.chain().focus().setTextAlign(alignment).run();
    setIsAlignMenuOpen(false);
  };

  const applyTextColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };

  const applyBackgroundColor = (color: string) => {
    if (color === "transparent") {
      editor?.chain().focus().unsetHighlight().run();
      return;
    }
    editor?.chain().focus().setHighlight({ color }).run();
  };

  const getAlignment = (): "left" | "center" | "right" | "justify" => {
    if (editor?.isActive({ textAlign: "center" })) return "center";
    if (editor?.isActive({ textAlign: "right" })) return "right";
    if (editor?.isActive({ textAlign: "justify" })) return "justify";
    return "left";
  };

  const alignment = getAlignment();

  const setBlock = (kind: "paragraph" | "blockquote" | 1 | 2 | 3 | 4 | 5 | 6) => {
    if (!editor) return;
    if (kind === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else if (kind === "blockquote") {
      editor.chain().focus().toggleBlockquote().run();
    } else {
      editor.chain().focus().setHeading({ level: kind }).run();
    }
    setIsBlockMenuOpen(false);
  };

  const blockRow = (
    label: string,
    kind: "paragraph" | "blockquote" | 1 | 2 | 3 | 4 | 5 | 6
  ) => {
    const active = editor ? getBlockLabel(editor) === label : false;
    return (
      <button
        key={label}
        type="button"
        onClick={() => setBlock(kind)}
        className={`group flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left transition-colors ${
          active ? "bg-gray-100/90" : "hover:bg-gray-50"
        }`}
      >
        <span className={getBlockPreviewClass(kind)}>
          {kind === "blockquote" ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-6 w-0.5 rounded bg-gray-300" />
              {label}
            </span>
          ) : (
            label
          )}
        </span>
        <span
          className={`mt-1 text-sm ${
            active ? "text-blue-600" : "text-transparent group-hover:text-gray-300"
          }`}
          aria-hidden
        >
          ✓
        </span>
      </button>
    );
  };

  const handleToggleHtmlMode = () => {
    if (!isHtmlMode) {
      setHtmlValue(editor?.getHTML() || value || "");
      setIsHtmlMode(true);
      closeAllMenus();
      return;
    }
    const next = htmlValue || "";
    onChange(next);
    if (editor) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
    setIsHtmlMode(false);
  };

  const AlignIcon = () => {
    if (alignment === "center") return <Bars3CenterLeftIcon className="h-5 w-5" />;
    if (alignment === "right") return <Bars3BottomRightIcon className="h-5 w-5" />;
    return <Bars3BottomLeftIcon className="h-5 w-5" />;
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Description
      </label>
      <div className="relative overflow-visible rounded-lg border border-gray-200 bg-white shadow-sm">
        {enableImages && (
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFileSelection}
          />
        )}
        <div className="relative z-20 flex flex-wrap items-center gap-0.5 border-b border-gray-200/90 bg-gray-50/95 px-2 py-1.5">
          {enableTemplates && (
            <>
              <div className="relative" ref={templateMenuRef}>
                <button
                  type="button"
                  className={`${ICON_BTN} ${isTemplateMenuOpen ? ICON_BTN_ACTIVE : ""}`}
                  title="Insert template"
                  onClick={() => {
                    setIsTemplateMenuOpen((o) => !o);
                    setIsBlockMenuOpen(false);
                    setIsAlignMenuOpen(false);
                    setIsColorMenuOpen(false);
                    setIsMoreMenuOpen(false);
                    setIsLinkPopoverOpen(false);
                    setIsTableMenuOpen(false);
                  }}
                >
                  <SparklesIcon className="h-5 w-5" aria-hidden />
                </button>
                {isTemplateMenuOpen ? (
                  <div className={`${MENU_PANEL} w-96 p-2`}>
                    <p className="px-2 pb-1 pt-0.5 text-xs font-medium text-gray-500">
                      Choose a template to start faster
                    </p>
                    <div className="max-h-96 space-y-1 overflow-y-auto">
                      {DESCRIPTION_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyDescriptionTemplate(template.html)}
                          className="w-full rounded-md border border-transparent px-3 py-2.5 text-left hover:border-gray-200 hover:bg-gray-50"
                        >
                          <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                          <p className="mt-0.5 text-xs text-gray-600">{template.useCase}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <ToolbarDivider />
            </>
          )}

          <div className="relative" ref={blockMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsBlockMenuOpen((o) => !o);
                setIsAlignMenuOpen(false);
                setIsMoreMenuOpen(false);
                setIsColorMenuOpen(false);
                setIsTemplateMenuOpen(false);
              }}
              className={DROPDOWN_BTN}
              title="Text style"
            >
              <span className="truncate">{getBlockLabel(editor)}</span>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            </button>
            {isBlockMenuOpen && editor ? (
              <div className={`${MENU_PANEL} max-h-80 w-76 overflow-y-auto py-0`}>
                {blockRow("Paragraph", "paragraph")}
                <div className="border-t border-gray-100" />
                {([1, 2, 3, 4, 5, 6] as const).map((level) =>
                  <React.Fragment key={level}>
                    {blockRow(`Heading ${level}`, level)}
                    {level !== 6 ? <div className="border-t border-gray-100" /> : null}
                  </React.Fragment>
                )}
                <div className="border-t border-gray-100" />
                {blockRow("Blockquote", "blockquote")}
              </div>
            ) : null}
          </div>

          <ToolbarDivider />

          <button
            type="button"
            className={`${ICON_BTN} font-bold ${editor?.isActive("bold") ? ICON_BTN_ACTIVE : ""}`}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor?.can().chain().focus().toggleBold().run()}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            className={`${ICON_BTN} italic ${editor?.isActive("italic") ? ICON_BTN_ACTIVE : ""}`}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor?.can().chain().focus().toggleItalic().run()}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            className={`${ICON_BTN} underline ${editor?.isActive("underline") ? ICON_BTN_ACTIVE : ""}`}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            U
          </button>

          <div className="relative" ref={colorMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsColorMenuOpen((o) => !o);
                setIsBlockMenuOpen(false);
                setIsAlignMenuOpen(false);
                setIsMoreMenuOpen(false);
                setIsTemplateMenuOpen(false);
              }}
              className={`${DROPDOWN_BTN} min-w-0 gap-0.5 px-1.5`}
              title="Text & highlight color"
            >
              <span className="text-sm font-semibold leading-none">A</span>
              <span
                className="h-1 w-4 rounded-sm"
                style={{
                  backgroundColor:
                    (editor?.getAttributes("textStyle").color as string) || "#111827",
                }}
              />
              <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden />
            </button>
            {isColorMenuOpen ? (
              <div className={`${MENU_PANEL} w-64 p-3`}>
                <div className="mb-2 flex rounded-md border border-gray-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => setColorTab("text")}
                    className={`flex-1 rounded py-1.5 text-xs font-medium ${
                      colorTab === "text"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorTab("background")}
                    className={`flex-1 rounded py-1.5 text-xs font-medium ${
                      colorTab === "background"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Background
                  </button>
                </div>
                {colorTab === "text" ? (
                  <div className="flex flex-wrap gap-1.5">
                    {TEXT_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="h-7 w-7 rounded-md border border-gray-200 shadow-sm"
                        style={{ backgroundColor: c }}
                        title={c}
                        onClick={() => applyTextColor(c)}
                      />
                    ))}
                    <label className="flex h-7 cursor-pointer items-center rounded-md border border-gray-200 px-2 text-[10px] text-gray-600">
                      Custom
                      <input
                        type="color"
                        className="ml-1 h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
                        value={(editor?.getAttributes("textStyle").color as string) || "#111827"}
                        onChange={(e) => applyTextColor(e.target.value)}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {BG_PRESETS.map((c) => (
                      <button
                        key={c || "x"}
                        type="button"
                        className={`h-7 w-7 rounded-md border border-gray-200 shadow-sm ${
                          c === "transparent" ? "bg-white" : ""
                        }`}
                        style={c === "transparent" ? undefined : { backgroundColor: c }}
                        title={c === "transparent" ? "No highlight" : c}
                        onClick={() => applyBackgroundColor(c)}
                      >
                        {c === "transparent" ? (
                          <span className="block text-[10px] leading-7 text-gray-400">
                            ∅
                          </span>
                        ) : null}
                      </button>
                    ))}
                    <label className="flex h-7 cursor-pointer items-center rounded-md border border-gray-200 px-2 text-[10px] text-gray-600">
                      Custom
                      <input
                        type="color"
                        className="ml-1 h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
                        onChange={(e) => applyBackgroundColor(e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <ToolbarDivider />

          <div className="relative" ref={alignMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsAlignMenuOpen((o) => !o);
                setIsBlockMenuOpen(false);
                setIsMoreMenuOpen(false);
                setIsColorMenuOpen(false);
                setIsTemplateMenuOpen(false);
              }}
              className={DROPDOWN_BTN}
              title="Alignment"
            >
              <AlignIcon />
              <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden />
            </button>
            {isAlignMenuOpen ? (
              <div className={MENU_PANEL}>
                <button
                  type="button"
                  onClick={() => setTextAlign("left")}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${
                    alignment === "left" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                  }`}
                >
                  <Bars3BottomLeftIcon className="h-5 w-5" />
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign("center")}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${
                    alignment === "center" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                  }`}
                >
                  <Bars3CenterLeftIcon className="h-5 w-5" />
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign("right")}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${
                    alignment === "right" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                  }`}
                >
                  <Bars3BottomRightIcon className="h-5 w-5" />
                  Right
                </button>
              </div>
            ) : null}
          </div>

          <ToolbarDivider />

          <div className="relative" ref={linkPopoverRef}>
            <button
              type="button"
              className={`${ICON_BTN} ${editor?.isActive("link") ? ICON_BTN_ACTIVE : ""}`}
              onClick={openLinkPopover}
              disabled={!editor}
              title="Link"
            >
              <LinkIcon className="h-5 w-5" aria-hidden />
            </button>
            {isLinkPopoverOpen ? (
              <div className="absolute left-0 z-30 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <label className="mb-1 block text-xs font-medium text-gray-700">Enter URL</label>
                <input
                  type="url"
                  value={linkDraft}
                  onChange={(e) => setLinkDraft(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="https://"
                />
                <div className="mt-2 flex items-center justify-end gap-2">
                  {editor?.isActive("link") ? (
                    <button
                      type="button"
                      onClick={removeLink}
                      className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      Remove
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setIsLinkPopoverOpen(false)}
                    className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyLink}
                    disabled={!editor || editor.state.selection.empty || !linkDraft.trim()}
                    className="rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
                {editor?.state.selection.empty ? (
                  <p className="mt-1 text-xs text-amber-600">
                    Select text first, then apply the link.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          {enableImages && (
            <button
              type="button"
              className={ICON_BTN}
              onClick={handlePickImage}
              disabled={!editor}
              title="Insert image"
            >
              <PhotoIcon className="h-5 w-5" aria-hidden />
            </button>
          )}
          <button
            type="button"
            className={ICON_BTN}
            onClick={openVideoModal}
            title="Insert video"
          >
            <PlayCircleIcon className="h-5 w-5" aria-hidden />
          </button>
          <div className="relative" ref={tableMenuRef}>
            <button
              type="button"
              className={`${ICON_BTN} ${editor?.isActive("table") ? ICON_BTN_ACTIVE : ""}`}
              onClick={() => {
                setIsTableMenuOpen((o) => !o);
                setIsBlockMenuOpen(false);
                setIsAlignMenuOpen(false);
                setIsColorMenuOpen(false);
                setIsMoreMenuOpen(false);
                setIsTemplateMenuOpen(false);
              }}
              disabled={!editor}
              title="Table"
            >
              <TableCellsIcon className="h-5 w-5" aria-hidden />
            </button>
            {isTableMenuOpen ? (
              <div className={`${MENU_PANEL} left-auto right-0 min-w-56`}>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                    setIsTableMenuOpen(false);
                  }}
                  className="mx-2 my-2 block rounded-md bg-gray-100 px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-200"
                >
                  Insert table
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().addRowBefore().run();
                    setIsTableMenuOpen(false);
                  }}
                  disabled={!editor?.can().chain().focus().addRowBefore().run()}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Insert row above
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().addRowAfter().run();
                    setIsTableMenuOpen(false);
                  }}
                  disabled={!editor?.can().chain().focus().addRowAfter().run()}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Insert row below
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().addColumnBefore().run();
                    setIsTableMenuOpen(false);
                  }}
                  disabled={!editor?.can().chain().focus().addColumnBefore().run()}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Insert column before
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().addColumnAfter().run();
                    setIsTableMenuOpen(false);
                  }}
                  disabled={!editor?.can().chain().focus().addColumnAfter().run()}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Insert column after
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().deleteRow().run();
                    setIsTableMenuOpen(false);
                  }}
                  disabled={!editor?.can().chain().focus().deleteRow().run()}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Delete row
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().deleteColumn().run();
                    setIsTableMenuOpen(false);
                  }}
                  disabled={!editor?.can().chain().focus().deleteColumn().run()}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Delete column
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().deleteTable().run();
                    setIsTableMenuOpen(false);
                  }}
                  disabled={!editor?.can().chain().focus().deleteTable().run()}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Delete table
                </button>
              </div>
            ) : null}
          </div>

          <ToolbarDivider />

          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen((o) => !o);
                setIsBlockMenuOpen(false);
                setIsAlignMenuOpen(false);
                setIsColorMenuOpen(false);
                setIsTemplateMenuOpen(false);
              }}
              className={ICON_BTN}
              title="More"
            >
              <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden />
            </button>
            {isMoreMenuOpen ? (
              <div className={`${MENU_PANEL} right-0 left-auto sm:left-0 sm:right-auto`}>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().toggleBulletList().run();
                    setIsMoreMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ListBulletIcon className="h-4 w-4" />
                  Bulleted list
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().toggleOrderedList().run();
                    setIsMoreMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <NumberedListIcon className="h-4 w-4" />
                  Numbered list
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().sinkListItem("listItem").run();
                    setIsMoreMenuOpen(false);
                  }}
                  disabled={!editor?.can().sinkListItem("listItem")}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Indent
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().liftListItem("listItem").run();
                    setIsMoreMenuOpen(false);
                  }}
                  disabled={!editor?.can().liftListItem("listItem")}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Outdent
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().toggleStrike().run();
                    setIsMoreMenuOpen(false);
                  }}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Strikethrough
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().clearNodes().unsetAllMarks().run();
                    setIsMoreMenuOpen(false);
                  }}
                  className="flex w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Clear formatting
                </button>
              </div>
            ) : null}
          </div>

          <div className="min-w-4 flex-1" aria-hidden />

          <button
            type="button"
            onClick={handleToggleHtmlMode}
            className={`${ICON_BTN} ${isHtmlMode ? ICON_BTN_ACTIVE : ""}`}
            title={isHtmlMode ? "Visual editor" : "HTML / code"}
          >
            <CodeBracketIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="max-h-[min(28rem,55vh)] overflow-y-auto bg-white">
          {isHtmlMode ? (
            <textarea
              value={htmlValue}
              onChange={(e) => {
                setHtmlValue(e.target.value);
                onChange(e.target.value);
              }}
              className="min-h-[220px] w-full resize-y border-0 px-4 py-3 font-mono text-sm text-gray-900 outline-none"
              spellCheck={false}
            />
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
      </div>

      {isVideoModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h4 className="text-2xl font-semibold text-gray-900">Insert video</h4>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="mb-3 text-base text-gray-900">
                Insert a video by pasting the embed snippet in the box below.
              </p>
              <textarea
                value={videoEmbedDraft}
                onChange={(e) => setVideoEmbedDraft(e.target.value)}
                placeholder='<iframe ...></iframe>'
                className="h-28 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                The embed snippet usually starts with "&lt;iframe ...&gt;"
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                disabled={!videoEmbedDraft.trim()}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Insert video
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDescriptionInput;
