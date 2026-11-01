import { isSoundMuted } from './soundEffects.ts';

// Speech helper for Spanish pronunciation
export function speakSpanish(text: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  if (isSoundMuted()) {
    window.speechSynthesis.cancel();
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Pick Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find((v) => v.lang.startsWith('es'));
    if (esVoice) {
      utterance.voice = esVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    return false;
  }
}
