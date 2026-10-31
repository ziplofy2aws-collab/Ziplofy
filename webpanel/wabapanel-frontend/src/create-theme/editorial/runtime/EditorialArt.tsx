/** Decorative isometric folded-shirts illustration for the Editorial media column. */

export function TealFoldedShirtIllustration() {
  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }} aria-hidden>
      <svg
        viewBox="0 0 440 340"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        {/* soft cast shadow, behind the stack toward the lower-left */}
        <polygon points="40,312 232,312 338,232 146,232" fill="#d6dbdb" opacity="0.85" />

        {/* right (medium) side face */}
        <polygon points="360,145 220,220 220,290 360,215" fill="#3E8E8E" />
        {/* left (dark) side face */}
        <polygon points="80,145 220,220 220,290 80,215" fill="#2C7777" />

        {/* folded-layer seams on the side faces */}
        <g stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeLinecap="round">
          <line x1="80" y1="168" x2="220" y2="243" />
          <line x1="80" y1="192" x2="220" y2="267" />
          <line x1="360" y1="168" x2="220" y2="243" />
          <line x1="360" y1="192" x2="220" y2="267" />
        </g>

        {/* top face */}
        <polygon points="220,70 360,145 220,220 80,145" fill="#5AA7A7" />
        {/* top-face highlight wedge */}
        <polygon points="220,70 360,145 220,145" fill="#65B2B2" opacity="0.55" />

        {/* subtle centre crease on the top face */}
        <line x1="220" y1="78" x2="220" y2="212" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />

        {/* folded collar tab */}
        <polygon points="176,104 214,124 192,142 154,122" fill="#ffffff" opacity="0.92" />
        <polygon points="176,104 214,124 192,142 154,122" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
