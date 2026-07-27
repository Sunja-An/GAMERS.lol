import { useState, useEffect } from 'react';
import type { Player, Candidate } from '@/types/balancer';
import type { Language } from '@/types/i18n';

const STORAGE_KEY = 'gamers_lol_balancer_state_v1';

interface SavedState {
  lang: Language;
  step: 'input' | 'config' | 'result';
  players: Player[];
  candidates: Candidate[];
  shownIndices: number[];
  currentCandidateIndex: number;
}

export function useBalancerState() {
  const [lang, setLang] = useState<Language>('ko');
  const [step, setStep] = useState<'input' | 'config' | 'result'>('input');
  const [players, setPlayers] = useState<Player[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [shownIndices, setShownIndices] = useState<Set<number>>(new Set());
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);

  // Load from sessionStorage on initial render
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: SavedState = JSON.parse(saved);
        if (parsed.lang) {
          setLang(parsed.lang);
        }
        if (parsed.players && parsed.players.length === 10) {
          setStep(parsed.step);
          setPlayers(parsed.players);
          setCandidates(parsed.candidates || []);
          setShownIndices(new Set(parsed.shownIndices || []));
          if (parsed.candidates && parsed.currentCandidateIndex >= 0) {
            setCurrentCandidate(parsed.candidates[parsed.currentCandidateIndex] || null);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load session storage state:', e);
    }
  }, []);

  // Sync to sessionStorage on state changes
  useEffect(() => {
    try {
      const currentIdx = currentCandidate
        ? candidates.findIndex((c) => c.id === currentCandidate.id)
        : -1;

      const dataToSave: SavedState = {
        lang,
        step,
        players,
        candidates,
        shownIndices: Array.from(shownIndices),
        currentCandidateIndex: currentIdx,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to save to sessionStorage:', e);
    }
  }, [lang, step, players, candidates, shownIndices, currentCandidate]);

  const resetAll = () => {
    setStep('input');
    setPlayers([]);
    setCandidates([]);
    setShownIndices(new Set());
    setCurrentCandidate(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return {
    lang,
    setLang,
    step,
    setStep,
    players,
    setPlayers,
    candidates,
    setCandidates,
    shownIndices,
    setShownIndices,
    currentCandidate,
    setCurrentCandidate,
    resetAll,
  };
}
