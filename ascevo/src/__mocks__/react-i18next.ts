// Mock for react-i18next in node test environment
export const initReactI18next = { type: '3rdParty', init: jest.fn() };
export const useTranslation = () => ({ t: (key: string) => key, i18n: { language: 'en' } });
