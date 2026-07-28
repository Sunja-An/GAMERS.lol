import React, { useState } from 'react';
import type { Player, Lane, Tier, Division } from '@/types/balancer';
import type { Language } from '@/types/i18n';
import { TierBadge } from './TierBadge';
import { LANES } from '@/utils/balancer';
import { TIER_ORDER, DIVISION_OFFSET, calculatePowerScore } from '@/utils/powerScore';
import { t } from '@/utils/i18n';
import { AnimatedButton } from './AnimatedButton';

interface PlayerConfigProps {
  lang: Language;
  players: Player[];
  onUpdatePlayers: (updated: Player[]) => void;
  onGenerateTeams: () => void;
  onBack: () => void;
}

export const PlayerConfig: React.FC<PlayerConfigProps> = ({
  lang,
  players,
  onUpdatePlayers,
  onGenerateTeams,
  onBack,
}) => {
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);

  const i18n = t(lang);

  const handlePrefChange = (playerIndex: number, lane: Lane, priority: 1 | 2) => {
    const updated = [...players];
    const player = { ...updated[playerIndex] };
    let prefs = [...player.preferences];

    prefs = prefs.filter((p) => p.priority !== priority);
    prefs = prefs.filter((p) => p.lane !== lane);

    prefs.push({ lane, priority });
    player.preferences = prefs;
    updated[playerIndex] = player;
    onUpdatePlayers(updated);
  };

  const handleFillToggle = (playerIndex: number) => {
    const updated = [...players];
    updated[playerIndex] = {
      ...updated[playerIndex],
      fillOk: !updated[playerIndex].fillOk,
    };
    onUpdatePlayers(updated);
  };

  const handleCustomRankSave = (index: number, tier: Tier, division: Division, lp: number) => {
    const updated = [...players];
    const isUnranked = tier === 'UNRANKED';
    const powerScore = calculatePowerScore(tier, division, lp);

    updated[index] = {
      ...updated[index],
      tier,
      division,
      leaguePoints: lp,
      powerScore,
      isUnranked,
    };

    onUpdatePlayers(updated);
    setEditingPlayerIndex(null);
  };

  return (
    <div className="player-config-container">
      <div className="panel-header flex-between">
        <div>
          <h2 className="panel-title">{i18n.config.title}</h2>
          <p className="panel-subtitle">{i18n.config.subtitle}</p>
        </div>
        <AnimatedButton variant="secondary" size="sm" onClick={onBack}>
          {i18n.config.backBtn}
        </AnimatedButton>
      </div>

      <div className="player-cards-grid">
        {players.map((player, idx) => {
          const pref1 = player.preferences.find((p) => p.priority === 1)?.lane;
          const pref2 = player.preferences.find((p) => p.priority === 2)?.lane;

          return (
            <div key={player.puuid || idx} className="player-config-card">
              <div className="card-top">
                <div className="player-avatar-group">
                  <div className="avatar-frame">
                    <span className="avatar-icon">🎮</span>
                  </div>
                  <div className="player-meta">
                    <span className="player-name">
                      {player.gameName}
                      <span className="player-tag">#{player.tagLine}</span>
                    </span>
                    <div className="rank-badge-wrap">
                      <TierBadge
                        tier={player.tier}
                        division={player.division}
                        lp={player.leaguePoints}
                        isUnranked={player.isUnranked}
                      />
                      <button
                        type="button"
                        className="edit-rank-btn"
                        onClick={() => setEditingPlayerIndex(idx)}
                        title={i18n.config.editRank}
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                </div>
                <div className="powerscore-badge" title="PowerScore">
                  <span className="ps-label">PowerScore</span>
                  <span className="ps-value">{player.powerScore}</span>
                </div>
              </div>

              <div className="lane-selection-block">
                <div className="lane-row">
                  <span className="lane-row-label">{i18n.config.pref1st}</span>
                  <div className="lane-buttons">
                    {LANES.map((lane) => (
                      <button
                        key={lane}
                        type="button"
                        className={`lane-btn ${pref1 === lane ? 'active-1' : ''}`}
                        onClick={() => handlePrefChange(idx, lane, 1)}
                      >
                        {lane}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lane-row">
                  <span className="lane-row-label">{i18n.config.pref2nd}</span>
                  <div className="lane-buttons">
                    {LANES.map((lane) => (
                      <button
                        key={lane}
                        type="button"
                        className={`lane-btn ${pref2 === lane ? 'active-2' : ''}`}
                        onClick={() => handlePrefChange(idx, lane, 2)}
                      >
                        {lane}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fill-toggle-row">
                  <label className="fill-checkbox-label">
                    <input
                      type="checkbox"
                      checked={player.fillOk}
                      onChange={() => handleFillToggle(idx)}
                    />
                    <span>{i18n.config.fillOk}</span>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="form-submit-bar sticky-bar">
        <AnimatedButton variant="primary" size="lg" onClick={onGenerateTeams}>
          {i18n.config.startMatching}
        </AnimatedButton>
      </div>

      {/* Rank Edit Modal */}
      {editingPlayerIndex !== null && (
        <RankEditModal
          lang={lang}
          player={players[editingPlayerIndex]}
          onSave={(tier, div, lp) => handleCustomRankSave(editingPlayerIndex, tier, div, lp)}
          onClose={() => setEditingPlayerIndex(null)}
        />
      )}
    </div>
  );
};

interface RankEditModalProps {
  lang: Language;
  player: Player;
  onSave: (tier: Tier, division: Division, lp: number) => void;
  onClose: () => void;
}

const RankEditModal: React.FC<RankEditModalProps> = ({ lang, player, onSave, onClose }) => {
  const [tier, setTier] = useState<Tier>(player.tier);
  const [division, setDivision] = useState<Division>(player.division);
  const [lp, setLp] = useState<number>(player.leaguePoints);

  const i18n = t(lang);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(tier, division, lp);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{i18n.modal.title(player.gameName)}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-field">
            <label>{i18n.modal.tierLabel}</label>
            <select value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
              {['UNRANKED', ...TIER_ORDER].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {!['UNRANKED', 'MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier) && (
            <div className="input-field">
              <label>{i18n.modal.divisionLabel}</label>
              <select value={division} onChange={(e) => setDivision(e.target.value as Division)}>
                {Object.keys(DIVISION_OFFSET).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tier !== 'UNRANKED' && (
            <div className="input-field">
              <label>{i18n.modal.lpLabel}</label>
              <input
                type="number"
                min={0}
                max={2000}
                value={lp}
                onChange={(e) => setLp(Number(e.target.value))}
              />
            </div>
          )}

          <div className="modal-actions">
            <AnimatedButton type="button" variant="secondary" onClick={onClose}>
              {i18n.modal.cancel}
            </AnimatedButton>
            <AnimatedButton type="submit" variant="primary">
              {i18n.modal.save}
            </AnimatedButton>
          </div>
        </form>
      </div>
    </div>
  );
};
