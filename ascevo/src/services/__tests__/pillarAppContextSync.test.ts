/**
 * Unit tests for pillarAppContextSync
 * 
 * Tests AppContext synchronization utilities.
 */

import { syncWithAppContext, isAppContextAvailable } from '../pillarAppContextSync';

describe('pillarAppContextSync', () => {
  describe('syncWithAppContext', () => {
    it('should call updateXP with the correct amount', async () => {
      const mockUpdateXP = jest.fn().mockResolvedValue(undefined);
      
      await syncWithAppContext(50, mockUpdateXP);
      
      expect(mockUpdateXP).toHaveBeenCalledWith(50);
      expect(mockUpdateXP).toHaveBeenCalledTimes(1);
    });

    it('should not throw when updateXP fails', async () => {
      const mockUpdateXP = jest.fn().mockRejectedValue(new Error('Network error'));
      
      // Should not throw - error is logged but not propagated
      await expect(syncWithAppContext(50, mockUpdateXP)).resolves.toBeUndefined();
      
      expect(mockUpdateXP).toHaveBeenCalledWith(50);
    });

    it('should skip sync when xpAmount is 0', async () => {
      const mockUpdateXP = jest.fn().mockResolvedValue(undefined);
      
      await syncWithAppContext(0, mockUpdateXP);
      
      expect(mockUpdateXP).not.toHaveBeenCalled();
    });

    it('should skip sync when xpAmount is negative', async () => {
      const mockUpdateXP = jest.fn().mockResolvedValue(undefined);
      
      await syncWithAppContext(-10, mockUpdateXP);
      
      expect(mockUpdateXP).not.toHaveBeenCalled();
    });

    it('should handle successful sync', async () => {
      const mockUpdateXP = jest.fn().mockResolvedValue(undefined);
      
      await syncWithAppContext(100, mockUpdateXP);
      
      expect(mockUpdateXP).toHaveBeenCalledWith(100);
    });
  });

  describe('isAppContextAvailable', () => {
    it('should return true when updateXP is a function', () => {
      const mockUpdateXP = jest.fn();
      
      expect(isAppContextAvailable(mockUpdateXP)).toBe(true);
    });

    it('should return false when updateXP is undefined', () => {
      expect(isAppContextAvailable(undefined)).toBe(false);
    });

    it('should return false when updateXP is null', () => {
      expect(isAppContextAvailable(null as any)).toBe(false);
    });

    it('should return false when updateXP is not a function', () => {
      expect(isAppContextAvailable('not a function' as any)).toBe(false);
      expect(isAppContextAvailable(123 as any)).toBe(false);
      expect(isAppContextAvailable({} as any)).toBe(false);
    });
  });
});
