import { exportUserData, shareExportedData, deleteExportedFile } from '../services/dataExportService';
import { supabase } from '../services/supabaseClient';

jest.mock('../services/supabaseClient');

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/directory/',
  writeAsStringAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  deleteAsync: jest.fn(),
  EncodingType: {
    UTF8: 'utf8',
  },
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

const FileSystem = require('expo-file-system');
const Sharing = require('expo-sharing');

describe('dataExportService', () => {
  const mockUserId = 'user-123';
  const mockFileUri = 'file:///path/to/export.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportUserData', () => {
    it('should export all user data to JSON file', async () => {
      // Mock Supabase responses
      const mockData = {
        profile: { id: mockUserId, username: 'testuser' },
        chatHistory: [{ id: '1', content: 'Hello' }],
        progress: [{ id: '1', lesson_id: 'lesson-1' }],
        streaks: { current_streak: 5 },
        xpTransactions: [{ id: '1', amount: 20 }],
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData[table as keyof typeof mockData] || null }),
        order: jest.fn().mockReturnThis(),
      }));

      (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await exportUserData(mockUserId);

      expect(result).toContain('growthovo_data_export_');
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
    });

    it('should log export request to database', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'data_export_requests') {
          return { insert: mockInsert };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null }),
          order: jest.fn().mockReturnThis(),
        };
      });

      (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);

      await exportUserData(mockUserId);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          export_date: expect.any(String),
        })
      );
    });

    it('should throw error on export failure', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database error')),
        order: jest.fn().mockReturnThis(),
      }));

      await expect(exportUserData(mockUserId)).rejects.toThrow('Failed to export data');
    });
  });

  describe('shareExportedData', () => {
    it('should share exported file', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

      await shareExportedData(mockFileUri);

      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        mockFileUri,
        expect.objectContaining({
          mimeType: 'application/json',
        })
      );
    });

    it('should throw error if sharing not available', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      await expect(shareExportedData(mockFileUri)).rejects.toThrow('Sharing is not available');
    });
  });

  describe('deleteExportedFile', () => {
    it('should delete file if it exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      await deleteExportedFile(mockFileUri);

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(mockFileUri);
    });

    it('should not throw error if file does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

      await expect(deleteExportedFile(mockFileUri)).resolves.not.toThrow();
    });
  });
});
