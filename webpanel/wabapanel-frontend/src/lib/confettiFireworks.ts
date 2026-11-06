import confetti from 'canvas-confetti';

/** Fire the celebration fireworks (sides → center). Returns when the burst window ends. */
export function fireConfettiFireworks(durationMs = 3200): Promise<void> {
  const animationEnd = Date.now() + durationMs;
  const defaults = {
    startVelocity: 32,
    spread: 360,
    ticks: 70,
    zIndex: 100000,
    disableForReducedMotion: true,
  };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  return new Promise((resolve) => {
    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        window.clearInterval(interval);
        resolve();
        return;
      }

      const particleCount = Math.max(18, Math.floor(55 * (timeLeft / durationMs)));

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.08, 0.28), y: Math.random() - 0.2 },
        colors: ['#059669', '#10b981', '#34d399', '#fbbf24', '#38bdf8', '#ffffff'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.72, 0.92), y: Math.random() - 0.2 },
        colors: ['#0d9488', '#14b8a6', '#f59e0b', '#60a5fa', '#a7f3d0', '#ffffff'],
      });
    }, 220);
  });
}
