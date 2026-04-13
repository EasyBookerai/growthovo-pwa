/**
 * Unit Tests — Lesson Service (language fallback)
 * Validates: Requirements 5.3, 5.4
 */

// Mock the store to return a default language
jest.mock('../store', () => ({
  useLanguageStore: {
    getState: () => ({ language: 'de' }),
  },
}));

// Mock progressService to avoid real DB calls
jest.mock('../services/progressService', () => ({
  awardXP: jest.fn(async () => {}),
}));

const mockEnLesson = {
  id: 'lesson-1',
  unit_id: 'unit-1',
  title: 'Discipline Basics',
  display_order: 1,
  card_concept: 'Concept',
  card_example: 'Example',
  card_mistake: 'Mistake',
  card_science: 'Science',
  card_challenge: 'Challenge',
  language: 'en',
};

const mockDeLesson = { ...mockEnLesson, title: 'Disziplin Grundlagen', language: 'de' };

// Build a chainable Supabase mock
function makeSupabaseMock(returnData: any[], returnError: any = null) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    single: jest.fn().mockResolvedValue({ data: returnData[0] ?? null, error: returnError }),
    in: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockReturnThis(),
  };
  // Make the chain thenable so `await supabase.from(...).select(...).eq(...)` works
  chain.then = (resolve: any) => resolve({ data: returnData, error: returnError });
  return chain;
}

describe('getLessonsForUnit — language fallback', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns lessons in the requested language when available', async () => {
    jest.doMock('../services/supabaseClient', () => ({
      supabase: {
        from: jest.fn(() => makeSupabaseMock([mockDeLesson])),
      },
    }));

    const { getLessonsForUnit } = require('../services/lessonService');
    const lessons = await getLessonsForUnit('unit-1', 'de');
    expect(lessons).toHaveLength(1);
    expect(lessons[0].title).toBe('Disziplin Grundlagen');
  });

  it('falls back to English when no lessons exist for the requested language', async () => {
    let callCount = 0;
    jest.doMock('../services/supabaseClient', () => ({
      supabase: {
        from: jest.fn(() => {
          callCount++;
          // First call (de) returns empty; second call (en) returns English lesson
          return makeSupabaseMock(callCount === 1 ? [] : [mockEnLesson]);
        }),
      },
    }));

    const { getLessonsForUnit } = require('../services/lessonService');
    const lessons = await getLessonsForUnit('unit-1', 'de');
    expect(lessons).toHaveLength(1);
    expect(lessons[0].title).toBe('Discipline Basics');
    // Should have made 2 calls: one for 'de', one fallback for 'en'
    expect(callCount).toBe(2);
  });

  it('returns empty array when no lessons exist in any language', async () => {
    jest.doMock('../services/supabaseClient', () => ({
      supabase: {
        from: jest.fn(() => makeSupabaseMock([])),
      },
    }));

    const { getLessonsForUnit } = require('../services/lessonService');
    const lessons = await getLessonsForUnit('unit-1', 'de');
    expect(lessons).toHaveLength(0);
  });
});
