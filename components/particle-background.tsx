"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  shineTimer: number;
  isShining: boolean;
  shineProgress: number; // Track transition progress
  baseSpeedX: number;
  baseSpeedY: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full screen
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // Initialize particles
    const initParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 7000);
      particlesRef.current = [];

      for (let i = 0; i < particleCount; i++) {
        const baseSpeedX = Math.random() * 0.2 - 0.1;
        const baseSpeedY = Math.random() * 0.2 - 0.1;
        
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1 + 0.2,
          speedX: baseSpeedX,
          speedY: baseSpeedY,
          opacity: Math.random() * 0.5 + 0.2,
          shineTimer: Math.floor(Math.random() * 200),
          isShining: false,
          shineProgress: 0, // Start with no shine
          baseSpeedX: baseSpeedX,
          baseSpeedY: baseSpeedY,
        });
      }
    };

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Draw gradient background
    const drawGradientBackground = () => {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#262626"); // neutral-800
      gradient.addColorStop(1, "#1f1f1f"); // slightly darker

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Smooth easing function for mouse influence
    const easeOutQuad = (x: number): number => {
      return 1 - (1 - x) * (1 - x);
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      drawGradientBackground();

      particlesRef.current.forEach((particle) => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Mouse interaction - gentle nudging
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = 150;
        
        // Apply gentle mouse influence with smooth falloff
        if (distance < influenceRadius && distance > 0) {
          // Calculate normalized direction away from mouse
          const dirX = -dx / distance; // Negative for repulsion
          const dirY = -dy / distance;
          
          // Calculate influence strength with smooth falloff
          // Stronger near mouse, weaker at edges of influence radius
          const normalizedDistance = distance / influenceRadius;
          const falloff = 1 - easeOutQuad(normalizedDistance);
          
          // Maximum per-frame influence (very gentle)
          const maxInfluence = 0.05; // Increased from 0.02 for more visible effect
          const influence = maxInfluence * falloff;
          
          // Calculate target velocity changes (small nudges)
          const targetChangeX = dirX * influence;
          const targetChangeY = dirY * influence;
          
          // Smoothly interpolate current velocity toward target (gentle turning)
          const easing = 0.15; // Increased from 0.05 for more noticeable turning
          particle.speedX += targetChangeX * easing;
          particle.speedY += targetChangeY * easing;
        }
        
        // Apply gentle damping to return to base drift
        const dampingFactor = 0.995; // Very slight damping
        const returnFactor = 0.001; // Very slow return to base speed
        
        // Dampen current speed
        particle.speedX *= dampingFactor;
        particle.speedY *= dampingFactor;
        
        // Gradually return to base speed
        particle.speedX += (particle.baseSpeedX - particle.speedX) * returnFactor;
        particle.speedY += (particle.baseSpeedY - particle.speedY) * returnFactor;

        // Limit speed to keep motion tranquil
        const maxSpeed = 0.3;
        const currentSpeed = Math.sqrt(
          particle.speedX * particle.speedX + particle.speedY * particle.speedY
        );
        
        if (currentSpeed > maxSpeed && currentSpeed > 0) {
          particle.speedX = (particle.speedX / currentSpeed) * maxSpeed;
          particle.speedY = (particle.speedY / currentSpeed) * maxSpeed;
        }

        // Random shine effect
        particle.shineTimer--;
        if (particle.shineTimer <= 0) {
          particle.isShining = Math.random() > 0.95;
          particle.shineTimer = Math.floor(Math.random() * 200) + 50;
        }

        // Update shine progress with smooth transition
        if (particle.isShining && particle.shineProgress < 1) {
          particle.shineProgress += 0.016; // Slower transition - approx 1s at 60fps
          if (particle.shineProgress > 1) particle.shineProgress = 1;
        } else if (!particle.isShining && particle.shineProgress > 0) {
          particle.shineProgress -= 0.016; // Slower transition - approx 1s at 60fps
          if (particle.shineProgress < 0) particle.shineProgress = 0;
        }

        // Apply ease-in-out curve to progress
        const easedProgress = easeOutQuad(particle.shineProgress);

        // White particles for dark mode
        const particleColor = "255, 255, 255";

        // Draw particle
        ctx.beginPath();

        if (easedProgress > 0) {
          // Partially or fully shining particle with glow
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 3 * easedProgress
          );
          gradient.addColorStop(
            0,
            `rgba(${particleColor}, ${particle.opacity + (0.3 * easedProgress)})`
          );
          gradient.addColorStop(
            0.5,
            `rgba(${particleColor}, ${particle.opacity * 0.5 * easedProgress})`
          );
          gradient.addColorStop(1, `rgba(${particleColor}, 0)`);

          ctx.fillStyle = gradient;
          ctx.arc(particle.x, particle.y, particle.size * 3 * easedProgress, 0, Math.PI * 2);
          ctx.fill();

          // Bright center with varying brightness
          ctx.beginPath();
          ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity + (0.5 * easedProgress)})`;
          ctx.arc(
            particle.x, 
            particle.y, 
            particle.size * (1 + easedProgress * 0.5), 
            0, 
            Math.PI * 2
          );
          ctx.fill();
        } else {
          // Normal particle
          ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity})`;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    handleResize();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed left-0 top-0 -z-20 h-full w-full"
    />
  );
}
