import { useEffect, useRef } from "react";

interface Symbol {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  el: HTMLSpanElement;
}

export function FloatingSymbols() {
  const containerRef = useRef<HTMLDivElement>(null);
  const symbolsRef = useRef<Symbol[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const addSymbol = () => {
      const el = document.createElement("span");
      el.textContent = "$";
      const opacity = 0.04 + Math.random() * 0.06;
      el.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        bottom: -5%;
        font-size: ${14 + Math.random() * 18}px;
        color: #004349;
        animation: float-up ${8 + Math.random() * 12}s ease-out ${Math.random() * 3}s forwards;
      `;
      el.style.setProperty("--fl-opacity", String(opacity));
      container.appendChild(el);

      const id = Date.now() + Math.random();

      setTimeout(() => {
        el.remove();
        symbolsRef.current = symbolsRef.current.filter((s) => s.id !== id);
      }, 25000);

      symbolsRef.current.push({ id, x: 0, size: 0, duration: 0, delay: 0, opacity: 0, el });
    };

    for (let i = 0; i < 5; i++) setTimeout(addSymbol, i * 600);
    const interval = setInterval(addSymbol, 2500);
    return () => { clearInterval(interval); symbolsRef.current.forEach((s) => s.el.remove()); symbolsRef.current = []; };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0" />;
}
