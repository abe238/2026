import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Home, Target, Award, Settings, Mic } from 'lucide-react';
import { VoiceCapture } from './VoiceCapture';

interface AppShellProps {
  children: ReactNode;
  currentRoute?: string;
  onWinCreated?: () => void;
}

const navItems = [
  { icon: Home, label: 'Today', href: '#/' },
  { icon: Target, label: 'Goals', href: '#/goals' },
  { icon: Award, label: 'Vault', href: '#/vault' },
  { icon: Settings, label: 'Settings', href: '#/settings' },
];

export function AppShell({ children, currentRoute = '/', onWinCreated }: AppShellProps) {
  const [isVoiceCaptureOpen, setIsVoiceCaptureOpen] = useState(false);

  const handleOpenVoiceCapture = () => {
    setIsVoiceCaptureOpen(true);
  };

  const handleCloseVoiceCapture = () => {
    setIsVoiceCaptureOpen(false);
  };

  const handleWinCreated = () => {
    onWinCreated?.();
  };

  const isActive = (href: string) => {
    const path = href.slice(1);
    return path === currentRoute;
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-secondary)]">
      <main className="pb-24 px-4 pt-6 max-w-lg mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface-primary)] border-t border-gray-200 px-6 py-3">
        <div className="max-w-lg mx-auto flex justify-around items-center">
          {navItems.map(({ icon: Icon, label, href }) => (
            <a
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive(href)
                  ? 'text-[var(--color-momentum-steady)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-momentum-steady)]'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs">{label}</span>
            </a>
          ))}
        </div>
      </nav>

      <motion.button
        onClick={handleOpenVoiceCapture}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-[var(--color-momentum-steady)] text-white shadow-lg flex items-center justify-center z-30"
        aria-label="Record win with voice"
      >
        <Mic size={28} />
      </motion.button>

      <VoiceCapture
        isOpen={isVoiceCaptureOpen}
        onClose={handleCloseVoiceCapture}
        onWinCreated={handleWinCreated}
      />
    </div>
  );
}
