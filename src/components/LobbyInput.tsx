import React, { useState, useEffect, useRef } from 'react';
import type { ParsedRiotId } from '@/types/balancer';
import type { Language } from '@/types/i18n';
import type { Region } from '@/types/region';
import { REGION_OPTIONS, getRegionOption } from '@/types/region';
import { parseLobbyLog } from '@/utils/logParser';
import { t } from '@/utils/i18n';
import { AnimatedButton } from './AnimatedButton';

interface LobbyInputProps {
  lang: Language;
  region: Region;
  onRegionChange: (region: Region) => void;
  onResolvePlayers: (parsedIds: ParsedRiotId[]) => void;
  isLoading: boolean;
}

export const LobbyInput: React.FC<LobbyInputProps> = ({
  lang,
  region,
  onRegionChange,
  onResolvePlayers,
  isLoading,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [parsedIds, setParsedIds] = useState<ParsedRiotId[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeRegionOpt = getRegionOption(region);

  // Manual Add Form State
  const [isAddingManual, setIsAddingManual] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualTag, setManualTag] = useState<string>(activeRegionOpt.defaultTag);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const i18n = t(lang);

  // Update default manual tag when region changes
  useEffect(() => {
    setManualTag(activeRegionOpt.defaultTag);
  }, [region]);

  useEffect(() => {
    if (!rawText.trim()) {
      setParsedIds([]);
      setErrorMsg(null);
      return;
    }

    const parsed = parseLobbyLog(rawText, lang);
    setParsedIds(parsed);

    if (parsed.length > 10) {
      setErrorMsg(i18n.input.exceededError);
    } else if (parsed.length < 10) {
      setErrorMsg(i18n.input.countInvalid(parsed.length));
    } else {
      setErrorMsg(null);
    }
  }, [rawText, lang]);

  useEffect(() => {
    if (isAddingManual) {
      nameInputRef.current?.focus();
    }
  }, [isAddingManual]);

  const handleOpenManualAdd = () => {
    if (parsedIds.length >= 10) return;
    setIsAddingManual(true);
  };

  const handleConfirmManualAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedName = manualName.trim();
    const trimmedTag = manualTag.trim() || activeRegionOpt.defaultTag;

    if (!trimmedName) return;
    if (parsedIds.length >= 10) return;

    const updated = [...parsedIds, { gameName: trimmedName, tagLine: trimmedTag }];
    setParsedIds(updated);
    setRawText((prev) => (prev.trim() ? `${prev.trim()}\n${trimmedName}#${trimmedTag}` : `${trimmedName}#${trimmedTag}`));

    setManualName('');
    setManualTag(activeRegionOpt.defaultTag);
    setIsAddingManual(false);
  };

  const handleCancelManualAdd = () => {
    setManualName('');
    setManualTag(activeRegionOpt.defaultTag);
    setIsAddingManual(false);
  };

  const handleItemChange = (index: number, gameName: string, tagLine: string) => {
    const updated = [...parsedIds];
    updated[index] = { gameName, tagLine };
    setParsedIds(updated);
    setRawText(updated.map((p) => `${p.gameName}#${p.tagLine}`).join('\n'));
  };

  const handleRemoveItem = (index: number) => {
    const updated = parsedIds.filter((_, idx) => idx !== index);
    setParsedIds(updated);
    setRawText(updated.map((p) => `${p.gameName}#${p.tagLine}`).join('\n'));
  };

  const handleClear = () => {
    setRawText('');
    setParsedIds([]);
    setErrorMsg(null);
    setIsAddingManual(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedIds.length !== 10) {
      setErrorMsg(i18n.input.countInvalid(parsedIds.length));
      return;
    }

    setErrorMsg(null);
    onResolvePlayers(parsedIds.slice(0, 10));
  };

  const count = parsedIds.length;

  return (
    <div className="extract-page-wrapper">
      {/* Hero Header */}
      <div className="extract-hero-header">
        <h1 className="extract-hero-title">{i18n.input.extractTitle}</h1>
        <p className="extract-hero-subtitle">
          {i18n.input.extractSubtitle}
        </p>
      </div>

      {/* Dedicated Riot Server Region Selector Section Card */}
      <div className="region-section-card glass-card">
        <div className="region-section-header">
          <div className="region-section-title-wrap">
            <span className="material-symbols-outlined region-section-icon">public</span>
            <div>
              <h3 className="region-section-title">{i18n.input.regionSectionTitle}</h3>
              <p className="region-section-subtitle">{i18n.input.regionSectionSubtitle}</p>
            </div>
          </div>
          <div className="current-region-badge">
            <span className="badge-flag">{activeRegionOpt.flag}</span>
            <span className="badge-name">{activeRegionOpt.name} ({activeRegionOpt.fullName})</span>
          </div>
        </div>

        <div className="region-chips-grid">
          {REGION_OPTIONS.map((opt) => {
            const isSelected = opt.id === region;
            return (
              <button
                key={opt.id}
                type="button"
                className={`region-chip-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => onRegionChange(opt.id)}
              >
                <span className="chip-flag">{opt.flag}</span>
                <span className="chip-code">{opt.name}</span>
                <span className="chip-fullname">{opt.fullName}</span>
                {isSelected && (
                  <span className="material-symbols-outlined chip-check">check_circle</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="extract-grid-container">
        {/* Left Column: Clean Glassmorphic Textarea Card */}
        <div className="glass-card extract-card left-card">
          <div className="extract-card-header">
            <span className="material-symbols-outlined icon-primary">content_paste</span>
            <h2 className="extract-card-title">{i18n.input.title}</h2>
          </div>

          {/* Clean Modern Textarea Container */}
          <div className="cyber-textarea-container">
            <textarea
              className="extract-textarea cyber-textarea"
              rows={9}
              placeholder={i18n.input.textareaPlaceholder}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />

            {/* Bottom Clear & Count Badge */}
            <div className="cyber-textarea-footer">
              <span className={`stat-tag count-tag ${count === 10 ? 'valid' : ''}`}>
                {count}/10
              </span>
              {rawText && (
                <button type="button" className="clear-btn" onClick={handleClear}>
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  {i18n.input.clearBtn}
                </button>
              )}
            </div>
          </div>

          {/* Validation Banner */}
          <div className={`status-validation-box ${count === 10 ? 'valid' : count > 10 ? 'error' : 'info'}`}>
            <span className="material-symbols-outlined">
              {count === 10 ? 'task_alt' : count > 10 ? 'warning' : 'info'}
            </span>
            <span className="status-text">
              {count === 10
                ? i18n.input.statusReady
                : count > 10
                ? i18n.input.statusTooMany(count)
                : errorMsg || i18n.input.statusRequired(10 - count)}
            </span>
          </div>
        </div>

        {/* Right Column: Distilled Team List */}
        <div className="glass-card extract-card right-card">
          <div className="extract-card-header flex-between">
            <div className="flex-align-gap">
              <span className="material-symbols-outlined icon-primary">group</span>
              <h2 className="extract-card-title">{i18n.input.distilledTitle}</h2>
            </div>
            <div className={`count-pill ${count === 10 ? 'valid' : ''}`}>
              {count}/10
            </div>
          </div>

          <div className="distilled-list-container">
            {count === 0 && !isAddingManual ? (
              <div className="distilled-empty-state">
                <span className="material-symbols-outlined text-4xl">hourglass_empty</span>
                <p className="empty-text">{i18n.input.emptyText}</p>
                <button type="button" className="distilled-add-btn" onClick={handleOpenManualAdd}>
                  <span className="material-symbols-outlined text-sm">add</span>
                  {i18n.input.addPlayer}
                </button>
              </div>
            ) : (
              <div className="distilled-chips-grid">
                {parsedIds.map((item, idx) => (
                  <div key={idx} className="distilled-player-chip">
                    <div className="distilled-player-left">
                      <div className="distilled-avatar-circle">
                        {item.gameName.charAt(0).toUpperCase()}
                      </div>
                      <div className="distilled-input-wrap">
                        <input
                          type="text"
                          className="chip-input name-input"
                          value={item.gameName}
                          placeholder={i18n.input.namePlaceholder}
                          onChange={(e) => handleItemChange(idx, e.target.value, item.tagLine)}
                        />
                        <span className="tag-hash-badge">#</span>
                        <input
                          type="text"
                          className="chip-input tag-input"
                          value={item.tagLine}
                          placeholder={i18n.input.tagPlaceholder}
                          onChange={(e) => handleItemChange(idx, item.gameName, e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="distilled-remove-btn"
                      onClick={() => handleRemoveItem(idx)}
                      title="Remove player"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Modern Manual Add Input Form Card */}
                {isAddingManual ? (
                  <div className="manual-add-form-chip active-add-card">
                    <div className="distilled-player-left">
                      <div className="distilled-avatar-circle new-avatar">
                        <span className="material-symbols-outlined text-sm">person_add</span>
                      </div>
                      <div className="distilled-input-wrap modern-input-wrap">
                        <input
                          ref={nameInputRef}
                          type="text"
                          className="chip-input name-input modern-text-input"
                          value={manualName}
                          placeholder={i18n.input.namePlaceholder}
                          onChange={(e) => setManualName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleConfirmManualAdd();
                            }
                          }}
                        />
                        <span className="tag-hash-badge active-badge">#</span>
                        <input
                          type="text"
                          className="chip-input tag-input modern-tag-input"
                          value={manualTag}
                          placeholder={i18n.input.tagPlaceholder}
                          onChange={(e) => setManualTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleConfirmManualAdd();
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="manual-form-actions">
                      <button
                        type="button"
                        className="manual-confirm-btn"
                        onClick={() => handleConfirmManualAdd()}
                        disabled={!manualName.trim()}
                        title="Add Player"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                      <button
                        type="button"
                        className="manual-cancel-btn"
                        onClick={handleCancelManualAdd}
                        title="Cancel"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  count < 10 && (
                    <button type="button" className="distilled-add-btn" onClick={handleOpenManualAdd}>
                      <span className="material-symbols-outlined text-sm">add</span>
                      {i18n.input.addPlayer}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="extract-action-footer">
            <AnimatedButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={count !== 10 || isLoading}
              className="w-full"
            >
              <span className="btn-label-text">
                {isLoading ? i18n.input.loading : i18n.input.startBalanceBtn}
              </span>
              <span className="material-symbols-outlined">auto_awesome</span>
            </AnimatedButton>
            <p className="extract-helper-text">
              {count === 10 ? i18n.input.helperReady : i18n.input.helperRequired}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
