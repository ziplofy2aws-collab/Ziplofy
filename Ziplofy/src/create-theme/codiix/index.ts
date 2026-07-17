import './codiix.css';

export { CodiixFaceIcon } from './CodiixFaceIcon';
export { CodiixChatPanel } from './CodiixChatPanel';
export type { CodiixMessage } from './codiix-session';
export { matchCodiixIntent, answerForIntentId, categoryIdForIntent } from './match-codiix-intent';
export { CODIX_INTENTS, CODIX_SUGGESTIONS, CODIX_FALLBACK } from './codiix-knowledge';
export {
  CODIX_ELEMENT_CATEGORIES,
  CODIX_AGENTIC_COMMANDS,
  matchAgenticCommand,
  listCodiixAgenticElementIds,
  relatedActionsForElement,
} from './codiix-elements-catalog';
export { CodiixElementPreview } from './CodiixElementPreview';
