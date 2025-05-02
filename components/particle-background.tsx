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
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1 + 0.2,
          speedX: Math.random() * 0.2 - 0.1,
          speedY: Math.random() * 0.2 - 0.1,
          opacity: Math.random() * 0.5 + 0.2,
          shineTimer: Math.floor(Math.random() * 200),
          isShining: false,
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

        // Mouse interaction - gentle repulsion
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (150 - distance) / 150;

          // Repel instead of attract
          particle.speedX -= forceDirectionX * force * 0.05;
          particle.speedY -= forceDirectionY * force * 0.05;

          // Directly modify position for immediate effect
          particle.x -= forceDirectionX * force * 1;
          particle.y -= forceDirectionY * force * 1;
        }

        // Limit speed
        const speed = Math.sqrt(
          particle.speedX * particle.speedX + particle.speedY * particle.speedY
        );
        if (speed > 0.5) {
          particle.speedX = (particle.speedX / speed) * 0.5;
          particle.speedY = (particle.speedY / speed) * 0.5;
        }

        // Random shine effect
        particle.shineTimer--;
        if (particle.shineTimer <= 0) {
          particle.isShining = Math.random() > 0.95;
          particle.shineTimer = Math.floor(Math.random() * 200) + 50;
        }

        // White particles for dark mode
        const particleColor = "255, 255, 255";

        // Draw particle
        ctx.beginPath();

        if (particle.isShining) {
          // Shiny effect with glow
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 3
          );
          gradient.addColorStop(
            0,
            `rgba(${particleColor}, ${particle.opacity + 0.3})`
          );
          gradient.addColorStop(
            0.5,
            `rgba(${particleColor}, ${particle.opacity * 0.5})`
          );
          gradient.addColorStop(1, `rgba(${particleColor}, 0)`);

          ctx.fillStyle = gradient;
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Bright center
          ctx.beginPath();
          ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity + 0.5})`;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
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
      className="fixed left-0 top-0 -z-10 h-full w-full"
    />
  );
}
