// Mock for i18next in node test environment
const i18n = {
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockResolvedValue(undefined),
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  t: jest.fn((key: string) => key),
  language: 'en',
  isInitialized: true,
};

export default i18n;
export const use = i18n.use;
export const init = i18n.init;
export const changeLanguage = i18n.changeLanguage;
export const t = i18n.t;
