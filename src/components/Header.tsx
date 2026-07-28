import React from 'react';
import type { Language } from '@/types/i18n';
import { t } from '@/utils/i18n';
import { AnimatedButton } from './AnimatedButton';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLanguageChange, onReset }) => {
  const i18n = t(lang);

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-section" onClick={onReset} style={{ cursor: 'pointer' }}>
          <img src="/myo.jpg" alt="GAMERS Logo" className="logo-img" />
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
              🇰🇷 한국어
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'ja' ? 'active' : ''}`}
              onClick={() => onLanguageChange('ja')}
            >
              🇯🇵 日本語
            </button>
          </div>

          <AnimatedButton variant="secondary" size="sm" onClick={onReset}>
            {i18n.header.reset}
          </AnimatedButton>
        </div>
      </div>
    </header>
  );
};
