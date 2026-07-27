import React from 'react';
import type { Language } from '@/types/i18n';
import { t } from '@/utils/i18n';

interface StepIndicatorProps {
  lang: Language;
  currentStep: 'input' | 'config' | 'result';
  onStepClick: (step: 'input' | 'config' | 'result') => void;
  canNavigateToConfig: boolean;
  canNavigateToResult: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  lang,
  currentStep,
  onStepClick,
  canNavigateToConfig,
  canNavigateToResult,
}) => {
  const i18n = t(lang);

  const steps = [
    { key: 'input', label: i18n.steps.input, icon: '📝', enabled: true },
    { key: 'config', label: i18n.steps.config, icon: '⚙️', enabled: canNavigateToConfig },
    { key: 'result', label: i18n.steps.result, icon: '🏆', enabled: canNavigateToResult },
  ];

  return (
    <div className="step-indicator">
      {steps.map((s, idx) => {
        const isActive = currentStep === s.key;
        return (
          <React.Fragment key={s.key}>
            <button
              className={`step-item ${isActive ? 'active' : ''} ${!s.enabled ? 'disabled' : ''}`}
              onClick={() => s.enabled && onStepClick(s.key as any)}
              disabled={!s.enabled}
            >
              <span className="step-icon">{s.icon}</span>
              <span className="step-label">{s.label}</span>
            </button>
            {idx < steps.length - 1 && <div className="step-divider" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
