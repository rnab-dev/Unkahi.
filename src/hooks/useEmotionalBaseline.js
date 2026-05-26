/**
 * useEmotionalBaseline.js
 * ========================
 * PRIVACY ARCHITECTURE – WHY THIS WORKS THIS WAY:
 *
 * All raw score data lives exclusively in the user's browser via IndexedDB.
 * Nothing here is ever serialized, sent over the network, or logged server-side.
 * The only values that ever leave this hook are derived mathematical abstractions
 * (rolling average, std deviation, boolean flag) — never the raw answers or text.
 *
 * Zero-Knowledge Principle:
 *   "We know the shape of the nervous system's trend, not its contents."
 */

import { useState, useEffect, useCallback } from 'react';
import { openDB } from 'idb';

/** Name of the IndexedDB database used for all local ML storage */
const DB_NAME = 'unkahi_edge_ml';

/** Current schema version — increment to trigger onupgradeneeded migrations */
const DB_VERSION = 1;

/** Object store that holds the time-series score history */
const STORE_NAME = 'daily_scores';

/**
 * The window (in days) used to compute the rolling baseline.
 * 7 days captures a full week's emotional rhythm without over-fitting
 * to short-term noise.
 */
const ROLLING_WINDOW_DAYS = 7;

/**
 * Extended window for longitudinal pattern detection.
 * 30 days is enough to spot weekly cycles and healing trends.
 */
const EXTENDED_WINDOW_DAYS = 30;

/**
 * Anomaly threshold in standard deviations.
 * 1.5 σ is a clinically-informed balance: sensitive enough to surface
 * meaningful nervous-system shifts, robust enough to avoid false alarms
 * from single-day fluctuations.
 */
const ANOMALY_THRESHOLD_SIGMA = 1.5;

/**
 * Opens (or creates) the local IndexedDB instance.
 * Returns the IDBDatabase handle wrapped by the `idb` library.
 *
 * Schema:
 *   Store: 'daily_scores'
 *     keyPath: 'date'   — ISO date string, e.g. "2024-06-15"
 *     indexes: none needed (we read all and sort in-memory for our small window)
 */
const getDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'date' });
      }
    },
  });

/**
 * Computes the arithmetic mean of an array of numbers.
 * @param {number[]} values
 * @returns {number}
 */
const computeMean = (values) =>
  values.reduce((sum, v) => sum + v, 0) / values.length;

/**
 * Computes the population standard deviation of an array of numbers.
 * We use population (not sample) std deviation because we are describing
 * the user's *actual* recent history, not inferring a broader population.
 * @param {number[]} values
 * @param {number} mean — pre-computed mean for efficiency
 * @returns {number}
 */
const computeStdDev = (values, mean) => {
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = computeMean(squaredDiffs);
  return Math.sqrt(variance);
};

/**
 * Given an array of score records, returns only those within the rolling window.
 * @param {Array<{date: string, score: number}>} records
 * @param {number} windowDays
 * @returns {Array<{date: string, score: number}>}
 */
const getWindowRecords = (records, windowDays) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  return records
    .filter((r) => new Date(r.date) >= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Detects the overall trend direction across a score series.
 * Returns 'improving' | 'worsening' | 'stable'
 * Uses simple linear regression slope sign.
 * @param {number[]} scores
 * @returns {'improving'|'worsening'|'stable'}
 */
const computeTrend = (scores) => {
  if (scores.length < 3) return 'stable';
  const n = scores.length;
  const xMean = (n - 1) / 2;
  const yMean = computeMean(scores);
  const num = scores.reduce((sum, y, x) => sum + (x - xMean) * (y - yMean), 0);
  const den = scores.reduce((sum, _, x) => sum + Math.pow(x - xMean, 2), 0);
  const slope = den === 0 ? 0 : num / den;
  // Slope threshold: > 1.5 points/day = meaningful change
  if (slope > 1.5)  return 'worsening';  // score rising = more distress
  if (slope < -1.5) return 'improving';  // score falling = more regulation
  return 'stable';
};

/**
 * Calculates how many days ago the user last saved a score.
 * Returns Infinity if no history exists.
 * @param {Array<{date: string, score: number}>} records
 * @returns {number}
 */
const computeDaysSinceLastCheckIn = (records) => {
  if (!records || records.length === 0) return Infinity;
  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastDate = new Date(sorted[0].date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
};

/**
 * useEmotionalBaseline
 * ─────────────────────
 * A React hook that maintains the user's private, local Time-Series AI baseline.
 *
 * Returns:
 *   - baseline {number|null}   Rolling 7-day moving average of scores (0–100)
 *   - stdDev   {number|null}   Population std deviation of the baseline window
 *   - isTriggered {boolean}    True if the *latest* score is an anomaly (> 1.5σ)
 *   - history  {Array}         The raw local history records (never sent to server)
 *   - saveScore(score)         Async fn — persists today's score to IndexedDB
 *   - isLoading {boolean}      True while the DB is being read
 *   - error {string|null}      Non-null if an IDB operation failed
 */
export function useEmotionalBaseline() {
  const [baseline, setBaseline]           = useState(null);
  const [stdDev, setStdDev]               = useState(null);
  const [isTriggered, setIsTriggered]     = useState(false);
  const [history, setHistory]             = useState([]);
  const [trendDirection, setTrendDirection] = useState('stable');
  const [daysSinceLastCheckIn, setDaysSinceLastCheckIn] = useState(Infinity);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState(null);
  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        const db = await getDB();
        // Retrieve all stored records. IndexedDB cursors are ordered by key
        // (our ISO date string), so this is already roughly sorted.
        const allRecords = await db.getAll(STORE_NAME);

        if (!mounted) return;

        setHistory(allRecords);
        recomputeBaseline(allRecords);
      } catch (err) {
        if (mounted) setError(`Failed to read local baseline: ${err.message}`);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadHistory();
    return () => { mounted = false; };
  }, []);

  /**
   * Recalculates the rolling average and anomaly flag from the full history.
   * This is called both on mount (loading stored data) and after each save.
   *
   * Anomaly Logic:
   *   - We need at least 3 data points to produce a meaningful std deviation.
   *   - If currentScore > baseline + (ANOMALY_THRESHOLD_SIGMA × stdDev), the
   *     nervous system is in an elevated state beyond its own personal norm.
   *   - We flag both high *and* low deviations — a sudden drop can also signal
   *     dissociation or shutdown (hypo-arousal), which is equally important.
   */
  const recomputeBaseline = useCallback((records) => {
    const windowRecords = getWindowRecords(records, ROLLING_WINDOW_DAYS);

    // Update days-since-last-check-in from full history
    setDaysSinceLastCheckIn(computeDaysSinceLastCheckIn(records));

    if (windowRecords.length < 2) {
      setBaseline(windowRecords.length === 1 ? windowRecords[0].score : null);
      setStdDev(null);
      setIsTriggered(false);
      setTrendDirection('stable');
      return;
    }

    const scores = windowRecords.map((r) => r.score);
    const mean   = computeMean(scores);
    const sd     = computeStdDev(scores, mean);

    setBaseline(parseFloat(mean.toFixed(2)));
    setStdDev(parseFloat(sd.toFixed(2)));
    setTrendDirection(computeTrend(scores));

    const latestScore = scores[scores.length - 1];
    const deviationMagnitude = Math.abs(latestScore - mean);
    const triggered = sd > 0 && deviationMagnitude > ANOMALY_THRESHOLD_SIGMA * sd;
    setIsTriggered(triggered);
  }, []);

  /**
   * Persists today's normalized assessment score (0–100) to local IndexedDB.
   *
   * PRIVACY NOTE: This score is the *only* data written. No question text,
   * no answer text, no IP address — just a numeric representation of
   * nervous-system load for the calendar date.
   *
   * We use the ISO date string as the keyPath so each day has exactly one
   * entry (upsert via `put`). Running the assessment twice in one day
   * overwrites the earlier score rather than duplicating it.
   *
   * @param {number} score — Normalized score 0–100
   * @returns {Promise<void>}
   */
  const saveScore = useCallback(async (score) => {
    if (typeof score !== 'number' || score < 0 || score > 100) {
      setError('Score must be a number between 0 and 100.');
      return;
    }

    try {
      const db = await getDB();
      const today = new Date().toISOString().split('T')[0]; // e.g. "2024-06-15"

      const record = {
        date: today,
        score: parseFloat(score.toFixed(2)),
        // We deliberately omit any context, user ID, or session data here.
        // The date alone does not identify the user across sessions.
      };

      // `put` performs an upsert — insert or replace by keyPath (date)
      await db.put(STORE_NAME, record);

      // Re-read the full history from IDB to ensure our state is authoritative
      const updatedRecords = await db.getAll(STORE_NAME);
      setHistory(updatedRecords);
      recomputeBaseline(updatedRecords);
    } catch (err) {
      setError(`Failed to save score locally: ${err.message}`);
    }
  }, [recomputeBaseline]);

  return {
    baseline,
    stdDev,
    isTriggered,
    trendDirection,
    daysSinceLastCheckIn,
    history,
    // last7Days — pre-filtered for chart rendering convenience
    last7Days: getWindowRecords(history, ROLLING_WINDOW_DAYS),
    // last30Days — for longitudinal pattern view
    last30Days: getWindowRecords(history, EXTENDED_WINDOW_DAYS),
    saveScore,
    isLoading,
    error,
  };
}
