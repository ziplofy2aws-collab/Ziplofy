import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowsPointingOutIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CodiixFaceIcon } from './CodiixFaceIcon';
import { CodiixElementPreview } from './CodiixElementPreview';
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
import { CODIX_SUGGESTIONS } from './codiix-knowledge';
import {
  answerForIntentId,
  categoryIdForIntent,
  matchCodiixIntent,
  type CodiixMatch,
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
} from './codiix-session';

export type { CodiixMessage };
export type CodiixSaveResult = 'saving' | 'modal' | 'loading' | 'needs-name';
export type CodiixNavigateResult = 'ok' | 'same' | 'checkout' | 'unavailable';
export type CodiixApplyResult = 'applying' | 'no-store' | 'needs-save' | 'busy';

type Props = {
  open: boolean;
  onClose: () => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
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
  onAgenticInsert,
  onSave,
  saveDisabled = false,
  onApplyTheme,
  applyThemeDisabled = false,
  pages = [],
  currentPageId,
  onNavigatePage,
  structure = [],
  onReorderSections,
  announcement = null,
  onEditField,
}: Props) {
  const [draft, setDraftState] = useState(() => getCodiixSessionDraft());
  const [messages, setMessagesState] = useState<CodiixMessage[]>(() => getCodiixSessionMessages());
  const [thinking, setThinking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [agenticMode, setAgenticModeState] = useState(() => getCodiixSessionAgenticMode());
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const previousPageId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOpen = useRef(false);
  const hasIntroduced = useRef(getCodiixSessionHasIntroduced());
  const [introducing, setIntroducing] = useState(false);

  const setDraft = useCallback((value: string | ((prev: string) => string)) => {
    setDraftState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      setCodiixSessionDraft(next);
      return next;
    });
  }, []);

  const setMessages = useCallback(
    (value: CodiixMessage[] | ((prev: CodiixMessage[]) => CodiixMessage[])) => {
      setMessagesState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        setCodiixSessionMessages(next);
        return next;
      });
    },
    [],
  );

  const setAgenticMode = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setAgenticModeState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      setCodiixSessionAgenticMode(next);
      return next;
    });
  }, []);

  const empty = messages.length === 0;
  const greeting = useMemo(() => greetingForNow(), [open]);
  const justOpened = open && !wasOpen.current;
  const showIntro = introducing || (justOpened && !hasIntroduced.current);

  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      setIntroducing(false);
      if (introTimer.current) clearTimeout(introTimer.current);
      return;
    }

    if (!wasOpen.current) {
      wasOpen.current = true;
      if (!hasIntroduced.current) {
        hasIntroduced.current = true;
        setCodiixSessionHasIntroduced(true);
        setIntroducing(true);
        if (introTimer.current) clearTimeout(introTimer.current);
        introTimer.current = setTimeout(() => setIntroducing(false), 1850);
      }
    }
  }, [open]);

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
      if (introTimer.current) clearTimeout(introTimer.current);
    };
  }, []);

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
    },
  ) => {
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

      setMessages((prev) => [...prev, { id: uid(), role: 'user', text: trimmed }]);
      setDraft('');
      setThinking(true);

      const delay = 420 + Math.min(900, trimmed.length * 18);
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
      thinkTimer.current = setTimeout(() => {
        const match = matchCodiixIntent(trimmed, {
          agentic: agenticMode,
          pages,
          currentPageId,
          previousPageId: previousPageId.current,
          structure,
          announcement,
        });
        const followUps =
          match.relatedSuggestions.length > 0
            ? match.relatedSuggestions
            : CODIX_SUGGESTIONS.slice(0, 3).map((s) => ({ id: s.id, label: s.label }));

        let answer = match.answer;
        let editorActions = match.editorActions;
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
        }

        streamAssistant(answer, followUps, match.actions, {
          relatedActions: match.relatedActions,
          relatedCategoryLabel: match.relatedCategoryLabel,
          previewElementId: match.previewElementId,
          pageActions: match.pageActions,
          editorActions,
          structureHints: match.structureHints,
          editHelpHints: match.editHelpHints,
        });
      }, delay);
    },
    [
      thinking,
      streamingMessageId,
      streamAssistant,
      agenticMode,
      setMessages,
      setDraft,
      runSaveCommand,
      runApplyCommand,
      runNavigateCommand,
      runReorderCommand,
      runEditCommand,
      pages,
      currentPageId,
      structure,
      announcement,
    ],
  );

  const respondFromSuggestion = useCallback(
    (id: string, label: string) => {
      if (thinking || streamingMessageId) return;
      setMessages((prev) => [...prev, { id: uid(), role: 'user', text: label }]);
      setThinking(true);
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
      thinkTimer.current = setTimeout(() => {
        const canned = answerForIntentId(id);
        const categoryId = categoryIdForIntent(id);
        const categoryActions =
          agenticMode && categoryId ? agenticSuggestionsForCategory(categoryId) : undefined;
        let match: CodiixMatch;
        if (canned) {
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
            systemAction: id === 'pages-templates' ? 'list-pages' : undefined,
          };
        } else {
          match = matchCodiixIntent(label, {
            agentic: agenticMode,
            pages,
            currentPageId,
            previousPageId: previousPageId.current,
            structure,
            announcement,
          });
        }
        const followUps =
          match.relatedSuggestions.length > 0
            ? match.relatedSuggestions
            : CODIX_SUGGESTIONS.filter((s) => s.id !== id)
                .slice(0, 3)
                .map((s) => ({ id: s.id, label: s.label }));
        const actions = match.actions?.length ? match.actions : undefined;
        let answer = match.answer;
        if (
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
        streamAssistant(answer, followUps, actions, {
          relatedActions: match.relatedActions,
          relatedCategoryLabel: match.relatedCategoryLabel,
          previewElementId: match.previewElementId,
          pageActions: match.pageActions,
          editorActions: match.editorActions,
          structureHints: match.structureHints,
          editHelpHints: match.editHelpHints,
        });
      }, 380);
    },
    [
      thinking,
      streamingMessageId,
      streamAssistant,
      agenticMode,
      setMessages,
      pages,
      currentPageId,
      structure,
      announcement,
      runNavigateCommand,
      runApplyCommand,
      runReorderCommand,
      runEditCommand,
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

  if (showIntro) {
    return (
      <div className="codiix-intro" role="status" aria-live="polite">
        <div className="codiix-intro__glow" aria-hidden="true" />
        <CodiixFaceIcon className="codiix-intro__face" title="Codiix" />
        <div className="codiix-intro__copy">
          <p className="codiix-intro__hello">
            Hi, I&apos;m Codiix <span className="codiix-intro__wave" aria-hidden="true">👋</span>
          </p>
          <p className="codiix-intro__byline">Your theme helper by Codiic</p>
        </div>
        <span className="codiix-intro__progress" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={`codiix-panel ${expanded ? 'codiix-panel--expanded' : ''}`}
      role="dialog"
      aria-label="Codiix theme helper"
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
            {agenticMode ? (
              <p className="codiix-empty__agentic">
                Agentic on — try “hero”, “add faq”, or “take me to cart”
              </p>
            ) : (
              <p className="codiix-empty__agentic">
                Try “take me to cart”, “switch to home”, or “change page”
              </p>
            )}
            <div className="codiix-chips">
              {(agenticMode
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
            agenticMode
              ? 'Try “hero”, “move FAQ above Hero”, “apply theme”…'
              : 'Try “move Contact form above Email signup”…'
          }
          className="codiix-composer__input"
          disabled={thinking || Boolean(streamingMessageId)}
          aria-label="Message Codiix"
        />
        <button
          type="submit"
          className="codiix-composer__send"
          disabled={thinking || Boolean(streamingMessageId) || !draft.trim()}
          aria-label="Send"
        >
          Send
        </button>
      </form>
    </div>
  );
}
