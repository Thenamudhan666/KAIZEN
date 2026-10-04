/**
 * pcmAudioStreamer.ts
 * 
 * Low-Latency Bidirectional Audio Streaming Client
 * - Captures microphone input at audio/pcm;rate=16000
 * - Streams raw 16kHz 16-bit linear PCM chunks via bidirectional WebSocket (/ws/audio)
 * - Native Voice Activity Detection (VAD) & mid-sentence Barge-In handling
 */

export interface PcmStreamerOptions {
  onVadLevel?: (level: number, isSpeaking: boolean) => void;
  onBargeIn?: (reason: string) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onAudioChunk?: (pcmBuffer: ArrayBuffer) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'disconnected' | 'connecting' | 'connected' | 'streaming') => void;
}

let activeStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let processorNode: ScriptProcessorNode | null = null;
let socket: WebSocket | null = null;
let isStreaming = false;

/**
 * Downsamples and converts Float32 audio samples from Web Audio API to 16-bit signed PCM (Int16Array)
 */
function convertFloat32ToInt16Pcm(inputData: Float32Array): Int16Array {
  const output = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    const s = Math.max(-1, Math.min(1, inputData[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

export function isPcmStreamingActive(): boolean {
  return isStreaming;
}

export async function startPcmAudioStreaming(options: PcmStreamerOptions): Promise<boolean> {
  stopPcmAudioStreaming();

  try {
    if (options.onStatusChange) options.onStatusChange('connecting');

    // 1. Establish Bidirectional WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/audio`;
    socket = new WebSocket(wsUrl);
    socket.binaryType = 'arraybuffer';

    socket.onopen = () => {
      console.log('[KAIZEN PCM Streamer] WebSocket connected at audio/pcm;rate=16000');
      if (options.onStatusChange) options.onStatusChange('connected');
    };

    socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'barge_in') {
            console.log('[KAIZEN PCM Streamer] Barge-in signal received:', msg.reason);
            if (options.onBargeIn) options.onBargeIn(msg.reason);
          } else if (msg.type === 'vad') {
            if (options.onVadLevel) options.onVadLevel(msg.energy, msg.active);
          } else if (msg.type === 'transcript') {
            if (options.onTranscript) options.onTranscript(msg.text, msg.isFinal);
          }
        } catch (e) {
          console.warn('[KAIZEN PCM Streamer] Non-JSON text frame:', event.data);
        }
      } else if (event.data instanceof ArrayBuffer) {
        if (options.onAudioChunk) {
          options.onAudioChunk(event.data);
        }
      }
    };

    socket.onerror = (err) => {
      console.error('[KAIZEN PCM Streamer] WebSocket error:', err);
      if (options.onError) options.onError('WebSocket connection to /ws/audio failed.');
    };

    socket.onclose = () => {
      console.log('[KAIZEN PCM Streamer] WebSocket closed.');
      if (options.onStatusChange) options.onStatusChange('disconnected');
      stopPcmAudioStreaming();
    };

    // 2. Capture Microphone Audio with 16kHz target
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    activeStream = stream;

    // Create AudioContext (fallback resampler if browser doesn't give 16kHz directly)
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx({ sampleRate: 16000 });
    audioContext = ctx;

    const source = ctx.createMediaStreamSource(stream);
    // Buffer size 2048 at 16kHz = ~128ms per audio frame
    const processor = ctx.createScriptProcessor(2048, 1, 1);
    processorNode = processor;

    processor.onaudioprocess = (e) => {
      if (!isStreaming || !socket || socket.readyState !== WebSocket.OPEN) return;

      const inputBuffer = e.inputBuffer.getChannelData(0);
      const pcm16Data = convertFloat32ToInt16Pcm(inputBuffer);

      // Local VAD energy measurement
      let sum = 0;
      for (let i = 0; i < inputBuffer.length; i++) {
        sum += inputBuffer[i] * inputBuffer[i];
      }
      const rms = Math.sqrt(sum / inputBuffer.length);
      const isVoiceActive = rms > 0.035;

      if (options.onVadLevel) {
        options.onVadLevel(rms, isVoiceActive);
      }

      // Stream 16kHz PCM chunk directly over WebSocket
      socket.send(pcm16Data.buffer);
    };

    source.connect(processor);
    processor.connect(ctx.destination);

    isStreaming = true;
    if (options.onStatusChange) options.onStatusChange('streaming');
    return true;
  } catch (err: any) {
    console.error('[KAIZEN PCM Streamer] Start failed:', err);
    if (options.onError) options.onError(err.message || 'Microphone initialization failed.');
    stopPcmAudioStreaming();
    return false;
  }
}

export function stopPcmAudioStreaming(): void {
  isStreaming = false;

  if (processorNode) {
    try {
      processorNode.disconnect();
    } catch (_) {}
    processorNode = null;
  }

  if (audioContext) {
    try {
      audioContext.close();
    } catch (_) {}
    audioContext = null;
  }

  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }

  if (socket) {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    } catch (_) {}
    socket = null;
  }
}
