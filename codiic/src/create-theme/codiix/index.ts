import './codiix.css';

export { CodiixFaceIcon } from './CodiixFaceIcon';
export { CodiixChatPanel } from './CodiixChatPanel';
export type { CodiixMessage } from './codiix-session';
export {
  matchCodiixIntent,
  matchSaveCommand,
  matchApplyCommand,
  answerForIntentId,
  categoryIdForIntent,
} from './match-codiix-intent';
export type { CodiixSaveResult, CodiixNavigateResult, CodiixApplyResult } from './CodiixChatPanel';
export { CODIX_INTENTS, CODIX_SUGGESTIONS, CODIX_FALLBACK } from './codiix-knowledge';
export {
  CODIX_ADMIN_INTENTS,
  CODIX_ADMIN_SUGGESTIONS,
  CODIX_ADMIN_FALLBACK,
} from './codiix-admin-knowledge';
export type { CodiixSurface } from './match-codiix-intent';
export {
  CODIX_ELEMENT_CATEGORIES,
  CODIX_AGENTIC_COMMANDS,
  matchAgenticCommand,
  listCodiixAgenticElementIds,
  relatedActionsForElement,
} from './codiix-elements-catalog';
export {
  buildCodiixPageOptions,
  matchPageCommand,
} from './codiix-pages';
export {
  buildCodiixStructure,
  matchReorderCommand,
} from './codiix-reorder';
export {
  resolveAnnouncementContext,
  matchAnnouncementEditCommand,
} from './codiix-edit-announcement';
export { CodiixElementPreview } from './CodiixElementPreview';
