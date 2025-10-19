'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface NebulaCanvasProps {
  emotions?: string[];
  intensity?: number;
  colorPalette?: string[];
  size?: 'small' | 'medium' | 'large';
}

export default function NebulaCanvas({
  emotions = ['calm'],
  intensity = 0.5,
  colorPalette = ['#9B59B6', '#D7BDE2', '#E8DAEF', '#A9CCE3'],
  size = 'large',
}: NebulaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);

  const sizeMap = {
    small: { width: 300, height: 300, particles: 200 },
    medium: { width: 500, height: 500, particles: 400 },
    large: { width: 800, height: 600, particles: 600 },
  };

  const dimensions = sizeMap[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Initialize particles
    particlesRef.current = createParticles(
      dimensions.particles,
      dimensions.width,
      dimensions.height,
      colorPalette,
      intensity
    );

    // Animation loop
    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Clear canvas with fade effect for trails
      ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        particle.update(delta, intensity, dimensions.width, dimensions.height);
        particle.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [emotions, intensity, colorPalette, dimensions.width, dimensions.height, dimensions.particles]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        background: 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          filter: 'blur(1px)',
        }}
      />
      {/* Overlay gradient for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, transparent 0%, rgba(10, 14, 39, 0.5) 100%)',
        }}
      />
    </motion.div>
  );
}

// Particle class
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  baseSpeed: number;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  alpha: number;

  constructor(
    x: number,
    y: number,
    color: string,
    size: number,
    baseSpeed: number
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.baseSpeed = baseSpeed;

    // Random velocity
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * baseSpeed;
    this.vy = Math.sin(angle) * baseSpeed;

    // Orbital motion
    this.angle = Math.random() * Math.PI * 2;
    this.orbitRadius = Math.random() * 50 + 20;
    this.orbitSpeed = (Math.random() - 0.5) * 0.02;

    this.alpha = Math.random() * 0.5 + 0.5;
  }

  update(delta: number, intensity: number, width: number, height: number) {
    // Orbital motion
    this.angle += this.orbitSpeed * intensity;

    // Update position with intensity
    const speedMultiplier = 0.5 + intensity * 1.5;
    this.x += this.vx * speedMultiplier * delta * 60;
    this.y += this.vy * speedMultiplier * delta * 60;

    // Add gentle swirl effect
    const centerX = width / 2;
    const centerY = height / 2;
    const dx = this.x - centerX;
    const dy = this.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const swirl = 0.0001 * intensity;
      this.vx += -dy * swirl;
      this.vy += dx * swirl;
    }

    // Wrap around edges
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Pulsing alpha
    this.alpha = 0.3 + Math.sin(Date.now() * 0.001 + this.angle) * 0.3;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    // Draw glow
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size * 3
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw core
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function createParticles(
  count: number,
  width: number,
  height: number,
  colors: string[],
  intensity: number
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 2 + 0.5;
    const baseSpeed = (Math.random() * 0.5 + 0.3) * (1 + intensity);

    particles.push(new Particle(x, y, color, size, baseSpeed));
  }

  return particles;
}

