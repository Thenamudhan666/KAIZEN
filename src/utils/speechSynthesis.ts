/**
 * speechSynthesis.ts
 * High-performance, low-latency Butler Voice Synthesizer for KAIZEN.
 * 
 * Supports:
 * - Refined British Butler persona (en-GB preference: Microsoft George, Google UK English Male, Daniel)
 * - Automatic markdown and action-tag cleanup
 * - Chromium pause/freeze bug workarounds (resume heartbeat)
 * - Instant Barge-In cancellation
 * - AudioContext & Web Speech unlock on user gesture
 */

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  pitch?: number;
  rate?: number;
  volume?: number;
}

let resumeInterval: any = null;

/**
 * Strips markdown, code blocks, and system action tags so the Butler speaks pristine conversational English.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Remove action tag blocks [ACTION:...][/ACTION:...] or standalone [ACTION:...]
    .replace(/\[ACTION:[^\]]*\][\s\S]*?\[\/ACTION:[^\]]*\]/gi, '')
    .replace(/\[ACTION:[^\]]*\]/gi, '')
    // Remove system bracket annotations like [BARGE-IN...], [SCREENPIPE...], [SOCRATIC...]
    .replace(/\[(BARGE-IN|SCREENPIPE|SOCRATIC|VOYAGER|SYSTEM)[^\]]*\]/gi, '')
    // Remove markdown code fences
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove bold and italic markers
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove markdown links [title](url) -> title
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove standalone URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove multiple newlines and trim
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if browser Web Speech API is supported.
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Selects the most erudite British Butler voice available in the environment.
 */
export function getBritishButlerVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Prime Candidates: UK English Male voices (Microsoft George, Google UK English Male, Daniel, Oliver)
  const ukMale = voices.find((v) => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    const isUK = lang.includes('en-gb') || lang.includes('en_gb');
    const isMale = name.includes('george') || name.includes('male') || name.includes('daniel') || name.includes('oliver') || name.includes('ryan');
    return isUK && isMale;
  });
  if (ukMale) return ukMale;

  // 2. Any UK English voice (en-GB)
  const anyUK = voices.find((v) => {
    const lang = (v.lang || '').toLowerCase();
    return lang.includes('en-gb') || lang.includes('en_gb');
  });
  if (anyUK) return anyUK;

  // 3. Other natural English male voices (en-US / en-AU / en-CA)
  const englishMale = voices.find((v) => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    return lang.startsWith('en') && (name.includes('male') || name.includes('david') || name.includes('alex') || name.includes('guy'));
  });
  if (englishMale) return englishMale;

  // 4. Any English voice
  const anyEnglish = voices.find((v) => (v.lang || '').toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // 5. Fallback to default
  return voices[0] || null;
}

/**
 * Speaks text using the British Butler voice.
 */
export function speakKaizenVoice(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSynthesisSupported()) {
    console.warn('[KAIZEN Audio] Speech synthesis not supported in this environment.');
    return false;
  }

  const clean = cleanTextForSpeech(text);
  if (!clean) return false;

  try {
    // 1. Always cancel any active speech first (instant barge-in guarantee)
    stopKaizenVoice();

    // 2. Clear any lingering pause state in Chromium
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(clean);
    const butlerVoice = getBritishButlerVoice();
    if (butlerVoice) {
      utterance.voice = butlerVoice;
      utterance.lang = butlerVoice.lang || 'en-GB';
    } else {
      utterance.lang = 'en-GB';
    }

    // Persona speech characteristics: Distinguished, calm, articulate
    utterance.pitch = options.pitch ?? 0.95;
    utterance.rate = options.rate ?? 1.02;
    utterance.volume = options.volume ?? 1.0;

    utterance.onstart = () => {
      console.log(`[KAIZEN Audio] Speaking: "${clean.slice(0, 50)}..." via voice: ${utterance.voice?.name || 'default'}`);
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      clearHeartbeat();
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (err) => {
      clearHeartbeat();
      // 'interrupted' or 'canceled' are intentional during barge-in; don't warn as errors
      if (err.error !== 'interrupted' && err.error !== 'canceled') {
        console.warn('[KAIZEN Audio] SpeechSynthesis error:', err);
      }
      if (options.onError) options.onError(err);
    };

    // Chromium long-speech heartbeat to prevent utterance freezing
    clearHeartbeat();
    resumeInterval = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.resume();
      } else {
        clearHeartbeat();
      }
    }, 4000);

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.error('[KAIZEN Audio] Failed to speak:', e);
    clearHeartbeat();
    if (options.onError) options.onError(e);
    return false;
  }
}

/**
 * Stops any currently playing speech immediately.
 */
export function stopKaizenVoice(): void {
  clearHeartbeat();
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
}

function clearHeartbeat(): void {
  if (resumeInterval) {
    clearInterval(resumeInterval);
    resumeInterval = null;
  }
}

/**
 * Global audio gesture unlocker: Ensures browser permissions allow audio playback.
 */
export function initAudioUnlock(): () => void {
  if (typeof window === 'undefined') return () => {};

  const unlock = () => {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.resume();
    }
  };

  // Pre-fetch voices
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });

  return () => {
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
}
