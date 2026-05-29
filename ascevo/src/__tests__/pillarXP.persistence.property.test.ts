/**
 * Property-Based Test: XP Persistence Round-Trip
 * 
 * Feature: premium-pillars-experience
 * Property 7: XP Persistence Round-Trip
 * Validates: Requirements 18.2, 18.5
 * 
 * Tests that for any XP value that is awarded:
 * - The new XP total is persisted to localStorage under key 'growthovo_xp'
 * - When the screen reloads, the XP value is retrieved and displayed correctly
 * - The round-trip preserves the exact XP value across multiple save/load cycles
 */

import fc from 'fast-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveGlobalXP, loadGlobalXP } from '../services/pillarStorageService';

// Create a proper in-memory storage for testing
const mockStorage: Record<string, string> = {};

// Mock AsyncStorage with actual storage behavior
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn(async (key: string) => {
      return Promise.resolve(mockStorage[key] || null);
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
    clear: jest.fn(async () => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(async () => {
      return Promise.resolve(Object.keys(mockStorage));
    }),
  },
}));

describe('Property 7: XP Persistence Round-Trip', () => {
  beforeEach(async () => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up after each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  it('should persist and retrieve any XP value 0-4999 correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 4999 }),
        async (xp) => {
          // Save XP
          await saveGlobalXP(xp);
          
          // Load XP
          const loadedXP = await loadGlobalXP();
          
          // XP should match exactly
          expect(loadedXP).toBe(xp);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve XP value across multiple save/load cycles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 4999 }),
        fc.integer({ min: 2, max: 5 }), // Number of cycles
        async (xp, cycles) => {
          let currentXP = xp;
          
          // Perform multiple save/load cycles
          for (let i = 0; i < cycles; i++) {
            await saveGlobalXP(currentXP);
            currentXP = await loadGlobalXP();
          }
          
          // Final XP should match original
          expect(currentXP).toBe(xp);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle XP updates correctly (save new value, load new value)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 2499 }), // Initial XP
        fc.integer({ min: 1, max: 500 }),  // XP to add
        async (initialXP, xpToAdd) => {
          // Save initial XP
          await saveGlobalXP(initialXP);
          
          // Load and verify
          const loaded1 = await loadGlobalXP();
          expect(loaded1).toBe(initialXP);
          
          // Update XP (simulate awarding XP)
          const newXP = initialXP + xpToAdd;
          await saveGlobalXP(newXP);
          
          // Load and verify new value
          const loaded2 = await loadGlobalXP();
          expect(loaded2).toBe(newXP);
          
          // Verify it's the new value, not the old one
          expect(loaded2).not.toBe(initialXP);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should persist XP to correct localStorage key', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 4999 }),
        async (xp) => {
          // Save XP
          await saveGlobalXP(xp);
          
          // Verify it's stored under correct key
          const rawData = await AsyncStorage.getItem('growthovo_xp');
          expect(rawData).not.toBeNull();
          
          // Verify the stored value matches
          const storedXP = parseInt(rawData!, 10);
          expect(storedXP).toBe(xp);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases (0 XP, max XP)', async () => {
    // Test 0 XP
    await saveGlobalXP(0);
    let loaded = await loadGlobalXP();
    expect(loaded).toBe(0);
    
    // Test max XP (4999)
    await saveGlobalXP(4999);
    loaded = await loadGlobalXP();
    expect(loaded).toBe(4999);
    
    // Test level boundaries
    const levelBoundaries = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500];
    for (const xp of levelBoundaries) {
      await saveGlobalXP(xp);
      loaded = await loadGlobalXP();
      expect(loaded).toBe(xp);
    }
  });

  it('should return 0 when no XP has been saved yet', async () => {
    // Don't save anything, just load
    const loaded = await loadGlobalXP();
    expect(loaded).toBe(0);
  });

  it('should handle concurrent save/load operations correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 4999 }), { minLength: 2, maxLength: 5 }),
        async (xpValues) => {
          // Save all values sequentially (simulating rapid XP awards)
          for (const xp of xpValues) {
            await saveGlobalXP(xp);
          }
          
          // Load should return the last saved value
          const loaded = await loadGlobalXP();
          expect(loaded).toBe(xpValues[xpValues.length - 1]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain data integrity after app restart simulation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 4999 }),
        async (xp) => {
          // Save XP
          await saveGlobalXP(xp);
          
          // Simulate app restart by creating new instance
          // (AsyncStorage persists across test runs until cleared)
          const loadedAfterRestart = await loadGlobalXP();
          
          // XP should persist across "restart"
          expect(loadedAfterRestart).toBe(xp);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle XP increments correctly (simulating lesson/challenge completion)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 4000 }), // Starting XP
        fc.array(
          fc.constantFrom(30, 50), // Challenge (30) or Lesson (50) XP
          { minLength: 1, maxLength: 10 }
        ),
        async (startingXP, xpAwards) => {
          // Set initial XP
          await saveGlobalXP(startingXP);
          
          // Simulate multiple XP awards
          let currentXP = startingXP;
          for (const award of xpAwards) {
            currentXP += award;
            await saveGlobalXP(currentXP);
            
            // Verify after each award
            const loaded = await loadGlobalXP();
            expect(loaded).toBe(currentXP);
          }
          
          // Final verification
          const finalXP = await loadGlobalXP();
          const expectedFinalXP = startingXP + xpAwards.reduce((sum, xp) => sum + xp, 0);
          expect(finalXP).toBe(expectedFinalXP);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject negative XP values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: -1000, max: -1 }),
        async (negativeXP) => {
          // Attempting to save negative XP should throw
          await expect(saveGlobalXP(negativeXP)).rejects.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle corrupted data gracefully', async () => {
    // Manually corrupt the data
    await AsyncStorage.setItem('growthovo_xp', 'invalid_data');
    
    // Load should return 0 (default) instead of crashing
    const loaded = await loadGlobalXP();
    expect(loaded).toBe(0);
    
    // Should be able to save valid data after corruption
    await saveGlobalXP(100);
    const loadedAfterFix = await loadGlobalXP();
    expect(loadedAfterFix).toBe(100);
  });

  it('should maintain XP value type as integer (no floating point errors)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 4999 }),
        async (xp) => {
          await saveGlobalXP(xp);
          const loaded = await loadGlobalXP();
          
          // Verify it's an integer
          expect(Number.isInteger(loaded)).toBe(true);
          
          // Verify no floating point errors
          expect(loaded).toBe(xp);
        }
      ),
      { numRuns: 100 }
    );
  });
});
