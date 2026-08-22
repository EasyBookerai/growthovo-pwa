/**
 * useMascot Hook
 * 
 * React hook for managing mascot state and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUserMascotStatus,
  subscribeMascotEvolutions,
  getMascotEvolutionHistory,
} from '../services/mascotService';
import {
  MascotStatus,
  MascotEvolutionHistory,
  MascotStage,
} from '../types/mascot';

interface UseMascotResult {
  status: MascotStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  evolutionHistory: MascotEvolutionHistory[];
  showEvolutionModal: boolean;
  lastEvolution: MascotEvolutionHistory | null;
  dismissEvolutionModal: () => void;
}

export function useMascot(userId: string | null): UseMascotResult {
  const [status, setStatus] = useState<MascotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evolutionHistory, setEvolutionHistory] = useState<
    MascotEvolutionHistory[]
  >([]);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [lastEvolution, setLastEvolution] = useState<MascotEvolutionHistory | null>(
    null
  );

  // Fetch mascot status
  const fetchStatus = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const mascotStatus = await getUserMascotStatus(userId);
      setStatus(mascotStatus);
    } catch (err) {
      console.error('Error fetching mascot status:', err);
      setError('Failed to load mascot status');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch evolution history
  const fetchHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const history = await getMascotEvolutionHistory(userId);
      setEvolutionHistory(history);
    } catch (err) {
      console.error('Error fetching evolution history:', err);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, [fetchStatus, fetchHistory]);

  // Subscribe to real-time evolution events
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeMascotEvolutions(userId, (evolution) => {
      console.log('🎉 Mascot evolved!', evolution);

      // Update history
      setEvolutionHistory((prev) => [evolution, ...prev]);

      // Show evolution modal
      setLastEvolution(evolution);
      setShowEvolutionModal(true);

      // Refresh status to get updated data
      fetchStatus();
    });

    return () => {
      unsubscribe();
    };
  }, [userId, fetchStatus]);

  // Dismiss evolution modal
  const dismissEvolutionModal = useCallback(() => {
    setShowEvolutionModal(false);
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchStatus();
    await fetchHistory();
  }, [fetchStatus, fetchHistory]);

  return {
    status,
    loading,
    error,
    refresh,
    evolutionHistory,
    showEvolutionModal,
    lastEvolution,
    dismissEvolutionModal,
  };
}

export default useMascot;
