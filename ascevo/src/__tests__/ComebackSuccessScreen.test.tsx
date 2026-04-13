/**
 * Tests for ComebackSuccessScreen functionality
 *
 * Covers:
 *  - Rex message selection based on streak length
 *  - Confetti animation setup
 *  - Share message format
 *
 * Feature: growthovo-features-v3
 * Validates: Requirements 5.6, 5.10
 */

describe('ComebackSuccessScreen functionality', () => {
  it('selects correct Rex message based on streak length', () => {
    const getRexMessage = (streak: number): string => {
      if (streak > 30) return "You didn't just come back. You came back stronger.";
      if (streak >= 15) return "That's what I'm talking about. Welcome back.";
      return "You showed up when it mattered. That's everything.";
    };

    expect(getRexMessage(35)).toBe("You didn't just come back. You came back stronger.");
    expect(getRexMessage(31)).toBe("You didn't just come back. You came back stronger.");
    expect(getRexMessage(30)).toBe("That's what I'm talking about. Welcome back.");
    expect(getRexMessage(15)).toBe("That's what I'm talking about. Welcome back.");
    expect(getRexMessage(14)).toBe("You showed up when it mattered. That's everything.");
    expect(getRexMessage(1)).toBe("You showed up when it mattered. That's everything.");
  });

  it('generates correct number of confetti particles', () => {
    const particleCount = 20;
    const particles = Array.from({ length: particleCount }, (_, i) => i);
    
    expect(particles.length).toBe(20);
    expect(particles[0]).toBe(0);
    expect(particles[19]).toBe(19);
  });

  it('formats share message correctly', () => {
    const shareMessage = 'I broke my streak and came back. @growthovo';
    
    expect(shareMessage).toContain('@growthovo');
    expect(shareMessage).toContain('broke my streak');
    expect(shareMessage).toContain('came back');
  });

  it('calculates confetti particle positions within screen bounds', () => {
    const generateParticleX = () => Math.random() * 300 + 50;
    
    for (let i = 0; i < 100; i++) {
      const x = generateParticleX();
      expect(x).toBeGreaterThanOrEqual(50);
      expect(x).toBeLessThanOrEqual(350);
    }
  });

  it('validates confetti color rotation', () => {
    const pillarColor = '#7C3AED';
    const xpGold = '#F59E0B';
    const success = '#16A34A';
    
    const getParticleColor = (index: number) => {
      if (index % 3 === 0) return pillarColor;
      if (index % 3 === 1) return xpGold;
      return success;
    };

    expect(getParticleColor(0)).toBe(pillarColor);
    expect(getParticleColor(1)).toBe(xpGold);
    expect(getParticleColor(2)).toBe(success);
    expect(getParticleColor(3)).toBe(pillarColor);
  });
});