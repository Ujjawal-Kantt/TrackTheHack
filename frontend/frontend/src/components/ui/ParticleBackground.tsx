import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
}

export const ParticleBackground = () => {
  const particleCount = 45;
  const colors = [
    'rgba(8, 247, 254, 0.8)',  // neon cyan
    'rgba(189, 0, 255, 0.5)',  // neon purple
    'rgba(254, 83, 187, 0.6)', // neon pink
    'rgba(92, 225, 230, 0.7)', // neon blue
    'rgba(125, 249, 255, 0.5)' // neon green
  ];
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const createParticles = () => {
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 0.2 - 0.1,
        speedY: Math.random() * 0.2 - 0.1,
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    
    return particles;
  };
  
  const particles = createParticles();
  
  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <div className="absolute inset-0 bg-dark-gradient opacity-90"></div>
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
            }}
            animate={{
              x: [0, particle.speedX * 100, 0],
              y: [0, particle.speedY * 100, 0],
              opacity: [particle.opacity, particle.opacity * 1.2, particle.opacity]
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
};