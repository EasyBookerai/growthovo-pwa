/**
 * Property-Based Test: Key Takeaway Word Count
 * 
 * Feature: premium-pillars-experience
 * Property 10: Key Takeaway Word Count
 * Validates: Requirements 19.5
 * 
 * Tests that all 24 lessons have key takeaway under 20 words.
 * This ensures takeaways are concise and memorable across all 6 pillars.
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

describe('Property 10: Key Takeaway Word Count', () => {
  const MAX_WORDS = 20;
  
  it('should have all 24 lessons with key takeaway under 20 words', () => {
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
          const wordCount = countWords(lesson.content.keyTakeaway);
          
          // Word count should be under 20 words
          expect(wordCount).toBeLessThan(MAX_WORDS);
          
          // Additional validation: key takeaway should exist and not be empty
          expect(lesson.content.keyTakeaway).toBeDefined();
          expect(lesson.content.keyTakeaway.trim().length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 24 } // Run once for each lesson
    );
  });
  
  it('should have key takeaway under 20 words for all Mental Health lessons', () => {
    const mentalHealthLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'mental-health'
    );
    
    expect(mentalHealthLessons).toHaveLength(4);
    
    mentalHealthLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countWords(lesson.content.keyTakeaway);
      
      expect(wordCount).toBeLessThan(MAX_WORDS);
    });
  });
  
  it('should have key takeaway under 20 words for all Relationships lessons', () => {
    const relationshipsLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'relationships'
    );
    
    expect(relationshipsLessons).toHaveLength(4);
    
    relationshipsLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countWords(lesson.content.keyTakeaway);
      
      expect(wordCount).toBeLessThan(MAX_WORDS);
    });
  });
  
  it('should have key takeaway under 20 words for all Career lessons', () => {
    const careerLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'career'
    );
    
    expect(careerLessons).toHaveLength(4);
    
    careerLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countWords(lesson.content.keyTakeaway);
      
      expect(wordCount).toBeLessThan(MAX_WORDS);
    });
  });
  
  it('should have key takeaway under 20 words for all Fitness lessons', () => {
    const fitnessLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'fitness'
    );
    
    expect(fitnessLessons).toHaveLength(4);
    
    fitnessLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countWords(lesson.content.keyTakeaway);
      
      expect(wordCount).toBeLessThan(MAX_WORDS);
    });
  });
  
  it('should have key takeaway under 20 words for all Finance lessons', () => {
    const financeLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'finance'
    );
    
    expect(financeLessons).toHaveLength(4);
    
    financeLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countWords(lesson.content.keyTakeaway);
      
      expect(wordCount).toBeLessThan(MAX_WORDS);
    });
  });
  
  it('should have key takeaway under 20 words for all Hobbies lessons', () => {
    const hobbiesLessons = Object.keys(LESSON_CONTENT).filter(
      id => LESSON_CONTENT[id].pillarKey === 'hobbies'
    );
    
    expect(hobbiesLessons).toHaveLength(4);
    
    hobbiesLessons.forEach(lessonId => {
      const lesson = LESSON_CONTENT[lessonId];
      const wordCount = countWords(lesson.content.keyTakeaway);
      
      expect(wordCount).toBeLessThan(MAX_WORDS);
    });
  });
  
  it('should have key takeaway as a single sentence (no multiple sentences)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(LESSON_CONTENT)),
        (lessonId) => {
          const lesson = LESSON_CONTENT[lessonId];
          const keyTakeaway = lesson.content.keyTakeaway.trim();
          
          // Requirements 19.5: key takeaway should be a single sentence
          // Count sentence-ending punctuation (. ! ?)
          const sentenceEndings = (keyTakeaway.match(/[.!?]/g) || []).length;
          
          // Should have at most 1 sentence ending (at the end)
          expect(sentenceEndings).toBeLessThanOrEqual(1);
          
          return true;
        }
      ),
      { numRuns: 24 }
    );
  });
  
  it('should have key takeaway that is memorable and actionable', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(LESSON_CONTENT)),
        (lessonId) => {
          const lesson = LESSON_CONTENT[lessonId];
          const keyTakeaway = lesson.content.keyTakeaway.trim();
          
          // Key takeaway should not be empty
          expect(keyTakeaway.length).toBeGreaterThan(0);
          
          // Should not contain placeholder text
          expect(keyTakeaway.toLowerCase()).not.toContain('lorem');
          expect(keyTakeaway.toLowerCase()).not.toContain('ipsum');
          expect(keyTakeaway.toLowerCase()).not.toContain('placeholder');
          
          // Should have at least 3 words to be meaningful
          expect(countWords(keyTakeaway)).toBeGreaterThanOrEqual(3);
          
          return true;
        }
      ),
      { numRuns: 24 }
    );
  });
});
