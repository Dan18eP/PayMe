import { useEffect, useRef } from "react";

export function FloatingSymbols() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const active: { el: HTMLSpanElement; y: number; speed: number }[] = [];

    const create = () => {
      const el = document.createElement("span");
      el.textContent = "$";
      const size = 12 + Math.random() * 14;
      el.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: 100%;
        font-size: ${size}px;
        color: #004349;
        pointer-events: none;
        opacity: 0;
      `;
      container.appendChild(el);
      active.push({ el, y: 0, speed: 0.3 + Math.random() * 0.5 });
    };

    const tick = () => {
      for (let i = active.length - 1; i >= 0; i--) {
        const a = active[i];
        a.y -= a.speed;
        a.el.style.transform = `translateY(${a.y}px)`;

        const total = -a.y;
        const vh = window.innerHeight;
        if (total < vh * 0.05) {
          a.el.style.opacity = String((total / (vh * 0.05)) * 0.08);
        } else if (total > vh * 0.85) {
          a.el.style.opacity = String(0.08 * (1 - (total - vh * 0.85) / (vh * 0.15)));
        } else {
          a.el.style.opacity = "0.08";
        }

        if (a.y < -(vh + 80)) {
          a.el.remove();
          active.splice(i, 1);
        }
      }
    };

    setInterval(tick, 30);
    for (let i = 0; i < 8; i++) setTimeout(create, i * 300);
    const interval = setInterval(create, 1200);

    return () => {
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
