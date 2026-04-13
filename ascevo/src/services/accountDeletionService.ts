import { supabase } from './supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeletionStatus {
  isScheduled: boolean;
  scheduledDate: string | null;
  gracePeriodEnds: string | null;
}

// ─── Schedule Account Deletion ────────────────────────────────────────────────

export async function scheduleAccountDeletion(userId: string): Promise<DeletionStatus> {
  try {
    // Calculate grace period end date (30 days from now)
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 30);

    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Note: User should cancel subscription manually via Stripe portal
    // We'll mark the account for deletion, and the subscription will be handled separately
    if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
      console.warn('User has active subscription. They should cancel via Stripe portal.');
    }

    // Mark account for deletion (soft delete)
    const { data, error } = await supabase
      .from('users')
      .update({
        deletion_scheduled_at: new Date().toISOString(),
        deletion_grace_period_ends: gracePeriodEnd.toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log deletion request
    await supabase.from('account_deletion_requests').insert({
      user_id: userId,
      requested_at: new Date().toISOString(),
      grace_period_ends: gracePeriodEnd.toISOString(),
      status: 'scheduled',
    });

    return {
      isScheduled: true,
      scheduledDate: new Date().toISOString(),
      gracePeriodEnds: gracePeriodEnd.toISOString(),
    };
  } catch (error: any) {
    console.error('Account deletion scheduling error:', error);
    throw new Error('Failed to schedule account deletion. Please try again.');
  }
}

// ─── Cancel Account Deletion ──────────────────────────────────────────────────

export async function cancelAccountDeletion(userId: string): Promise<void> {
  try {
    // Remove deletion schedule
    const { error } = await supabase
      .from('users')
      .update({
        deletion_scheduled_at: null,
        deletion_grace_period_ends: null,
      })
      .eq('id', userId);

    if (error) throw error;

    // Update deletion request status
    await supabase
      .from('account_deletion_requests')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'scheduled');
  } catch (error: any) {
    console.error('Cancel deletion error:', error);
    throw new Error('Failed to cancel account deletion.');
  }
}

// ─── Get Deletion Status ──────────────────────────────────────────────────────

export async function getDeletionStatus(userId: string): Promise<DeletionStatus> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('deletion_scheduled_at, deletion_grace_period_ends')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      isScheduled: !!data?.deletion_scheduled_at,
      scheduledDate: data?.deletion_scheduled_at || null,
      gracePeriodEnds: data?.deletion_grace_period_ends || null,
    };
  } catch (error: any) {
    console.error('Get deletion status error:', error);
    return {
      isScheduled: false,
      scheduledDate: null,
      gracePeriodEnds: null,
    };
  }
}

// ─── Permanently Delete Account ───────────────────────────────────────────────
// This would typically be run by a scheduled job, not directly by the user

export async function permanentlyDeleteAccount(userId: string): Promise<void> {
  try {
    // This is a placeholder - actual deletion would be handled by a backend job
    // that runs after the grace period expires
    
    // In production, this would:
    // 1. Delete all user data from all tables (CASCADE handles most)
    // 2. Delete user from auth.users
    // 3. Remove any stored files (audio, images)
    // 4. Update deletion request status to 'completed'
    
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;

    // Log completion
    await supabase
      .from('account_deletion_requests')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'scheduled');
  } catch (error: any) {
    console.error('Permanent deletion error:', error);
    throw new Error('Failed to permanently delete account.');
  }
}
