import { supabase } from '../supabaseClient';
import { ensureAnonymousSession } from './supabaseTelemetry';

// ==============================================================
// 1. DYNAMIC WEBSITE CONTENT FETCHERS (WITH INSTANT FALLBACKS)
// ==============================================================

/**
 * Fetches clinical pillars from Supabase, falling back to local list on failure.
 * @param {Array} fallbackPillars
 * @returns {Promise<Array>}
 */
export async function fetchClinicalPillars(fallbackPillars = []) {
  try {
    const { data, error } = await supabase
      .from('clinical_pillars')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Sync Content] Error fetching pillars (using fallback):', error.message);
      return fallbackPillars;
    }

    if (data && data.length > 0) {
      // Map database schema to match UI props format
      return data.map(item => ({
        id: item.id,
        title: item.title,
        icon: item.icon,
        desc: item.desc_text,
        tip: item.tip
      }));
    }

    return fallbackPillars;
  } catch (err) {
    console.warn('[Sync Content] Unexpected error fetching pillars (using fallback):', err.message);
    return fallbackPillars;
  }
}

/**
 * Fetches interactive scenarios from Supabase, falling back to local list on failure.
 * @param {Array} fallbackScenarios
 * @returns {Promise<Array>}
 */
export async function fetchLegalScenarios(fallbackScenarios = []) {
  try {
    const { data, error } = await supabase
      .from('legal_scenarios')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Sync Content] Error fetching scenarios (using fallback):', error.message);
      return fallbackScenarios;
    }

    if (data && data.length > 0) {
      return data; // Column names match the scenario object format perfectly
    }

    return fallbackScenarios;
  } catch (err) {
    console.warn('[Sync Content] Unexpected error fetching scenarios (using fallback):', err.message);
    return fallbackScenarios;
  }
}

/**
 * Fetches nervous system psychoeducation cards from Supabase, falling back to local list on failure.
 * @param {Array} fallbackCards
 * @returns {Promise<Array>}
 */
export async function fetchPsychoEducationCards(fallbackCards = []) {
  try {
    const { data, error } = await supabase
      .from('psycho_education_cards')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Sync Content] Error fetching library cards (using fallback):', error.message);
      return fallbackCards;
    }

    if (data && data.length > 0) {
      return data; // Fields: id, title, emoji, content
    }

    return fallbackCards;
  } catch (err) {
    console.warn('[Sync Content] Unexpected error fetching library cards (using fallback):', err.message);
    return fallbackCards;
  }
}


// ==============================================================
// 2. USER DATA STORAGE & BACKGROUND SYNCING
// ==============================================================

/**
 * Syncs a new Mood Diary entry to the Supabase database.
 * @param {Object} entry - { wot: number, emotions: string[], notes: string, date: string }
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function syncMoodDiaryEntry(entry) {
  try {
    const sessionId = ensureAnonymousSession();
    const { error } = await supabase
      .from('mood_diary')
      .insert([{
        session_id: sessionId,
        wot: parseInt(entry.wot),
        emotions: entry.emotions || [],
        notes: entry.notes || '',
        logged_date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString()
      }]);

    if (error) {
      console.error('[Sync User Data] Mood diary sync failed:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('[Sync User Data] Unexpected mood diary sync error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Syncs a new Gratitude Vault entry to the Supabase database.
 * @param {Object} entry - { title: string, emoji: string, content: string, category: string, date: string }
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function syncGratitudeVaultEntry(entry) {
  try {
    const sessionId = ensureAnonymousSession();
    const { error } = await supabase
      .from('gratitude_vault')
      .insert([{
        session_id: sessionId,
        title: entry.title || '',
        emoji: entry.emoji,
        content: entry.content,
        category: entry.category || '',
        logged_date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString()
      }]);

    if (error) {
      console.error('[Sync User Data] Gratitude vault sync failed:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('[Sync User Data] Unexpected gratitude vault sync error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Syncs or updates the user's Stanley-Brown Safety Plan.
 * Uses upsert to overwrite any existing plan for the session_id.
 * @param {Object} planData - Complete safety plan object
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function syncSafetyPlan(planData) {
  try {
    const sessionId = ensureAnonymousSession();
    const { error } = await supabase
      .from('safety_plans')
      .insert([{
        session_id: sessionId,
        plan_data: planData,
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('[Sync User Data] Safety plan sync failed:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('[Sync User Data] Unexpected safety plan sync error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Attempts to pull the safety plan associated with this session from Supabase.
 * Useful if the user switches browsers but retains their session key.
 * @returns {Promise<Object|null>}
 */
export async function fetchSyncedSafetyPlan() {
  try {
    const sessionId = ensureAnonymousSession();
    const { data, error } = await supabase
      .from('safety_plans')
      .select('plan_data')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      return null;
    }

    return data ? data.plan_data : null;
  } catch (err) {
    return null;
  }
}
