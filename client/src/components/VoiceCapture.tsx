import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Check, Edit2, Loader2 } from 'lucide-react';
import { useVoiceCapture, type ExtractedWin } from '../hooks/useVoiceCapture';
import { useCreateWin } from '../hooks/useWins';

interface VoiceCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onWinCreated?: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sheetVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const pulseVariants = {
  recording: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  idle: {
    scale: 1,
    opacity: 0,
  },
};

const waveformVariants = {
  animate: {
    scaleY: [0.3, 1, 0.5, 0.8, 0.3],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function WaveformBars() {
  return (
    <div className="flex items-center gap-1 h-8">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-[var(--color-momentum-steady)] rounded-full"
          style={{ height: '100%' }}
          variants={waveformVariants}
          animate="animate"
          transition={{ delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

interface WinPreviewCardProps {
  win: ExtractedWin;
  onEdit: () => void;
}

function WinPreviewCard({ win, onEdit }: WinPreviewCardProps) {
  const confidenceColor =
    win.confidence >= 0.8
      ? 'text-green-400'
      : win.confidence >= 0.6
        ? 'text-yellow-400'
        : 'text-orange-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface-secondary)] rounded-xl p-4 border border-gray-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[var(--color-text-primary)] font-medium truncate">{win.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm px-2 py-0.5 rounded-full bg-[var(--color-momentum-steady)]/20 text-[var(--color-momentum-steady)]">
              {win.goalAreaName}
            </span>
            <span className={`text-xs ${confidenceColor}`}>
              {Math.round(win.confidence * 100)}% match
            </span>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Edit win"
        >
          <Edit2 size={18} className="text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
}

export function VoiceCapture({ isOpen, onClose, onWinCreated }: VoiceCaptureProps) {
  const {
    isRecording,
    isProcessing,
    transcript,
    interimTranscript,
    extractedWins,
    error,
    duration,
    startRecording,
    stopRecording,
    reset,
  } = useVoiceCapture();

  const createWin = useCreateWin();

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleConfirm = useCallback(async () => {
    if (extractedWins.length === 0) return;

    try {
      for (const win of extractedWins) {
        await createWin.mutateAsync({
          goalAreaId: win.goalAreaId,
          title: win.title,
          captureMethod: 'voice',
        });
      }
      onWinCreated?.();
      handleClose();
    } catch (err) {
      console.error('Failed to create win:', err);
    }
  }, [extractedWins, createWin, onWinCreated, handleClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const showResults = !isRecording && !isProcessing && extractedWins.length > 0;
  const showTranscript = isRecording || isProcessing || transcript;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleClose}
          />

          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl bg-[var(--color-surface-primary)] shadow-xl"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col h-full max-h-[85vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {isRecording
                    ? 'Listening...'
                    : isProcessing
                      ? 'Processing...'
                      : showResults
                        ? 'Win Captured'
                        : 'Log a Win'}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {!showResults && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-[var(--color-momentum-steady)]"
                        variants={pulseVariants}
                        animate={isRecording ? 'recording' : 'idle'}
                        style={{ width: 120, height: 120, margin: -20 }}
                      />

                      <motion.button
                        onClick={handleMicClick}
                        disabled={isProcessing}
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-[var(--color-momentum-steady)] hover:bg-[var(--color-momentum-steady)]/80'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isProcessing ? (
                          <Loader2 size={32} className="text-white animate-spin" />
                        ) : isRecording ? (
                          <MicOff size={32} className="text-white" />
                        ) : (
                          <Mic size={32} className="text-white" />
                        )}
                      </motion.button>
                    </div>

                    {isRecording && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 flex flex-col items-center gap-4"
                      >
                        <WaveformBars />
                        <span className="text-sm text-gray-400 font-mono">
                          {formatDuration(duration)}
                        </span>
                      </motion.div>
                    )}

                    {!isRecording && !isProcessing && !transcript && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 text-center text-gray-400"
                      >
                        Tap to start recording your win
                      </motion.p>
                    )}
                  </div>
                )}

                {showTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-[var(--color-surface-secondary)] min-h-[60px]"
                  >
                    <p className="text-sm text-gray-500 mb-1">Transcript</p>
                    <p className="text-[var(--color-text-primary)]">
                      {transcript || interimTranscript || (
                        <span className="text-gray-500 italic">Waiting for speech...</span>
                      )}
                      {isRecording && interimTranscript && (
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="inline-block w-0.5 h-4 bg-[var(--color-momentum-steady)] ml-1"
                        />
                      )}
                    </p>
                  </motion.div>
                )}

                {showResults && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-3"
                      >
                        <Check size={32} className="text-green-400" />
                      </motion.div>
                      <p className="text-[var(--color-text-secondary)]">
                        We found {extractedWins.length} win{extractedWins.length > 1 ? 's' : ''} to
                        log
                      </p>
                    </div>

                    <div className="space-y-3">
                      {extractedWins.map((win, index) => (
                        <WinPreviewCard
                          key={index}
                          win={win}
                          onEdit={() => {
                            console.log('Edit win:', win);
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-4 border-t border-gray-700 flex gap-3"
                >
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-600 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={createWin.isPending}
                    className="flex-1 py-3 px-4 rounded-xl bg-[var(--color-momentum-steady)] text-white font-medium hover:bg-[var(--color-momentum-steady)]/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createWin.isPending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Save Win
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
