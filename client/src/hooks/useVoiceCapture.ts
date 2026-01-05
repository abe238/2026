import { useState, useRef, useCallback, useEffect } from 'react';
import { api } from '../lib/api';

export interface ExtractedWin {
  title: string;
  goalAreaId: string;
  goalAreaName: string;
  confidence: number;
}

interface VoiceCaptureState {
  isRecording: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  extractedWins: ExtractedWin[];
  error: string | null;
  duration: number;
}

interface UseVoiceCaptureReturn extends VoiceCaptureState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  reset: () => void;
  confirmWins: (wins: ExtractedWin[]) => Promise<void>;
}

export function useVoiceCapture(): UseVoiceCaptureReturn {
  const [state, setState] = useState<VoiceCaptureState>({
    isRecording: false,
    isPaused: false,
    isProcessing: false,
    transcript: '',
    interimTranscript: '',
    extractedWins: [],
    error: null,
    duration: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null, transcript: '', interimTranscript: '', extractedWins: [], duration: 0 }));

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onerror = () => {
        setState((prev) => ({ ...prev, error: 'Recording failed. Please try again.' }));
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);

      setState((prev) => ({ ...prev, isRecording: true }));

      durationIntervalRef.current = window.setInterval(() => {
        setState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      setState((prev) => ({ ...prev, interimTranscript: 'Recording...' }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access denied';
      setState((prev) => ({ ...prev, error: message }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setState((prev) => ({ ...prev, isRecording: false, isPaused: false, isProcessing: true, interimTranscript: '' }));

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        try {
          const result = await api.voice.process(audioBlob);

          setState((prev) => ({
            ...prev,
            isProcessing: false,
            transcript: result.transcript,
            extractedWins: result.wins,
          }));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Processing failed';
          setState((prev) => ({ ...prev, isProcessing: false, error: errorMessage }));
        }
      };

      mediaRecorderRef.current.stop();
    } else {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, []);

  const reset = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setState({
      isRecording: false,
      isPaused: false,
      isProcessing: false,
      transcript: '',
      interimTranscript: '',
      extractedWins: [],
      error: null,
      duration: 0,
    });
  }, []);

  const confirmWins = useCallback(async (_wins: ExtractedWin[]) => {
    setState((prev) => ({ ...prev, isProcessing: true }));

    await new Promise((r) => setTimeout(r, 500));

    setState({
      isRecording: false,
      isPaused: false,
      isProcessing: false,
      transcript: '',
      interimTranscript: '',
      extractedWins: [],
      error: null,
      duration: 0,
    });

    return Promise.resolve();
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    confirmWins,
  };
}
