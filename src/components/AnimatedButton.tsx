import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'reroll' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  magnetic?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  magnetic = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: buttonRef });

  const handleMouseEnter = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    gsap.to(buttonRef.current, {
      scale: 1.035,
      boxShadow: '0 8px 24px rgba(200, 170, 110, 0.4)',
      duration: 0.3,
      ease: 'power2.out',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0.8,
        scale: 1.2,
        duration: 0.3,
      });
    }

    onMouseEnter?.(e);
  });

  const handleMouseMove = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Follow mouse position for radial light flare
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: x - rect.width / 2,
        y: y - rect.height / 2,
        duration: 0.2,
        ease: 'power1.out',
      });
    }

    // Magnetic pull effect
    if (magnetic) {
      const moveX = (x - rect.width / 2) * 0.12;
      const moveY = (y - rect.height / 2) * 0.12;

      gsap.to(buttonRef.current, {
        x: moveX,
        y: moveY,
        duration: 0.2,
        ease: 'power1.out',
      });
    }

    onMouseMove?.(e);
  });

  const handleMouseLeave = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    gsap.to(buttonRef.current, {
      scale: 1,
      x: 0,
      y: 0,
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
      duration: 0.4,
      ease: 'elastic.out(1, 0.4)',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
      });
    }

    onMouseLeave?.(e);
  });

  const handleMouseDown = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.in',
    });

    onMouseDown?.(e);
  });

  const handleMouseUp = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    gsap.to(buttonRef.current, {
      scale: 1.035,
      duration: 0.2,
      ease: 'back.out(2)',
    });

    onMouseUp?.(e);
  });

  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'gsap-btn-primary';
      case 'secondary': return 'gsap-btn-secondary';
      case 'reroll': return 'gsap-btn-reroll';
      case 'warning': return 'gsap-btn-warning';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'gsap-btn-sm';
      case 'md': return 'gsap-btn-md';
      case 'lg': return 'gsap-btn-lg';
    }
  };

  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      className={`gsap-animated-btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      <div ref={glowRef} className="gsap-btn-glow" />
      <span className="gsap-btn-content">{children}</span>
    </button>
  );
};
