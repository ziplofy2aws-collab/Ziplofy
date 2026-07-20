/**
 * Named re-exports for remote theme bundles (blob URL → these shims).
 * Vite prebundles `react` as CJS (`export default` only), so `export *` does not
 * surface hooks — list every binding catalog themes may import.
 */
export {
  Children,
  Component,
  Fragment,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} from 'react';
export { default } from 'react';
