import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface ResetButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export const ResetButton: React.FC<ResetButtonProps> = ({ label, onClick, className = '' }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: buttonRef });

  const handleMouseEnter = contextSafe(() => {
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: '+=360',
        duration: 0.6,
        ease: 'back.out(1.7)',
      });
    }

    gsap.to(buttonRef.current, {
      scale: 1.05,
      boxShadow: '0 8px 24px rgba(108, 84, 133, 0.3)',
      duration: 0.3,
      ease: 'power2.out',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0.8,
        scale: 1.3,
        duration: 0.3,
      });
    }
  });

  const handleMouseMove = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: x - rect.width / 2,
        y: y - rect.height / 2,
        duration: 0.2,
        ease: 'power1.out',
      });
    }

    const moveX = (x - rect.width / 2) * 0.15;
    const moveY = (y - rect.height / 2) * 0.15;
    gsap.to(buttonRef.current, {
      x: moveX,
      y: moveY,
      duration: 0.2,
      ease: 'power1.out',
    });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(buttonRef.current, {
      scale: 1,
      x: 0,
      y: 0,
      boxShadow: '0 4px 12px rgba(108, 84, 133, 0.12)',
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
  });

  const handleClick = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { rotation: 0, scale: 1 },
        {
          rotation: 720,
          scale: 1.35,
          duration: 0.7,
          ease: 'power3.out',
          onComplete: () => {
            if (iconRef.current) {
              gsap.to(iconRef.current, { scale: 1, duration: 0.2 });
            }
          },
        }
      );
    }

    if (rippleRef.current && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;

      gsap.fromTo(
        rippleRef.current,
        {
          x: rx - 25,
          y: ry - 25,
          scale: 0,
          opacity: 0.85,
        },
        {
          scale: 5,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
        }
      );
    }

    gsap.to(buttonRef.current, {
      scale: 0.92,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });

    onClick();
  });

  return (
    <button
      ref={buttonRef}
      className={`reset-gsap-btn ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={glowRef} className="reset-btn-glow" />
      <div ref={rippleRef} className="reset-btn-ripple" />
      <span className="reset-btn-content">
        <span ref={iconRef} className="material-symbols-outlined reset-icon">
          refresh
        </span>
        <span>{label}</span>
      </span>
    </button>
  );
};
