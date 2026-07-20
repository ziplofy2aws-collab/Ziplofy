/** Stacked shirt illustration for Collection links spotlight media column. */

export function CollectionLinksSpotlightArt() {
  return (
    <div style={{ position: 'relative', width: 118, height: 96, margin: '0 auto' }} aria-hidden>
      <div
        style={{
          position: 'absolute',
          left: '6%',
          top: '20%',
          width: 50,
          height: 68,
          transform: 'rotate(-8deg)',
          borderRadius: 4,
          background: '#5a9a6a',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '30%',
          top: '12%',
          width: 52,
          height: 72,
          transform: 'rotate(4deg)',
          borderRadius: 4,
          background: '#e8c547',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '4%',
          top: '24%',
          width: 48,
          height: 66,
          transform: 'rotate(10deg)',
          borderRadius: 4,
          background: '#d45454',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
        }}
      />
    </div>
  );
}
