import { useEffect, useState } from 'react';

/**
 * Full-screen animated gradient border flashed while the editor switches
 * preview pages — signals "AI is working" without blocking interaction.
 */
export function PageSwitchGlow({ runKey }: { runKey: number }) {
  const [activeKey, setActiveKey] = useState(0);

  useEffect(() => {
    if (runKey > 0) setActiveKey(runKey);
  }, [runKey]);

  if (!activeKey) return null;

  return (
    <div
      key={activeKey}
      className="create-theme-page-switch-glow"
      aria-hidden
      onAnimationEnd={(e) => {
        if (e.animationName === 'ctpsg-fade') setActiveKey(0);
      }}
    />
  );
}
