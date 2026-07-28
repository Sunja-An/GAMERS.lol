import React from 'react';
import type { Tier, Division } from '@/types/balancer';

interface TierBadgeProps {
  tier: Tier;
  division?: Division;
  lp?: number;
  isUnranked?: boolean;
}

const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  IRON: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  BRONZE: { bg: '#fff7ed', text: '#9a3412', border: '#fdba74' },
  SILVER: { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
  GOLD: { bg: '#fefce8', text: '#854d0e', border: '#fde047' },
  PLATINUM: { bg: '#f0fdf4', text: '#0f766e', border: '#5eead4' },
  EMERALD: { bg: '#ecfdf5', text: '#065f46', border: '#6ee7b7' },
  DIAMOND: { bg: '#f0f9ff', text: '#0369a1', border: '#7dd3fc' },
  MASTER: { bg: '#faf5ff', text: '#6b21a8', border: '#d8b4fe' },
  GRANDMASTER: { bg: '#fff1f2', text: '#9f1239', border: '#fda4af' },
  CHALLENGER: { bg: '#fefce8', text: '#713f12', border: '#eab308' },
  UNRANKED: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
};

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, division, lp, isUnranked }) => {
  const effectiveTier = isUnranked ? 'UNRANKED' : tier;
  const style = TIER_COLORS[effectiveTier] || TIER_COLORS.UNRANKED;

  const getLabel = () => {
    if (isUnranked || effectiveTier === 'UNRANKED') return 'UNRANKED';
    if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(effectiveTier)) {
      return `${effectiveTier} (${lp ?? 0}LP)`;
    }
    return `${effectiveTier} ${division || ''}`.trim();
  };

  return (
    <span
      className="tier-badge"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      <span className="tier-dot" style={{ backgroundColor: style.text }} />
      {getLabel()}
    </span>
  );
};
