import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      if (target && (target.closest('a') || target.closest('button') || target.closest('.glass-card') || target.closest('input'))) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Subtle Glow Backdrop Follower */}
      <motion.div
        className="fixed top-0 left-0 w-72 h-72 bg-lime/10 rounded-full pointer-events-none blur-[90px] z-40 hidden md:block"
        animate={{
          x: position.x - 144,
          y: position.y - 144,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.1 }}
      />

      {/* NEXUS Studio White Circle CLICK Cursor Follower */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:flex items-center justify-center rounded-full bg-white text-black font-extrabold text-[10px] tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.4)]"
        animate={{
          x: position.x - (isHovered ? 28 : 20),
          y: position.y - (isHovered ? 28 : 20),
          width: isHovered ? 56 : 40,
          height: isHovered ? 56 : 40,
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.15 }}
      >
        <span className="opacity-90 transition-opacity">CLICK</span>
      </motion.div>
    </>
  );
}

export default CustomCursor;

