import { useEffect, useRef } from "react";

export function FloatingSymbols() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const active: { el: HTMLSpanElement; speed: number; opacity: number }[] = [];
    let frameId: number;

    const create = () => {
      const el = document.createElement("span");
      el.textContent = "$";
      const size = 12 + Math.random() * 14;
      const opacity = 0.04 + Math.random() * 0.05;
      el.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        bottom: 0;
        font-size: ${size}px;
        color: #004349;
        pointer-events: none;
        will-change: transform, opacity;
      `;
      container.appendChild(el);
      active.push({ el, speed: 0.3 + Math.random() * 0.5, opacity });
    };

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      for (let i = active.length - 1; i >= 0; i--) {
        const a = active[i];
        const current = parseFloat(a.el.style.bottom) || 0;
        const newBottom = current + a.speed * dt * 60;
        a.el.style.bottom = `${newBottom}px`;

        const vh = window.innerHeight;
        if (newBottom > vh + 50) {
          a.el.remove();
          active.splice(i, 1);
        } else if (newBottom < vh * 0.1) {
          a.el.style.opacity = String(a.opacity * (newBottom / (vh * 0.1)));
        } else if (newBottom > vh * 0.85) {
          a.el.style.opacity = String(a.opacity * (1 - (newBottom - vh * 0.85) / (vh * 0.15)));
        } else {
          a.el.style.opacity = String(a.opacity);
        }
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    const interval = setInterval(create, 2200);
    setTimeout(create, 100);

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(interval);
      active.forEach((a) => a.el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    />
  );
}
