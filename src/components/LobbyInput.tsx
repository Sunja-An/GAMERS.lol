import React, { useState, useEffect } from 'react';
import type { ParsedRiotId } from '@/types/balancer';
import type { Language } from '@/types/i18n';
import { parseLobbyLog } from '@/utils/logParser';
import { t } from '@/utils/i18n';

interface LobbyInputProps {
  lang: Language;
  onResolvePlayers: (parsedIds: ParsedRiotId[]) => void;
  isLoading: boolean;
}

export const LobbyInput: React.FC<LobbyInputProps> = ({ lang, onResolvePlayers, isLoading }) => {
  const [rawText, setRawText] = useState<string>('');
  const [parsedIds, setParsedIds] = useState<ParsedRiotId[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const i18n = t(lang);

  // Automatically parse text whenever rawText OR lang changes
  useEffect(() => {
    if (!rawText.trim()) {
      setParsedIds([]);
      setErrorMsg(null);
      return;
    }

    // Language-aware parsing rule execution
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

  const handleManualAdd = () => {
    if (parsedIds.length >= 10) return;
    const nextNum = parsedIds.length + 1;
    const updated = [...parsedIds, { gameName: `Player${nextNum}`, tagLine: 'KR1' }];
    setParsedIds(updated);
    setRawText(updated.map((p) => `${p.gameName}#${p.tagLine}`).join('\n'));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedIds.length !== 10) {
      alert(i18n.input.countInvalid(parsedIds.length));
      return;
    }
    onResolvePlayers(parsedIds.slice(0, 10));
  };

  return (
    <div className="input-panel-container">
      <div className="panel-header">
        <h2 className="panel-title">{i18n.input.title}</h2>
        <p className="panel-subtitle">{i18n.input.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <div className="textarea-group">
          <textarea
            className="lobby-textarea"
            rows={7}
            placeholder={i18n.input.textareaPlaceholder}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div className="textarea-footer">
            <span className={`count-badge ${parsedIds.length === 10 ? 'valid' : ''}`}>
              {i18n.input.countValid(parsedIds.length)}
            </span>
          </div>
        </div>

        {errorMsg && <div className="validation-banner">{errorMsg}</div>}

        <div className="parsed-list-section">
          <div className="parsed-list-header">
            <h3>{i18n.input.listTitle(parsedIds.length)}</h3>
            {parsedIds.length < 10 && (
              <button type="button" className="btn btn-sm btn-secondary" onClick={handleManualAdd}>
                {i18n.input.addPlayer}
              </button>
            )}
          </div>

          <div className="parsed-grid">
            {parsedIds.map((item, idx) => (
              <div key={idx} className="player-input-chip">
                <span className="chip-index">{idx + 1}</span>
                <input
                  type="text"
                  className="chip-input name-input"
                  value={item.gameName}
                  placeholder={i18n.input.namePlaceholder}
                  onChange={(e) => handleItemChange(idx, e.target.value, item.tagLine)}
                />
                <span className="chip-hash">#</span>
                <input
                  type="text"
                  className="chip-input tag-input"
                  value={item.tagLine}
                  placeholder={i18n.input.tagPlaceholder}
                  onChange={(e) => handleItemChange(idx, item.gameName, e.target.value)}
                />
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={() => handleRemoveItem(idx)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-submit-bar">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={parsedIds.length !== 10 || isLoading}
          >
            {isLoading ? i18n.input.loading : i18n.input.nextBtn}
          </button>
        </div>
      </form>
    </div>
  );
};
