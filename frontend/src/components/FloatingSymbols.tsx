import { useState, useEffect } from "react";

interface Item {
  id: number;
  x: number;
  size: number;
  dur: number;
  delay: number;
}

export function FloatingSymbols() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const add = () => {
      setItems((prev) => {
        const next = [...prev, { id: Date.now() + Math.random(), x: Math.random() * 100, size: 14 + Math.random() * 18, dur: 8 + Math.random() * 12, delay: Math.random() * 4 }];
        return next.length > 15 ? next.slice(-15) : next;
      });
    };
    add();
    const interval = setInterval(add, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {items.map((i) => (
        <span
          key={i.id}
          style={{
            position: "absolute",
            left: `${i.x}%`,
            bottom: "-30px",
            fontSize: `${i.size}px`,
            color: "#004349",
            opacity: 0,
            animation: `float-up ${i.dur}s ease-out ${i.delay}s forwards`,
          }}
        >
          $
        </span>
      ))}
    </div>
  );
}
