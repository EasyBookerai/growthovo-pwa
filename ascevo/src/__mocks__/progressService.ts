export const awardXP = jest.fn().mockResolvedValue(undefined);
export const getTotalXP = jest.fn().mockResolvedValue(0);
export const getPillarXP = jest.fn().mockResolvedValue(0);
export const getPillarLevel = jest.fn().mockResolvedValue(1);
export const getAllPillarLevels = jest.fn().mockResolvedValue({});
export const calculateLevel = jest.fn().mockReturnValue(1);
export const xpForNextLevel = jest.fn().mockReturnValue({ current: 0, required: 100, level: 1 });
export const sumTransactions = jest.fn().mockReturnValue(0);
