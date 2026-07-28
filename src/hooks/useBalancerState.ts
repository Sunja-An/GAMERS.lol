import { useState, useEffect, useCallback } from 'react';
import type { Player, Candidate } from '@/types/balancer';
import type { Language } from '@/types/i18n';
import type { Region } from '@/types/region';

const STORAGE_KEY = 'gamers_lol_balancer_state_v1';

interface SavedState {
  lang: Language;
  region?: Region;
  step: 'input' | 'config' | 'result';
  players: Player[];
  candidates: Candidate[];
  shownIndices: number[];
  currentCandidateIndex: number;
}

/**
 * Parses language from URL Path (/ko, /ja, /kr, /jp) or fallback to Query Param
 */
function getLangFromUrlPath(): Language | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.toLowerCase();
  
  if (path.startsWith('/ko') || path.startsWith('/kr')) return 'ko';
  if (path.startsWith('/ja') || path.startsWith('/jp')) return 'ja';

  // Fallback: check query parameter
  const params = new URLSearchParams(window.location.search);
  const param = params.get('lang')?.toLowerCase();
  if (param === 'ko' || param === 'kr') return 'ko';
  if (param === 'jp' || param === 'ja') return 'ja';

  return null;
}

/**
 * Detects default user language based on browser environment (navigator.language)
 */
function getBrowserLang(): Language {
  if (typeof window === 'undefined' || !navigator) return 'ko';
  const navLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
  if (navLang.startsWith('ja')) return 'ja';
  return 'ko';
}

/**
 * Gets initial language: URL path -> query param -> browser language fallback
 */
function getInitialLanguage(): Language {
  const urlLang = getLangFromUrlPath();
  if (urlLang) return urlLang;
  return getBrowserLang();
}

/**
 * Updates URL Path without page reload (e.g. /ko or /ja)
 */
function updateUrlPathLang(lang: Language) {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;

  // Clean existing lang prefix from pathname
  const cleanedPath = currentPath.replace(/^\/(ko|ja|kr|jp)(\/|$)/i, '/');
  const targetPrefix = `/${lang}`;
  const newPath = cleanedPath === '/' ? targetPrefix : `${targetPrefix}${cleanedPath}`;

  if (`${currentPath}${search}${hash}` !== `${newPath}${hash}`) {
    window.history.replaceState({}, '', `${newPath}${hash}`);
  }
}

export function useBalancerState() {
  const [lang, setLangState] = useState<Language>(() => getInitialLanguage());
  const [region, setRegion] = useState<Region>('kr');
  const [step, setStep] = useState<'input' | 'config' | 'result'>('input');
  const [players, setPlayers] = useState<Player[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [shownIndices, setShownIndices] = useState<Set<number>>(new Set());
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);

  // Function to set lang and update URL path
  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    updateUrlPathLang(newLang);
  }, []);

  // Load state on initial render and ensure URL path is populated
  useEffect(() => {
    try {
      const urlLang = getLangFromUrlPath();
      const saved = sessionStorage.getItem(STORAGE_KEY);
      let activeLang: Language;

      if (urlLang) {
        activeLang = urlLang;
      } else if (saved) {
        const parsed: SavedState = JSON.parse(saved);
        activeLang = parsed.lang || getBrowserLang();
      } else {
        activeLang = getBrowserLang();
      }

      setLangState(activeLang);
      updateUrlPathLang(activeLang);

      if (saved) {
        const parsed: SavedState = JSON.parse(saved);
        if (parsed.region) {
          setRegion(parsed.region);
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

  // Listen to browser navigation changes (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const urlLang = getLangFromUrlPath();
      if (urlLang) {
        setLangState(urlLang);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Sync state to sessionStorage
  useEffect(() => {
    try {
      const currentIdx = currentCandidate
        ? candidates.findIndex((c) => c.id === currentCandidate.id)
        : -1;

      const dataToSave: SavedState = {
        lang,
        region,
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
  }, [lang, region, step, players, candidates, shownIndices, currentCandidate]);

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
    region,
    setRegion,
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
