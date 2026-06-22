/** Placeholder folded-shirts stack for storytelling Video section. */

export function VideoStorytellingShirtsIllustration() {
  return (
    <div className="flex items-end justify-center gap-3" aria-hidden>
      <div
        style={{
          width: 88,
          height: 72,
          borderRadius: '10px 10px 4px 4px',
          background: '#e8c547',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: 96,
          height: 88,
          borderRadius: '10px 10px 4px 4px',
          background: '#4a9a9a',
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '28%',
            transform: 'translateX(-50%)',
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #f5d76e 0%, #e8a838 55%, #c45c4a 100%)',
            opacity: 0.9,
          }}
        />
      </div>
      <div
        style={{
          width: 80,
          height: 64,
          borderRadius: '10px 10px 4px 4px',
          background: '#8b6914',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        }}
      />
    </div>
  );
}
