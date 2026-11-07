import confetti from 'canvas-confetti';

const EMERALD_PALETTE = ['#059669', '#10b981', '#34d399', '#fbbf24', '#38bdf8', '#ffffff'];
const TEAL_PALETTE = ['#0d9488', '#14b8a6', '#f59e0b', '#60a5fa', '#a7f3d0', '#ffffff'];
const GOLD_PALETTE = ['#00896F', '#10b981', '#fbbf24', '#fcd34d', '#ffffff', '#d4f4d8'];

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

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
        colors: EMERALD_PALETTE,
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.72, 0.92), y: Math.random() - 0.2 },
        colors: TEAL_PALETTE,
      });
    }, 220);
  });
}

/**
 * Short, polished burst for unlocking a new service —
 * center fan + soft side showers (professional, not chaotic).
 */
export function fireServiceUnlockConfetti(): Promise<void> {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return Promise.resolve();

  const end = Date.now() + 1800;

  // Opening fan from the center
  confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 38,
    origin: { x: 0.5, y: 0.62 },
    colors: GOLD_PALETTE,
    ticks: 90,
    zIndex: 100000,
    scalar: 1.05,
  });

  return new Promise((resolve) => {
    const interval = window.setInterval(() => {
      if (Date.now() > end) {
        window.clearInterval(interval);
        // Soft finishing sparkle
        confetti({
          particleCount: 40,
          spread: 100,
          startVelocity: 22,
          origin: { x: 0.5, y: 0.35 },
          colors: GOLD_PALETTE,
          ticks: 60,
          zIndex: 100000,
          gravity: 0.9,
        });
        resolve();
        return;
      }

      confetti({
        particleCount: 14,
        angle: 60,
        spread: 48,
        origin: { x: 0, y: 0.7 },
        colors: EMERALD_PALETTE,
        zIndex: 100000,
        startVelocity: 28,
        ticks: 65,
      });
      confetti({
        particleCount: 14,
        angle: 120,
        spread: 48,
        origin: { x: 1, y: 0.7 },
        colors: TEAL_PALETTE,
        zIndex: 100000,
        startVelocity: 28,
        ticks: 65,
      });
    }, 280);
  });
}
