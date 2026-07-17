import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowsPointingOutIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CodiixFaceIcon } from './CodiixFaceIcon';
import {
  agenticSuggestionsForCategory,
  type CodiixAgenticAction,
} from './codiix-elements-catalog';
import { CODIX_SUGGESTIONS } from './codiix-knowledge';
import {
  answerForIntentId,
  categoryIdForIntent,
  matchCodiixIntent,
} from './match-codiix-intent';

export type CodiixMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions?: { id: string; label: string }[];
  actions?: CodiixAgenticAction[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** When set, Agentic mode can insert real sections into the theme. */
  onAgenticInsert?: (elementId: string) => boolean | void;
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
  expanded = false,
  onExpandedChange,
  onAgenticInsert,
}: Props) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<CodiixMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [agenticMode, setAgenticMode] = useState(false);
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOpen = useRef(false);
  const hasIntroduced = useRef(false);
  const [introducing, setIntroducing] = useState(false);

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
  }, []);

  const runAgenticAction = useCallback(
    (action: CodiixAgenticAction) => {
      if (!onAgenticInsert || busyActionId || thinking || streamingMessageId) return;
      setBusyActionId(action.id);
      const ok = onAgenticInsert(action.elementId);
      const success = ok !== false;
      streamAssistant(
        success
          ? `Done — I added **${action.label.replace(/^Add\s+/i, '')}** to your theme.\n\n` +
              'Select it in the sidebar to edit settings, or ask me to add something else.'
          : `I couldn’t add **${action.label.replace(/^Add\s+/i, '')}** right now.\n\n` +
              'Make sure the theme is loaded, then try again — or use **Add section** in the sidebar.',
        [
          { id: 'product-elements', label: 'What are product elements?' },
          { id: 'add-section', label: 'How do I add a section?' },
        ],
      );
      setBusyActionId(null);
    },
    [onAgenticInsert, busyActionId, thinking, streamingMessageId, streamAssistant],
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
        const match = matchCodiixIntent(trimmed, { agentic: agenticMode });
        const followUps =
          match.relatedSuggestions.length > 0
            ? match.relatedSuggestions
            : CODIX_SUGGESTIONS.slice(0, 3).map((s) => ({ id: s.id, label: s.label }));
        streamAssistant(match.answer, followUps, match.actions);
      }, delay);
    },
    [thinking, streamingMessageId, streamAssistant, agenticMode],
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
        const match = canned
          ? {
              answer: canned,
              relatedSuggestions: [] as { id: string; label: string }[],
              actions:
                agenticMode && categoryId
                  ? agenticSuggestionsForCategory(categoryId)
                  : undefined,
            }
          : matchCodiixIntent(label, { agentic: agenticMode });
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
          actions?.length &&
          !answer.includes('Agentic mode is on')
        ) {
          answer +=
            '\n\n**Agentic mode is on** — tap a button below and I’ll add that section for you.';
        }
        streamAssistant(answer, followUps, actions);
      }, 380);
    },
    [thinking, streamingMessageId, streamAssistant, agenticMode],
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
              <p className="codiix-empty__agentic">Agentic mode on — try “add header”</p>
            ) : null}
            <div className="codiix-chips">
              {(agenticMode
                ? [
                    { id: 'add-header', label: 'Add Header' },
                    { id: 'product-elements', label: 'What are product elements?' },
                    { id: 'form-elements', label: 'What are the forms?' },
                    { id: 'banner-elements', label: 'What are banner elements?' },
                    { id: 'agentic-mode', label: 'What is Agentic mode?' },
                  ]
                : CODIX_SUGGESTIONS.slice(0, 5)
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="codiix-chip"
                  onClick={() =>
                    agenticMode && s.id.startsWith('add-')
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
              ? 'Try “add header” or ask about elements…'
              : 'Ask about elements, forms, banners…'
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
