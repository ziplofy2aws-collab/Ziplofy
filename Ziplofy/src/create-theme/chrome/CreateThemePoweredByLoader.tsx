import React from 'react';
import './create-theme-powered-by-loader.css';

const CUBE_FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const;

const TESSERACT_BRIDGE_EDGES: Array<{ rotateY: number; rotateX: number; length: number }> = [
  { rotateY: -35, rotateX: -28, length: 56 },
  { rotateY: 35, rotateX: -28, length: 56 },
  { rotateY: -35, rotateX: 28, length: 56 },
  { rotateY: 35, rotateX: 28, length: 56 },
  { rotateY: 0, rotateX: -42, length: 58 },
  { rotateY: 0, rotateX: 42, length: 58 },
  { rotateY: -48, rotateX: 0, length: 56 },
  { rotateY: 48, rotateX: 0, length: 56 },
];

function WireframeCube({ variant }: { variant: 'outer' | 'inner' }) {
  return (
    <div className={`tesseract__cube tesseract__cube--${variant}`}>
      {CUBE_FACES.map((face) => (
        <div key={face} className={`tesseract__face tesseract__face--${face}`} />
      ))}
    </div>
  );
}

export function CreateThemePoweredByLoader() {
  return (
    <div className="create-theme-powered-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="create-theme-powered-loader__content">
        <div className="create-theme-powered-loader__scene" aria-hidden>
          <div className="tesseract">
            <div className="tesseract__projection">
              <WireframeCube variant="outer" />
              <WireframeCube variant="inner" />
              <div className="tesseract__bridge">
                {TESSERACT_BRIDGE_EDGES.map((edge, i) => (
                  <div
                    key={i}
                    className="tesseract__edge"
                    style={{
                      height: edge.length,
                      transform: `rotateY(${edge.rotateY}deg) rotateX(${edge.rotateX}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="create-theme-powered-loader__brand">
          Powered by <span>Ziplofy</span>
        </p>
      </div>
    </div>
  );
}
