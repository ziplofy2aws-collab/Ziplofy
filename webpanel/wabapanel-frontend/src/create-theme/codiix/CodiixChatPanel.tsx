import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowsPointingOutIcon,
  PaperAirplaneIcon,
  StopIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CodiixFaceIcon } from './CodiixFaceIcon';
import { CodiixElementPreview } from './CodiixElementPreview';
import { CodiixChatFormCard } from './CodiixChatFormCard';
import {
  formatAppliedThemeAnswer,
  formatEditCurrentThemeAnswer,
  type CodiixAppliedThemeInfo,
  type CodiixThemePickOption,
} from './codiix-admin-themes';
import {
  buildCreateBlogForm,
  buildCreateBlogPostForm,
  buildCreateCollectionForm,
  parseCreateBlogFormValues,
  parseCreateBlogPostFormValues,
  parseCreateCollectionFormValues,
  type CodiixBlogOption,
  type CodiixCreateBlogInput,
  type CodiixCreateBlogPostInput,
  type CodiixCreateBlogPostResult,
  type CodiixCreateBlogResult,
  type CodiixCreateCollectionInput,
  type CodiixCreateCollectionResult,
  type CodiixChatFormKind,
} from './codiix-chat-form';
import { CODIX_ADMIN_SUGGESTIONS } from './codiix-admin-knowledge';
import { CODIX_SUGGESTIONS } from './codiix-knowledge';
import {
  answerForIntentId,
  categoryIdForIntent,
  matchCodiixIntent,
  type CodiixMatch,
  type CodiixSurface,
} from './match-codiix-intent';
import {
  getCodiixSessionAgenticMode,
  getCodiixSessionDraft,
  getCodiixSessionHasIntroduced,
  getCodiixSessionMessages,
  setCodiixSessionAgenticMode,
  setCodiixSessionDraft,
  setCodiixSessionHasIntroduced,
  setCodiixSessionMessages,
  type CodiixMessage,
  type CodiixSessionScope,
} from './codiix-session';
import {
  agenticSuggestionsForCategory,
  getCodiixCategoryLabel,
  relatedActionsForElement,
  type CodiixAgenticAction,
} from './codiix-elements-catalog';
import {
  type CodiixPageAction,
  type CodiixPageOption,
} from './codiix-pages';
import {
  type CodiixReorderPlan,
  type CodiixStructureSection,
} from './codiix-reorder';
import {
  type CodiixAnnouncementContext,
  type CodiixEditPlan,
} from './codiix-edit-announcement';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';

export type { CodiixMessage };
export type CodiixSaveResult = 'saving' | 'modal' | 'loading' | 'needs-name';
export type CodiixNavigateResult = 'ok' | 'same' | 'checkout' | 'unavailable';
export type CodiixApplyResult = 'applying' | 'no-store' | 'needs-save' | 'busy';

type Props = {
  open: boolean;
  onClose: () => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** theme-editor (default) or store admin. */
  surface?: CodiixSurface;
  /** When set, Agentic mode can insert real sections into the theme. */
  onAgenticInsert?: (elementId: string) => boolean | void;
  /** Works in any mode — same path as the header Save button / save API. */
  onSave?: () => CodiixSaveResult | void;
  saveDisabled?: boolean;
  /** Works in any mode — same as ⋮ → Apply theme. */
  onApplyTheme?: () => CodiixApplyResult | void;
  applyThemeDisabled?: boolean;
  /** Pages from the top page selector (any mode). */
  pages?: CodiixPageOption[];
  currentPageId?: string;
  onNavigatePage?: (pageId: string) => CodiixNavigateResult | void;
  /** Store-admin sidebar navigation (Codiix “take me to products”). */
  onNavigateAdmin?: (path: string) => void;
  /** Create a blog from an in-chat form (admin). */
  onCreateBlog?: (input: CodiixCreateBlogInput) => Promise<CodiixCreateBlogResult>;
  /** List blogs for the create-blog-post form (admin). */
  onListBlogs?: () => Promise<CodiixBlogOption[]>;
  /** Create a blog post from an in-chat form (admin). */
  onCreateBlogPost?: (
    input: CodiixCreateBlogPostInput,
  ) => Promise<CodiixCreateBlogPostResult>;
  /** Create a collection from an in-chat form (admin). */
  onCreateCollection?: (
    input: CodiixCreateCollectionInput,
  ) => Promise<CodiixCreateCollectionResult>;
  /** Resolve the store’s currently applied theme. */
  onGetAppliedTheme?: () => Promise<CodiixAppliedThemeInfo | null>;
  /** List installed + custom themes for quick switch. */
  onListThemePicks?: () => Promise<CodiixThemePickOption[]>;
  /** Apply a theme from the quick list. */
  onApplyThemePick?: (pick: CodiixThemePickOption) => Promise<CodiixAppliedThemeInfo>;
  /** Open the live theme’s editor in a new tab. */
  onOpenAppliedThemeEditor?: () => Promise<CodiixAppliedThemeInfo>;
  /** Current page section tree (header / template / footer). */
  structure?: CodiixStructureSection[];
  /** Reorder sections — same path as sidebar drag. */
  onReorderSections?: (listKey: string, orderedIds: string[]) => boolean | void;
  /** Announcement bar context for chat editing. */
  announcement?: CodiixAnnouncementContext | null;
  /** Patch a settings field (same as the settings panel). */
  onEditField?: (
    path: string,
    fieldType: ThemeEditorFieldType,
    value: string | boolean,
    selectNodeId?: string,
  ) => boolean | void;
};

function sessionScopeForSurface(surface: CodiixSurface): CodiixSessionScope {
  return surface === 'admin' ? 'admin' : 'theme';
}

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function CodiixFormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let index = 0;
  let blockKey = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push(
        <h3 key={blockKey++} className="codiix-markdown__heading">
          {renderInlineMarkdown(heading[2])}
        </h3>,
      );
      index += 1;
      continue;
    }

    const isOpeningTitle =
      blocks.length === 0 &&
      line.length <= 90 &&
      lines[index + 1]?.trim() === '' &&
      !/^(?:•|-)\s+|\d+[.)]\s+/.test(line);
    if (isOpeningTitle) {
      blocks.push(
        <h3 key={blockKey++} className="codiix-markdown__heading">
          {renderInlineMarkdown(line.replace(/:$/, ''))}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (/^(?:•|-)\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(/^(?:•|-)\s+(.+)$/);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push(
        <ul key={blockKey++} className="codiix-markdown__list">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(/^\d+[.)]\s+(.+)$/);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push(
        <ol key={blockKey++} className="codiix-markdown__list codiix-markdown__list--ordered">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        /^(?:#{1,3}\s+|(?:•|-)\s+|\d+[.)]\s+)/.test(next)
      ) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }
    blocks.push(
      <p key={blockKey++} className="codiix-markdown__paragraph">
        {renderInlineMarkdown(paragraph.join(' '))}
      </p>,
    );
  }

  return <div className="codiix-markdown">{blocks}</div>;
}

export function CodiixChatPanel({
  open,
  onClose,
  expanded = true,
  onExpandedChange,
  surface = 'theme-editor',
  onAgenticInsert,
  onSave,
  saveDisabled = false,
  onApplyTheme,
  applyThemeDisabled = false,
  pages = [],
  currentPageId,
  onNavigatePage,
  onNavigateAdmin,
  onCreateBlog,
  onListBlogs,
  onCreateBlogPost,
  onCreateCollection,
  onGetAppliedTheme,
  onListThemePicks,
  onApplyThemePick,
  onOpenAppliedThemeEditor,
  structure = [],
  onReorderSections,
  announcement = null,
  onEditField,
}: Props) {
  const sessionScope = sessionScopeForSurface(surface);
  const isAdmin = surface === 'admin';
  const [draft, setDraftState] = useState(() => getCodiixSessionDraft(sessionScope));
  const [messages, setMessagesState] = useState<CodiixMessage[]>(() =>
    getCodiixSessionMessages(sessionScope),
  );
  const [thinking, setThinking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [agenticMode, setAgenticModeState] = useState(() =>
    getCodiixSessionAgenticMode(sessionScope),
  );
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const previousPageId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationSeq = useRef(0);
  const wasOpen = useRef(false);
  const hasIntroduced = useRef(getCodiixSessionHasIntroduced(sessionScope));
  const [introducing, setIntroducing] = useState(false);
  const isGenerating = thinking || Boolean(streamingMessageId);

  const setDraft = useCallback(
    (value: string | ((prev: string) => string)) => {
      setDraftState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        setCodiixSessionDraft(next, sessionScope);
        return next;
      });
    },
    [sessionScope],
  );

  const setMessages = useCallback(
    (value: CodiixMessage[] | ((prev: CodiixMessage[]) => CodiixMessage[])) => {
      setMessagesState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        setCodiixSessionMessages(next, sessionScope);
        return next;
      });
    },
    [sessionScope],
  );

  const setAgenticMode = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setAgenticModeState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        setCodiixSessionAgenticMode(next, sessionScope);
        return next;
      });
    },
    [sessionScope],
  );

  const empty = messages.length === 0;
  const greeting = useMemo(() => greetingForNow(), [open]);
  // Intro is a non-blocking toast — never replace the chat panel (that caused a stuck
  // first-open state when the dismiss timer was cleared on remount / Strict Mode).
  const showIntro = introducing;

  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      setIntroducing(false);
      if (introTimer.current) {
        clearTimeout(introTimer.current);
        introTimer.current = null;
      }
      return;
    }

    if (wasOpen.current) return;
    wasOpen.current = true;

    if (hasIntroduced.current) return;

    let cancelled = false;
    hasIntroduced.current = true;
    setCodiixSessionHasIntroduced(true, sessionScope);
    setIntroducing(true);

    if (introTimer.current) clearTimeout(introTimer.current);
    introTimer.current = setTimeout(() => {
      introTimer.current = null;
      if (!cancelled) setIntroducing(false);
    }, 1850);

    return () => {
      cancelled = true;
      if (introTimer.current) {
        clearTimeout(introTimer.current);
        introTimer.current = null;
      }
      setIntroducing(false);
    };
  }, [open, sessionScope]);

  const dismissIntro = useCallback(() => {
    if (introTimer.current) {
      clearTimeout(introTimer.current);
      introTimer.current = null;
    }
    setIntroducing(false);
  }, []);

  useEffect(() => {
    if (!open || showIntro) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open, showIntro]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking, open]);

  useEffect(() => {
    return () => {
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
      if (streamTimer.current) clearInterval(streamTimer.current);
      // Intro timer is owned by the open-effect cleanup — don't clear it here or
      // Strict Mode remounts can cancel dismiss and leave a stuck intro with no panel.
    };
  }, []);

  const focusComposer = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const stopGenerating = useCallback(() => {
    generationSeq.current += 1;
    if (thinkTimer.current) {
      clearTimeout(thinkTimer.current);
      thinkTimer.current = null;
    }
    if (streamTimer.current) {
      clearInterval(streamTimer.current);
      streamTimer.current = null;
    }
    setThinking(false);
    setStreamingMessageId(null);
    focusComposer();
  }, [focusComposer]);

  const streamAssistant = useCallback((
    text: string,
    suggestions?: CodiixMessage['suggestions'],
    actions?: CodiixMessage['actions'],
    extras?: {
      relatedActions?: CodiixMessage['relatedActions'];
      relatedCategoryLabel?: string;
      previewElementId?: string;
      pageActions?: CodiixMessage['pageActions'];
      editorActions?: CodiixMessage['editorActions'];
      structureHints?: CodiixMessage['structureHints'];
      editHelpHints?: CodiixMessage['editHelpHints'];
      adminNavActions?: CodiixMessage['adminNavActions'];
      form?: CodiixMessage['form'];
      panelActions?: CodiixMessage['panelActions'];
      themePickActions?: CodiixMessage['themePickActions'];
    },
    seq?: number,
  ) => {
    const activeSeq = seq ?? generationSeq.current;
    if (activeSeq !== generationSeq.current) return;

    const messageId = uid();
    let visibleCharacters = 0;

    if (streamTimer.current) clearInterval(streamTimer.current);
    setThinking(false);
    setStreamingMessageId(messageId);
    setMessages((prev) => [
      ...prev,
      { id: messageId, role: 'assistant', text: '' },
    ]);

    streamTimer.current = setInterval(() => {
      if (activeSeq !== generationSeq.current) {
        if (streamTimer.current) clearInterval(streamTimer.current);
        streamTimer.current = null;
        return;
      }

      visibleCharacters = Math.min(text.length, visibleCharacters + 2);
      const complete = visibleCharacters >= text.length;
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                text: text.slice(0, visibleCharacters),
                suggestions: complete ? suggestions : undefined,
                actions: complete ? actions : undefined,
                relatedActions: complete ? extras?.relatedActions : undefined,
                relatedCategoryLabel: complete ? extras?.relatedCategoryLabel : undefined,
                previewElementId: complete ? extras?.previewElementId : undefined,
                pageActions: complete ? extras?.pageActions : undefined,
                editorActions: complete ? extras?.editorActions : undefined,
                structureHints: complete ? extras?.structureHints : undefined,
                editHelpHints: complete ? extras?.editHelpHints : undefined,
                adminNavActions: complete ? extras?.adminNavActions : undefined,
                form: complete ? extras?.form : undefined,
                panelActions: complete ? extras?.panelActions : undefined,
                themePickActions: complete ? extras?.themePickActions : undefined,
              }
            : message,
        ),
      );

      if (complete) {
        if (streamTimer.current) clearInterval(streamTimer.current);
        streamTimer.current = null;
        setStreamingMessageId(null);
      }
    }, 26);
  }, [setMessages]);

  const runAgenticAction = useCallback(
    (action: CodiixAgenticAction) => {
      if (!onAgenticInsert || busyActionId || thinking || streamingMessageId) return;
      setBusyActionId(action.id);
      const ok = onAgenticInsert(action.elementId);
      const success = ok !== false;
      const related = success
        ? relatedActionsForElement(action.elementId, 4)
        : { actions: [] as CodiixAgenticAction[], categoryLabel: '' };
      streamAssistant(
        success
          ? `Done — I added **${action.label.replace(/^Add\s+/i, '')}** to your theme.\n\n` +
              (related.actions.length
                ? `Want more from **${related.categoryLabel}** as well?`
                : 'Select it in the sidebar to edit settings, or ask me to add something else.')
          : `I couldn’t add **${action.label.replace(/^Add\s+/i, '')}** right now.\n\n` +
              'Make sure the theme is loaded, then try again — or use **Add section** in the sidebar.',
        [
          { id: 'product-elements', label: 'What are product elements?' },
          { id: 'add-section', label: 'How do I add a section?' },
        ],
        undefined,
        success && related.actions.length
          ? {
              relatedActions: related.actions,
              relatedCategoryLabel: related.categoryLabel,
            }
          : undefined,
      );
      setBusyActionId(null);
    },
    [onAgenticInsert, busyActionId, thinking, streamingMessageId, streamAssistant],
  );

  const runSaveCommand = useCallback((): {
    answer: string;
    editorActions?: CodiixMessage['editorActions'];
  } => {
    if (saveDisabled || !onSave) {
      return {
        answer:
          'I can’t save just yet — the theme is still loading.\n\n' +
          'Wait a moment, then say **“save my changes”** again (or tap **Save** in the header).',
      };
    }
    const result = onSave() ?? 'saving';
    if (result === 'loading') {
      return {
        answer:
          'Theme is still loading, so I couldn’t save yet.\n\n' +
          'Give it a second, then ask me again.',
      };
    }
    if (result === 'modal') {
      return {
        answer:
          'This theme isn’t saved yet — I opened the **Save theme** dialog so you can name it.\n\n' +
          'Confirm there and you’re good.',
      };
    }
    if (result === 'needs-name') {
      return {
        answer:
          'I need a **theme name** before saving.\n\n' +
          'Type a name in the header, then say **“save my changes”** again.',
      };
    }
    return {
      answer:
        'Done — I saved the work you’re doing on your theme.\n\n' +
        'Want your customers to see it? Tap **Apply theme** below to apply it to your storefront.',
      editorActions: onApplyTheme
        ? [{ id: 'apply-theme', label: 'Apply theme', action: 'apply' as const }]
        : undefined,
    };
  }, [onSave, saveDisabled, onApplyTheme]);

  const runApplyCommand = useCallback((): string => {
    if (!onApplyTheme) {
      return (
        'Apply theme isn’t available right now.\n\n' +
        'Use **Apply theme** in the ⋮ menu in the header.'
      );
    }
    if (applyThemeDisabled) {
      return 'I’m already applying the theme — hang tight a second.';
    }
    const result = onApplyTheme() ?? 'applying';
    if (result === 'no-store') {
      return (
        'Select a store first, then say **“apply theme”** again.\n\n' +
        'I need an active store to push this theme live.'
      );
    }
    if (result === 'needs-save') {
      return (
        'Save the theme first, then I can apply it.\n\n' +
        'Say **“save my changes”** (or tap **Save**), then **“apply theme”**.'
      );
    }
    if (result === 'busy') {
      return 'I’m already applying the theme — hang tight a second.';
    }
    return (
      'Done — I applied this theme to your storefront, so your customers can see it now.\n\n' +
      'If it was already applied, nothing changes. **Save** stores the work on your theme; **Apply theme** puts it live for customers.'
    );
  }, [onApplyTheme, applyThemeDisabled]);

  const runReorderCommand = useCallback(
    (plan: CodiixReorderPlan): string => {
      if (!onReorderSections) {
        return (
          'I can’t reorder sections right now.\n\n' +
          'Drag them in the left sidebar, or try again in a moment.'
        );
      }
      const ok = onReorderSections(plan.listKey, plan.orderedIds);
      if (ok === false) {
        return (
          `I couldn’t move **${plan.moveLabel}**.\n\n` +
          'Make sure both sections are on this page and in the same group (Header, Template, or Footer).'
        );
      }
      return plan.edge === 'before'
        ? `Done — **${plan.moveLabel}** is now above **${plan.targetLabel}**.`
        : `Done — **${plan.moveLabel}** is now below **${plan.targetLabel}**.`;
    },
    [onReorderSections],
  );

  const runEditCommand = useCallback(
    (plan: CodiixEditPlan): string => {
      if (!onEditField) {
        return (
          'I can’t edit settings right now.\n\n' +
          'Select the Announcement bar in the sidebar and edit it there.'
        );
      }
      const ok = onEditField(plan.path, plan.fieldType, plan.value, plan.selectNodeId);
      if (ok === false) {
        return `I couldn’t update **${plan.label}**. Try again in a moment.`;
      }
      return `Done — ${plan.summary.toLowerCase().replace(/\.$/, '')}.`;
    },
    [onEditField],
  );

  const runAdminNavigate = useCallback(
    (path: string): string => {
      if (!onNavigateAdmin) {
        return (
          'I can’t open admin pages from here right now.\n\n' +
          'Use the left sidebar to jump where you need.'
        );
      }
      onNavigateAdmin(path);
      return 'Opening that page for you.';
    },
    [onNavigateAdmin],
  );

  const resolveAppliedThemeResponse = useCallback(async (): Promise<{
    answer: string;
    panelActions?: CodiixMessage['panelActions'];
    adminNavActions?: CodiixMessage['adminNavActions'];
  }> => {
    if (!onGetAppliedTheme) {
      return {
        answer:
          'I can’t check the live theme right now.\n\n' +
          'Open **Online Store → Themes**, or say **“take me to themes”**.',
        adminNavActions: [
          { id: 'themes', label: 'Go to Themes', path: '/online-store/themes', primary: true },
        ],
      };
    }
    try {
      const info = await onGetAppliedTheme();
      return {
        answer: formatAppliedThemeAnswer(info),
        panelActions: info
          ? [
              {
                id: 'edit-current-theme',
                label: 'Edit this theme',
                action: 'edit-current-theme',
                primary: true,
              },
              { id: 'change-theme', label: 'Change theme?', action: 'show-theme-picker' },
            ]
          : [
              { id: 'change-theme', label: 'Change theme?', action: 'show-theme-picker', primary: true },
            ],
        adminNavActions: [
          { id: 'themes', label: 'Open Themes page', path: '/online-store/themes' },
        ],
      };
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message || 'I couldn’t load your live theme just now.';
      return {
        answer: `${msg}\n\nTry again, or say **“take me to themes”**.`,
        adminNavActions: [
          { id: 'themes', label: 'Go to Themes', path: '/online-store/themes', primary: true },
        ],
      };
    }
  }, [onGetAppliedTheme]);

  const resolveThemePickerResponse = useCallback(async (): Promise<{
    answer: string;
    themePickActions?: CodiixMessage['themePickActions'];
    adminNavActions?: CodiixMessage['adminNavActions'];
  }> => {
    if (!onListThemePicks) {
      return {
        answer:
          'Theme switching isn’t available right now.\n\n' +
          'Say **“take me to themes”** to manage themes on the Themes page.',
        adminNavActions: [
          { id: 'themes', label: 'Go to Themes', path: '/online-store/themes', primary: true },
        ],
      };
    }
    try {
      const picks = await onListThemePicks();
      if (!picks.length) {
        return {
          answer:
            'You don’t have any installed or custom themes yet.\n\n' +
            'Open **Themes** to install a catalog theme or create a custom one.',
          adminNavActions: [
            { id: 'themes', label: 'Go to Themes', path: '/online-store/themes', primary: true },
          ],
        };
      }
      return {
        answer:
          'Here’s a quick list of themes on your store. Tap one to apply it live:',
        themePickActions: picks,
        adminNavActions: [
          { id: 'themes', label: 'Open Themes page', path: '/online-store/themes' },
        ],
      };
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message || 'I couldn’t load your themes just now.';
      return {
        answer: `${msg}\n\nTry again, or say **“take me to themes”**.`,
        adminNavActions: [
          { id: 'themes', label: 'Go to Themes', path: '/online-store/themes', primary: true },
        ],
      };
    }
  }, [onListThemePicks]);

  const resolveEditCurrentThemeResponse = useCallback(async (): Promise<{
    answer: string;
    panelActions?: CodiixMessage['panelActions'];
    adminNavActions?: CodiixMessage['adminNavActions'];
  }> => {
    if (!onOpenAppliedThemeEditor) {
      return {
        answer:
          'I can’t open the theme editor right now.\n\n' +
          'Say **“take me to themes”** and open your live theme from there.',
        adminNavActions: [
          { id: 'themes', label: 'Go to Themes', path: '/online-store/themes', primary: true },
        ],
      };
    }
    try {
      const info = await onOpenAppliedThemeEditor();
      return {
        answer: formatEditCurrentThemeAnswer(info),
        panelActions: [
          { id: 'change-theme', label: 'Change theme?', action: 'show-theme-picker' },
        ],
        adminNavActions: [
          { id: 'themes', label: 'Open Themes page', path: '/online-store/themes' },
        ],
      };
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        'I couldn’t open the editor for your live theme.';
      return {
        answer: `${msg}\n\nTry **“which theme is applied?”** or say **“take me to themes”**.`,
        panelActions: [
          { id: 'change-theme', label: 'Change theme?', action: 'show-theme-picker' },
        ],
        adminNavActions: [
          { id: 'themes', label: 'Go to Themes', path: '/online-store/themes', primary: true },
        ],
      };
    }
  }, [onOpenAppliedThemeEditor]);

  const showThemePicker = useCallback(() => {
    if (thinking || streamingMessageId) return;
    const seq = ++generationSeq.current;
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text: 'Change theme?' }]);
    setThinking(true);
    if (thinkTimer.current) clearTimeout(thinkTimer.current);
    thinkTimer.current = setTimeout(() => {
      void (async () => {
        if (seq !== generationSeq.current) return;
        const resolved = await resolveThemePickerResponse();
        if (seq !== generationSeq.current) return;
        streamAssistant(
          resolved.answer,
          [
            { id: 'admin-applied-theme', label: 'Which theme is applied?' },
            { id: 'admin-edit-current-theme', label: 'Edit my current theme' },
          ],
          undefined,
          {
            themePickActions: resolved.themePickActions,
            adminNavActions: resolved.adminNavActions,
          },
          seq,
        );
      })();
    }, 280);
  }, [
    thinking,
    streamingMessageId,
    setMessages,
    resolveThemePickerResponse,
    streamAssistant,
  ]);

  const openEditCurrentTheme = useCallback(() => {
    if (thinking || streamingMessageId) return;
    const seq = ++generationSeq.current;
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text: 'Edit my current theme' }]);
    setThinking(true);
    if (thinkTimer.current) clearTimeout(thinkTimer.current);
    thinkTimer.current = setTimeout(() => {
      void (async () => {
        if (seq !== generationSeq.current) return;
        const resolved = await resolveEditCurrentThemeResponse();
        if (seq !== generationSeq.current) return;
        streamAssistant(
          resolved.answer,
          [
            { id: 'admin-applied-theme', label: 'Which theme is applied?' },
            { id: 'admin-change-theme', label: 'Change theme' },
          ],
          undefined,
          {
            panelActions: resolved.panelActions,
            adminNavActions: resolved.adminNavActions,
          },
          seq,
        );
      })();
    }, 280);
  }, [
    thinking,
    streamingMessageId,
    setMessages,
    resolveEditCurrentThemeResponse,
    streamAssistant,
  ]);

  const applyThemePick = useCallback(
    async (messageId: string, pick: CodiixThemePickOption) => {
      if (!onApplyThemePick || busyActionId || thinking || streamingMessageId) return;
      if (pick.live) {
        streamAssistant(
          `**${pick.label}** is already live on your store.`,
          [
            { id: 'admin-applied-theme', label: 'Which theme is applied?' },
            { id: 'admin-change-theme', label: 'Change theme' },
          ],
          undefined,
          {
            adminNavActions: [
              { id: 'themes', label: 'Open Themes page', path: '/online-store/themes' },
            ],
          },
        );
        return;
      }

      setBusyActionId(pick.id);
      try {
        const applied = await onApplyThemePick(pick);
        const picks = (await onListThemePicks?.()) ?? [];
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId && m.themePickActions
              ? {
                  ...m,
                  themePickActions: picks.length
                    ? picks
                    : m.themePickActions.map((p) => ({
                        ...p,
                        live: p.themeId === applied.themeId && p.kind === applied.kind,
                      })),
                }
              : m,
          ),
        );
        streamAssistant(
          `Done — **${applied.name}** is now live on your store.\n\n` +
            `• Type: **${applied.kindLabel}**`,
          [
            { id: 'admin-edit-current-theme', label: 'Edit my current theme' },
            { id: 'admin-applied-theme', label: 'Which theme is applied?' },
            { id: 'admin-change-theme', label: 'Change theme again' },
          ],
          undefined,
          {
            adminNavActions: [
              { id: 'themes', label: 'Open Themes page', path: '/online-store/themes', primary: true },
            ],
          },
        );
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response
            ?.data?.message ||
          (err as { message?: string })?.message ||
          'Failed to apply theme';
        streamAssistant(
          `I couldn’t apply **${pick.label}**.\n\n${msg}`,
          [
            { id: 'admin-change-theme', label: 'Try again' },
            { id: 'admin-applied-theme', label: 'Which theme is applied?' },
          ],
        );
      } finally {
        setBusyActionId(null);
      }
    },
    [
      onApplyThemePick,
      onListThemePicks,
      busyActionId,
      thinking,
      streamingMessageId,
      setMessages,
      streamAssistant,
    ],
  );

  const submitChatForm = useCallback(
    async (messageId: string, values: Record<string, string>, kind: CodiixChatFormKind) => {
      if (kind === 'create-collection') {
        const parsed = parseCreateCollectionFormValues(values);
        if ('error' in parsed) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId && m.form
                ? {
                    ...m,
                    form: { ...m.form, status: 'error', errorMessage: parsed.error },
                  }
                : m,
            ),
          );
          return;
        }

        if (!onCreateCollection) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId && m.form
                ? {
                    ...m,
                    form: {
                      ...m.form,
                      status: 'error',
                      errorMessage: 'Collection creation isn’t available right now.',
                    },
                  }
                : m,
            ),
          );
          return;
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId && m.form
              ? { ...m, form: { ...m.form, status: 'submitting', errorMessage: undefined } }
              : m,
          ),
        );

        try {
          const created = await onCreateCollection(parsed);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    text:
                      `Done — I created **${created.title}**.\n\n` +
                      'Want to open it? Use the button below to go to the collection details page.',
                    form: m.form
                      ? { ...m.form, status: 'done', errorMessage: undefined }
                      : undefined,
                    suggestions: [
                      { id: 'admin-create-collection', label: 'Create another collection' },
                      { id: 'admin-products', label: 'How do I add a product?' },
                    ],
                    adminNavActions: [
                      {
                        id: `open-collection-${created.id}`,
                        label: 'Open collection details',
                        path: created.path,
                        primary: true,
                      },
                      {
                        id: 'collections-list',
                        label: 'Collections',
                        path: '/products/collections',
                      },
                    ],
                  }
                : m,
            ),
          );
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } }; message?: string })?.response
              ?.data?.message ||
            (err as { message?: string })?.message ||
            'Failed to create collection';
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId && m.form
                ? {
                    ...m,
                    form: { ...m.form, status: 'error', errorMessage: msg },
                  }
                : m,
            ),
          );
        }
        return;
      }

      if (kind === 'create-blog-post') {
        const parsed = parseCreateBlogPostFormValues(values);
        if ('error' in parsed) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId && m.form
                ? {
                    ...m,
                    form: { ...m.form, status: 'error', errorMessage: parsed.error },
                  }
                : m,
            ),
          );
          return;
        }

        if (!onCreateBlogPost) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId && m.form
                ? {
                    ...m,
                    form: {
                      ...m.form,
                      status: 'error',
                      errorMessage: 'Blog post creation isn’t available right now.',
                    },
                  }
                : m,
            ),
          );
          return;
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId && m.form
              ? { ...m, form: { ...m.form, status: 'submitting', errorMessage: undefined } }
              : m,
          ),
        );

        try {
          const created = await onCreateBlogPost(parsed);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    text:
                      `Done — I created **${created.title}**.\n\n` +
                      'Want to open it? Use the button below to go to the blog post details page.',
                    form: m.form
                      ? { ...m.form, status: 'done', errorMessage: undefined }
                      : undefined,
                    suggestions: [
                      { id: 'admin-create-blog-post', label: 'Create another blog post' },
                      { id: 'admin-create-blog', label: 'Create a blog' },
                    ],
                    adminNavActions: [
                      {
                        id: `open-blog-post-${created.id}`,
                        label: 'Open blog post details',
                        path: created.path,
                        primary: true,
                      },
                      {
                        id: 'blog-posts-list',
                        label: 'Blog posts',
                        path: '/content/articles',
                      },
                    ],
                  }
                : m,
            ),
          );
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } }; message?: string })?.response
              ?.data?.message ||
            (err as { message?: string })?.message ||
            'Failed to create blog post';
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId && m.form
                ? {
                    ...m,
                    form: { ...m.form, status: 'error', errorMessage: msg },
                  }
                : m,
            ),
          );
        }
        return;
      }

      const parsed = parseCreateBlogFormValues(values);
      if ('error' in parsed) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId && m.form
              ? {
                  ...m,
                  form: { ...m.form, status: 'error', errorMessage: parsed.error },
                }
              : m,
          ),
        );
        return;
      }

      if (!onCreateBlog) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId && m.form
              ? {
                  ...m,
                  form: {
                    ...m.form,
                    status: 'error',
                    errorMessage: 'Blog creation isn’t available right now.',
                  },
                }
              : m,
          ),
        );
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId && m.form
            ? { ...m, form: { ...m.form, status: 'submitting', errorMessage: undefined } }
            : m,
        ),
      );

      try {
        const created = await onCreateBlog(parsed);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  text:
                    `Done — I created **${created.title}**.\n\n` +
                    'Want to open it? Use the button below to go to the blog details page.',
                  form: m.form
                    ? { ...m.form, status: 'done', errorMessage: undefined }
                    : undefined,
                  suggestions: [
                    { id: 'admin-create-blog', label: 'Create another blog' },
                    { id: 'admin-create-blog-post', label: 'Create a blog post' },
                  ],
                  adminNavActions: [
                    {
                      id: `open-blog-${created.id}`,
                      label: 'Open blog details',
                      path: created.path,
                      primary: true,
                    },
                    {
                      id: 'blogs-list',
                      label: 'Manage blogs',
                      path: '/content/blogs',
                    },
                  ],
                }
              : m,
          ),
        );
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response
            ?.data?.message ||
          (err as { message?: string })?.message ||
          'Failed to create blog';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId && m.form
              ? {
                  ...m,
                  form: { ...m.form, status: 'error', errorMessage: msg },
                }
              : m,
          ),
        );
      }
    },
    [onCreateBlog, onCreateBlogPost, onCreateCollection, setMessages],
  );

  const runEditorAction = useCallback(
    (action: NonNullable<CodiixMessage['editorActions']>[number]) => {
      if (busyActionId || thinking || streamingMessageId) return;
      if (action.action !== 'apply') return;
      setBusyActionId(action.id);
      const answer = runApplyCommand();
      streamAssistant(answer, [
        { id: 'save-apply', label: 'Save vs Apply theme' },
        { id: 'pages-templates', label: 'Pages & templates' },
      ]);
      setBusyActionId(null);
    },
    [busyActionId, thinking, streamingMessageId, runApplyCommand, streamAssistant],
  );

  const runNavigateCommand = useCallback(
    (pageId: string): string => {
      const page = pages.find((p) => p.id === pageId);
      const label = page?.label ?? pageId;
      if (!onNavigatePage) {
        return (
          `I found **${label}**, but page switching isn’t available right now.\n\n` +
          'Use the page selector in the top bar instead.'
        );
      }
      if (pageId === currentPageId) {
        return `You’re already on **${label}**.`;
      }
      if (currentPageId) previousPageId.current = currentPageId;
      const result = onNavigatePage(pageId) ?? 'ok';
      if (result === 'unavailable') {
        return `I couldn’t open **${label}** right now. Try the page selector in the top bar.`;
      }
      if (result === 'same') {
        return `You’re already on **${label}**.`;
      }
      if (result === 'checkout') {
        return `Opening **${label}** for you.`;
      }
      return `Done — you’re now on **${label}**.`;
    },
    [pages, onNavigatePage, currentPageId],
  );

  const runPageAction = useCallback(
    (action: CodiixPageAction) => {
      if (busyActionId || thinking || streamingMessageId) return;
      setBusyActionId(action.id);
      const answer = runNavigateCommand(action.pageId);
      const more = pages
        .filter((p) => p.id !== action.pageId && p.id !== currentPageId)
        .slice(0, 5)
        .map((p) => ({
          id: `page-${p.id}`,
          label: `Go to ${p.label}`,
          pageId: p.id,
          kind: p.kind,
        }));
      streamAssistant(
        answer,
        [
          { id: 'pages-templates', label: 'Pages & templates' },
          { id: 'save-apply', label: 'Save vs Apply theme' },
        ],
        undefined,
        { pageActions: more },
      );
      setBusyActionId(null);
    },
    [
      busyActionId,
      thinking,
      streamingMessageId,
      runNavigateCommand,
      pages,
      currentPageId,
      streamAssistant,
    ],
  );

  const respond = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed || thinking || streamingMessageId) return;

      const seq = ++generationSeq.current;
      setMessages((prev) => [...prev, { id: uid(), role: 'user', text: trimmed }]);
      setDraft('');
      setThinking(true);
      // Keep the composer focused after send (do not disable the textarea —
      // disabled inputs blur and force a re-tap).
      focusComposer();

      const delay = 420 + Math.min(900, trimmed.length * 18);
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
      thinkTimer.current = setTimeout(() => {
        void (async () => {
          if (seq !== generationSeq.current) return;

          const match = matchCodiixIntent(trimmed, {
            agentic: agenticMode,
            surface,
            pages,
            currentPageId,
            previousPageId: previousPageId.current,
            structure,
            announcement,
          });
          const defaultSuggestions = isAdmin
            ? CODIX_ADMIN_SUGGESTIONS.slice(0, 3)
            : CODIX_SUGGESTIONS.slice(0, 3).map((s) => ({ id: s.id, label: s.label }));
          const followUps =
            match.relatedSuggestions.length > 0
              ? match.relatedSuggestions
              : defaultSuggestions;

          let answer = match.answer;
          let editorActions = match.editorActions;
          let form = match.form;
          if (match.systemAction === 'save') {
            const saved = runSaveCommand();
            answer = saved.answer;
            editorActions = saved.editorActions ?? editorActions;
          } else if (match.systemAction === 'apply') {
            answer = runApplyCommand();
            editorActions = undefined;
          } else if (match.systemAction === 'navigate' && match.pageTargetId) {
            answer = runNavigateCommand(match.pageTargetId);
          } else if (match.systemAction === 'reorder' && match.reorderPlan) {
            answer = runReorderCommand(match.reorderPlan);
          } else if (match.systemAction === 'edit' && match.editPlan) {
            answer = runEditCommand(match.editPlan);
          } else if (match.systemAction === 'admin-navigate' && match.adminPath) {
            answer = runAdminNavigate(match.adminPath);
            // Prefer the match’s richer “Opening **Label**…” if navigate succeeded.
            if (onNavigateAdmin) answer = match.answer;
          } else if (
            match.systemAction === 'admin-form' &&
            match.form?.kind === 'create-blog-post'
          ) {
            const blogs = (await onListBlogs?.()) ?? [];
            if (!blogs.length) {
              answer =
                'You don’t have a blog yet — create one first, then I can add a post.\n\n' +
                'Say **“create a blog”** and I’ll open the form.';
              form = undefined;
            } else {
              form = buildCreateBlogPostForm(blogs);
            }
          }

          let panelActions = match.panelActions;
          let themePickActions = match.themePickActions;
          let adminNavActions = match.adminNavActions;

          if (match.systemAction === 'admin-applied-theme') {
            const resolved = await resolveAppliedThemeResponse();
            answer = resolved.answer;
            panelActions = resolved.panelActions;
            adminNavActions = resolved.adminNavActions;
          } else if (match.systemAction === 'admin-change-theme') {
            const resolved = await resolveThemePickerResponse();
            answer = resolved.answer;
            themePickActions = resolved.themePickActions;
            adminNavActions = resolved.adminNavActions;
          } else if (match.systemAction === 'admin-edit-current-theme') {
            const resolved = await resolveEditCurrentThemeResponse();
            answer = resolved.answer;
            panelActions = resolved.panelActions;
            adminNavActions = resolved.adminNavActions;
          }

          if (seq !== generationSeq.current) return;

          streamAssistant(answer, followUps, match.actions, {
            relatedActions: match.relatedActions,
            relatedCategoryLabel: match.relatedCategoryLabel,
            previewElementId: match.previewElementId,
            pageActions: match.pageActions,
            editorActions,
            structureHints: match.structureHints,
            editHelpHints: match.editHelpHints,
            adminNavActions,
            form,
            panelActions,
            themePickActions,
          }, seq);
        })();
      }, delay);
    },
    [
      thinking,
      streamingMessageId,
      streamAssistant,
      agenticMode,
      surface,
      isAdmin,
      setMessages,
      setDraft,
      focusComposer,
      runSaveCommand,
      runApplyCommand,
      runNavigateCommand,
      runReorderCommand,
      runEditCommand,
      runAdminNavigate,
      onNavigateAdmin,
      onListBlogs,
      resolveAppliedThemeResponse,
      resolveThemePickerResponse,
      resolveEditCurrentThemeResponse,
      pages,
      currentPageId,
      structure,
      announcement,
    ],
  );

  const respondFromSuggestion = useCallback(
    (id: string, label: string) => {
      if (thinking || streamingMessageId) return;
      const seq = ++generationSeq.current;
      setMessages((prev) => [...prev, { id: uid(), role: 'user', text: label }]);
      setThinking(true);
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
      thinkTimer.current = setTimeout(() => {
        void (async () => {
          if (seq !== generationSeq.current) return;

          const canned = answerForIntentId(id, surface);
          const categoryId = categoryIdForIntent(id, surface);
          const categoryActions =
            !isAdmin && agenticMode && categoryId
              ? agenticSuggestionsForCategory(categoryId)
              : undefined;
          let match: CodiixMatch;
          if (canned) {
            const isCreateBlog = id === 'admin-create-blog';
            const isCreateBlogPost = id === 'admin-create-blog-post';
            const isCreateCollection = id === 'admin-create-collection';
            const isAppliedTheme = id === 'admin-applied-theme';
            const isChangeTheme = id === 'admin-change-theme';
            const isEditCurrentTheme = id === 'admin-edit-current-theme';
            match = {
              intentId: id,
              answer: canned,
              relatedSuggestions: [],
              actions: categoryActions?.slice(0, 1),
              relatedActions: categoryActions?.slice(1),
              relatedCategoryLabel: categoryId ? getCodiixCategoryLabel(categoryId) : undefined,
              previewElementId: categoryActions?.[0]?.elementId,
              pageActions:
                id === 'pages-templates'
                  ? pages
                      .filter((p) => p.id !== currentPageId)
                      .slice(0, 6)
                      .map((p) => ({
                        id: `page-${p.id}`,
                        label: `Go to ${p.label}`,
                        pageId: p.id,
                        kind: p.kind,
                      }))
                  : undefined,
              systemAction:
                id === 'pages-templates'
                  ? 'list-pages'
                  : isCreateBlog || isCreateBlogPost || isCreateCollection
                    ? 'admin-form'
                    : isAppliedTheme
                      ? 'admin-applied-theme'
                      : isChangeTheme
                        ? 'admin-change-theme'
                        : isEditCurrentTheme
                          ? 'admin-edit-current-theme'
                          : undefined,
              form: isCreateBlog
                ? buildCreateBlogForm()
                : isCreateBlogPost
                  ? buildCreateBlogPostForm([])
                  : isCreateCollection
                    ? buildCreateCollectionForm()
                    : undefined,
              adminNavActions:
                isAdmin &&
                !isCreateBlog &&
                !isCreateBlogPost &&
                !isCreateCollection &&
                !isAppliedTheme &&
                !isChangeTheme &&
                !isEditCurrentTheme
                  ? [
                      { id: 'products', label: 'Go to Products', path: '/products' },
                      { id: 'orders', label: 'Go to Orders', path: '/orders' },
                      { id: 'themes', label: 'Go to Themes', path: '/online-store/themes' },
                    ]
                  : undefined,
            };
          } else {
            match = matchCodiixIntent(label, {
              agentic: agenticMode,
              surface,
              pages,
              currentPageId,
              previousPageId: previousPageId.current,
              structure,
              announcement,
            });
          }
          const defaultSuggestions = isAdmin
            ? CODIX_ADMIN_SUGGESTIONS.filter((s) => s.id !== id).slice(0, 3)
            : CODIX_SUGGESTIONS.filter((s) => s.id !== id)
                .slice(0, 3)
                .map((s) => ({ id: s.id, label: s.label }));
          const followUps =
            match.relatedSuggestions.length > 0
              ? match.relatedSuggestions
              : defaultSuggestions;
          const actions = match.actions?.length ? match.actions : undefined;
          let answer = match.answer;
          let form = match.form;
          if (
            !isAdmin &&
            agenticMode &&
            (actions?.length || match.relatedActions?.length) &&
            !answer.includes('Agentic mode is on') &&
            !answer.includes('catalog preview')
          ) {
            answer +=
              '\n\n**Agentic mode is on** — tap a button below and I’ll add that section for you.';
          }
          if (id === 'pages-templates' && match.pageActions?.length) {
            answer +=
              '\n\nOr just tell me — e.g. **“take me to cart”**, **“switch to product page”**, or **“go back”**.';
          }
          if (id === 'reorder' && structure.length) {
            answer +=
              '\n\nOr say it here — e.g. **“move Contact form above Email signup”**.';
            match.structureHints = structure.slice(0, 8).map((s) => ({
              id: s.nodeId,
              label: s.label,
            }));
          }
          if (match.systemAction === 'navigate' && match.pageTargetId) {
            answer = runNavigateCommand(match.pageTargetId);
          }
          if (match.systemAction === 'apply') {
            answer = runApplyCommand();
          }
          if (match.systemAction === 'reorder' && match.reorderPlan) {
            answer = runReorderCommand(match.reorderPlan);
          }
          if (match.systemAction === 'edit' && match.editPlan) {
            answer = runEditCommand(match.editPlan);
          }
          if (match.systemAction === 'admin-navigate' && match.adminPath) {
            runAdminNavigate(match.adminPath);
            if (onNavigateAdmin) answer = match.answer;
          }
          if (
            match.systemAction === 'admin-form' &&
            match.form?.kind === 'create-blog-post'
          ) {
            const blogs = (await onListBlogs?.()) ?? [];
            if (!blogs.length) {
              answer =
                'You don’t have a blog yet — create one first, then I can add a post.\n\n' +
                'Say **“create a blog”** and I’ll open the form.';
              form = undefined;
            } else {
              form = buildCreateBlogPostForm(blogs);
            }
          }

          let panelActions = match.panelActions;
          let themePickActions = match.themePickActions;
          let adminNavActions = match.adminNavActions;

          if (match.systemAction === 'admin-applied-theme') {
            const resolved = await resolveAppliedThemeResponse();
            answer = resolved.answer;
            panelActions = resolved.panelActions;
            adminNavActions = resolved.adminNavActions;
          } else if (match.systemAction === 'admin-change-theme') {
            const resolved = await resolveThemePickerResponse();
            answer = resolved.answer;
            themePickActions = resolved.themePickActions;
            adminNavActions = resolved.adminNavActions;
          } else if (match.systemAction === 'admin-edit-current-theme') {
            const resolved = await resolveEditCurrentThemeResponse();
            answer = resolved.answer;
            panelActions = resolved.panelActions;
            adminNavActions = resolved.adminNavActions;
          }

          if (seq !== generationSeq.current) return;

          streamAssistant(answer, followUps, actions, {
            relatedActions: match.relatedActions,
            relatedCategoryLabel: match.relatedCategoryLabel,
            previewElementId: match.previewElementId,
            pageActions: match.pageActions,
            editorActions: match.editorActions,
            structureHints: match.structureHints,
            editHelpHints: match.editHelpHints,
            adminNavActions,
            form,
            panelActions,
            themePickActions,
          }, seq);
        })();
      }, 380);
    },
    [
      thinking,
      streamingMessageId,
      streamAssistant,
      agenticMode,
      surface,
      isAdmin,
      setMessages,
      pages,
      currentPageId,
      structure,
      announcement,
      runNavigateCommand,
      runApplyCommand,
      runReorderCommand,
      runEditCommand,
      runAdminNavigate,
      onNavigateAdmin,
      onListBlogs,
      resolveAppliedThemeResponse,
      resolveThemePickerResponse,
      resolveEditCurrentThemeResponse,
    ],
  );

  const onSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      respond(draft);
    },
    [draft, respond],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        respond(draft);
      }
    },
    [draft, respond],
  );

  if (!open) return null;

  return (
    <>
      {showIntro ? (
        <button
          type="button"
          className="codiix-intro"
          role="status"
          aria-live="polite"
          aria-label="Codiix is ready"
          onClick={dismissIntro}
          title="Tap to continue"
        >
          <div className="codiix-intro__glow" aria-hidden="true" />
          <CodiixFaceIcon className="codiix-intro__face" title="Codiix" />
          <div className="codiix-intro__copy">
            <p className="codiix-intro__hello">
              Hi, I&apos;m Codiix <span className="codiix-intro__wave" aria-hidden="true">👋</span>
            </p>
            <p className="codiix-intro__byline">
              {isAdmin ? 'Your store helper by Codiic' : 'Your theme helper by Codiic'}
            </p>
          </div>
          <span className="codiix-intro__progress" aria-hidden="true" />
        </button>
      ) : null}

      <div
        className={`codiix-panel ${expanded ? 'codiix-panel--expanded' : ''}`}
        role="dialog"
        aria-label={isAdmin ? 'Codiix store helper' : 'Codiix theme helper'}
        aria-modal="false"
      >
      <div className="codiix-panel__chrome">
        <div className="codiix-panel__title">
          <CodiixFaceIcon className="h-6 w-6 shrink-0" />
          <span>Codiix</span>
        </div>
        <div className="codiix-panel__actions">
          {onAgenticInsert ? (
            <button
              type="button"
              className={`codiix-agentic-toggle ${agenticMode ? 'codiix-agentic-toggle--on' : ''}`}
              title={agenticMode ? 'Agentic mode on' : 'Turn on Agentic mode'}
              aria-pressed={agenticMode}
              onClick={() => setAgenticMode((v) => !v)}
            >
              <span className="codiix-agentic-toggle__dot" aria-hidden="true" />
              Agentic
            </button>
          ) : null}
          {onExpandedChange ? (
            <button
              type="button"
              className="codiix-icon-btn"
              title={expanded ? 'Shrink' : 'Expand'}
              aria-label={expanded ? 'Shrink panel' : 'Expand panel'}
              onClick={() => onExpandedChange(!expanded)}
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            className="codiix-icon-btn"
            title="Close"
            aria-label="Close Codiix"
            onClick={onClose}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={listRef} className="codiix-panel__body">
        {empty ? (
          <div className="codiix-empty">
            <CodiixFaceIcon className="codiix-empty__face" title="Codiix" />
            <p className="codiix-empty__greet">{greeting}</p>
            <h2 className="codiix-empty__ask">How can I help?</h2>
            {isAdmin ? (
              <p className="codiix-empty__agentic">
                Try “edit my current theme”, “which theme is applied?”, or “change theme”
              </p>
            ) : agenticMode ? (
              <p className="codiix-empty__agentic">
                Agentic on — try “hero”, “add faq”, or “take me to cart”
              </p>
            ) : (
              <p className="codiix-empty__agentic">
                Try “take me to cart”, “switch to home”, or “change page”
              </p>
            )}
            <div className="codiix-chips">
              {(isAdmin
                ? [
                    { id: 'admin-edit-current-theme', label: 'Edit my current theme' },
                    { id: 'admin-applied-theme', label: 'Which theme is applied?' },
                    { id: 'admin-change-theme', label: 'Change theme' },
                    { id: 'admin-create-collection', label: 'Create a collection' },
                    { id: 'admin-create-blog-post', label: 'Create a blog post' },
                  ]
                : agenticMode
                ? [
                    { id: 'add-header', label: 'Add Header' },
                    { id: 'go-home', label: 'Take me to home' },
                    { id: 'product-elements', label: 'What are product elements?' },
                    { id: 'pages-templates', label: 'Pages & templates' },
                    { id: 'agentic-mode', label: 'What is Agentic mode?' },
                  ]
                : [
                    { id: 'go-home', label: 'Take me to home' },
                    { id: 'go-cart', label: 'Switch to cart' },
                    { id: 'apply-theme', label: 'Apply theme' },
                    { id: 'pages-templates', label: 'Pages & templates' },
                    ...CODIX_SUGGESTIONS.filter((s) => s.id !== 'pages-templates').slice(0, 1),
                  ]
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="codiix-chip"
                  onClick={() =>
                    s.id.startsWith('go-') ||
                    s.id === 'apply-theme' ||
                    (agenticMode && s.id.startsWith('add-'))
                      ? respond(s.label)
                      : respondFromSuggestion(s.id, s.label)
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="codiix-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`codiix-msg ${m.role === 'user' ? 'codiix-msg--user' : 'codiix-msg--bot'}`}
              >
                {m.role === 'assistant' ? (
                  <CodiixFaceIcon className="codiix-msg__avatar" />
                ) : null}
                <div
                  className={`codiix-msg__bubble ${
                    m.id === streamingMessageId ? 'codiix-msg__bubble--streaming' : ''
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <CodiixFormattedMessage text={m.text} />
                  ) : (
                    <p className="codiix-msg__text">{m.text}</p>
                  )}
                  {m.previewElementId ? (
                    <CodiixElementPreview elementId={m.previewElementId} />
                  ) : null}
                  {m.actions && m.actions.length > 0 ? (
                    <div className="codiix-actions">
                      {m.actions.map((action) => (
                        <button
                          key={action.id}
                          type="button"
                          className="codiix-action-btn"
                          disabled={Boolean(busyActionId) || !onAgenticInsert}
                          onClick={() => runAgenticAction(action)}
                        >
                          {busyActionId === action.id ? 'Adding…' : action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {m.editorActions && m.editorActions.length > 0 ? (
                    <div className="codiix-actions">
                      {m.editorActions.map((action) => (
                        <button
                          key={action.id}
                          type="button"
                          className="codiix-action-btn"
                          disabled={
                            Boolean(busyActionId) ||
                            !onApplyTheme ||
                            (action.action === 'apply' && applyThemeDisabled)
                          }
                          onClick={() => runEditorAction(action)}
                        >
                          {busyActionId === action.id ? 'Applying…' : action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {m.relatedActions && m.relatedActions.length > 0 ? (
                    <div className="codiix-related">
                      <p className="codiix-related__label">
                        {m.relatedCategoryLabel
                          ? `Want these from ${m.relatedCategoryLabel.replace(/\s+elements$/i, '').trim()} as well?`
                          : 'Want related elements as well?'}
                      </p>
                      <div className="codiix-actions codiix-actions--related">
                        {m.relatedActions.map((action) => (
                          <button
                            key={action.id}
                            type="button"
                            className="codiix-action-btn codiix-action-btn--ghost"
                            disabled={Boolean(busyActionId) || !onAgenticInsert}
                            onClick={() => runAgenticAction(action)}
                          >
                            {busyActionId === action.id ? 'Adding…' : action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {m.pageActions && m.pageActions.length > 0 ? (
                    <div className="codiix-related">
                      <p className="codiix-related__label">Pages from the selector</p>
                      <div className="codiix-actions codiix-actions--related">
                        {m.pageActions.map((action) => (
                          <button
                            key={action.id}
                            type="button"
                            className="codiix-action-btn codiix-action-btn--page"
                            disabled={Boolean(busyActionId) || !onNavigatePage}
                            onClick={() => runPageAction(action)}
                          >
                            {busyActionId === action.id ? 'Switching…' : action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {m.structureHints && m.structureHints.length > 0 ? (
                    <div className="codiix-related">
                      <p className="codiix-related__label">On this page — tap to start a move</p>
                      <div className="codiix-chips codiix-chips--inline">
                        {m.structureHints.map((hint) => (
                          <button
                            key={hint.id}
                            type="button"
                            className="codiix-chip"
                            onClick={() => {
                              setDraft(`move ${hint.label} above `);
                              window.setTimeout(() => inputRef.current?.focus(), 40);
                            }}
                            title={`Move ${hint.label}…`}
                          >
                            {hint.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {m.editHelpHints && m.editHelpHints.length > 0 ? (
                    <div className="codiix-related">
                      <p className="codiix-related__label">Try an announcement edit</p>
                      <div className="codiix-chips codiix-chips--inline">
                        {m.editHelpHints.map((hint) => (
                          <button
                            key={hint.id}
                            type="button"
                            className="codiix-chip"
                            onClick={() => {
                              const drafts: Record<string, string> = {
                                'ann-text': 'change announcement text to ',
                                'ann-bg': 'set announcement background to ',
                                'ann-color': 'change announcement text color to ',
                                'ann-hide': 'hide announcement bar',
                                'ann-show': 'show announcement bar',
                                'ann-link': 'set announcement link to ',
                              };
                              setDraft(drafts[hint.id] ?? `${hint.label} `);
                              window.setTimeout(() => inputRef.current?.focus(), 40);
                            }}
                            title={hint.label}
                          >
                            {hint.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {m.form ? (
                    <CodiixChatFormCard
                      form={m.form}
                      onSubmit={(values) => submitChatForm(m.id, values, m.form!.kind)}
                    />
                  ) : null}
                  {m.panelActions && m.panelActions.length > 0 ? (
                    <div className="codiix-related">
                      <div className="codiix-chips codiix-chips--inline">
                        {m.panelActions.map((action) => (
                          <button
                            key={action.id}
                            type="button"
                            className={action.primary ? 'codiix-nav-cta' : 'codiix-chip'}
                            disabled={Boolean(busyActionId) || isGenerating}
                            onClick={() => {
                              if (action.action === 'show-theme-picker') showThemePicker();
                              if (action.action === 'edit-current-theme') openEditCurrentTheme();
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {m.themePickActions && m.themePickActions.length > 0 ? (
                    <div className="codiix-theme-picks" role="list">
                      {m.themePickActions.map((pick) => (
                        <button
                          key={pick.id}
                          type="button"
                          role="listitem"
                          className={`codiix-theme-pick ${pick.live ? 'codiix-theme-pick--live' : ''}`}
                          disabled={Boolean(busyActionId) || isGenerating || pick.live}
                          onClick={() => void applyThemePick(m.id, pick)}
                          title={
                            pick.live
                              ? `${pick.label} is live`
                              : `Apply ${pick.label}`
                          }
                        >
                          <span className="codiix-theme-pick__name">{pick.label}</span>
                          <span className="codiix-theme-pick__meta">
                            <span className="codiix-theme-pick__kind">{pick.kindLabel}</span>
                            {pick.live ? (
                              <span className="codiix-theme-pick__badge">Live</span>
                            ) : (
                              <span className="codiix-theme-pick__apply">Apply</span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {m.adminNavActions && m.adminNavActions.length > 0 ? (
                    <div className="codiix-related">
                      {m.adminNavActions.some((nav) => nav.primary) ? null : (
                        <p className="codiix-related__label">Jump to</p>
                      )}
                      <div className="codiix-chips codiix-chips--inline">
                        {m.adminNavActions.map((nav) => (
                          <button
                            key={nav.id}
                            type="button"
                            className={nav.primary ? 'codiix-nav-cta' : 'codiix-chip'}
                            onClick={() => onNavigateAdmin?.(nav.path)}
                            title={nav.label}
                          >
                            {nav.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {m.suggestions && m.suggestions.length > 0 ? (
                    <div className="codiix-chips codiix-chips--inline">
                      {m.suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="codiix-chip"
                          onClick={() => respondFromSuggestion(s.id, s.label)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {thinking ? (
              <div className="codiix-msg codiix-msg--bot">
                <CodiixFaceIcon className="codiix-msg__avatar" />
                <div
                  className="codiix-msg__bubble codiix-msg__bubble--thinking"
                  role="status"
                  aria-label="Codiix is thinking"
                >
                  <span className="codiix-thinking" aria-hidden="true">
                    <span className="codiix-thinking__aura" />
                    <span className="codiix-thinking__blob" />
                    <span className="codiix-thinking__orbit codiix-thinking__orbit--one" />
                    <span className="codiix-thinking__orbit codiix-thinking__orbit--two" />
                  </span>
                  <span className="codiix-thinking__label">Codiix is thinking</span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form className="codiix-composer" onSubmit={onSubmit}>
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            isAdmin
              ? 'Try “edit my current theme” or “which theme is applied?”…'
              : agenticMode
                ? 'Try “hero”, “move FAQ above Hero”, “apply theme”…'
                : 'Try “move Contact form above Email signup”…'
          }
          className="codiix-composer__input"
          aria-busy={isGenerating}
          aria-label="Message Codiix"
        />
        {isGenerating ? (
          <button
            type="button"
            className="codiix-composer__send codiix-composer__send--stop"
            onMouseDown={(e) => e.preventDefault()}
            onClick={stopGenerating}
            aria-label="Stop generating"
            title="Stop"
          >
            <StopIcon className="codiix-composer__send-icon" aria-hidden />
          </button>
        ) : (
          <button
            type="submit"
            className="codiix-composer__send"
            disabled={!draft.trim()}
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Send"
            title="Send"
          >
            <PaperAirplaneIcon className="codiix-composer__send-icon" aria-hidden />
          </button>
        )}
      </form>
    </div>
    </>
  );
}
