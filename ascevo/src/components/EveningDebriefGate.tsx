import React, { useEffect, useState } from 'react';
import { hasDebriefBeenShownToday } from '../services/debriefService';
import EveningDebriefScreen from '../screens/debrief/EveningDebriefScreen';

interface Props {
  userId: string;
  children: React.ReactNode;
}

/**
 * EveningDebriefGate
 *
 * Wraps the main app content. On mount it checks:
 *   1. Has the debrief already been shown today?
 *   2. Is the current time at or after 21:00 (the default evening time)?
 *
 * If both conditions are met it renders EveningDebriefScreen as a full-screen
 * overlay. Once the user dismisses the debrief the gate hides and the normal
 * navigation (children) is shown.
 *
 * Requirements: 16.1, 16.2, 16.4
 */
export default function EveningDebriefGate({ userId, children }: Props) {
  // null = still checking, true = show debrief, false = skip
  const [showDebrief, setShowDebrief] = useState<boolean | null>(null);

  useEffect(() => {
    checkShouldShowDebrief();
  }, [userId]);

  async function checkShouldShowDebrief() {
    try {
      // Requirement 16.4: show at most once per calendar day
      const alreadyShown = await hasDebriefBeenShownToday(userId);
      if (alreadyShown) {
        setShowDebrief(false);
        return;
      }

      // Requirement 16.1: only show after the configured evening time (default 21:00)
      const now = new Date();
      const eveningHour = 21;
      const eveningMinute = 0;
      const afterEveningTime =
        now.getHours() > eveningHour ||
        (now.getHours() === eveningHour && now.getMinutes() >= eveningMinute);

      setShowDebrief(afterEveningTime);
    } catch {
      // On error, skip the gate so the user isn't blocked
      setShowDebrief(false);
    }
  }

  // Still checking — render nothing (App already shows a splash while loading)
  if (showDebrief === null) return null;

  // Requirement 16.2: show EveningDebriefScreen before HomeScreen
  if (showDebrief) {
    return (
      <EveningDebriefScreen
        userId={userId}
        onDismiss={() => setShowDebrief(false)}
      />
    );
  }

  return <>{children}</>;
}
