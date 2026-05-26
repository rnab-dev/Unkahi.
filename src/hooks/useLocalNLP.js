/**
 * useLocalNLP.js
 * ===============
 * PRIVACY ARCHITECTURE:
 *
 * Replaces the previous 67MB @xenova/transformers implementation with a
 * lightweight (~20KB) AFINN-165 keyword-based sentiment library.
 *
 * Why this is better for Unkahi users:
 *   - Zero download wait — analysis is instant on every device
 *   - Works offline from the first visit
 *   - Text is processed locally and never sent to any server
 *   - The only value that leaves this hook is a number (emotionalWeight 0–100)
 *
 * Tradeoff vs. DistilBERT:
 *   - Slightly less nuanced for complex sentences
 *   - But for short, emotional personal writing (the Let Go Box use case),
 *     AFINN keyword matching is highly effective and clinically sufficient
 *
 * Zero-Knowledge Principle:
 *   "We feel the weight of what you wrote, not the words."
 */

import { useState, useCallback, useRef } from 'react';
import Sentiment from 'sentiment';

/**
 * The Sentiment analyser is instantiated once at module level.
 * It holds no state between calls — each call to .analyze() is independent
 * and does not accumulate or store the input text.
 */
const analyser = new Sentiment();

/**
 * Converts the AFINN comparative score to a normalised emotionalWeight (0–100).
 *
 * AFINN comparative score range: typically -5 to +5 (can exceed for short text)
 *   Negative score → distress / heavy emotion → high emotional weight
 *   Positive score → processing / relief → low emotional weight
 *   Near zero      → neutral / mixed
 *
 * @param {number} comparative — AFINN comparative score (-5 to +5)
 * @returns {{ label: string, emotionalWeight: number, confidence: number }}
 */
const deriveResult = (comparative) => {
  // Clamp to a -5…+5 range then map to 0–100
  const clamped = Math.max(-5, Math.min(5, comparative));

  // Invert so negative comparative (distress) → high weight
  const rawWeight = ((clamped * -1) + 5) / 10 * 100;
  const emotionalWeight = parseFloat(Math.min(100, Math.max(0, rawWeight)).toFixed(1));

  const label = comparative < -0.2
    ? 'NEGATIVE'
    : comparative > 0.2
    ? 'POSITIVE'
    : 'NEUTRAL';

  // Confidence: how far from 0 the score is, normalised to 0–1
  const confidence = parseFloat(Math.min(1, Math.abs(comparative) / 5).toFixed(3));

  return { label, emotionalWeight, confidence };
};

/**
 * useLocalNLP
 * ────────────
 * Provides instant, browser-based sentiment analysis for the Let Go Box.
 *
 * No model download. No Web Worker. No async loading state.
 * The AFINN wordlist is bundled inside the `sentiment` package (~20KB total).
 *
 * Returns:
 *   - analyzeText(text) → NLPResult  (synchronous under the hood, wrapped async for API compat)
 *   - isAnalyzing {boolean}
 *   - error {string|null}
 *
 * NLPResult:
 *   { label, confidence, emotionalWeight }
 *   — the original `text` is NEVER included
 */
export function useLocalNLP() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError]             = useState(null);

  /**
   * analyzeText
   * ────────────
   * Processes the user's text locally with AFINN sentiment analysis.
   *
   * CRITICAL PRIVACY CONTRACT:
   *   1. `rawText` is passed to analyser.analyze() as a local variable.
   *   2. After analysis, `textToProcess` is explicitly set to null.
   *   3. The returned object contains ONLY mathematical output — no text.
   *   4. The analyser holds no persistent state between calls.
   *
   * @param {string} rawText
   * @returns {Promise<{ label: string, confidence: number, emotionalWeight: number } | null>}
   */
  const analyzeText = useCallback(async (rawText) => {
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    let textToProcess = rawText.trim();

    try {
      // AFINN analysis — synchronous, in-memory, no network calls
      const result = analyser.analyze(textToProcess);
      // Discard the text immediately. The analyser returns word tokens
      // inside `result.words` — we only use the numeric `comparative` score.
      textToProcess = null;

      const { label, emotionalWeight, confidence } = deriveResult(result.comparative);

      // Return ONLY mathematical derivatives — never the text
      return { label, confidence, emotionalWeight };

    } catch (err) {
      textToProcess = null;
      const msg = `Analysis failed: ${err.message}`;
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyzeText,
    // These fields match the old Transformers.js API so callers don't need changes
    isModelLoading: false,  // Instant — no model to load
    modelProgress: 100,     // Always "ready"
    isAnalyzing,
    error,
  };
}
