import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Language } from '@/types/i18n';
import { t } from '@/utils/i18n';
import { ResetButton } from './ResetButton';

gsap.registerPlugin(useGSAP);

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onReset,
}) => {
  const headerRef = useRef<HTMLElement>(null);
  const i18n = t(lang);

  useGSAP(() => {
    let isHidden = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const atTop = currentScrollY <= 20;

      if (atTop && isHidden) {
        isHidden = false;
        gsap.to(headerRef.current, {
          opacity: 1,
          y: 0,
          pointerEvents: 'auto',
          duration: 0.35,
          ease: 'power2.out',
        });
      } else if (!atTop && !isHidden) {
        isHidden = true;
        gsap.to(headerRef.current, {
          opacity: 0,
          y: -20,
          pointerEvents: 'none',
          duration: 0.35,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, { scope: headerRef });

  return (
    <header ref={headerRef} className="app-header">
      <div className="header-container">
        <div className="logo-section" onClick={onReset} style={{ cursor: 'pointer' }}>
          <div className="logo-avatar-wrap">
            <img src="/myo.jpg" alt="GAMERS Logo" className="logo-img" />
          </div>
          <div className="logo-text-group">
            <span className="logo-title">{i18n.header.title}</span>
            <span className="logo-subtitle">{i18n.header.subtitle}</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Language Switcher */}
          <div className="lang-switcher">
            <button
              type="button"
              className={`lang-btn ${lang === 'ko' ? 'active' : ''}`}
              onClick={() => onLanguageChange('ko')}
            >
              🇰🇷 KR
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'ja' ? 'active' : ''}`}
              onClick={() => onLanguageChange('ja')}
            >
              🇯🇵 JP
            </button>
          </div>

          <ResetButton label={i18n.header.reset} onClick={onReset} />
        </div>
      </div>
    </header>
  );
};
