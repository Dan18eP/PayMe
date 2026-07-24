import { useEffect, useState } from "react";

interface Symbol {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function FloatingSymbols() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);

  useEffect(() => {
    const addSymbol = () => {
      const id = Date.now() + Math.random();
      setSymbols((prev) => [
        ...prev.slice(-12),
        {
          id,
          x: Math.random() * 100,
          size: 14 + Math.random() * 18,
          duration: 8 + Math.random() * 12,
          delay: Math.random() * 3,
          opacity: 0.04 + Math.random() * 0.06,
        },
      ]);
    };

    addSymbol();
    const interval = setInterval(addSymbol, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {symbols.map((s) => (
        <span
          key={s.id}
          className="absolute"
          style={{
            left: `${s.x}%`,
            bottom: "-5%",
            fontSize: `${s.size}px`,
            opacity: s.opacity,
            animation: `float-up ${s.duration}s ease-out ${s.delay}s forwards`,
            color: "#004349",
          }}
        >
          $
        </span>
      ))}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--target-opacity, 0.08);
          }
          90% {
            opacity: var(--target-opacity, 0.08);
          }
          100% {
            transform: translateY(-110vh) rotate(15deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
