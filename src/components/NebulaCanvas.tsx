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
  const coresRef = useRef<NebulaCore[]>([]);
  const cloudsRef = useRef<NebulaCloud[]>([]);
  const starsRef = useRef<Star[]>([]);

  const sizeMap = {
    small: { width: 300, height: 300, cores: 1, clouds: 8, stars: 50 },
    medium: { width: 500, height: 500, cores: 2, clouds: 15, stars: 100 },
    large: { width: 800, height: 600, cores: 3, clouds: 25, stars: 200 },
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

    // Initialize nebula elements
    coresRef.current = createNebulaCores(dimensions.cores, dimensions.width, dimensions.height, colorPalette);
    cloudsRef.current = createNebulaClouds(dimensions.clouds, dimensions.width, dimensions.height, colorPalette);
    starsRef.current = createStars(dimensions.stars, dimensions.width, dimensions.height);

    // Animation loop
    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Clear canvas with deep space background
      ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw background stars
      starsRef.current.forEach((star) => {
        star.update(delta);
        star.draw(ctx);
      });

      // Draw nebula clouds
      cloudsRef.current.forEach((cloud) => {
        cloud.update(delta, intensity, dimensions.width, dimensions.height);
        cloud.draw(ctx);
      });

      // Draw nebula cores
      coresRef.current.forEach((core) => {
        core.update(delta, intensity);
        core.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [emotions, intensity, colorPalette, dimensions.width, dimensions.height, dimensions.cores, dimensions.clouds, dimensions.stars]);

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
          filter: 'blur(0.5px)',
        }}
      />
      {/* Overlay gradient for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, transparent 0%, rgba(10, 14, 39, 0.3) 100%)',
        }}
      />
    </motion.div>
  );
}

// Nebula Core class - represents the bright central regions
class NebulaCore {
  x: number;
  y: number;
  radius: number;
  color: string;
  pulsePhase: number;
  rotation: number;
  rotationSpeed: number;

  constructor(x: number, y: number, color: string, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 0.01;
  }

  update(delta: number, intensity: number) {
    this.pulsePhase += delta * 0.5;
    this.rotation += this.rotationSpeed * intensity;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Pulsing effect
    const pulse = 0.8 + Math.sin(this.pulsePhase) * 0.2;
    const currentRadius = this.radius * pulse;
    
    // Outer glow
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentRadius * 3);
    gradient.addColorStop(0, this.color + '80');
    gradient.addColorStop(0.5, this.color + '40');
    gradient.addColorStop(1, this.color + '00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, currentRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright spot
    ctx.fillStyle = this.color + 'FF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, currentRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Nebula Cloud class - represents floating gas clouds
class NebulaCloud {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  driftSpeed: number;
  rotation: number;
  rotationSpeed: number;
  turbulence: number;

  constructor(x: number, y: number, color: string, size: number) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.alpha = Math.random() * 0.4 + 0.1;
    
    // Slow drift motion
    this.driftSpeed = Math.random() * 0.5 + 0.1;
    const driftAngle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(driftAngle) * this.driftSpeed;
    this.vy = Math.sin(driftAngle) * this.driftSpeed;
    
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.005;
    this.turbulence = Math.random() * 0.1 + 0.05;
  }

  update(delta: number, intensity: number, width: number, height: number) {
    // Slow drift
    this.x += this.vx * delta * 30;
    this.y += this.vy * delta * 30;
    
    // Rotation
    this.rotation += this.rotationSpeed * intensity;
    
    // Turbulence effect
    this.x += (Math.random() - 0.5) * this.turbulence;
    this.y += (Math.random() - 0.5) * this.turbulence;
    
    // Gentle pulsing
    this.alpha = 0.1 + Math.sin(Date.now() * 0.002 + this.rotation) * 0.3;
    
    // Wrap around edges
    if (this.x < -this.size) this.x = width + this.size;
    if (this.x > width + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = height + this.size;
    if (this.y > height + this.size) this.y = -this.size;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Create cloud-like shape using multiple overlapping circles
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, this.color + '80');
    gradient.addColorStop(0.7, this.color + '40');
    gradient.addColorStop(1, this.color + '00');
    
    ctx.fillStyle = gradient;
    
    // Main cloud body
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some cloud extensions
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const extX = Math.cos(angle) * this.size * 0.6;
      const extY = Math.sin(angle) * this.size * 0.4;
      
      ctx.beginPath();
      ctx.ellipse(extX, extY, this.size * 0.4, this.size * 0.3, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

// Star class - for background stars
class Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinklePhase: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 0.5;
    this.brightness = Math.random() * 0.8 + 0.2;
    this.twinklePhase = Math.random() * Math.PI * 2;
  }

  update(delta: number) {
    this.twinklePhase += delta * 2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const twinkle = 0.5 + Math.sin(this.twinklePhase) * 0.5;
    const alpha = this.brightness * twinkle;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add cross-hair for brighter stars
    if (this.size > 1.5) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(this.x - 3, this.y);
      ctx.lineTo(this.x + 3, this.y);
      ctx.moveTo(this.x, this.y - 3);
      ctx.lineTo(this.x, this.y + 3);
      ctx.stroke();
    }
    
    ctx.restore();
  }
}

function createNebulaCores(count: number, width: number, height: number, colors: string[]): NebulaCore[] {
  const cores: NebulaCore[] = [];
  
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const radius = Math.random() * 30 + 20;
    
    cores.push(new NebulaCore(x, y, color, radius));
  }
  
  return cores;
}

function createNebulaClouds(count: number, width: number, height: number, colors: string[]): NebulaCloud[] {
  const clouds: NebulaCloud[] = [];
  
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 40 + 20;
    
    clouds.push(new NebulaCloud(x, y, color, size));
  }
  
  return clouds;
}

function createStars(count: number, width: number, height: number): Star[] {
  const stars: Star[] = [];
  
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    
    stars.push(new Star(x, y));
  }
  
  return stars;
}