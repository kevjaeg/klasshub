// Lightweight confetti animation using CSS only (no dependencies)

export function triggerConfetti() {
  if (typeof document === "undefined") return;

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(container);

  const colors = ["#6366f1", "#f43f5e", "#eab308", "#22c55e", "#3b82f6", "#f97316"];

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.3;
    const size = Math.random() * 6 + 4;
    const rotation = Math.random() * 360;
    const duration = Math.random() * 1.5 + 1.5;

    piece.style.cssText = `
      position:absolute;
      top:-10px;
      left:${left}%;
      width:${size}px;
      height:${size * 0.6}px;
      background:${color};
      border-radius:1px;
      transform:rotate(${rotation}deg);
      animation:confetti-fall ${duration}s ease-in ${delay}s forwards;
    `;
    container.appendChild(piece);
  }

  // Inject keyframes if not already present
  if (!document.getElementById("confetti-style")) {
    const style = document.createElement("style");
    style.id = "confetti-style";
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Cleanup after animation
  setTimeout(() => {
    container.remove();
  }, 3500);
}
