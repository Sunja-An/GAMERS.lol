import React, { useState, useRef, useEffect } from 'react';
import type { Region } from '@/types/region';
import { REGION_OPTIONS, getRegionOption } from '@/types/region';
import { FlagIcon } from './FlagIcon';

interface RegionSelectorProps {
  currentRegion: Region;
  onRegionChange: (region: Region) => void;
  compact?: boolean;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  currentRegion,
  onRegionChange,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeOption = getRegionOption(currentRegion);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`region-selector-container ${compact ? 'compact' : ''}`} ref={containerRef}>
      <button
        type="button"
        className="region-trigger-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="region-flag">
          <FlagIcon code={activeOption.id} size="1.2em" />
        </span>
        <span className="region-name">{activeOption.name}</span>
        <span className="material-symbols-outlined dropdown-arrow">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="region-dropdown-menu" role="listbox">
          <div className="region-dropdown-header">Riot Region</div>
          <div className="region-options-list">
            {REGION_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`region-option-item ${option.id === currentRegion ? 'active' : ''}`}
                onClick={() => {
                  onRegionChange(option.id);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={option.id === currentRegion}
              >
                <span className="option-flag">
                  <FlagIcon code={option.id} size="1.2em" />
                </span>
                <div className="option-text-group">
                  <span className="option-name">{option.name}</span>
                  <span className="option-fullname">{option.fullName}</span>
                </div>
                {option.id === currentRegion && (
                  <span className="material-symbols-outlined check-icon">check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
