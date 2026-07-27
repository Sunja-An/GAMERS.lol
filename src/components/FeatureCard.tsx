import React from 'react';

export interface FeatureProps {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export const FeatureCard: React.FC<FeatureProps> = ({ icon, title, description, badge }) => {
  return (
    <div className="feature-card">
      <div className="feature-header">
        <span className="feature-icon">{icon}</span>
        {badge && <span className="feature-badge">{badge}</span>}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  );
};
