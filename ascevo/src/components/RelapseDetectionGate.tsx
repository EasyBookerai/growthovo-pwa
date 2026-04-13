import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectStreakBreak } from '../services/relapseService';

interface Props {
  userId: string;
  onStreakBroke: (originalStreak: number) => void;
  children: React.ReactNode;
}

export default function RelapseDetectionGate({ userId, onStreakBroke, children }: Props) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkForStreakBreak();
  }, [userId]);

  async function checkForStreakBreak() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `@growthovo_relapse_shown_${today}`;
      
      // Check if we've already shown relapse flow today
      const alreadyShown = await AsyncStorage.getItem(storageKey);
      if (alreadyShown) {
        setIsChecking(false);
        return;
      }

      // Detect if streak broke
      const result = await detectStreakBreak(userId);
      
      if (result.broke && !result.freezeActivated) {
        // Mark as shown for today to prevent duplicate fires
        await AsyncStorage.setItem(storageKey, 'true');
        
        // Navigate to streak broke screen
        onStreakBroke(result.originalStreak);
      }
      // Note: freeze activation is already handled in detectStreakBreak
    } catch (error) {
      console.error('Error checking for streak break:', error);
    } finally {
      setIsChecking(false);
    }
  }

  // Show children once checking is complete
  if (isChecking) {
    return null; // Could show a loading spinner here if needed
  }

  return <>{children}</>;
}