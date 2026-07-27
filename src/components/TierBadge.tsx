import React from 'react';
import type { Tier, Division } from '@/types/balancer';

interface TierBadgeProps {
  tier: Tier;
  division?: Division;
  lp?: number;
  isUnranked?: boolean;
}

const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  IRON: { bg: 'rgba(113, 113, 122, 0.2)', text: '#a1a1aa', border: 'rgba(161, 161, 170, 0.4)' },
  BRONZE: { bg: 'rgba(180, 83, 9, 0.2)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.4)' },
  SILVER: { bg: 'rgba(148, 163, 184, 0.2)', text: '#cbd5e1', border: 'rgba(203, 213, 225, 0.4)' },
  GOLD: { bg: 'rgba(234, 179, 8, 0.2)', text: '#fde047', border: 'rgba(253, 224, 71, 0.4)' },
  PLATINUM: { bg: 'rgba(20, 184, 166, 0.2)', text: '#2dd4bf', border: 'rgba(45, 212, 191, 0.4)' },
  EMERALD: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: 'rgba(52, 211, 153, 0.4)' },
  DIAMOND: { bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' },
  MASTER: { bg: 'rgba(192, 132, 252, 0.2)', text: '#c084fc', border: 'rgba(192, 132, 252, 0.4)' },
  GRANDMASTER: { bg: 'rgba(244, 63, 94, 0.2)', text: '#fb7185', border: 'rgba(251, 113, 133, 0.4)' },
  CHALLENGER: { bg: 'rgba(250, 204, 21, 0.25)', text: '#facc15', border: 'rgba(250, 204, 21, 0.6)' },
  UNRANKED: { bg: 'rgba(71, 85, 105, 0.2)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
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
