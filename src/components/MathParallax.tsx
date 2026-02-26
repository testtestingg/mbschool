import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  symbol: string;
  size: number;
  baseX: number;
  baseY: number;
  floatAmplitude: number;
  floatSpeed: number;
  floatOffset: number;
  interactRadius: number;
  interactStrength: number;
  color: string;
  alpha: number;
  reset: () => void;
  update: (time: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const MathParallax = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    // Initialize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0" style={{ zIndex: 1 }}>
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10px 10px, rgb(255, 255, 255) 2px, transparent 3px),
            radial-gradient(circle at 40px 40px, rgb(255, 255, 255) 2px, transparent 3px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-0"
      />
    </div>
  );
};

export default MathParallax;