import React, { useEffect, useRef } from 'react';
import './Background.css';

const Background = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="background-canvas">
      <div className="background-grid" />
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-orb orb-three" />
    </div>
  );
};

export default Background;
