/**
 * Unit tests for pillarStorageService
 * 
 * Tests localStorage persistence utilities with mocked AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  savePillarProgress,
  loadPillarProgress,
  saveGlobalXP,
  loadGlobalXP,
  saveCompletedLessons,
  loadCompletedLessons,
  createDefaultProgress,
  validatePillarKey,
  getCurrentDate,
  shouldResetDailyChallenge,
  clearInMemoryCache,
} from '../services/pillarStorageService';
import type { PillarProgress, CompletedLessons } from '../types/pillars';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('pillarStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mock to return null for all keys
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    // Clear in-memory cache
    clearInMemoryCache();
  });
  
  describe('createDefaultProgress', () => {
    it('should create default progress with level 1 and 0 XP', () => {
      const progress = createDefaultProgress('mental-health');
      
      expect(progress).toEqual({
        pillarKey: 'mental-health',
        xp: 0,
        level: 1,
        completedLessons: [],
        streak: 0,
        lastActivityDate: '',
        challengeCompletedToday: false,
        challengeCompletionDate: null,
      });
    });
    
    it('should create default progress for all valid pillars', () => {
      const pillars = ['mental-health', 'relationships', 'career', 'fitness', 'finance', 'hobbies'];
      
      pillars.forEach((pillar) => {
        const progress = createDefaultProgress(pillar as any);
        expect(progress.pillarKey).toBe(pillar);
        expect(progress.xp).toBe(0);
        expect(progress.level).toBe(1);
      });
    });
  });
  
  describe('validatePillarKey', () => {
    it('should return true for valid pillar keys', () => {
      expect(validatePillarKey('mental-health')).toBe(true);
      expect(validatePillarKey('relationships')).toBe(true);
      expect(validatePillarKey('career')).toBe(true);
      expect(validatePillarKey('fitness')).toBe(true);
      expect(validatePillarKey('finance')).toBe(true);
      expect(validatePillarKey('hobbies')).toBe(true);
    });
    
    it('should return false for invalid pillar keys', () => {
      expect(validatePillarKey('invalid')).toBe(false);
      expect(validatePillarKey('mind')).toBe(false);
      expect(validatePillarKey('')).toBe(false);
      expect(validatePillarKey('MENTAL-HEALTH')).toBe(false);
    });
  });
  
  describe('savePillarProgress', () => {
    it('should save progress to AsyncStorage', async () => {
      const progress: PillarProgress = {
        pillarKey: 'mental-health',
        xp: 250,
        level: 1,
        completedLessons: ['lesson-1'],
        streak: 5,
        lastActivityDate: '2025-01-15',
        challengeCompletedToday: true,
        challengeCompletionDate: '2025-01-15',
      };
      
      await savePillarProgress('mental-health', progress);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'growthovo_pillar_progress_mental-health',
        JSON.stringify(progress)
      );
    });
    
    it('should throw error for invalid pillar key', async () => {
      const progress = createDefaultProgress('mental-health');
      
      await expect(
        savePillarProgress('invalid' as any, progress)
      ).rejects.toThrow('Invalid pillar key: invalid');
    });
  });
  
  describe('loadPillarProgress', () => {
    it('should load progress from AsyncStorage', async () => {
      const progress: PillarProgress = {
        pillarKey: 'mental-health',
        xp: 250,
        level: 1,
        completedLessons: ['mental-health-lesson-1'],
        streak: 5,
        lastActivityDate: '2025-01-15',
        challengeCompletedToday: true,
        challengeCompletionDate: '2025-01-15',
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(progress));
      
      const loaded = await loadPillarProgress('mental-health');
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        'growthovo_pillar_progress_mental-health'
      );
      expect(loaded).toEqual(progress);
    });
    
    it('should return default progress if not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const loaded = await loadPillarProgress('mental-health');
      
      expect(loaded).toEqual(createDefaultProgress('mental-health'));
    });
    
    it('should return default progress for invalid pillar key', async () => {
      const loaded = await loadPillarProgress('invalid' as any);
      
      expect(loaded.pillarKey).toBe('invalid');
      expect(loaded.xp).toBe(0);
      expect(loaded.level).toBe(1);
    });
    
    it('should sanitize invalid XP values', async () => {
      const invalidProgress = {
        pillarKey: 'mental-health',
        xp: -100, // Invalid
        level: 1,
        completedLessons: [],
        streak: 0,
        lastActivityDate: '',
        challengeCompletedToday: false,
        challengeCompletionDate: null,
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(invalidProgress));
      
      const loaded = await loadPillarProgress('mental-health');
      
      expect(loaded.xp).toBe(0);
    });
    
    it('should recalculate level if mismatched', async () => {
      const invalidProgress = {
        pillarKey: 'mental-health',
        xp: 750, // Should be level 2
        level: 5, // Wrong level
        completedLessons: [],
        streak: 0,
        lastActivityDate: '',
        challengeCompletedToday: false,
        challengeCompletionDate: null,
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(invalidProgress));
      
      const loaded = await loadPillarProgress('mental-health');
      
      expect(loaded.level).toBe(2); // Corrected
    });
  });
  
  describe('saveGlobalXP', () => {
    it('should save global XP to AsyncStorage', async () => {
      await saveGlobalXP(1500);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'growthovo_xp',
        '1500'
      );
    });
    
    it('should throw error for negative XP', async () => {
      await expect(saveGlobalXP(-100)).rejects.toThrow('Invalid XP value: -100 (must be >= 0 and integer)');
    });
  });
  
  describe('loadGlobalXP', () => {
    it('should load global XP from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1500');
      
      const xp = await loadGlobalXP();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('growthovo_xp');
      expect(xp).toBe(1500);
    });
    
    it('should return 0 if not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const xp = await loadGlobalXP();
      
      expect(xp).toBe(0);
    });
    
    it('should return 0 for invalid XP value', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid');
      
      const xp = await loadGlobalXP();
      
      expect(xp).toBe(0);
    });
    
    it('should return 0 for negative XP', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('-100');
      
      const xp = await loadGlobalXP();
      
      expect(xp).toBe(0);
    });
  });
  
  describe('saveCompletedLessons', () => {
    it('should save completed lessons to AsyncStorage', async () => {
      const completedLessons: CompletedLessons = {
        lessonIds: ['lesson-1', 'lesson-2', 'lesson-3'],
        lastUpdated: '2025-01-15T10:00:00Z',
      };
      
      await saveCompletedLessons(completedLessons);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'growthovo_completed_lessons',
        JSON.stringify(completedLessons)
      );
    });
  });
  
  describe('loadCompletedLessons', () => {
    it('should load completed lessons from AsyncStorage', async () => {
      const completedLessons: CompletedLessons = {
        lessonIds: ['lesson-1', 'lesson-2', 'lesson-3'],
        lastUpdated: '2025-01-15T10:00:00Z',
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(completedLessons));
      
      const loaded = await loadCompletedLessons();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('growthovo_completed_lessons');
      expect(loaded).toEqual(completedLessons);
    });
    
    it('should return empty list if not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const loaded = await loadCompletedLessons();
      
      expect(loaded.lessonIds).toEqual([]);
      expect(loaded.lastUpdated).toBeDefined();
    });
    
    it('should return empty list for invalid structure', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');
      
      const loaded = await loadCompletedLessons();
      
      expect(loaded.lessonIds).toEqual([]);
    });
  });
  
  describe('getCurrentDate', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const date = getCurrentDate();
      
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
  
  describe('shouldResetDailyChallenge', () => {
    it('should return false if challenge not completed', () => {
      const progress = createDefaultProgress('mental-health');
      progress.challengeCompletedToday = false;
      
      expect(shouldResetDailyChallenge(progress)).toBe(false);
    });
    
    it('should return false if challenge completed today', () => {
      const progress = createDefaultProgress('mental-health');
      progress.challengeCompletedToday = true;
      progress.challengeCompletionDate = getCurrentDate();
      
      expect(shouldResetDailyChallenge(progress)).toBe(false);
    });
    
    it('should return true if challenge completed on different day', () => {
      const progress = createDefaultProgress('mental-health');
      progress.challengeCompletedToday = true;
      progress.challengeCompletionDate = '2025-01-01';
      
      expect(shouldResetDailyChallenge(progress)).toBe(true);
    });
    
    it('should return false if completion date is null', () => {
      const progress = createDefaultProgress('mental-health');
      progress.challengeCompletedToday = true;
      progress.challengeCompletionDate = null;
      
      expect(shouldResetDailyChallenge(progress)).toBe(false);
    });
  });
});
