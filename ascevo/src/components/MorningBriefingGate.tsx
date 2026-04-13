import React, { useEffect, useState } from 'react';
import { hasBriefingBeenShownToday } from '../services/briefingService';
import MorningBriefingScreen from '../screens/briefing/MorningBriefingScreen';

interface Props {
  userId: string;
  children: React.ReactNode;
}

/**
 * MorningBriefingGate
 *
 * Wraps the main app content. On mount it checks:
 *   1. Has the briefing already been shown today?
 *   2. Is the current time at or after 07:30 (the default morning time)?
 *
 * If both conditions are met it renders MorningBriefingScreen as a full-screen
 * overlay. Once the user dismisses the briefing the gate hides and the normal
 * navigation (children) is shown.
 *
 * Requirements: 1.1, 1.2, 1.5
 */
export default function MorningBriefingGate({ userId, children }: Props) {
  // null = still checking, true = show briefing, false = skip
  const [showBriefing, setShowBriefing] = useState<boolean | null>(null);

  useEffect(() => {
    checkShouldShowBriefing();
  }, [userId]);

  async function checkShouldShowBriefing() {
    try {
      // Requirement 1.5: show at most once per calendar day
      const alreadyShown = await hasBriefingBeenShownToday(userId);
      if (alreadyShown) {
        setShowBriefing(false);
        return;
      }

      // Requirement 1.1: only show after the configured morning time (default 07:30)
      const now = new Date();
      const morningHour = 7;
      const morningMinute = 30;
      const afterMorningTime =
        now.getHours() > morningHour ||
        (now.getHours() === morningHour && now.getMinutes() >= morningMinute);

      setShowBriefing(afterMorningTime);
    } catch {
      // On error, skip the gate so the user isn't blocked
      setShowBriefing(false);
    }
  }

  // Still checking — render nothing (App already shows a splash while loading)
  if (showBriefing === null) return null;

  // Requirement 1.2: show MorningBriefingScreen before HomeScreen
  if (showBriefing) {
    return (
      <MorningBriefingScreen
        userId={userId}
        onDismiss={() => setShowBriefing(false)}
      />
    );
  }

  return <>{children}</>;
}
