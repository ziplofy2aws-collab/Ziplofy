import React from 'react';

export type TesseraeBootPhase =
  | 'detect'
  | 'schema'
  | 'preview'
  | 'almost'
  | 'switching'
  | 'ready';

type Props = {
  phase?: TesseraeBootPhase;
  /** Ignored — kept for call-site compatibility. */
  progress?: number;
  className?: string;
};

/**
 * Minimal catalog theme-editor boot screen:
 * white page, small geometric loader, one line of copy.
 */
export function TesseraeThemeEditorLoader({
  phase = 'schema',
  className = '',
}: Props) {
  const switching = phase === 'switching';
  const label = switching
    ? 'Switching theme…'
    : 'Loading your theme editor, powered by Codiic';

  return (
    <div
      className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-white ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="codiic-geo-loader" aria-hidden>
        <span className="codiic-geo-loader__a" />
        <span className="codiic-geo-loader__b" />
        <span className="codiic-geo-loader__c" />
        <span className="codiic-geo-loader__core" />
      </div>

      <p className="mt-8 max-w-sm px-6 text-center text-[15px] font-medium tracking-tight text-neutral-800">
        {switching ? (
          label
        ) : (
          <>
            Loading your theme editor,{' '}
            <span className="text-neutral-500">powered by Codiic</span>
          </>
        )}
      </p>

      <style>{`
        .codiic-geo-loader {
          position: relative;
          width: 44px;
          height: 44px;
          transform-style: preserve-3d;
          animation: codiic-geo-spin 3.2s linear infinite;
        }
        .codiic-geo-loader__a,
        .codiic-geo-loader__b,
        .codiic-geo-loader__c,
        .codiic-geo-loader__core {
          position: absolute;
          inset: 0;
          margin: auto;
          border: 1.5px solid #171717;
          background: transparent;
          box-sizing: border-box;
        }
        .codiic-geo-loader__a {
          width: 28px;
          height: 28px;
          border-radius: 3px;
          transform: rotateX(55deg) rotateZ(45deg);
        }
        .codiic-geo-loader__b {
          width: 28px;
          height: 28px;
          border-radius: 3px;
          border-color: #525252;
          transform: rotateY(55deg) rotateZ(-45deg);
          animation: codiic-geo-pulse 1.6s ease-in-out infinite;
        }
        .codiic-geo-loader__c {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          border-color: #a3a3a3;
          transform: rotateX(-35deg) rotateY(35deg);
        }
        .codiic-geo-loader__core {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          border: none;
          background: #171717;
        }
        @keyframes codiic-geo-spin {
          from { transform: rotateX(12deg) rotateY(0deg); }
          to { transform: rotateX(12deg) rotateY(360deg); }
        }
        @keyframes codiic-geo-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .codiic-geo-loader,
          .codiic-geo-loader__b {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default TesseraeThemeEditorLoader;
