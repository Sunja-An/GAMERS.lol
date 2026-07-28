import React, { useState } from 'react';
import type { Candidate, PlayerLaneAssignment } from '@/types/balancer';
import type { Language } from '@/types/i18n';
import { TierBadge } from './TierBadge';
import { formatTeamSummaryText } from '@/utils/clipboard';
import { LANES } from '@/utils/balancer';
import { t } from '@/utils/i18n';
import { AnimatedButton } from './AnimatedButton';

interface TeamResultProps {
  lang: Language;
  currentCandidate: Candidate | null;
  totalCandidatesCount: number;
  shownCandidatesCount: number;
  onRebalance: () => void;
  onBackToConfig: () => void;
  wasRecomputed?: boolean;
}

export const TeamResult: React.FC<TeamResultProps> = ({
  lang,
  currentCandidate,
  totalCandidatesCount,
  shownCandidatesCount,
  onRebalance,
  onBackToConfig,
  wasRecomputed,
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'matchup'>('cards');
  const i18n = t(lang);

  if (!currentCandidate) {
    return (
      <div className="glass-card panel-container text-center p-8">
        <h2>{i18n.result.noData}</h2>
        <AnimatedButton variant="primary" onClick={onBackToConfig} className="mt-4">
          ← {i18n.config.backBtn}
        </AnimatedButton>
      </div>
    );
  }

  const sumPowerA = currentCandidate.teamA.reduce((acc, a) => acc + a.player.powerScore, 0);
  const sumPowerB = currentCandidate.teamB.reduce((acc, b) => acc + b.player.powerScore, 0);

  const handleCopyClipboard = async () => {
    try {
      const formattedText = formatTeamSummaryText(currentCandidate, lang);
      await navigator.clipboard.writeText(formattedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
      alert('Clipboard copy failed.');
    }
  };

  return (
    <div className="team-result-container">
      <div className="glass-card result-header-bar">
        <div className="result-info">
          <h2 className="panel-title flex-align-gap">
            <span className="material-symbols-outlined icon-primary">auto_awesome</span>
            {i18n.result.title}
          </h2>
          <p className="panel-subtitle">{i18n.result.subtitle}</p>
        </div>

        <div className="result-actions">
          {/* View Mode Switcher */}
          <div className="view-mode-switcher">
            <button
              type="button"
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <span className="material-symbols-outlined text-xs">grid_view</span>
              {i18n.result.viewModeCards}
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'matchup' ? 'active' : ''}`}
              onClick={() => setViewMode('matchup')}
            >
              <span className="material-symbols-outlined text-xs">compare_arrows</span>
              {i18n.result.viewModeMatchup}
            </button>
          </div>

          <AnimatedButton variant="secondary" size="sm" onClick={onBackToConfig}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {i18n.result.backToConfig}
          </AnimatedButton>
          <AnimatedButton variant="secondary" size="sm" onClick={handleCopyClipboard}>
            <span className="material-symbols-outlined text-sm">content_copy</span>
            {copySuccess ? i18n.result.copied : i18n.result.copyResult}
          </AnimatedButton>
          <AnimatedButton variant="reroll" size="md" onClick={onRebalance}>
            <span className="material-symbols-outlined text-sm">refresh</span>
            {i18n.result.reroll}
          </AnimatedButton>
        </div>
      </div>

      {wasRecomputed && <div className="jitter-notice-banner">{i18n.result.recomputedNotice}</div>}

      <div className="balance-stats-bar">
        <div className="glass-card stat-pill">
          <span className="stat-label">{i18n.result.progress}</span>
          <span className="stat-value highlight">
            {shownCandidatesCount} / {totalCandidatesCount}
          </span>
        </div>
        <div className="glass-card stat-pill">
          <span className="stat-label">{i18n.result.balanceDiff}</span>
          <span className={`stat-value ${currentCandidate.balanceScore < 100 ? 'good' : 'warning'}`}>
            {currentCandidate.balanceScore} PS
          </span>
        </div>
        <div className="glass-card stat-pill">
          <span className="stat-label">{i18n.result.penalty}</span>
          <span className="stat-value">{currentCandidate.preferencePenalty}</span>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="teams-grid">
          {/* Blue Team (Team A) */}
          <div className="glass-card team-card team-blue">
            <div className="team-header">
              <div className="team-title-group">
                <span className="team-flag blue-flag">{i18n.result.blueTeam}</span>
                <span className="team-power">{i18n.result.totalPower(sumPowerA)}</span>
              </div>
              <div className="team-avg">{i18n.result.avgPower(Math.round(sumPowerA / 5))}</div>
            </div>

            <div className="team-members-list">
              {currentCandidate.teamA.map((assignment) => (
                <PlayerRow
                  key={assignment.player.puuid + assignment.lane}
                  lang={lang}
                  assignment={assignment}
                />
              ))}
            </div>
          </div>

          <div className="vs-badge">VS</div>

          {/* Red Team (Team B) */}
          <div className="glass-card team-card team-red">
            <div className="team-header">
              <div className="team-title-group">
                <span className="team-flag red-flag">{i18n.result.redTeam}</span>
                <span className="team-power">{i18n.result.totalPower(sumPowerB)}</span>
              </div>
              <div className="team-avg">{i18n.result.avgPower(Math.round(sumPowerB / 5))}</div>
            </div>

            <div className="team-members-list">
              {currentCandidate.teamB.map((assignment) => (
                <PlayerRow
                  key={assignment.player.puuid + assignment.lane}
                  lang={lang}
                  assignment={assignment}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Line-by-Line Matchup Direct Comparison View */
        <div className="glass-card line-matchup-container">
          <div className="line-matchup-header">
            <h3>{i18n.result.lineMatchupTitle}</h3>
          </div>

          <div className="line-matchup-list">
            {LANES.map((lane) => {
              const blueAssign = currentCandidate.teamA.find((a) => a.lane === lane)!;
              const redAssign = currentCandidate.teamB.find((b) => b.lane === lane)!;

              const diff = blueAssign.player.powerScore - redAssign.player.powerScore;
              const absDiff = Math.abs(diff);
              const fav: 'BLUE' | 'RED' | 'EQUAL' =
                diff > 0 ? 'BLUE' : diff < 0 ? 'RED' : 'EQUAL';

              return (
                <div key={lane} className="line-matchup-row">
                  {/* Blue Player */}
                  <div className="line-matchup-side blue-side">
                    <PlayerRow lang={lang} assignment={blueAssign} />
                  </div>

                  {/* Line Comparison Badge */}
                  <div className="line-center-badge">
                    <span className={`lane-type-tag lane-${lane.toLowerCase()}`}>{lane}</span>
                    <span className={`line-diff-indicator ${fav.toLowerCase()}`}>
                      {i18n.result.laneAdvantage(absDiff, fav)}
                    </span>
                  </div>

                  {/* Red Player */}
                  <div className="line-matchup-side red-side">
                    <PlayerRow lang={lang} assignment={redAssign} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface PlayerRowProps {
  lang: Language;
  assignment: PlayerLaneAssignment;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ lang, assignment }) => {
  const { player, lane, preferenceStatus } = assignment;
  const i18n = t(lang);

  const getPrefBadge = () => {
    switch (preferenceStatus) {
      case '1st':
        return <span className="pref-tag pref-1st">{i18n.result.prefBadges['1st']}</span>;
      case '2nd':
        return <span className="pref-tag pref-2nd">{i18n.result.prefBadges['2nd']}</span>;
      case 'fill':
        return <span className="pref-tag pref-fill">{i18n.result.prefBadges['fill']}</span>;
      case 'forced':
        return <span className="pref-tag pref-forced">{i18n.result.prefBadges['forced']}</span>;
    }
  };

  return (
    <div className="player-row player-row-card">
      {/* Top Row: Lane + Avatar + Full Name & Tag */}
      <div className="player-row-top">
        <div className="player-row-identity">
          <div className="lane-badge-wrap">
            <span className="lane-name">{lane}</span>
          </div>
          <div className="player-avatar-mini-wrap">
            <img
              src={player.profileIconUrl || `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${player.profileIconId || 1}.png`}
              alt={player.gameName}
              className="avatar-img-mini"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://ddragon.leagueoflegends.com/cdn/15.2.1/img/profileicon/1.png';
              }}
            />
          </div>
          <div className="player-name-full">
            <span className="name" title={`${player.gameName}#${player.tagLine}`}>
              {player.gameName}
            </span>
            <span className="tag">#{player.tagLine}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Level, Pref Tag, Rank Badge, PowerScore */}
      <div className="player-row-bottom">
        <div className="player-stats-left">
          {player.summonerLevel && (
            <span className="summoner-level">Lv.{player.summonerLevel}</span>
          )}
          {getPrefBadge()}
        </div>
        <div className="player-stats-right">
          <TierBadge
            tier={player.tier}
            division={player.division}
            lp={player.leaguePoints}
            isUnranked={player.isUnranked}
          />
          <div className="powerscore-mini-chip" title="PowerScore">
            <span className="ps-label-mini">PS</span>
            <span className="ps-value-mini">{player.powerScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
