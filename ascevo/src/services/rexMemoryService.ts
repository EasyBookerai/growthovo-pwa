/**
 * Rex Memory Service — manages the long-term memory system.
 * Local: AsyncStorage under '@growthovo:rex_memory'
 * Remote: Supabase rex_memory table
 */

import { supabase } from './supabaseClient';
import { RexMemory, MemoryContext, MemoryType } from '../types';

const MEMORY_CAP = 200;
const MEMORY_CONTEXT_COUNT = 5;

/**
 * Selects the top `count` memories sorted by importance_score desc,
 * then last_referenced_at desc.
 * Requirements: 13.7, 15.7
 */
export function selectTopMemories(memories: RexMemory[], count: number): RexMemory[] {
  return [...memories]
    .sort((a, b) => {
      if (b.importanceScore !== a.importanceScore) {
        return b.importanceScore - a.importanceScore;
      }
      return (
        new Date(b.lastReferencedAt).getTime() -
        new Date(a.lastReferencedAt).getTime()
      );
    })
    .slice(0, count);
}

/**
 * Selects the memory entry to evict: lowest importance_score,
 * then oldest last_referenced_at.
 * Requirements: 13.7
 */
export function selectMemoryToEvict(memories: RexMemory[]): RexMemory {
  return [...memories].sort((a, b) => {
    if (a.importanceScore !== b.importanceScore) {
      return a.importanceScore - b.importanceScore;
    }
    return (
      new Date(a.lastReferencedAt).getTime() -
      new Date(b.lastReferencedAt).getTime()
    );
  })[0];
}

/**
 * Fetches the current memory count for a user. If >= 200, evicts the
 * lowest-scored oldest entry before a new one is inserted.
 * Requirements: 13.7
 */
export async function pruneMemoriesIfNeeded(userId: string): Promise<void> {
  const { count, error: countError } = await supabase
    .from('rex_memory')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) throw countError;
  if ((count ?? 0) < MEMORY_CAP) return;

  // Fetch all memories to determine which to evict
  const { data: memories, error: fetchError } = await supabase
    .from('rex_memory')
    .select('*')
    .eq('user_id', userId);

  if (fetchError) throw fetchError;
  if (!memories || memories.length === 0) return;

  const mapped: RexMemory[] = memories.map((m) => ({
    id: m.id,
    userId: m.user_id,
    memoryType: m.memory_type as MemoryType,
    content: m.content,
    importanceScore: m.importance_score,
    createdAt: m.created_at,
    lastReferencedAt: m.last_referenced_at,
  }));

  const toEvict = selectMemoryToEvict(mapped);

  const { error: deleteError } = await supabase
    .from('rex_memory')
    .delete()
    .eq('id', toEvict.id);

  if (deleteError) throw deleteError;
}

/**
 * Adds a new memory entry for a user, pruning first if the cap is reached.
 * Requirements: 13.1, 13.3, 13.7
 */
export async function addMemory(
  userId: string,
  memory: Omit<RexMemory, 'id' | 'userId' | 'createdAt' | 'lastReferencedAt'>
): Promise<void> {
  await pruneMemoriesIfNeeded(userId);

  const now = new Date().toISOString();

  const { error } = await supabase.from('rex_memory').insert({
    user_id: userId,
    memory_type: memory.memoryType,
    content: memory.content,
    importance_score: memory.importanceScore,
    created_at: now,
    last_referenced_at: now,
  });

  if (error) throw error;
}

/**
 * Updates last_referenced_at for a memory entry to now.
 * Requirements: 13.5
 */
export async function markMemoryReferenced(memoryId: string): Promise<void> {
  const { error } = await supabase
    .from('rex_memory')
    .update({ last_referenced_at: new Date().toISOString() })
    .eq('id', memoryId);

  if (error) throw error;
}

/**
 * Fetches all memories for a user, selects the top 5 by importance + recency,
 * and formats them for inclusion in an OpenAI prompt.
 * Requirements: 13.6, 15.7
 */
export async function getMemoryContext(userId: string): Promise<MemoryContext> {
  const { data, error } = await supabase
    .from('rex_memory')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  const memories: RexMemory[] = (data ?? []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    memoryType: m.memory_type as MemoryType,
    content: m.content,
    importanceScore: m.importance_score,
    createdAt: m.created_at,
    lastReferencedAt: m.last_referenced_at,
  }));

  const top = selectTopMemories(memories, MEMORY_CONTEXT_COUNT);

  const formattedForPrompt = top
    .map((m) => `- [${m.memoryType}] ${m.content} (importance: ${m.importanceScore})`)
    .join('\n');

  return { memories: top, formattedForPrompt };
}
