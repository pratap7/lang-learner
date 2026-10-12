/**
 * Lightweight client-side confetti animation utility
 */

export function triggerConfetti() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  const colors = [
    "#ef4444", // German red
    "#f59e0b", // Gold / amber
    "#10b981", // Emerald
    "#3b82f6", // Sky
    "#8b5cf6", // Purple
    "#ec4899", // Pink
  ];

  const particleCount = 75;
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRotation: number;
    alpha: number;
  }> = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: (window.innerWidth / 2) * dpr + (Math.random() - 0.5) * 200 * dpr,
      y: (window.innerHeight * 0.45) * dpr,
      vx: (Math.random() - 0.5) * 14 * dpr,
      vy: -(Math.random() * 12 + 6) * dpr,
      size: (Math.random() * 8 + 4) * dpr,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      alpha: 1,
    });
  }

  let animationFrameId: number;
  const gravity = 0.35 * dpr;
  const startTime = Date.now();
  const duration = 2800; // 2.8 seconds

  const render = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.rotation += p.vRotation;
      p.alpha = Math.max(0, 1 - elapsed / duration);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  };

  animationFrameId = requestAnimationFrame(render);
}

export const fireConfetti = triggerConfetti;
