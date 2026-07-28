import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { ParsedRiotId } from '@/types/balancer';
import type { Language } from '@/types/i18n';
import type { Region } from '@/types/region';
import type { VerifiedUserResult, VerificationStatus } from '@/types/verification';
import { REGION_OPTIONS, getRegionOption } from '@/types/region';
import { verifyUserExistence } from '@/services/riotService';
import { parseLobbyLog } from '@/utils/logParser';
import { t } from '@/utils/i18n';
import { AnimatedButton } from './AnimatedButton';
import { FlagIcon } from './FlagIcon';

gsap.registerPlugin(useGSAP);

interface LobbyInputProps {
  lang: Language;
  region: Region;
  onRegionChange: (region: Region) => void;
  onResolvePlayers: (parsedIds: ParsedRiotId[]) => void;
  isLoading: boolean;
  rawText: string;
  setRawText: React.Dispatch<React.SetStateAction<string>>;
  parsedIds: ParsedRiotId[];
  setParsedIds: React.Dispatch<React.SetStateAction<ParsedRiotId[]>>;
  verificationCache: Record<string, VerifiedUserResult>;
  setVerificationCache: React.Dispatch<React.SetStateAction<Record<string, VerifiedUserResult>>>;
}

export const LobbyInput: React.FC<LobbyInputProps> = ({
  lang,
  region,
  onRegionChange,
  onResolvePlayers,
  isLoading,
  rawText,
  setRawText,
  parsedIds,
  setParsedIds,
  verificationCache,
  setVerificationCache,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Verification state tracking per player index
  const [verificationMap, setVerificationMap] = useState<Record<number, VerifiedUserResult>>({});
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const activeRegionOpt = getRegionOption(region);

  // Manual Add Form State
  const [isAddingManual, setIsAddingManual] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualTag, setManualTag] = useState<string>(activeRegionOpt.defaultTag);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const scannerLineRef = useRef<HTMLDivElement>(null);
  const i18n = t(lang);

  useGSAP({ scope: listContainerRef });

  // Ref to hold current verificationCache without recreating runVerificationScan
  const verificationCacheRef = useRef<Record<string, VerifiedUserResult>>(verificationCache);

  useEffect(() => {
    verificationCacheRef.current = verificationCache;
  }, [verificationCache]);

  // Update default manual tag when region changes
  useEffect(() => {
    setManualTag(activeRegionOpt.defaultTag);
  }, [region, activeRegionOpt.defaultTag]);

  // Main text parsing effect
  useEffect(() => {
    if (!rawText.trim()) {
      if (parsedIds.length > 0) {
        setParsedIds([]);
      }
      setVerificationMap({});
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
  }, [rawText, lang, i18n.input]);

  useEffect(() => {
    if (isAddingManual) {
      nameInputRef.current?.focus();
    }
  }, [isAddingManual]);

  // Helper to generate unique cache key for a player + region
  const getCacheKey = useCallback(
    (gameName: string, tagLine: string, targetRegion: Region) => {
      const name = gameName.trim().toLowerCase();
      const tag = (tagLine.trim() || activeRegionOpt.defaultTag).toLowerCase();
      return `${name}#${tag}@${targetRegion}`;
    },
    [activeRegionOpt.defaultTag]
  );

  // Execute User Verification & GSAP Scan Animation incrementally
  const runVerificationScan = useCallback(
    async (idsToVerify: ParsedRiotId[], targetRegion: Region, forceReScan = false) => {
      if (idsToVerify.length === 0) {
        setVerificationMap({});
        setIsScanning(false);
        return;
      }

      if (forceReScan) {
        // Clear cache if manual re-scan button clicked
        verificationCacheRef.current = {};
        setVerificationCache({});
      }

      const initialMap: Record<number, VerifiedUserResult> = {};
      const uncachedIndices: number[] = [];

      idsToVerify.forEach((item, idx) => {
        const key = getCacheKey(item.gameName, item.tagLine, targetRegion);
        const cached = verificationCacheRef.current[key];

        if (cached && !forceReScan) {
          // Instantly restore cached result! No redundant request!
          initialMap[idx] = cached;
        } else {
          // Mark for verification scan
          initialMap[idx] = {
            id: `${item.gameName}#${item.tagLine || activeRegionOpt.defaultTag}`,
            gameName: item.gameName,
            tagLine: item.tagLine || activeRegionOpt.defaultTag,
            status: 'verifying',
            region: targetRegion,
          };
          uncachedIndices.push(idx);
        }
      });

      setVerificationMap(initialMap);

      // If all items were already cached, we are done! Zero network calls!
      if (uncachedIndices.length === 0) {
        setIsScanning(false);
        return;
      }

      setIsScanning(true);

      // GSAP Laser Scan Sweep Line Animation
      if (scannerLineRef.current) {
        gsap.fromTo(
          scannerLineRef.current,
          { top: '0%', opacity: 1, scaleX: 1 },
          {
            top: '100%',
            opacity: 0.3,
            scaleX: 0.95,
            duration: 0.85,
            ease: 'power2.inOut',
          }
        );
      }

      // GSAP Stagger Entrance / Highlight for Player Cards
      if (listContainerRef.current) {
        gsap.fromTo(
          listContainerRef.current.querySelectorAll('.distilled-player-chip'),
          { y: 8, opacity: 0.7 },
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            stagger: 0.04,
            ease: 'power2.out',
          }
        );
      }

      // Async staggered verification for uncached items only
      const promises = uncachedIndices.map(async (idx, seq) => {
        const item = idsToVerify[idx];
        const key = getCacheKey(item.gameName, item.tagLine, targetRegion);

        // Small delay per item to visualize sequential verification scan
        await new Promise((res) => setTimeout(res, 100 + seq * 60));
        const res = await verifyUserExistence(item.gameName, item.tagLine, targetRegion);

        // Save in verification cache
        verificationCacheRef.current[key] = res;
        setVerificationCache((prev) => ({
          ...prev,
          [key]: res,
        }));

        setVerificationMap((prev) => ({
          ...prev,
          [idx]: res,
        }));

        // Trigger GSAP Pop Animation for the newly verified badge
        setTimeout(() => {
          if (listContainerRef.current) {
            const badges = listContainerRef.current.querySelectorAll(`.chip-status-badge-${idx}`);
            if (badges.length > 0) {
              gsap.fromTo(
                badges,
                { scale: 0.5, opacity: 0, rotate: -15 },
                { scale: 1, opacity: 1, rotate: 0, duration: 0.4, ease: 'back.out(2)' }
              );
            }
          }
        }, 10);
      });

      await Promise.all(promises);
      setIsScanning(false);
    },
    [activeRegionOpt.defaultTag, getCacheKey, setVerificationCache]
  );

  // Trigger verification scan whenever parsedIds or region changes
  useEffect(() => {
    runVerificationScan(parsedIds, region, false);
  }, [parsedIds, region, runVerificationScan]);

  const handleRegionSelect = (newRegion: Region) => {
    onRegionChange(newRegion);
  };

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

  const handleAutoTagFix = (index: number) => {
    const item = parsedIds[index];
    if (!item) return;
    handleItemChange(index, item.gameName, activeRegionOpt.defaultTag);
  };

  const handleRemoveItem = (index: number) => {
    const updated = parsedIds.filter((_, idx) => idx !== index);
    setParsedIds(updated);
    setRawText(updated.map((p) => `${p.gameName}#${p.tagLine}`).join('\n'));
  };

  const handleClear = () => {
    setRawText('');
    setParsedIds([]);
    setVerificationMap({});
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
  const verifiedCount = Object.values(verificationMap).filter((v) => v.status === 'verified').length;

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
            <span className="badge-flag">
              <FlagIcon code={activeRegionOpt.id} size="1.25em" />
            </span>
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
                onClick={() => handleRegionSelect(opt.id)}
              >
                <span className="chip-flag">
                  <FlagIcon code={opt.id} size="1.3em" />
                </span>
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

        {/* Right Column: Distilled Team List with GSAP Verification Scanner */}
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

          {/* Server User Verification Progress Header Bar */}
          {count > 0 && (
            <div className={`verification-summary-bar ${isScanning ? 'scanning' : 'complete'}`}>
              <div className="verification-summary-left">
                <span className="verification-region-flag">
                  <FlagIcon code={activeRegionOpt.id} size="1.35em" />
                </span>
                <div className="verification-text-group">
                  <span className="verification-title-text">
                    {isScanning
                      ? i18n.input.verifyingText(activeRegionOpt.name)
                      : i18n.input.verifiedStatus(verifiedCount, count, activeRegionOpt.name)}
                  </span>
                  <span className="verification-subtitle-text">
                    Riot Server Region: <strong>{activeRegionOpt.name} ({activeRegionOpt.fullName})</strong>
                  </span>
                </div>
              </div>
              <div className="verification-summary-right">
                <button
                  type="button"
                  className="rescan-btn"
                  onClick={() => runVerificationScan(parsedIds, region, true)}
                  title="Re-verify summoners on region server"
                >
                  <span className={`material-symbols-outlined ${isScanning ? 'spin-icon' : ''}`}>
                    radar
                  </span>
                  <span className="rescan-text">Re-Scan</span>
                </button>
              </div>
            </div>
          )}

          <div ref={listContainerRef} className="distilled-list-container relative-container">
            {/* GSAP Animated Laser Scanner Beam Line */}
            {isScanning && <div ref={scannerLineRef} className="scanner-laser-line" />}

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
                {parsedIds.map((item, idx) => {
                  const ver = verificationMap[idx];
                  const status: VerificationStatus = ver ? ver.status : 'verifying';
                  const isVerified = status === 'verified';
                  const isUnverified = status === 'unverified';
                  const hasTag = Boolean(item.tagLine && item.tagLine.trim());

                  return (
                    <div
                      key={idx}
                      className={`distilled-player-chip player-chip-status-${status} ${
                        isVerified ? 'verified-glow' : ''
                      }`}
                    >
                      <div className="distilled-player-left">
                        <div
                          className={`distilled-avatar-circle ${
                            isVerified ? 'verified-avatar' : isUnverified ? 'unverified-avatar' : 'verifying-avatar'
                          }`}
                        >
                          {status === 'verifying' ? (
                            <span className="material-symbols-outlined spin-icon text-sm">sync</span>
                          ) : (
                            item.gameName.charAt(0).toUpperCase()
                          )}
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

                      {/* Verification Status Badge & Auto-Tag Helper */}
                      <div className="distilled-player-right-actions">
                        {status === 'verifying' && (
                          <div className={`chip-status-badge chip-status-badge-${idx} verifying`}>
                            <span className="pulse-dot" />
                            <span className="status-badge-text">Checking...</span>
                          </div>
                        )}

                        {isVerified && (
                          <div className={`chip-status-badge chip-status-badge-${idx} verified`}>
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            <span className="status-badge-text">
                              {activeRegionOpt.name} Valid
                            </span>
                          </div>
                        )}

                        {isUnverified && (
                          <div className="chip-status-actions-wrap">
                            {!hasTag ? (
                              <button
                                type="button"
                                className="auto-tag-btn"
                                onClick={() => handleAutoTagFix(idx)}
                                title={`Auto-fill #${activeRegionOpt.defaultTag}`}
                              >
                                <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                                {i18n.input.autoTagBtn(activeRegionOpt.defaultTag)}
                              </button>
                            ) : (
                              <div className={`chip-status-badge chip-status-badge-${idx} unverified`}>
                                <span className="material-symbols-outlined text-xs">warning</span>
                                <span className="status-badge-text">{i18n.input.unverifiedBadge}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          className="distilled-remove-btn"
                          onClick={() => handleRemoveItem(idx)}
                          title="Remove player"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}

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
