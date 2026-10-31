/** Placeholder illustration used in storytelling carousel slides. */
export function TealFoldedShirtIllustration() {
  return (
    <div style={{ position: 'relative', height: 48, width: 44 }} aria-hidden>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: 8,
          borderRadius: 4,
          background: '#4a9a9a',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
        }}
      />
    </div>
  );
}
