export type BlogPostIllustrationVariant = 'thread' | 'sewing' | 'boxes';

export function BlogPostIllustration({ variant }: { variant: BlogPostIllustrationVariant }) {
  if (variant === 'thread') {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6 }} aria-hidden>
        <div style={{ height: 40, width: 12, borderRadius: 999, background: '#e8c547' }} />
        <div style={{ height: 48, width: 14, borderRadius: 999, background: '#d45454' }} />
        <div style={{ height: 36, width: 12, borderRadius: 999, background: '#4a9a9a' }} />
      </div>
    );
  }
  if (variant === 'sewing') {
    return (
      <div style={{ position: 'relative', height: 48, width: 56 }} aria-hidden>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            height: 28,
            width: 40,
            transform: 'translateX(-50%)',
            borderRadius: 4,
            background: '#6b7280',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            height: 8,
            width: 48,
            transform: 'translateX(-50%)',
            borderRadius: 4,
            background: '#4b5563',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            right: 4,
            height: 16,
            width: 16,
            borderRadius: '50%',
            background: '#9ca3af',
          }}
        />
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', height: 44, width: 48 }} aria-hidden>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 20,
          width: 24,
          borderRadius: 4,
          background: '#c4a574',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: 16,
          height: 24,
          width: 28,
          borderRadius: 4,
          background: '#a88b5c',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          height: 16,
          width: 20,
          borderRadius: 4,
          background: '#8b6914',
        }}
      />
    </div>
  );
}
