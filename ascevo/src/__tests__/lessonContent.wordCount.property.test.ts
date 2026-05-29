/**
 * Property-Based Test: Lesson Content Word Count
 * 
 * Feature: premium-pillars-experience
 * Property 9: Lesson Content Word Count
 * Validates: Requirements 19.1
 * 
 * Tests that all 24 lessons have content between 150-250 words.
 * This ensures content quality and consistency across all 6 pillars.
 */

import fc from 'fast-check';
import { LESSON_CONTENT } from '../data/lessonContent';

/**
 * Helper function to count words in text
 * Matches the implementation used in debriefService
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Helper function to count total words in lesson content paragraphs
 */
function countLessonWords(paragraphs: string[]): number {
  return paragraphs.reduce((total, paragraph) => {
    return total + countWords(paragraph);
  }, 0);
}

describe('Property 9: Lesson Content Word Count', () => {
  const MIN_WORDS = 150;
  const MAX_WORDS = 250;
  
  it('should have all 24 lessons with content between 150-250 words', () => {
    // Get all lesson IDs from LESSON_CONTENT
    const lessonIds = Object.keys(LESSON_CONTENT);
    
    // Verify we have exactly 24 lessons (4 per pillar × 6 pillars)
    expect(lessonIds).toHaveLength(24);
    
    // Test each lesson
    fc.assert(
      fc.property(
        fc.constantFrom(...lessonIds),
        (lessonId) => {
          const lesson = LESSON_CONTENT[lessonId];
          const wordCount = countLessonWords(lesson.content.paragraphs);
          
          // Word count should be between 150 and 250
          expect(wordCount).toBeGreaterThanOrEqual(MIN_WORDS);
          expect(wordCount).toBeLessThanOrEqual(MAX_WORDS);
          
          // Additional validation: lesson should have content
          expect(lesson.content.paragraphs).toBeDefined();
          expect(lesson.content.paragraphs.length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 24 } // Run once for each lesson
    );
  });
  
  it('should have content between 150-250 words for all Mental Health lessons', () => {
    const mentalHealthLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'mental-health'
    );
    
    expect(mentalHealthLessons).toHaveLength(4);
    
    mentalHealthLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countLessonWords(lesson.content.paragraphs);
      
      expect(wordCount).toBeGreaterThanOrEqual(MIN_WORDS);
      expect(wordCount).toBeLessThanOrEqual(MAX_WORDS);
    });
  });
  
  it('should have content between 150-250 words for all Relationships lessons', () => {
    const relationshipsLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'relationships'
    );
    
    expect(relationshipsLessons).toHaveLength(4);
    
    relationshipsLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countLessonWords(lesson.content.paragraphs);
      
      expect(wordCount).toBeGreaterThanOrEqual(MIN_WORDS);
      expect(wordCount).toBeLessThanOrEqual(MAX_WORDS);
    });
  });
  
  it('should have content between 150-250 words for all Career lessons', () => {
    const careerLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'career'
    );
    
    expect(careerLessons).toHaveLength(4);
    
    careerLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countLessonWords(lesson.content.paragraphs);
      
      expect(wordCount).toBeGreaterThanOrEqual(MIN_WORDS);
      expect(wordCount).toBeLessThanOrEqual(MAX_WORDS);
    });
  });
  
  it('should have content between 150-250 words for all Fitness lessons', () => {
    const fitnessLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'fitness'
    );
    
    expect(fitnessLessons).toHaveLength(4);
    
    fitnessLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countLessonWords(lesson.content.paragraphs);
      
      expect(wordCount).toBeGreaterThanOrEqual(MIN_WORDS);
      expect(wordCount).toBeLessThanOrEqual(MAX_WORDS);
    });
  });
  
  it('should have content between 150-250 words for all Finance lessons', () => {
    const financeLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'finance'
    );
    
    expect(financeLessons).toHaveLength(4);
    
    financeLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countLessonWords(lesson.content.paragraphs);
      
      expect(wordCount).toBeGreaterThanOrEqual(MIN_WORDS);
      expect(wordCount).toBeLessThanOrEqual(MAX_WORDS);
    });
  });
  
  it('should have content between 150-250 words for all Hobbies lessons', () => {
    const hobbiesLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'hobbies'
    );
    
    expect(hobbiesLessons).toHaveLength(4);
    
    hobbiesLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countLessonWords(lesson.content.paragraphs);
      
      expect(wordCount).toBeGreaterThanOrEqual(MIN_WORDS);
      expect(wordCount).toBeLessThanOrEqual(MAX_WORDS);
    });
  });
  
  it('should have 3-4 paragraphs per lesson as specified in requirements', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(LESSON_CONTENT)),
        (lessonId) => {
          const lesson = LESSON_CONTENT[lessonId];
          const paragraphCount = lesson.content.paragraphs.length;
          
          // Requirements 19.1 specifies 3-4 paragraphs
          expect(paragraphCount).toBeGreaterThanOrEqual(3);
          expect(paragraphCount).toBeLessThanOrEqual(4);
          
          return true;
        }
      ),
      { numRuns: 24 }
    );
  });
  
  it('should not contain placeholder text (lorem ipsum)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(LESSON_CONTENT)),
        (lessonId) => {
          const lesson = LESSON_CONTENT[lessonId];
          const allText = lesson.content.paragraphs.join(' ').toLowerCase();
          
          // Requirements 19.3: avoid placeholder text
          expect(allText).not.toContain('lorem');
          expect(allText).not.toContain('ipsum');
          expect(allText).not.toContain('placeholder');
          
          return true;
        }
      ),
      { numRuns: 24 }
    );
  });
  
  it('should have non-empty paragraphs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(LESSON_CONTENT)),
        (lessonId) => {
          const lesson = LESSON_CONTENT[lessonId];
          
          // Each paragraph should have content
          lesson.content.paragraphs.forEach(paragraph => {
            expect(paragraph.trim().length).toBeGreaterThan(0);
            expect(countWords(paragraph)).toBeGreaterThan(0);
          });
          
          return true;
        }
      ),
      { numRuns: 24 }
    );
  });
});
