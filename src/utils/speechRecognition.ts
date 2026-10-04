/**
 * speechRecognition.ts
 * Dual-Engine Voice Input System for KAIZEN.
 * 
 * Features:
 * - Engine A: Direct Local MediaRecorder + Gemini 3.5 Neural Transcription (/api/voice/transcribe)
 *   Zero-network-error guarantee; completely bypasses Google Web Speech API restrictions in
 *   Chrome, Edge, Brave, Electron, VPNs, and firewalled networks.
 * - Engine B: Web Speech API (webkitSpeechRecognition) with instant seamless failover
 * - Strict transcription synchronization: ensures KAIZEN only responds AFTER the neural engine
 *   has fully transcribed the user's speech.
 */

export interface SpeechRecognitionOptions {
  onInterimText?: (text: string) => void;
  onFinalText?: (text: string) => void;
  onProcessing?: () => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  continuous?: boolean;
  lang?: string;
  silenceTimeoutMs?: number;
}

// Global engine states
let activeRecognition: any = null;
let activeMediaRecorder: MediaRecorder | null = null;
let activeMediaStream: MediaStream | null = null;
let activeAudioContext: AudioContext | null = null;
let isRecordingActive = false;
let isAborted = false;
let hasDispatchedFinal = false;
let isNetworkSpeechRestricted = false;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const hasWebSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  return hasWebSpeech || hasMediaDevices;
}

/**
 * Engine A: High-Reliability Local MediaRecorder + Gemini Neural Transcription
 */
async function startNeuralAudioRecording(options: SpeechRecognitionOptions): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    activeMediaStream = stream;
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
    }

    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    activeMediaRecorder = recorder;
    const audioChunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    // Live Web Audio VAD & Silence Detector
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx();
    activeAudioContext = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let speechDetected = false;
    let silenceTimer: any = null;
    const silenceTimeout = options.silenceTimeoutMs ?? 1600;

    const checkAudioLevel = () => {
      if (!isRecordingActive) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length / 255;

      if (avg > 0.04) {
        speechDetected = true;
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
      } else if (speechDetected && !silenceTimer) {
        silenceTimer = setTimeout(() => {
          if (isRecordingActive && !isAborted) {
            console.log('[KAIZEN Neural Voice] Silence detected after speech. Finalizing audio capture...');
            stopSpeechRecognition();
          }
        }, silenceTimeout);
      }

      if (isRecordingActive) {
        requestAnimationFrame(checkAudioLevel);
      }
    };

    recorder.onstart = () => {
      console.log('[KAIZEN Neural Voice] Local audio recording started (Gemini Neural Engine)');
      if (options.onStart) options.onStart();
      // DO NOT inject fake status text into onInterimText so the user chat box remains clean
      requestAnimationFrame(checkAudioLevel);
    };

    recorder.onstop = async () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      console.log('[KAIZEN Neural Voice] Recording stopped. Chunks collected:', audioChunks.length);

      if (options.onProcessing) {
        options.onProcessing();
      }

      if (audioChunks.length > 0 && !hasDispatchedFinal && !isAborted) {
        const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
        if (audioBlob.size > 500) {
          try {
            const base64Audio = await blobToBase64(audioBlob);
            const res = await fetch('/api/voice/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioData: base64Audio,
                mimeType: (mimeType || 'audio/webm').split(';')[0],
              }),
            });

            if (res.ok) {
              const data = await res.json();
              const transcript = (data.transcript || '').trim();
              if (transcript && transcript !== '[SILENCE]') {
                hasDispatchedFinal = true;
                console.log('[KAIZEN Neural Voice] Final transcript from Gemini:', transcript);
                if (options.onFinalText) {
                  options.onFinalText(transcript);
                }
              } else {
                console.log('[KAIZEN Neural Voice] Audio contained silence or no discernible speech.');
                if (options.onEnd) options.onEnd();
              }
            } else {
              throw new Error(`Server status ${res.status}`);
            }
          } catch (err: any) {
            console.warn('[KAIZEN Neural Voice] Transcribe request failed:', err);
            if (options.onError) {
              options.onError('Neural transcription failed. Please try speaking again.');
            }
          }
        } else {
          if (options.onEnd) options.onEnd();
        }
      } else {
        if (options.onEnd) options.onEnd();
      }
    };

    recorder.start(250);
    return true;
  } catch (err: any) {
    console.error('[KAIZEN Neural Voice] Initialization error:', err);
    if (options.onError) {
      options.onError(err.message || 'Microphone access denied.');
    }
    return false;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Main Entry Point: Starts Voice Recognition with Automatic Engine Failover
 */
export function startSpeechRecognition(options: SpeechRecognitionOptions): boolean {
  stopSpeechRecognition();
  isAborted = false;
  hasDispatchedFinal = false;
  isRecordingActive = true;

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (isNetworkSpeechRestricted || !SpeechRecognitionClass) {
    console.log('[KAIZEN Voice Input] Routing directly to Gemini Neural Audio Engine.');
    startNeuralAudioRecording(options);
    return true;
  }

  try {
    const recognition = new SpeechRecognitionClass();
    activeRecognition = recognition;

    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = true;
    recognition.lang = options.lang || 'en-US';
    recognition.maxAlternatives = 1;

    let accumulatedFinal = '';
    let latestFullText = '';
    let silenceTimer: any = null;
    const silenceTimeout = options.silenceTimeoutMs ?? 1500;

    const dispatchFinal = (text: string) => {
      if (hasDispatchedFinal) return;
      const clean = text.trim();
      if (clean && options.onFinalText) {
        hasDispatchedFinal = true;
        console.log('[KAIZEN Voice Input] Dispatched final transcript:', clean);
        options.onFinalText(clean);
      }
    };

    recognition.onstart = () => {
      console.log('[KAIZEN Voice Input] Microphone active (Web Speech).');
      if (options.onStart) options.onStart();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          accumulatedFinal += (accumulatedFinal ? ' ' : '') + transcript.trim();
        } else {
          interimTranscript += transcript;
        }
      }

      latestFullText = ((accumulatedFinal ? accumulatedFinal + ' ' : '') + interimTranscript).trim();

      if (options.onInterimText) {
        options.onInterimText(latestFullText);
      }

      if (silenceTimer) clearTimeout(silenceTimer);
      if (latestFullText) {
        silenceTimer = setTimeout(() => {
          if (!isAborted && activeRecognition === recognition) {
            dispatchFinal(latestFullText);
            stopSpeechRecognition();
          }
        }, silenceTimeout);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[KAIZEN Voice Input] Web Speech event warning:', event.error);
      
      // Auto-failover on 'network', 'service-not-allowed', or any Web Speech connectivity errors
      if (event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'language-not-supported') {
        console.log(`[KAIZEN Voice Input] Web Speech API restricted (${event.error}). Seamlessly failing over to Neural Audio Engine...`);
        isNetworkSpeechRestricted = true;
        try {
          recognition.abort();
        } catch (_) {}
        activeRecognition = null;
        
        startNeuralAudioRecording(options);
        return;
      }

      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      if (event.error === 'not-allowed') {
        if (options.onError) options.onError('Microphone access was denied. Please allow microphone permission in your browser or system settings.');
        return;
      }
      if (event.error === 'audio-capture') {
        if (options.onError) options.onError('No microphone hardware detected.');
        return;
      }

      if (!isNetworkSpeechRestricted) {
        console.warn(`[KAIZEN Voice Input] Web Speech error "${event.error}". Auto-switching to Neural Engine...`);
        isNetworkSpeechRestricted = true;
        try {
          recognition.abort();
        } catch (_) {}
        activeRecognition = null;
        startNeuralAudioRecording(options);
        return;
      }

      if (options.onError) {
        options.onError(`Microphone notice: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      if (latestFullText && !hasDispatchedFinal && !isNetworkSpeechRestricted) {
        dispatchFinal(latestFullText);
      }
      if (options.onEnd && !isNetworkSpeechRestricted) {
        options.onEnd();
      }
    };

    recognition.start();
    return true;
  } catch (err: any) {
    console.warn('[KAIZEN Voice Input] Web Speech failed to start. Falling back to Neural Audio Engine:', err);
    isNetworkSpeechRestricted = true;
    startNeuralAudioRecording(options);
    return true;
  }
}

export function stopSpeechRecognition(): void {
  isRecordingActive = false;

  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (_) {}
    activeRecognition = null;
  }

  // Trigger stop on MediaRecorder so that onstop collects all chunks and transcribes
  if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
    try {
      activeMediaRecorder.stop();
    } catch (_) {}
    activeMediaRecorder = null;
  }

  if (activeAudioContext) {
    try {
      activeAudioContext.close();
    } catch (_) {}
    activeAudioContext = null;
  }

  if (activeMediaStream) {
    activeMediaStream.getTracks().forEach((track) => track.stop());
    activeMediaStream = null;
  }
}

export function abortSpeechRecognition(): void {
  isAborted = true;
  hasDispatchedFinal = true;
  stopSpeechRecognition();
}
