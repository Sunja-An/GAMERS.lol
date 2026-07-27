import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} React + TypeScript + Vite Starter Kit</p>
        <div className="footer-links">
          <a href="https://react.dev" target="_blank" rel="noreferrer">React</a>
          <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript</a>
          <a href="https://vite.dev" target="_blank" rel="noreferrer">Vite</a>
        </div>
      </div>
    </footer>
  );
};
