import React, { useState, Suspense, lazy } from 'react';
import { useBalancerState } from '@/hooks/useBalancerState';
import { useSeoMeta } from '@/hooks/useSeoMeta';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StepIndicator } from '@/components/StepIndicator';
import { resolveRiotPlayers } from '@/services/riotService';
import { generateTopKTeams, pickNextCandidate } from '@/utils/balancer';
import type { ParsedRiotId } from '@/types/balancer';
import './App.css';

// Code splitting: lazy load heavy step components
const LobbyInput = lazy(() => import('@/components/LobbyInput').then(m => ({ default: m.LobbyInput })));
const PlayerConfig = lazy(() => import('@/components/PlayerConfig').then(m => ({ default: m.PlayerConfig })));
const TeamResult = lazy(() => import('@/components/TeamResult').then(m => ({ default: m.TeamResult })));

export const App: React.FC = () => {
  const {
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
  } = useBalancerState();

  // Dynamically update SEO meta tags on lang change
  useSeoMeta(lang);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wasRecomputed, setWasRecomputed] = useState<boolean>(false);

  // Step 1 -> Step 2: Resolve 10 players
  const handleResolvePlayers = async (parsedIds: ParsedRiotId[]) => {
    setIsLoading(true);
    try {
      const resolved = await resolveRiotPlayers(parsedIds, region);
      setPlayers(resolved);
      setStep('config');
    } catch (e) {
      console.error('Error resolving players:', e);
      alert('Error resolving player data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> Step 3: Compute Top-K and pick initial candidate
  const handleGenerateTeams = () => {
    if (players.length !== 10) {
      alert('10 players required.');
      return;
    }

    const topK = generateTopKTeams(players, 10);
    setCandidates(topK);

    const initialShown = new Set<number>();
    const { chosenCandidate, candidatePool, updatedShownIndices } = pickNextCandidate(
      topK,
      initialShown,
      players
    );

    setCandidates(candidatePool);
    setShownIndices(updatedShownIndices);
    setCurrentCandidate(chosenCandidate);
    setWasRecomputed(false);
    setStep('result');
  };

  // Rebalance / Re-roll click handler in Step 3
  const handleRebalance = () => {
    const { chosenCandidate, candidatePool, updatedShownIndices, wasRecomputed: recomputed } =
      pickNextCandidate(candidates, shownIndices, players);

    setCandidates(candidatePool);
    setShownIndices(updatedShownIndices);
    setCurrentCandidate(chosenCandidate);
    setWasRecomputed(recomputed);
  };

  return (
    <div className="app-shell">
      <Header lang={lang} onLanguageChange={setLang} onReset={resetAll} />

      <main className="main-container">
        <StepIndicator
          lang={lang}
          currentStep={step}
          onStepClick={(s) => setStep(s)}
          canNavigateToConfig={players.length === 10}
          canNavigateToResult={candidates.length > 0 && currentCandidate !== null}
        />

        <div className="content-view-wrap">
          <Suspense fallback={<div className="step-loading-fallback" />}>
            {step === 'input' && (
              <LobbyInput
                lang={lang}
                region={region}
                onRegionChange={setRegion}
                onResolvePlayers={handleResolvePlayers}
                isLoading={isLoading}
              />
            )}

            {step === 'config' && (
              <PlayerConfig
                lang={lang}
                players={players}
                onUpdatePlayers={setPlayers}
                onGenerateTeams={handleGenerateTeams}
                onBack={() => setStep('input')}
              />
            )}

            {step === 'result' && (
              <TeamResult
                lang={lang}
                currentCandidate={currentCandidate}
                totalCandidatesCount={candidates.length}
                shownCandidatesCount={shownIndices.size}
                onRebalance={handleRebalance}
                onBackToConfig={() => setStep('config')}
                wasRecomputed={wasRecomputed}
              />
            )}
          </Suspense>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
};

export default App;
