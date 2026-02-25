import { useEffect, useRef } from 'react';

const WireframeMesh = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const points: { x: number; y: number; z: number }[] = [];
    const numPoints = 280;

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      const r = 350 + Math.random() * 60;
      points.push({
        x: r * Math.cos(theta) * Math.sin(phi),
        y: r * Math.sin(theta) * Math.sin(phi) * 0.6,
        z: r * Math.cos(phi),
      });
    }

    const draw = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const cosT = Math.cos(time);
      const sinT = Math.sin(time);

      const projected = points.map((p) => {
        const x1 = p.x * cosT - p.z * sinT;
        const z1 = p.x * sinT + p.z * cosT;
        const wave = Math.sin(p.y * 0.01 + time * 2) * 20;
        const scale = 800 / (800 + z1);
        return {
          x: cx + (x1 + wave) * scale,
          y: cy + p.y * scale,
          z: z1,
          scale,
        };
      });

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {
            const alpha = (1 - dist / 80) * 0.3;
            if ((i + j) % 17 === 0) {
              // Accent yellow lines
              ctx.strokeStyle = `hsla(48, 100%, 50%, ${alpha * 1.5})`;
              ctx.lineWidth = 0.8;
            } else {
              // Light blue lines
              ctx.strokeStyle = `hsla(197, 43%, 60%, ${alpha})`;
              ctx.lineWidth = 0.4;
            }
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of projected) {
        const alpha = Math.max(0.1, Math.min(0.6, p.scale * 0.5));
        ctx.fillStyle = `hsla(197, 43%, 70%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  );
};

export default WireframeMesh;
