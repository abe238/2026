import { useState, useRef, useCallback, useEffect } from 'react';

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

function mockExtractWins(transcript: string): ExtractedWin[] {
  const lower = transcript.toLowerCase();
  const wins: ExtractedWin[] = [];

  if (lower.includes('peloton') || lower.includes('workout') || lower.includes('gym') || lower.includes('run') || lower.includes('exercise')) {
    wins.push({
      title: transcript,
      goalAreaId: 'physical_health',
      goalAreaName: 'Physical Health',
      confidence: 0.92,
    });
  } else if (lower.includes('meditat') || lower.includes('journal') || lower.includes('therapy') || lower.includes('mindful')) {
    wins.push({
      title: transcript,
      goalAreaId: 'mental_health',
      goalAreaName: 'Mental Health',
      confidence: 0.88,
    });
  } else if (lower.includes('ian') || lower.includes('son') || lower.includes('kid')) {
    wins.push({
      title: transcript,
      goalAreaId: 'family_ian',
      goalAreaName: 'Family - Ian',
      confidence: 0.85,
    });
  } else if (lower.includes('wife') || lower.includes('date') || lower.includes('dinner together')) {
    wins.push({
      title: transcript,
      goalAreaId: 'family_wife',
      goalAreaName: 'Family - Wife',
      confidence: 0.87,
    });
  } else if (lower.includes('1:1') || lower.includes('one on one') || lower.includes('team') || lower.includes('mentor')) {
    wins.push({
      title: transcript,
      goalAreaId: 'work_leadership',
      goalAreaName: 'Work - Leadership',
      confidence: 0.84,
    });
  } else if (lower.includes('strateg') || lower.includes('okr') || lower.includes('vision') || lower.includes('presentation')) {
    wins.push({
      title: transcript,
      goalAreaId: 'work_strategic',
      goalAreaName: 'Work - Strategic',
      confidence: 0.86,
    });
  } else if (lower.includes('newsletter') || lower.includes('wrote') || lower.includes('article') || lower.includes('content')) {
    wins.push({
      title: transcript,
      goalAreaId: 'content_newsletter',
      goalAreaName: 'Content/Newsletter',
      confidence: 0.83,
    });
  } else {
    wins.push({
      title: transcript,
      goalAreaId: 'work_strategic',
      goalAreaName: 'Work - Strategic',
      confidence: 0.6,
    });
  }

  return wins;
}

async function simulateTranscription(
  onInterim: (text: string) => void,
  onFinal: (text: string) => void,
  signal: AbortSignal
): Promise<void> {
  const mockPhrases = [
    'Just did',
    'Just did a 20',
    'Just did a 20 minute',
    'Just did a 20 minute Peloton ride',
  ];

  for (let i = 0; i < mockPhrases.length; i++) {
    if (signal.aborted) return;
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
    if (signal.aborted) return;
    onInterim(mockPhrases[i]);
  }

  if (!signal.aborted) {
    onFinal(mockPhrases[mockPhrases.length - 1]);
  }
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const durationIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

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

      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, isRecording: true }));

      durationIntervalRef.current = window.setInterval(() => {
        setState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      simulateTranscription(
        (interim) => setState((prev) => ({ ...prev, interimTranscript: interim })),
        (final) => setState((prev) => ({ ...prev, transcript: final, interimTranscript: '' })),
        abortControllerRef.current.signal
      );
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

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState((prev) => {
      const finalTranscript = prev.transcript || prev.interimTranscript;
      return {
        ...prev,
        isRecording: false,
        isPaused: false,
        isProcessing: true,
        transcript: finalTranscript,
        interimTranscript: '',
      };
    });

    setTimeout(() => {
      setState((prev) => {
        const wins = mockExtractWins(prev.transcript);
        return {
          ...prev,
          isProcessing: false,
          extractedWins: wins,
        };
      });
    }, 800);
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
