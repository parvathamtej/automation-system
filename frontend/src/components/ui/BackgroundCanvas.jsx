import { useEffect, useState } from 'react';

export default function BackgroundCanvas() {
  const [position, setPosition] = useState({ x: 50, y: 30 });

  useEffect(() => {
    function handleMove(event) {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      setPosition({ x, y });
    }

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div
      className="background-canvas"
      style={{
        '--mouse-x': `${position.x}%`,
        '--mouse-y': `${position.y}%`,
      }}
    >
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-orb orb-three" />
      <div className="background-grid" />
    </div>
  );
}
