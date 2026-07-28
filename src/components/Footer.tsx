import React from 'react';
import type { Language } from '@/types/i18n';
import { t } from '@/utils/i18n';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const i18n = t(lang);

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <img src="/myo.jpg" alt="GAMERS Logo" className="footer-logo-img" />
              <span className="footer-brand-name">{i18n.header.title}</span>
            </div>
            <p className="footer-subtitle">{i18n.header.subtitle}</p>
          </div>

          <div className="footer-links">
            <a
              href="https://sonu.co.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link-btn footer-blog-link"
              title="Blog (https://sonu.co.kr/)"
            >
              <span className="material-symbols-outlined blog-icon text-lg">rss_feed</span>
              <span>{i18n.footer.blog}</span>
            </a>

            <a
              href="https://github.com/GMS-developer"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link-btn footer-github-link"
              title="GMS-developer GitHub"
            >
              <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-disclaimer">{i18n.footer.disclaimer}</p>
          <p className="footer-rights">{i18n.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};
